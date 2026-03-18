import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saleSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const serviceId = searchParams.get("serviceId");

    const where: Record<string, unknown> = {};
    
    if (startDate && endDate) {
      where.saleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.saleDate = { gte: new Date(startDate) };
    } else if (endDate) {
      where.saleDate = { lte: new Date(endDate) };
    }
    
    if (serviceId) {
      where.serviceId = serviceId;
    }

    const sales = await prisma.sale.findMany({
      where,
      include: { service: true },
      orderBy: { saleDate: "desc" },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = saleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const saleData: any = {
      serviceId: result.data.serviceId,
      customerGender: result.data.customerGender,
      price: result.data.price,
      quantity: result.data.quantity,
      notes: result.data.notes,
      saleDate: result.data.saleDate ? new Date(result.data.saleDate) : new Date(),
    };
    
    if (result.data.customerName) {
      saleData.customerName = result.data.customerName;
    }
    
    const sale = await prisma.sale.create({
      data: saleData,
      include: { service: true },
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
