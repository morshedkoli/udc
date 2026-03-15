import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validators";
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

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const assignmentsCount = customer.assignments.length;
    const totalPayments = customer.assignments.reduce(
      (sum, assignment) =>
        sum + assignment.payments.reduce((pSum, p) => pSum + p.amount, 0),
      0
    );

    return NextResponse.json({
      ...customer,
      assignmentsCount,
      totalPayments,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
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
    const result = customerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: result.data,
    });

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    await logActivity("updated", "customer", customer.id, `Customer "${customer.name}" updated`, userId);

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
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

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    await prisma.customer.delete({ where: { id } });

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    await logActivity("deleted", "customer", id, `Customer "${existing.name}" deleted`, userId);

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
