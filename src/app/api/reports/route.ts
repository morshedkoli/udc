import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getDateRange(period: string, startDate?: string, endDate?: string) {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (period) {
    case "daily":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "weekly":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      break;
    case "biweekly":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
      break;
    case "monthly":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "yearly":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case "custom":
      start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
      end = endDate ? new Date(endDate + "T23:59:59.999") : end;
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  return { start, end };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "daily";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const { start, end } = getDateRange(period, startDate, endDate);

    // Fetch sales in date range with service relations
    const sales = await prisma.sale.findMany({
      where: {
        saleDate: { gte: start, lte: end },
      },
      include: {
        service: { select: { id: true, name: true } },
      },
      orderBy: { saleDate: "desc" },
    });

    // Calculate total revenue
    let totalRevenue = 0;
    const serviceMap: Record<string, { name: string; count: number; revenue: number }> = {};

    sales.forEach((sale) => {
      totalRevenue += sale.price;

      // Build top services data
      const svcId = sale.serviceId;
      if (!serviceMap[svcId]) {
        serviceMap[svcId] = { name: sale.service.name, count: 0, revenue: 0 };
      }
      serviceMap[svcId].count += 1;
      serviceMap[svcId].revenue += sale.price;
    });

    const topServices = Object.values(serviceMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Build chart data grouped by day
    const revenueByDay: Record<string, number> = {};
    sales.forEach((sale) => {
      const day = new Date(sale.saleDate).toISOString().split("T")[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + sale.price;
    });

    const chartData = Object.entries(revenueByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        revenue,
      }));

    return NextResponse.json({
      sales,
      totalRevenue,
      totalSales: sales.length,
      topServices,
      chartData,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
