import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saleSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = saleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updateData: any = {
      serviceId: result.data.serviceId,
      customerGender: result.data.customerGender,
      price: result.data.price,
      quantity: result.data.quantity,
      notes: result.data.notes,
      saleDate: result.data.saleDate ? new Date(result.data.saleDate) : undefined,
    };
    
    if (result.data.customerName !== undefined) {
      updateData.customerName = result.data.customerName || null;
    }
    
    const sale = await prisma.sale.update({
      where: { id },
      data: updateData,
      include: { service: true },
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error("Error updating sale:", error);
    return NextResponse.json(
      { error: "Failed to update sale" },
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
    await prisma.sale.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    );
  }
}
