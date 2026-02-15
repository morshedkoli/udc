// Desktop storage utility for Electron app
// Uses localStorage for data persistence

const STORAGE_KEYS = {
  SERVICES: 'udc_services',
  SERVICE_OPTIONS: 'udc_service_options',
  ENTRIES: 'udc_entries',
};

interface Service {
  id: number;
  serviceName: string;
  serviceDate: string;
  amountPaid: number;
  customerGender: string;
  notes?: string;
  timestamp?: number;
}

interface Entry {
  id: number;
  serviceName: string;
  serviceDate: string;
  quantity: number;
  amountPaid: number;
  customerGender: string;
  timestamp: number;
}

class DesktopStorage {
  private static instance: DesktopStorage;

  static getInstance(): DesktopStorage {
    if (!DesktopStorage.instance) {
      DesktopStorage.instance = new DesktopStorage();
    }
    return DesktopStorage.instance;
  }

  // Initialize default service options
  initializeDefaults(): void {
    const options = this.getServiceOptions();
    if (options.length === 0) {
      const defaultOptions = [
        'জন্ম নিবন্ধন',
        'মৃত্যু নিবন্ধন',
        'জাতীয় পরিচয়পত্র',
        'পাসপোর্ট আবেদন',
        'অনলাইন আবেদন',
        'ছবি তোলা',
        'প্রিন্ট ও স্ক্যান',
        'ফটোকপি',
        'ইন্টারনেট ব্রাউজিং',
        'কম্পিউটার প্রশিক্ষণ',
      ];
      localStorage.setItem(STORAGE_KEYS.SERVICE_OPTIONS, JSON.stringify(defaultOptions));
    }
  }

  // Services
  getServices(): Service[] {
    const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return data ? JSON.parse(data) : [];
  }

  addService(service: Omit<Service, 'id'>): Service {
    const services = this.getServices();
    const newService: Service = {
      ...service,
      id: Date.now(),
      timestamp: Date.now(),
    };
    services.push(newService);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    return newService;
  }

  // Service Options
  getServiceOptions(): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.SERVICE_OPTIONS);
    return data ? JSON.parse(data) : [];
  }

  addServiceOption(option: string): void {
    const options = this.getServiceOptions();
    if (!options.includes(option)) {
      options.push(option);
      localStorage.setItem(STORAGE_KEYS.SERVICE_OPTIONS, JSON.stringify(options));
    }
  }

  deleteServiceOption(option: string): void {
    const options = this.getServiceOptions();
    const index = options.indexOf(option);
    if (index > -1) {
      options.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.SERVICE_OPTIONS, JSON.stringify(options));
    }
  }

  // Entries (for PIN-only mode)
  getEntries(): Entry[] {
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    return data ? JSON.parse(data) : [];
  }

  addEntry(entry: Omit<Entry, 'id' | 'timestamp'>): Entry {
    const entries = this.getEntries();
    const newEntry: Entry = {
      ...entry,
      id: Date.now(),
      timestamp: Date.now(),
    };
    entries.push(newEntry);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    return newEntry;
  }

  // Stats
  getStats(startDate?: string, endDate?: string): { totalServices: number; totalRevenue: number; genderBreakdown: any } {
    let services = this.getServices();
    
    if (startDate && endDate) {
      services = services.filter(s => s.serviceDate >= startDate && s.serviceDate <= endDate);
    }

    const totalServices = services.length;
    const totalRevenue = services.reduce((sum, s) => sum + s.amountPaid, 0);
    
    const genderBreakdown = {
      male: services.filter(s => s.customerGender === 'Male').length,
      female: services.filter(s => s.customerGender === 'Female').length,
      other: services.filter(s => s.customerGender === 'Other').length,
      preferNotToSay: services.filter(s => s.customerGender === 'PreferNotToSay').length,
    };

    return { totalServices, totalRevenue, genderBreakdown };
  }

  // Clear all data (for testing)
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.SERVICE_OPTIONS);
    localStorage.removeItem(STORAGE_KEYS.ENTRIES);
  }

  // Export data as JSON
  exportData(): string {
    const data = {
      services: this.getServices(),
      serviceOptions: this.getServiceOptions(),
      entries: this.getEntries(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  // Import data from JSON
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.services) localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data.services));
      if (data.serviceOptions) localStorage.setItem(STORAGE_KEYS.SERVICE_OPTIONS, JSON.stringify(data.serviceOptions));
      if (data.entries) localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(data.entries));
      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  }
}

export const desktopStorage = DesktopStorage.getInstance();
export default desktopStorage;
