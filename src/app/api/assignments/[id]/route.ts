import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignmentSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity-logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const assignment = await prisma.serviceAssignment.findUnique({
      where: { id },
      include: {
        customer: true,
        service: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = assignmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.serviceAssignment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
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

    const assignment = await prisma.serviceAssignment.update({
      where: { id },
      data: data as Parameters<typeof prisma.serviceAssignment.update>[0]["data"],
      include: {
        customer: true,
        service: true,
      },
    });

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    await logActivity(
      "updated",
      "assignment",
      assignment.id,
      `Assignment for "${assignment.customer.name}" - "${assignment.service.name}" updated`,
      userId
    );

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.serviceAssignment.findUnique({
      where: { id },
      include: { customer: true, service: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    await prisma.serviceAssignment.delete({ where: { id } });

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    await logActivity(
      "deleted",
      "assignment",
      id,
      `Assignment for "${existing.customer.name}" - "${existing.service.name}" deleted`,
      userId
    );

    return NextResponse.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
