import { NextResponse } from 'next/server';
import { insertService } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.serviceName || !body.serviceDate || !body.amountPaid || !body.customerGender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate amountPaid is a number
    if (isNaN(parseFloat(body.amountPaid))) {
      return NextResponse.json(
        { error: 'Amount paid must be a valid number' },
        { status: 400 }
      );
    }
    
    // Insert the service
    const id = insertService({
      serviceName: body.serviceName,
      serviceDate: body.serviceDate,
      amountPaid: parseFloat(body.amountPaid),
      customerGender: body.customerGender,
      notes: body.notes || null
    });
    
    return NextResponse.json({ id, message: 'Service logged successfully' });
  } catch (error) {
    console.error('Error inserting service:', error);
    return NextResponse.json(
      { error: 'Failed to log service' },
      { status: 500 }
    );
  }
}