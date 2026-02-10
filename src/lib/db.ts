// Re-export all functions from Google Sheets database layer
export {
  getAllServices,
  getAllServiceOptions,
  getServicesByDateRange,
  getServicesLastNDays,
  getRecentServices,
  getAggregatedStats,
  insertService,
  insertServiceOption,
  updateServiceOption,
  deleteServiceOption,
} from './sheets-db';
