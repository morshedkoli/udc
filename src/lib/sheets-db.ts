import { google } from 'googleapis';

// Service account credentials from environment
const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
  : null;

const spreadsheetId = process.env.GOOGLE_SHEET_ID;

if (!spreadsheetId) {
  throw new Error('GOOGLE_SHEET_ID environment variable is required');
}

// Initialize Google Sheets API
let sheets: any = null;

async function getSheets() {
  if (sheets) return sheets;

  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  sheets = google.sheets({ version: 'v4', auth: authClient });
  return sheets;
}

// Service options are now managed dynamically via the UI

type ServiceDocument = {
  serviceName: string;
  serviceDate: string;
  quantity: number;
  amountPaid: number;
  customerGender: string;
  notes?: string | null;
};

type ServiceRecord = ServiceDocument & { id: string };

let initialized = false;

async function ensureSheetStructure() {
  const api = await getSheets();

  try {
    // Check if sheets exist
    const response = await api.spreadsheets.get({
      spreadsheetId,
    });

    const sheetNames = response.data.sheets?.map((s: any) => s.properties?.title) || [];

    // Create 'services' sheet if it doesn't exist
    if (!sheetNames.includes('services')) {
      await api.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'services',
              },
            },
          }],
        },
      });

      // Add headers
      await api.spreadsheets.values.update({
        spreadsheetId,
        range: 'services!A1:G1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['id', 'serviceName', 'serviceDate', 'quantity', 'amountPaid', 'customerGender', 'notes']],
        },
      });
    }

    // Create 'serviceOptions' sheet if it doesn't exist
    if (!sheetNames.includes('serviceOptions')) {
      await api.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'serviceOptions',
              },
            },
          }],
        },
      });

      // Add headers only (no default options)
      await api.spreadsheets.values.update({
        spreadsheetId,
        range: 'serviceOptions!A1:A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['name']],
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring sheet structure:', error);
    throw error;
  }
}

async function ensureInitialized() {
  if (!initialized) {
    await ensureSheetStructure();
    initialized = true;
  }
}

export async function getAllServices(): Promise<ServiceRecord[]> {
  await ensureInitialized();
  const api = await getSheets();

  const response = await api.spreadsheets.values.get({
    spreadsheetId,
    range: 'services!A2:G',
  });

  const rows = response.data.values || [];
  return rows.map((row: any[]) => ({
    id: row[0] || '',
    serviceName: row[1] || '',
    serviceDate: row[2] || '',
    quantity: parseFloat(row[3]) || 1,
    amountPaid: parseFloat(row[4]) || 0,
    customerGender: row[5] || '',
    notes: row[6] || null,
  })).sort((a: any, b: any) => b.serviceDate.localeCompare(a.serviceDate));
}

export async function getAllServiceOptions(): Promise<string[]> {
  await ensureInitialized();
  const api = await getSheets();

  const response = await api.spreadsheets.values.get({
    spreadsheetId,
    range: 'serviceOptions!A2:A',
  });

  const rows = response.data.values || [];
  return rows.map((row: any[]) => row[0]).filter(Boolean).sort();
}

export async function getServicesByDateRange(startDate: string, endDate: string): Promise<ServiceRecord[]> {
  const allServices = await getAllServices();
  return allServices.filter(
    service => service.serviceDate >= startDate && service.serviceDate <= endDate
  );
}

export async function getServicesLastNDays(days: number): Promise<ServiceRecord[]> {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const startDate = date.toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  return getServicesByDateRange(startDate, endDate);
}

export async function getRecentServices(limit = 10): Promise<ServiceRecord[]> {
  const allServices = await getAllServices();
  return allServices.slice(0, limit);
}

export async function getAggregatedStats(startDate: string, endDate: string) {
  const services = await getServicesByDateRange(startDate, endDate);

  const stats = services.reduce(
    (acc, service) => {
      acc.totalServices++;
      acc.totalRevenue += service.amountPaid;

      switch (service.customerGender) {
        case 'Male':
          acc.maleCount++;
          break;
        case 'Female':
          acc.femaleCount++;
          break;
        case 'Other':
          acc.otherCount++;
          break;
        case 'Prefer Not To Say':
          acc.preferNotToSayCount++;
          break;
      }

      return acc;
    },
    {
      totalServices: 0,
      totalRevenue: 0,
      maleCount: 0,
      femaleCount: 0,
      otherCount: 0,
      preferNotToSayCount: 0,
    }
  );

  return {
    totalServices: stats.totalServices,
    totalRevenue: stats.totalRevenue,
    genderBreakdown: {
      male: stats.maleCount,
      female: stats.femaleCount,
      other: stats.otherCount,
      preferNotToSay: stats.preferNotToSayCount,
    },
  };
}

export async function insertService(service: ServiceDocument): Promise<string> {
  await ensureInitialized();
  const api = await getSheets();

  const id = Date.now().toString();

  await api.spreadsheets.values.append({
    spreadsheetId,
    range: 'services!A2',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        id,
        service.serviceName,
        service.serviceDate,
        service.quantity,
        service.amountPaid,
        service.customerGender,
        service.notes || '',
      ]],
    },
  });

  return id;
}

export async function insertServiceOption(name: string): Promise<void> {
  await ensureInitialized();
  const api = await getSheets();

  // Check if option already exists
  const existingOptions = await getAllServiceOptions();
  if (existingOptions.includes(name)) {
    return;
  }

  await api.spreadsheets.values.append({
    spreadsheetId,
    range: 'serviceOptions!A2',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[name]],
    },
  });
}

export async function updateServiceOption(index: number, name: string): Promise<void> {
  await ensureInitialized();
  const api = await getSheets();

  // Row index is index + 2 (header row + 0-based to 1-based)
  const rowNumber = index + 2;

  await api.spreadsheets.values.update({
    spreadsheetId,
    range: `serviceOptions!A${rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[name]],
    },
  });
}

export async function deleteServiceOption(index: number): Promise<void> {
  await ensureInitialized();
  const api = await getSheets();

  // Get all service options
  const allOptions = await getAllServiceOptions();

  // Remove the item at the specified index
  allOptions.splice(index, 1);

  // Clear all data except header
  await api.spreadsheets.values.clear({
    spreadsheetId,
    range: 'serviceOptions!A2:A',
  });

  // Re-write all remaining options
  if (allOptions.length > 0) {
    await api.spreadsheets.values.append({
      spreadsheetId,
      range: 'serviceOptions!A2',
      valueInputOption: 'RAW',
      requestBody: {
        values: allOptions.map(name => [name]),
      },
    });
  }
}
