/**
 * Server-side proxy for profile updates.
 *
 * Security model:
 * 1. The user's NextAuth session is verified server-side via getServerSession().
 * 2. The user's email from the verified session is used — NOT the one from the request body.
 * 3. The INTERNAL_API_KEY is added server-side (not exposed to the browser).
 *
 * This prevents the IDOR vulnerability where any client could PATCH
 * /auth/update with any victim email and overwrite their profile.
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL || "http://127.0.0.1:8000/api/v1";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

export async function PATCH(req: NextRequest) {
  // 1. Verify the caller has a valid NextAuth session
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse the request body
  let body: { name?: string; picture?: string; bio?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
  }

  // 3. Forward to FastAPI backend — email comes from the verified session, NOT the client body
  const backendRes = await fetch(`${BACKEND_URL}/auth/update`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": INTERNAL_API_KEY,
    },
    body: JSON.stringify({
      email: session.user.email, // Always use session email — never trust client
      name: body.name,
      picture: body.picture,
      bio: body.bio,
    }),
  });

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}
