import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignmentSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity-logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId")?.trim();
    const serviceId = searchParams.get("serviceId")?.trim();
    const status = searchParams.get("status")?.trim();

    const where: Record<string, unknown> = {};
    if (customerId) {
      where.customerId = customerId;
    }
    if (serviceId) {
      where.serviceId = serviceId;
    }
    if (status) {
      where.status = status;
    }

    const assignments = await prisma.serviceAssignment.findMany({
      where,
      include: {
        customer: true,
        service: true,
        payments: true,
      },
      orderBy: { assignedDate: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = assignmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {
      customerId: result.data.customerId,
      serviceId: result.data.serviceId,
      customPrice: result.data.customPrice,
      status: result.data.status,
      notes: result.data.notes,
    };

    if (result.data.assignedDate) {
      data.assignedDate = new Date(result.data.assignedDate);
    }

    const assignment = await prisma.serviceAssignment.create({
      data: data as Parameters<typeof prisma.serviceAssignment.create>[0]["data"],
      include: {
        customer: true,
        service: true,
      },
    });

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    await logActivity(
      "created",
      "assignment",
      assignment.id,
      `Assignment for "${assignment.customer.name}" - "${assignment.service.name}" created`,
      userId
    );

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
