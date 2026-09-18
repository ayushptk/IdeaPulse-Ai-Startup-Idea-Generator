import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SERVER_API_URL } from "@/lib/api-config";

const API_URL = SERVER_API_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/saved-ideas?email=${encodeURIComponent(session.user.email)}`, {
      headers: {
        "X-API-Key": INTERNAL_API_KEY,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch saved ideas" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { idea_key, idea_data } = body;
    const res = await fetch(`${API_URL}/saved-ideas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        email: session.user.email,
        idea_key,
        idea_data,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to save idea" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { idea_key } = body;
    const res = await fetch(`${API_URL}/saved-ideas`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        email: session.user.email,
        idea_key,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to delete saved idea" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
