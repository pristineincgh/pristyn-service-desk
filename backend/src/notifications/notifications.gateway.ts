import {
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import * as signature from 'cookie-signature';
import { AuthService } from 'src/auth/auth.service';
import { AUTH_SESSION_ID_COOKIE } from 'src/auth/auth.constants';
import { ConfigService } from '@nestjs/config';

type NotificationSocket = Socket & {
  data: {
    userId?: string;
  };
};

@WebSocketGateway()
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly cookieSecret: string;
  private readonly allowedOrigins: string[];

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.cookieSecret = this.configService.get<string>('cookie.secret', '');
    const corsOrigin = this.configService.get<string>('cors.origin', '');
    this.allowedOrigins = corsOrigin
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  afterInit(server: Server) {
    server.engine.opts.cors = {
      origin:
        this.allowedOrigins.length === 1
          ? this.allowedOrigins[0]
          : this.allowedOrigins,
      credentials: true,
    };
  }

  private getRoomName(userId: string) {
    return `user:${userId}`;
  }

  private getSignedSessionId(rawCookieHeader?: string) {
    if (!rawCookieHeader) {
      return null;
    }

    const parsedCookies = cookie.parse(rawCookieHeader);
    const rawSessionCookie = parsedCookies[AUTH_SESSION_ID_COOKIE];

    if (!rawSessionCookie) {
      return null;
    }

    if (!rawSessionCookie.startsWith('s:')) {
      return rawSessionCookie;
    }

    const unsignedValue = signature.unsign(
      rawSessionCookie.slice(2),
      this.cookieSecret,
    );

    return unsignedValue || null;
  }

  async handleConnection(@ConnectedSocket() client: NotificationSocket) {
    try {
      const sessionId = this.getSignedSessionId(
        client.handshake.headers.cookie,
      );

      if (!sessionId) {
        this.logger.warn(
          `Rejected socket ${client.id}: missing session cookie`,
        );
        client.disconnect(true);
        return;
      }

      const session = await this.authService.validateSession(sessionId);
      client.data.userId = session.user.id;
      await client.join(this.getRoomName(session.user.id));
      client.emit('notifications.connected', {
        userId: session.user.id,
      });
    } catch (error) {
      this.logger.warn(
        `Rejected socket ${client.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      client.disconnect(true);
    }
  }

  async handleDisconnect(@ConnectedSocket() client: NotificationSocket) {
    const userId = client.data.userId;
    if (userId) {
      await client.leave(this.getRoomName(userId));
    }
  }

  emitNotificationCreated(userId: string, payload: unknown) {
    this.server
      .to(this.getRoomName(userId))
      .emit('notification.created', payload);
  }

  emitUnreadCountUpdated(userId: string, unreadCount: number) {
    this.server
      .to(this.getRoomName(userId))
      .emit('notification.unread-count', { unreadCount });
  }
}
