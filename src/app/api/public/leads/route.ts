import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PublicLeadSchema } from "@/lib/validations/public-lead";

const ALLOWED_ORIGINS = [
  process.env.PUBLIC_SITE_ORIGIN,
  "http://localhost:3001",
  "http://localhost:3000",
].filter((origin): origin is string => Boolean(origin));

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const requestLog = new Map<string, number[]>();

function corsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin ?? "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Слишком много заявок, попробуйте позже." },
      { status: 429, headers: corsHeaders(request) }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400, headers: corsHeaders(request) });
  }

  const validated = PublicLeadSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { ok: false, error: "Проверьте имя и телефон.", fieldErrors: validated.error.flatten().fieldErrors },
      { status: 400, headers: corsHeaders(request) }
    );
  }

  const data = validated.data;

  // Honeypot tripped — pretend success so bots don't learn anything, just skip creating a lead.
  if (data.website) {
    return NextResponse.json({ ok: true }, { headers: corsHeaders(request) });
  }

  const existing = await prisma.contact.findFirst({
    where: { phone: data.phone, deletedAt: null },
    select: { id: true },
  });

  if (existing) {
    await prisma.contact.update({
      where: { id: existing.id },
      data: { lastContactedAt: new Date() },
    });
    return NextResponse.json({ ok: true }, { headers: corsHeaders(request) });
  }

  await prisma.contact.create({
    data: {
      fullName: data.fullName,
      phone: data.phone,
      source: "WEBSITE",
      format: data.format || null,
      sourceDetail: data.comment || null,
      stage: "LEAD",
    },
  });

  return NextResponse.json({ ok: true }, { headers: corsHeaders(request) });
}
