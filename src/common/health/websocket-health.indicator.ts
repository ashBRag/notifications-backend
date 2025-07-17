/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { io, Socket } from 'socket.io-client';

interface WebSocketHealthConfig {
  url?: string;
  timeout?: number;
  validateConnection?: boolean;
  pingMessage?: string;
  pongMessage?: string;
}

@Injectable()
export class WebSocketHealthIndicator {
  private readonly logger = new Logger(WebSocketHealthIndicator.name);

  constructor(private readonly configService: ConfigService) {}

  async isHealthy(
    key: string,
    config: WebSocketHealthConfig = {},
  ): Promise<HealthIndicatorResult> {
    const {
      url = this.getDefaultWebSocketUrl(),
      timeout = 5000,
      validateConnection = true,
      pingMessage = 'health-check-ping',
      pongMessage = 'health-check-pong',
    } = config;

    let socket: Socket;
    let timeoutId: NodeJS.Timeout;
    let isResolved = false;

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
        }
      };

      const resolveHealth = (isHealthy: boolean, error?: string) => {
        if (isResolved) return;
        isResolved = true;

        cleanup();

        const result: HealthIndicatorResult = {
          [key]: {
            status: isHealthy ? 'up' : 'down',
            ...(error && { error }),
            url,
            timestamp: new Date().toISOString(),
          },
        };

        if (isHealthy) {
          resolve(result);
        } else {
          this.logger.warn(
            `WebSocket health check failed: ${error || 'Unknown error'}`,
          );
          reject(new HealthCheckError('WebSocket health check failed', result));
        }
      };

      try {
        // Set up timeout
        timeoutId = setTimeout(() => {
          resolveHealth(false, 'Connection timeout');
        }, timeout);

        // Create socket connection
        socket = io(url, {
          transports: ['websocket'],
          timeout: timeout - 500, // Slightly less than our timeout
          reconnection: false,
          forceNew: true,
          autoConnect: false,
        });

        // Connection successful
        socket.on('connect', () => {
          this.logger.debug(`WebSocket connected for health check: ${url}`);

          if (!validateConnection) {
            resolveHealth(true);
            return;
          }

          // Send ping to validate bidirectional communication
          socket.emit(pingMessage, { timestamp: Date.now() });

          // Set up pong listener with its own timeout
          const pongTimeout = setTimeout(() => {
            resolveHealth(false, 'Ping-pong validation timeout');
          }, 2000);

          socket.once(pongMessage, () => {
            clearTimeout(pongTimeout);
            resolveHealth(true);
          });
        });

        // Connection failed
        socket.on('connect_error', (error) => {
          this.logger.debug(`WebSocket connection error: ${error.message}`);
          resolveHealth(false, `Connection error: ${error.message}`);
        });

        // Disconnection during health check
        socket.on('disconnect', (reason) => {
          this.logger.debug(
            `WebSocket disconnected during health check: ${reason}`,
          );
          resolveHealth(false, `Disconnected: ${reason}`);
        });

        // Generic error handler
        socket.on('error', (error) => {
          this.logger.debug(`WebSocket error during health check: ${error}`);
          resolveHealth(false, `Socket error: ${error}`);
        });

        // Initiate connection
        socket.connect();
      } catch (error) {
        cleanup();
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`WebSocket health check exception: ${errorMessage}`);
        resolveHealth(false, `Exception: ${errorMessage}`);
      }
    });
  }

  private getDefaultWebSocketUrl(): string {
    const protocol = this.configService.get('WEBSOCKET_PROTOCOL', 'http');
    const host = this.configService.get('WEBSOCKET_HOST', 'localhost');
    const port =
      this.configService.get('WEBSOCKET_PORT') ||
      this.configService.get('PORT', '5000');

    return `${protocol}://${host}:${port}`;
  }
}
