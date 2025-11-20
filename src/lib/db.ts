import { MongoClient, WithId } from 'mongodb';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI environment variable is required');
}

const dbName = process.env.MONGODB_DB_NAME || 'service-logger-dashboard';
const client = new MongoClient(uri);
const clientPromise = global._mongoClientPromise ?? (global._mongoClientPromise = client.connect());

const defaultServiceOptions = [
  'ফটোকপি',
  'জন্ম নিবন্ধন আবেদন',
  'ভূমি কর',
  'চাকরির আবেদন',
  'আইডি কার্ড আবেদন'
];

async function getDb() {
  const mongo = await clientPromise;
  return mongo.db(dbName);
}

let initialized = false;

async function ensureServiceOptions() {
  const db = await getDb();
  const collection = db.collection('serviceOptions');
  await collection.createIndex({ name: 1 }, { unique: true });
  await Promise.all(
    defaultServiceOptions.map((name) =>
      collection.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true })
    )
  );
}

async function ensureInitialized() {
  if (!initialized) {
    await ensureServiceOptions();
    initialized = true;
  }
}

type ServiceDocument = {
  serviceName: string;
  serviceDate: string;
  amountPaid: number;
  customerGender: string;
  notes?: string | null;
};

type ServiceRecord = ServiceDocument & { id: string };

function normalize(doc: WithId<ServiceDocument>): ServiceRecord {
  return {
    id: doc._id.toString(),
    serviceName: doc.serviceName,
    serviceDate: doc.serviceDate,
    amountPaid: doc.amountPaid,
    customerGender: doc.customerGender,
    notes: doc.notes ?? null
  };
}

export async function getAllServices() {
  await ensureInitialized();
  const db = await getDb();
  const docs = await db
    .collection<ServiceDocument>('services')
    .find()
    .sort({ serviceDate: -1 })
    .toArray();
  return docs.map(normalize);
}

export async function getAllServiceOptions() {
  await ensureInitialized();
  const db = await getDb();
  const docs = await db.collection('serviceOptions').find().sort({ name: 1 }).toArray();
  return docs.map((option) => option.name);
}

export async function getServicesByDateRange(startDate: string, endDate: string) {
  await ensureInitialized();
  const db = await getDb();
  const docs = await db
    .collection<ServiceDocument>('services')
    .find({ serviceDate: { $gte: startDate, $lte: endDate } })
    .sort({ serviceDate: -1 })
    .toArray();
  return docs.map(normalize);
}

export async function getServicesLastNDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const startDate = date.toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  return getServicesByDateRange(startDate, endDate);
}

export async function getRecentServices(limit = 10) {
  await ensureInitialized();
  const db = await getDb();
  const docs = await db
    .collection<ServiceDocument>('services')
    .find()
    .sort({ serviceDate: -1, _id: -1 })
    .limit(limit)
    .toArray();
  return docs.map(normalize);
}

export async function getAggregatedStats(startDate: string, endDate: string) {
  await ensureInitialized();
  const db = await getDb();
  const stats = await db
    .collection<ServiceDocument>('services')
    .aggregate([
      {
        $match: {
          serviceDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          totalRevenue: { $sum: '$amountPaid' },
          maleCount: {
            $sum: { $cond: [{ $eq: ['$customerGender', 'Male'] }, 1, 0] }
          },
          femaleCount: {
            $sum: { $cond: [{ $eq: ['$customerGender', 'Female'] }, 1, 0] }
          },
          otherCount: {
            $sum: { $cond: [{ $eq: ['$customerGender', 'Other'] }, 1, 0] }
          },
          preferNotToSayCount: {
            $sum: { $cond: [{ $eq: ['$customerGender', 'Prefer Not To Say'] }, 1, 0] }
          }
        }
      }
    ])
    .next();

  return {
    totalServices: stats?.totalServices ?? 0,
    totalRevenue: stats?.totalRevenue ?? 0,
    genderBreakdown: {
      male: stats?.maleCount ?? 0,
      female: stats?.femaleCount ?? 0,
      other: stats?.otherCount ?? 0,
      preferNotToSay: stats?.preferNotToSayCount ?? 0
    }
  };
}

export async function insertService(service: ServiceDocument) {
  await ensureInitialized();
  const db = await getDb();
  const result = await db.collection<ServiceDocument>('services').insertOne(service);
  return result.insertedId.toString();
}

export async function insertServiceOption(name: string) {
  await ensureInitialized();
  const db = await getDb();
  return db.collection('serviceOptions').updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
}
