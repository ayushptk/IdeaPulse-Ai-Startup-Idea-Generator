import { NextResponse } from 'next/server';
import { SERVER_API_URL } from '@/lib/api-config';

export async function POST() {
  const apiUrl = SERVER_API_URL;
  const apiKey = process.env.INTERNAL_API_KEY || '';

  try {
    const res = await fetch(`${apiUrl}/pipelines/run-all`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
