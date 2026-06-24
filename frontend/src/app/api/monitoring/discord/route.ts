import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Relais Sentry -> Discord.
// Sentry ne peut pas poster directement dans un webhook Discord (formats incompatibles),
// alors on reçoit l'alerte Sentry ici et on la reformate pour Discord.
//
// Variables d'environnement requises :
//   DISCORD_MONITORING_WEBHOOK_URL  -> URL du webhook du canal Discord
//   SENTRY_DISCORD_RELAY_SECRET     -> secret partagé pour protéger l'endpoint
//
// Sentry appelle :  POST /api/monitoring/discord?secret=XXXX

type SentryWebhookPayload = {
  message?: string;
  level?: string;
  culprit?: string;
  url?: string;
  project_name?: string;
  event?: {
    title?: string;
    web_url?: string;
    environment?: string;
    metadata?: { type?: string; value?: string };
  };
};

const LEVEL_COLORS: Record<string, number> = {
  fatal: 0x7c1d1d,
  error: 0xe03131,
  warning: 0xf08c00,
  info: 0x1971c2,
  debug: 0x868e96,
};

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.SENTRY_DISCORD_RELAY_SECRET;
  const webhookUrl = process.env.DISCORD_MONITORING_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "DISCORD_MONITORING_WEBHOOK_URL is not configured" },
      { status: 500 },
    );
  }

  // Protection de l'endpoint : Sentry doit fournir le bon secret.
  const providedSecret = request.nextUrl.searchParams.get("secret");
  if (expectedSecret && providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: SentryWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const level = (payload.level ?? "error").toLowerCase();
  const title =
    payload.event?.title ??
    payload.message ??
    payload.event?.metadata?.value ??
    "Erreur Sentry";
  const link = payload.event?.web_url ?? payload.url;
  const environment = payload.event?.environment ?? "unknown";
  const project = payload.project_name ?? "christian-lemelin";

  const discordMessage = {
    username: "Sentry Monitoring",
    embeds: [
      {
        title: title.slice(0, 256),
        url: link,
        color: LEVEL_COLORS[level] ?? LEVEL_COLORS.error,
        fields: [
          { name: "Projet", value: project, inline: true },
          { name: "Niveau", value: level, inline: true },
          { name: "Environnement", value: environment, inline: true },
          ...(payload.culprit
            ? [{ name: "Origine", value: payload.culprit.slice(0, 1024) }]
            : []),
        ],
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(discordMessage),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Discord webhook failed", status: res.status },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
