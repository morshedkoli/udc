import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface SearchResult {
  type: "customer" | "service" | "assignment";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json([]);
    }

    // Run all searches in parallel for better performance
    const [customers, services, assignments] = await Promise.all([
      prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      prisma.service.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
        },
        take: 10,
      }),
      prisma.serviceAssignment.findMany({
        where: {
          OR: [
            { customer: { name: { contains: q, mode: "insensitive" } } },
            { service: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { customer: true, service: true },
        take: 10,
      }),
    ]);

    const results: SearchResult[] = [];

    for (const customer of customers) {
      results.push({
        type: "customer",
        id: customer.id,
        title: customer.name,
        subtitle: [customer.phone, customer.email].filter(Boolean).join(" | ") || "Customer",
        href: `/customers/${customer.id}`,
      });
    }

    for (const service of services) {
      results.push({
        type: "service",
        id: service.id,
        title: service.name,
        subtitle: `${service.category} - ${service.status}`,
        href: `/services`,
      });
    }

    for (const assignment of assignments) {
      results.push({
        type: "assignment",
        id: assignment.id,
        title: `${assignment.customer.name} - ${assignment.service.name}`,
        subtitle: `${assignment.status} | Price: ${assignment.customPrice}`,
        href: `/assignments`,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error performing search:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
