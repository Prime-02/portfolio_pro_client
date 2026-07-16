import { BASE_URL } from "@/lib/utilities/syncFunctions/syncs";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // or "nodejs" if you need Node-specific APIs

const THUM_IO_BASE = "https://image.thum.io/get";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 },
    );
  }

  // Validate it's a thum.io URL to prevent open redirect abuse
  if (!url.startsWith(THUM_IO_BASE)) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
        Referer: BASE_URL,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Thum.io returned ${response.status}` },
        { status: 502 },
      );
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch snapshot" },
      { status: 500 },
    );
  }
}
