import { db } from "@/db";
import { workSessions } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const [activeSession] = await db
    .select()
    .from(workSessions)
    .where(isNull(workSessions.endTime))
    .limit(1);

  return NextResponse.json({ activeSession: activeSession ?? null });
}

export async function POST() {
  const [existing] = await db
    .select()
    .from(workSessions)
    .where(isNull(workSessions.endTime))
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "Session already active" }, { status: 400 });
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const [session] = await db
    .insert(workSessions)
    .values({
      startTime: now.toISOString(),
      date: today,
    })
    .returning();

  return NextResponse.json({ session });
}

export async function PATCH() {
  const now = new Date().toISOString();
  const [activeSession] = await db
    .select()
    .from(workSessions)
    .where(isNull(workSessions.endTime))
    .limit(1);

  if (!activeSession) {
    return NextResponse.json({ error: "No active session" }, { status: 400 });
  }

  const [updated] = await db
    .update(workSessions)
    .set({ endTime: now })
    .where(and(eq(workSessions.id, activeSession.id), isNull(workSessions.endTime)))
    .returning();

  return NextResponse.json({ session: updated });
}


