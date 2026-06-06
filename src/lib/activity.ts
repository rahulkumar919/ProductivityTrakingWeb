import { ActivityLog } from "@/models";

export async function logActivity(userId: string, type: string, description: string, metadata: Record<string, unknown> = {}) {
  return ActivityLog.create({ userId, type, description, metadata });
}
