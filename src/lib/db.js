import Database from 'better-sqlite3';
import { join } from 'path';

// Create or connect to the database
const dbPath = join(process.cwd(), 'services.db');
const db = new Database(dbPath);

// Initialize the database table
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serviceName TEXT NOT NULL,
      serviceDate TEXT NOT NULL,
      amountPaid REAL NOT NULL,
      customerGender TEXT NOT NULL,
      notes TEXT
    )
  `);
  
  // Create a separate table for service options to allow customization
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);
  
  // Insert default service options if they don't exist
  const defaultServices = [
    'ফটোকপি',
    'জন্ম নিবন্ধন আবেদন',
    'ভূমি কর',
    'চাকরির আবেদন',
    'আইডি কার্ড আবেদন'
  ];
  
  const insertStmt = db.prepare('INSERT OR IGNORE INTO service_options (name) VALUES (?)');
  defaultServices.forEach(service => {
    insertStmt.run(service);
  });
}

// Get all services
export function getAllServices() {
  return db.prepare('SELECT * FROM services ORDER BY serviceDate DESC').all();
}

// Get all service options
export function getAllServiceOptions() {
  return db.prepare('SELECT name FROM service_options ORDER BY name').all().map(row => row.name);
}

// Get services within a date range
export function getServicesByDateRange(startDate, endDate) {
  return db.prepare(
    'SELECT * FROM services WHERE serviceDate BETWEEN ? AND ? ORDER BY serviceDate DESC'
  ).all(startDate, endDate);
}

// Get services for the last N days
export function getServicesLastNDays(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const startDate = date.toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  
  return db.prepare(
    'SELECT * FROM services WHERE serviceDate BETWEEN ? AND ? ORDER BY serviceDate DESC'
  ).all(startDate, endDate);
}

// Get aggregated stats for a date range
export function getAggregatedStats(startDate, endDate) {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as totalServices,
      SUM(amountPaid) as totalRevenue,
      SUM(CASE WHEN customerGender = 'Male' THEN 1 ELSE 0 END) as maleCount,
      SUM(CASE WHEN customerGender = 'Female' THEN 1 ELSE 0 END) as femaleCount,
      SUM(CASE WHEN customerGender = 'Other' THEN 1 ELSE 0 END) as otherCount,
      SUM(CASE WHEN customerGender = 'Prefer Not To Say' THEN 1 ELSE 0 END) as preferNotToSayCount
    FROM services 
    WHERE serviceDate BETWEEN ? AND ?
  `).get(startDate, endDate);
  
  return {
    totalServices: stats.totalServices || 0,
    totalRevenue: stats.totalRevenue || 0,
    genderBreakdown: {
      male: stats.maleCount || 0,
      female: stats.femaleCount || 0,
      other: stats.otherCount || 0,
      preferNotToSay: stats.preferNotToSayCount || 0
    }
  };
}

// Insert a new service
export function insertService(service) {
  const stmt = db.prepare(`
    INSERT INTO services (serviceName, serviceDate, amountPaid, customerGender, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    service.serviceName,
    service.serviceDate,
    service.amountPaid,
    service.customerGender,
    service.notes || null
  );
  
  return result.lastInsertRowid;
}

// Insert a new service option
export function insertServiceOption(name) {
  const stmt = db.prepare('INSERT OR IGNORE INTO service_options (name) VALUES (?)');
  return stmt.run(name);
}

// Get recent services (last 10)
export function getRecentServices(limit = 10) {
  return db.prepare('SELECT * FROM services ORDER BY id DESC LIMIT ?').all(limit);
}

// Initialize the database when the module is loaded
initDB();