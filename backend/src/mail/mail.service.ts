import { Injectable, Logger } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { Resend } from 'resend';
import {
  EmailField,
  formatTimestamp,
  linkField,
  renderEmail,
  renderText,
  textField,
} from './email-templates';

export interface ContactNotification {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}

export interface ApplicationNotification {
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  jobTitle?: string | null;
  /** Original filename of the uploaded CV (if any). */
  cvFilename?: string | null;
  /** Absolute/relative path to the uploaded CV on disk (if any). */
  cvPath?: string | null;
}

/**
 * Sends form-notification emails to the company via Resend.
 *
 * Configuration is environment-driven (no NODE_ENV branching — same convention
 * as CORS/seeding in this app). Defaults are dev-safe Resend test addresses, so
 * a local stack only needs RESEND_API_KEY to start exercising real sends:
 *   - MAIL_FROM  dev: "… <onboarding@resend.dev>" (Resend's shared sender, no
 *                domain verification needed); prod: a verified-domain address.
 *   - MAIL_TO    dev: "delivered@resend.dev" (Resend test inbox); prod: the real
 *                company address.
 * See README "Email notifications (Resend)".
 *
 * Sending is best-effort: failures are logged but never thrown, so a Resend
 * outage can't break a form submission (the data is already persisted).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly to: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    this.from =
      process.env.MAIL_FROM?.trim() ||
      'Entreprises Christian Lemelin <onboarding@resend.dev>';
    this.to = process.env.MAIL_TO?.trim() || 'delivered@resend.dev';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.resend = null;
      this.logger.warn(
        'RESEND_API_KEY is not set — form notification emails are disabled.',
      );
    }
  }

  async sendContactNotification(input: ContactNotification): Promise<void> {
    const fields: EmailField[] = [
      textField('Nom', input.name),
      linkField('Courriel', input.email, `mailto:${input.email}`),
    ];
    if (input.phone) {
      fields.push(
        linkField(
          'Téléphone',
          input.phone,
          `tel:${input.phone.replace(/[^\d+]/g, '')}`,
        ),
      );
    }

    const footerNote = `Reçu via le formulaire « Nous joindre » du site — ${formatTimestamp(new Date())}`;
    const html = renderEmail({
      preheader: `Nouvelle demande de ${input.name}`,
      eyebrow: 'Nouvelle demande de contact',
      title: 'Un visiteur souhaite vous joindre',
      intro:
        'Une nouvelle demande a été envoyée depuis le formulaire de contact du site web.',
      fields,
      messageLabel: 'Son projet',
      messageBody: input.message,
      action: { label: `Répondre à ${input.name}`, href: `mailto:${input.email}` },
      footerNote,
    });
    const text = renderText({
      eyebrow: 'Nouvelle demande de contact',
      title: 'Un visiteur souhaite vous joindre',
      fields,
      messageLabel: 'Son projet',
      messageBody: input.message,
      footerNote,
    });

    await this.send({
      subject: `Nouvelle demande de contact — ${input.name}`,
      html,
      text,
      replyTo: input.email,
    });
  }

  async sendApplicationNotification(
    input: ApplicationNotification,
  ): Promise<void> {
    const fields: EmailField[] = [
      textField('Candidat', input.name),
      linkField('Courriel', input.email, `mailto:${input.email}`),
    ];
    if (input.phone) {
      fields.push(
        linkField(
          'Téléphone',
          input.phone,
          `tel:${input.phone.replace(/[^\d+]/g, '')}`,
        ),
      );
    }
    if (input.jobTitle) {
      fields.push(textField('Poste visé', input.jobTitle));
    }

    // Read the CV from disk to attach it (best-effort — never blocks the send).
    let attachments:
      | { filename: string; content: Buffer }[]
      | undefined;
    let note: string | undefined;
    if (input.cvPath) {
      try {
        const content = await readFile(input.cvPath);
        const filename = input.cvFilename || basename(input.cvPath);
        attachments = [{ filename, content }];
        note = `📎 CV joint : ${filename}`;
      } catch (err) {
        this.logger.warn(
          `Could not read CV for attachment (${input.cvPath}): ${String(err)}`,
        );
        note = 'Un CV a été téléversé mais n’a pas pu être joint à ce courriel.';
      }
    }

    const jobSuffix = input.jobTitle ? ` · ${input.jobTitle}` : '';
    const footerNote = `Reçu via le formulaire de candidature du site — ${formatTimestamp(new Date())}`;
    const html = renderEmail({
      preheader: `Candidature de ${input.name}${jobSuffix}`,
      eyebrow: 'Nouvelle candidature',
      title: input.jobTitle
        ? `Candidature — ${input.jobTitle}`
        : 'Nouvelle candidature spontanée',
      intro:
        'Une nouvelle candidature a été soumise depuis la section emplois du site web.',
      fields,
      messageLabel: input.message ? 'Message du candidat' : undefined,
      messageBody: input.message ?? undefined,
      note,
      action: { label: `Répondre à ${input.name}`, href: `mailto:${input.email}` },
      footerNote,
    });
    const text = renderText({
      eyebrow: 'Nouvelle candidature',
      title: input.jobTitle
        ? `Candidature — ${input.jobTitle}`
        : 'Nouvelle candidature spontanée',
      fields,
      messageLabel: input.message ? 'Message du candidat' : undefined,
      messageBody: input.message ?? undefined,
      note,
      footerNote,
    });

    await this.send({
      subject: `Nouvelle candidature — ${input.name}${jobSuffix}`,
      html,
      text,
      replyTo: input.email,
      attachments,
    });
  }

  /** Single send path — swallows errors so a form submission never fails on email. */
  private async send(payload: {
    subject: string;
    html: string;
    text: string;
    replyTo: string;
    attachments?: { filename: string; content: Buffer }[];
  }): Promise<void> {
    if (!this.resend) return; // disabled (no API key)
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: this.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        replyTo: payload.replyTo,
        attachments: payload.attachments,
      });
      if (error) {
        this.logger.error(`Resend rejected the email: ${JSON.stringify(error)}`);
        return;
      }
      this.logger.log(
        `Notification email sent to ${this.to} (id: ${data?.id ?? 'unknown'})`,
      );
    } catch (err) {
      this.logger.error(`Failed to send notification email: ${String(err)}`);
    }
  }
}
