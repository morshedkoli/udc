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

    // Fetch assignments in date range with payments and relations
    const assignments = await prisma.serviceAssignment.findMany({
      where: {
        assignedDate: { gte: start, lte: end },
      },
      include: {
        customer: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } },
        payments: true,
      },
      orderBy: { assignedDate: "desc" },
    });

    // Calculate total revenue from payments of filtered assignments
    let totalRevenue = 0;
    const serviceMap: Record<string, { name: string; count: number; revenue: number }> = {};

    assignments.forEach((a) => {
      const paymentTotal = a.payments.reduce((sum, p) => sum + p.amount, 0);
      totalRevenue += paymentTotal;

      // Build top services data
      const svcId = a.serviceId;
      if (!serviceMap[svcId]) {
        serviceMap[svcId] = { name: a.service.name, count: 0, revenue: 0 };
      }
      serviceMap[svcId].count += 1;
      serviceMap[svcId].revenue += paymentTotal;
    });

    const topServices = Object.values(serviceMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate pending payments
    const pendingPayments = assignments.reduce((sum, a) => {
      if (a.status !== "completed") {
        const paid = a.payments.reduce((s, p) => s + p.amount, 0);
        return sum + Math.max(0, a.customPrice - paid);
      }
      return sum;
    }, 0);

    // Build chart data grouped by day
    const revenueByDay: Record<string, number> = {};
    assignments.forEach((a) => {
      a.payments.forEach((p) => {
        const day = new Date(p.paymentDate).toISOString().split("T")[0];
        revenueByDay[day] = (revenueByDay[day] || 0) + p.amount;
      });
    });

    const chartData = Object.entries(revenueByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        revenue,
      }));

    return NextResponse.json({
      assignments,
      totalRevenue,
      totalAssignments: assignments.length,
      topServices,
      chartData,
      pendingPayments,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
