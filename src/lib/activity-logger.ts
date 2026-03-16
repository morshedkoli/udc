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
    await Promise.all([
      prisma.activityLog.create({
        data: {
          action,
          entityType,
          entityId,
          details,
          userId: userId || null,
        },
      }),
      prisma.notification.create({
        data: {
          title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} ${action}`,
          message: details,
          type: action === "deleted" ? "warning" : action === "created" ? "success" : "info",
          entityType,
          entityId,
          href: getEntityHref(entityType, entityId),
          userId: userId || null,
        },
      }),
    ]);
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

function getEntityHref(entityType: EntityType, entityId: string): string {
  switch (entityType) {
    case "customer":
      return `/customers/${entityId}`;
    case "service":
      return "/services";
    case "assignment":
      return "/assignments";
    case "payment":
      return "/payments";
    default:
      return "/";
  }
}
