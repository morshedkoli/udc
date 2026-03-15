import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Total customers
    const totalCustomers = await prisma.customer.count();

    // Total active services
    const totalServices = await prisma.service.count({
      where: { status: "active" },
    });

    // Total revenue (sum of all payments)
    const revenueAggregate = await prisma.payment.aggregate({
      _sum: { amount: true },
    });
    const totalRevenue = revenueAggregate._sum.amount || 0;

    // Today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayRevenueAggregate = await prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      _sum: { amount: true },
    });
    const todayRevenue = todayRevenueAggregate._sum.amount || 0;

    // Pending amount: sum of (customPrice - totalPaid) for non-completed assignments
    const nonCompletedAssignments = await prisma.serviceAssignment.findMany({
      where: {
        status: { not: "completed" },
      },
      include: {
        payments: {
          select: { amount: true },
        },
      },
    });

    const pendingAmount = nonCompletedAssignments.reduce((sum, assignment) => {
      const totalPaid = assignment.payments.reduce((pSum, p) => pSum + p.amount, 0);
      return sum + Math.max(0, assignment.customPrice - totalPaid);
    }, 0);

    // Completed assignments count
    const completedAssignments = await prisma.serviceAssignment.count({
      where: { status: "completed" },
    });

    // Monthly revenue for last 6 months
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthAggregate = await prisma.payment.aggregate({
        where: {
          paymentDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { amount: true },
      });

      const monthLabel = monthStart.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });

      monthlyRevenue.push({
        month: monthLabel,
        revenue: monthAggregate._sum.amount || 0,
      });
    }

    // Recent activity (last 5)
    const recentActivity = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      totalCustomers,
      totalServices,
      totalRevenue,
      todayRevenue,
      pendingAmount,
      completedAssignments,
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
