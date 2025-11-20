import { NextResponse } from 'next/server';
import { 
  getAllServices, 
  getServicesByDateRange, 
  getAggregatedStats, 
  getRecentServices,
  getServicesLastNDays,
  getAllServiceOptions
} from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') || 'all';
    
    // Handle different request types
    switch (type) {
      case 'recent':
        // Get recent services (last 10)
        const recentServices = getRecentServices(10);
        return NextResponse.json(recentServices);
      
      case 'stats':
        // Get aggregated stats
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate and endDate are required for stats' },
            { status: 400 }
          );
        }
        const stats = getAggregatedStats(startDate, endDate);
        return NextResponse.json(stats);
      
      case 'range':
        // Get services within date range
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate and endDate are required for range query' },
            { status: 400 }
          );
        }
        const servicesInRange = getServicesByDateRange(startDate, endDate);
        return NextResponse.json(servicesInRange);
      
      case 'last15days':
        // Get services from last 15 days
        const servicesLast15Days = getServicesLastNDays(15);
        return NextResponse.json(servicesLast15Days);
      
      case 'service-options':
        // Get all service options
        const serviceOptions = getAllServiceOptions();
        return NextResponse.json(serviceOptions);
        
      case 'all':
      default:
        // Get all services
        const allServices = getAllServices();
        return NextResponse.json(allServices);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}