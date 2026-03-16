import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity-logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim();
    const status = searchParams.get("status")?.trim();

    const where: Record<string, unknown> = {};
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = serviceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: result.data,
    });

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    await logActivity("created", "service", service.id, `Service "${service.name}" created`, userId);

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
