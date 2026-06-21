import {
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Receives Resend delivery events (email.sent / delivered / bounced / opened …).
 * See README "Email notifications (Resend)" and the Resend webhooks docs.
 *
 * In dev/testing this just logs events so you can watch them in the console while
 * tunnelling localhost (ngrok / `resend webhooks listen` / VS Code port-forward).
 * When RESEND_WEBHOOK_SECRET is set, every request is verified with the Svix
 * signature scheme (HMAC-SHA256 over `${id}.${timestamp}.${rawBody}`).
 */
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  // Bounded de-dup of already-seen deliveries (Svix may retry the same event).
  private readonly seen = new Set<string>();

  @Post('resend')
  @HttpCode(200)
  handleResend(
    @Req() req: RawBodyRequest<Request>,
    @Headers('svix-id') svixId?: string,
    @Headers('svix-timestamp') svixTimestamp?: string,
    @Headers('svix-signature') svixSignature?: string,
  ): { received: true } {
    const raw = req.rawBody?.toString('utf8') ?? '';

    const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
    if (secret) {
      this.verifySignature(secret, raw, svixId, svixTimestamp, svixSignature);
    }

    // De-dup on the Svix delivery id when present.
    if (svixId) {
      if (this.seen.has(svixId)) {
        this.logger.debug(`Duplicate webhook ${svixId} ignored.`);
        return { received: true };
      }
      this.seen.add(svixId);
      if (this.seen.size > 1000) {
        // Keep the set from growing unbounded over a long-lived process.
        this.seen.delete(this.seen.values().next().value as string);
      }
    }

    try {
      const event = JSON.parse(raw) as {
        type?: string;
        data?: { email_id?: string; to?: unknown; subject?: string };
      };
      this.logger.log(
        `Resend event "${event.type ?? 'unknown'}" — id=${
          event.data?.email_id ?? '?'
        } subject="${event.data?.subject ?? ''}"`,
      );
    } catch {
      this.logger.warn('Received a Resend webhook with an unparseable body.');
    }

    return { received: true };
  }

  /** Svix signature verification (the scheme Resend uses for webhooks). */
  private verifySignature(
    secret: string,
    payload: string,
    id?: string,
    timestamp?: string,
    signatureHeader?: string,
  ): void {
    if (!id || !timestamp || !signatureHeader) {
      throw new UnauthorizedException('Missing Svix signature headers');
    }

    // Secret is "whsec_<base64>"; the key is the base64-decoded remainder.
    const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
    const signedContent = `${id}.${timestamp}.${payload}`;
    const expected = createHmac('sha256', key)
      .update(signedContent)
      .digest('base64');

    // Header is a space-delimited list of "v1,<signature>" entries.
    const provided = signatureHeader
      .split(' ')
      .map((part) => part.split(',')[1])
      .filter(Boolean);

    const expectedBuf = Buffer.from(expected);
    const match = provided.some((sig) => {
      const sigBuf = Buffer.from(sig);
      return (
        sigBuf.length === expectedBuf.length &&
        timingSafeEqual(sigBuf, expectedBuf)
      );
    });

    if (!match) {
      this.logger.warn('Rejected a Resend webhook with an invalid signature.');
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }
}
