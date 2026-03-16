import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity-logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId")?.trim();

    const where: Record<string, unknown> = {};
    if (assignmentId) {
      where.assignmentId = assignmentId;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        assignment: {
          include: {
            customer: true,
            service: true,
          },
        },
      },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = paymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {
      assignmentId: result.data.assignmentId,
      amount: result.data.amount,
      method: result.data.method,
      notes: result.data.notes,
    };

    if (result.data.paymentDate) {
      data.paymentDate = new Date(result.data.paymentDate);
    }

    const payment = await prisma.payment.create({
      data: data as Parameters<typeof prisma.payment.create>[0]["data"],
      include: {
        assignment: {
          include: {
            customer: true,
            service: true,
          },
        },
      },
    });

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Check if total payments for this assignment >= customPrice, auto-complete
    const totalPaid = await prisma.payment.aggregate({
      where: { assignmentId: result.data.assignmentId },
      _sum: { amount: true },
    });

    const assignment = await prisma.serviceAssignment.findUnique({
      where: { id: result.data.assignmentId },
    });

    if (
      assignment &&
      assignment.status !== "completed" &&
      (totalPaid._sum.amount || 0) >= assignment.customPrice
    ) {
      await prisma.serviceAssignment.update({
        where: { id: result.data.assignmentId },
        data: { status: "completed" },
      });

      await logActivity(
        "auto-completed",
        "assignment",
        assignment.id,
        `Assignment auto-completed: total payments reached ${totalPaid._sum.amount}`,
        userId
      );
    }

    await logActivity(
      "created",
      "payment",
      payment.id,
      `Payment of ${payment.amount} for "${payment.assignment.customer.name}" - "${payment.assignment.service.name}"`,
      userId
    );

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
