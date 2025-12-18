import { NextResponse } from 'next/server';
import { getAllServiceOptions, insertServiceOption } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const options = await getAllServiceOptions();
        return NextResponse.json(options);
    } catch (error) {
        console.error('Error fetching service options:', error);
        return NextResponse.json({ error: 'Failed to fetch service options' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name } = await request.json();

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Service name is required' }, { status: 400 });
        }

        await insertServiceOption(name.trim());
        return NextResponse.json({ message: 'Service option added successfully' });
    } catch (error) {
        console.error('Error adding service option:', error);
        return NextResponse.json({ error: 'Failed to add service option' }, { status: 500 });
    }
}
