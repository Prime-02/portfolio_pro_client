import { NextRequest, NextResponse } from "next/server";

const SERVER_URL = process.env.API_URL;
const BACKUP_SERVER_URL = process.env.BACKUP_SERVER;
const API_KEY = process.env.X_API_KEY; // server-only

async function proxy(req: NextRequest, path: string[]) {
  if (!SERVER_URL && !BACKUP_SERVER_URL) {
    return NextResponse.json(
      { message: "Server misconfigured: API_URL is not set" },
      { status: 500 },
    );
  }

  const headers = new Headers(req.headers);
  headers.set("X_Api_Key", API_KEY!);
  headers.delete("host");

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  const candidates = [SERVER_URL, BACKUP_SERVER_URL].filter(
    (url): url is string => Boolean(url),
  );

  let res: Response | undefined;
  const errors: { targetUrl: string; cause: string }[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const base = candidates[i];
    const targetUrl = `${base}/api/v1/${path.join("/")}${req.nextUrl.search}`;
    const isLastAttempt = i === candidates.length - 1;

    try {
      res = await fetch(targetUrl, {
        method: req.method,
        headers,
        // body is an ArrayBuffer read once above; reuse across attempts is fine
        // since arrayBuffer() already fully consumed the original stream.
        body,
        redirect: "follow",
      });
      // Got a response (even a non-2xx one) — backend is reachable, stop here.
      break;
    } catch (err) {
      // fetch() throws on network-level failures: backend down, wrong host,
      // DNS failure, TLS error, connection refused, etc.
      const cause = err instanceof Error ? err.message : String(err);
      console.error(`[proxy] fetch failed for ${targetUrl}:`, err);
      errors.push({ targetUrl, cause });

      if (isLastAttempt) {
        return NextResponse.json(
          {
            message: "Failed to reach backend (primary and backup)",
            attempts: errors,
          },
          { status: 502 },
        );
      }
      // otherwise fall through to try the next candidate
    }
  }

  // Should be unreachable given the checks above, but keep TypeScript happy
  // and guard against an empty candidates array edge case.
  if (!res) {
    return NextResponse.json(
      { message: "Failed to reach backend", attempts: errors },
      { status: 502 },
    );
  }

  const resHeaders = new Headers(res.headers);
  resHeaders.delete("content-encoding");
  resHeaders.delete("content-length");
  resHeaders.delete("transfer-encoding");

  return new NextResponse(res.body, {
    status: res.status,
    headers: resHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxy(req, path);
}
export async function POST(req: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxy(req, path);
}
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxy(req, path);
}
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxy(req, path);
}
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  return proxy(req, path);
}
