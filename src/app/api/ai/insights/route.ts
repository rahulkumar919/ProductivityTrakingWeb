import { NextResponse } from "next/server";
import { generateProductivityInsights } from "@/lib/ai";

export async function POST(request: Request) {
  const body = await request.json();
  const insight = await generateProductivityInsights(JSON.stringify(body, null, 2));
  return NextResponse.json({ insight });
}
