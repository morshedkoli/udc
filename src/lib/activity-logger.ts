import { prisma } from "@/lib/prisma";

type EntityType = "customer" | "service" | "assignment" | "payment" | "user";

export async function logActivity(
  action: string,
  entityType: EntityType,
  entityId: string = "",
  details: string = "",
  userId?: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        entityType,
        entityId,
        details,
        userId: userId || null,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
