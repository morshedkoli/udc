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

    // Validate quantity is a number (default to 1 if not provided)
    const quantity = body.quantity ? parseFloat(body.quantity) : 1;
    if (isNaN(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be a valid number greater than 0' },
        { status: 400 }
      );
    }

    // Insert the service
    const id = await insertService({
      serviceName: body.serviceName,
      serviceDate: body.serviceDate,
      quantity: quantity,
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