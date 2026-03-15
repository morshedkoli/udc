import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Run independent queries in parallel
    const [
      totalCustomers,
      totalServices,
      revenueAggregate,
      todayRevenueAggregate,
      nonCompletedAssignments,
      recentActivity,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.service.count({ where: { status: "active" } }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.payment.aggregate({
        where: {
          paymentDate: { gte: todayStart, lte: todayEnd },
        },
        _sum: { amount: true },
      }),
      prisma.serviceAssignment.findMany({
        where: { status: { not: "completed" } },
        include: { payments: { select: { amount: true } } },
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { id: true, name: true } },
        },
      }),
    ]);

    const totalRevenue = revenueAggregate._sum.amount || 0;
    const todayRevenue = todayRevenueAggregate._sum.amount || 0;

    const pendingAmount = nonCompletedAssignments.reduce((sum, assignment) => {
      const totalPaid = assignment.payments.reduce((pSum, p) => pSum + p.amount, 0);
      return sum + Math.max(0, assignment.customPrice - totalPaid);
    }, 0);

    // Monthly revenue for last 6 months — run all 6 in parallel
    const monthlyQueries = Array.from({ length: 6 }, (_, idx) => {
      const i = 5 - idx;
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthLabel = monthStart.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });

      return prisma.payment
        .aggregate({
          where: { paymentDate: { gte: monthStart, lte: monthEnd } },
          _sum: { amount: true },
        })
        .then((agg) => ({
          month: monthLabel,
          revenue: agg._sum.amount || 0,
        }));
    });

    const monthlyRevenue = await Promise.all(monthlyQueries);

    return NextResponse.json({
      totalCustomers,
      totalServices,
      totalRevenue,
      todayRevenue,
      pendingAmount,
      monthlyRevenue,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
