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
      totalServices,
      totalSales,
      revenueAggregate,
      todayRevenueAggregate,
      recentSales,
    ] = await Promise.all([
      prisma.service.count({ where: { status: "active" } }),
      prisma.sale.count(),
      prisma.sale.aggregate({ _sum: { price: true } }),
      prisma.sale.aggregate({
        where: {
          saleDate: { gte: todayStart, lte: todayEnd },
        },
        _sum: { price: true },
      }),
      prisma.sale.findMany({
        orderBy: { saleDate: "desc" },
        take: 5,
        include: { service: true },
      }),
    ]);

    const totalRevenue = revenueAggregate._sum.price || 0;
    const todayRevenue = todayRevenueAggregate._sum.price || 0;

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

      return prisma.sale
        .aggregate({
          where: { saleDate: { gte: monthStart, lte: monthEnd } },
          _sum: { price: true },
        })
        .then((agg) => ({
          month: monthLabel,
          revenue: agg._sum.price || 0,
        }));
    });

    const monthlyRevenue = await Promise.all(monthlyQueries);

    return NextResponse.json({
      totalServices,
      totalSales,
      totalRevenue,
      todayRevenue,
      monthlyRevenue,
      recentSales,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
