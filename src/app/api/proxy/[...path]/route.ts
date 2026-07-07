import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL; // server-only, no NEXT_PUBLIC_ prefix
const API_KEY = process.env.X_API_KEY; // server-only

async function proxy(req: NextRequest, path: string[]) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { message: "Server misconfigured: API_URL is not set" },
      { status: 500 },
    );
  }

  const targetUrl = `${BACKEND_URL}/api/v1/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  headers.set("X_Api_Key", API_KEY!);
  headers.delete("host");

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
    redirect: "follow",
  });

  const resHeaders = new Headers(res.headers);
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
