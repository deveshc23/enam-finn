import { NextRequest, NextResponse } from "next/server";

const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join("/") : "";
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_INTERNAL_URL}/api/${path}${searchParams ? `?${searchParams}` : ""}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Backend responded with ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error(`Proxy GET /api/${path} failed:`, err);
    return NextResponse.json(
      { error: "Backend proxy unreachable", details: err?.message || String(err) },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join("/") : "";
  const targetUrl = `${BACKEND_INTERNAL_URL}/api/${path}`;

  try {
    const body = await request.json();
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Backend responded with ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error(`Proxy POST /api/${path} failed:`, err);
    return NextResponse.json(
      { error: "Backend proxy unreachable", details: err?.message || String(err) },
      { status: 502 }
    );
  }
}
