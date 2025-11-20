import { NextRequest, NextResponse } from 'next/server';

interface ReportItem {
  date: string;
  services: number;
  revenue: number;
}

interface ServiceItem {
  serviceDate: string;
  serviceName: string;
  customerGender: string;
  amountPaid: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportData, services, totalServices, totalRevenue, period } = body;

    // Create HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @font-face {
            font-family: 'NotoSansBengali';
            src: url('/fonts/NotoSansBengali-Regular.ttf') format('truetype');
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 40px;
            color: #333;
            background-color: #ffffff;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding-left: 20px;
            padding-right: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
          }
          .title {
            font-family: 'NotoSansBengali';
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1f2937;
          }
          .subtitle {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #374151;
          }
          .period {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 0;
            font-style: italic;
          }
          .section-title {
            font-family: 'NotoSansBengali';
            font-size: 16px;
            font-weight: bold;
            margin-top: 30px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #3b82f6;
            color: #1f2937;
          }
          .summary {
            margin-bottom: 25px;
            padding: 15px;
            background-color: #f3f4f6;
            border-left: 4px solid #3b82f6;
            border-radius: 4px;
            line-height: 1.8;
          }
          .summary div {
            margin-bottom: 8px;
            font-size: 14px;
          }
          .summary div:last-child {
            margin-bottom: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            font-size: 13px;
          }
          th {
            background-color: #3b82f6;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #1e40af;
          }
          td {
            padding: 11px 12px;
            border: 1px solid #e5e7eb;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          tr:nth-child(odd) {
            background-color: #ffffff;
          }
          tr:hover {
            background-color: #f3f4f6;
          }
          .page-break {
            page-break-after: always;
            margin-top: 40px;
            margin-bottom: 40px;
          }
          @media print {
            body {
              padding: 30px;
            }
            .page-break {
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
        <div class="header">
          <div class="title">কালিকচ্ছ ইউনিয়ন ডিজিটাল সেন্টার</div>
          <div class="subtitle">Service Report</div>
          <div class="period">Period: ${period}</div>
        </div>

        <div class="section-title">রিপোর্ট সারসংক্ষেপ</div>
        <div class="summary">
          <div>Total Services: ${totalServices}</div>
          <div>Total Revenue: $${totalRevenue.toFixed(2)}</div>
        </div>

        <div class="section-title">দৈনিক বিবরণ</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Services</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
    `;

    reportData.forEach((item: ReportItem) => {
      htmlContent += `
        <tr>
          <td>${item.date}</td>
          <td>${item.services}</td>
          <td>$${item.revenue.toFixed(2)}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>

        <div class="page-break"></div>

        <div class="section-title">বিস্তারিত পরিষেবা</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Service</th>
              <th>Gender</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
    `;

    services.forEach((service: ServiceItem) => {
      htmlContent += `
        <tr>
          <td>${service.serviceDate}</td>
          <td>${service.serviceName}</td>
          <td>${service.customerGender}</td>
          <td>$${service.amountPaid.toFixed(2)}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
