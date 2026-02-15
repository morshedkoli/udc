// Unified data service that works both in web and desktop (Electron) mode
// Automatically switches between API calls and localStorage

import desktopStorage from './desktop-storage';

interface Service {
  id: number;
  serviceName: string;
  serviceDate: string;
  amountPaid: number;
  customerGender: string;
  notes?: string;
}

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.isElectron;

// Initialize desktop storage defaults
if (typeof window !== 'undefined' && isElectron) {
  desktopStorage.initializeDefaults();
}

class DataService {
  // Get service options
  async getServiceOptions(): Promise<string[]> {
    if (isElectron) {
      return desktopStorage.getServiceOptions();
    }
    
    try {
      const res = await fetch('/api/data?type=service-options');
      return await res.json();
    } catch (error) {
      console.error('Error fetching service options:', error);
      return [];
    }
  }

  // Add service option
  async addServiceOption(option: string): Promise<boolean> {
    if (isElectron) {
      desktopStorage.addServiceOption(option);
      return true;
    }
    
    try {
      const res = await fetch('/api/service-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option }),
      });
      return res.ok;
    } catch (error) {
      console.error('Error adding service option:', error);
      return false;
    }
  }

  // Delete service option
  async deleteServiceOption(option: string): Promise<boolean> {
    if (isElectron) {
      desktopStorage.deleteServiceOption(option);
      return true;
    }
    
    try {
      const res = await fetch('/api/service-options', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option }),
      });
      return res.ok;
    } catch (error) {
      console.error('Error deleting service option:', error);
      return false;
    }
  }

  // Get services (with optional date range)
  async getServices(startDate?: string, endDate?: string): Promise<Service[]> {
    if (isElectron) {
      let services = desktopStorage.getServices();
      if (startDate && endDate) {
        services = services.filter(s => s.serviceDate >= startDate && s.serviceDate <= endDate);
      }
      return services;
    }
    
    try {
      let url = '/api/data?type=recent';
      if (startDate && endDate) {
        url = `/api/data?type=range&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url);
      return await res.json();
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  // Add service
  async addService(serviceData: {
    serviceName: string;
    serviceDate: string;
    quantity: string;
    amountPaid: string;
    customerGender: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (isElectron) {
      desktopStorage.addService({
        serviceName: serviceData.serviceName,
        serviceDate: serviceData.serviceDate,
        amountPaid: parseInt(serviceData.amountPaid) || 0,
        customerGender: serviceData.customerGender,
      });
      return { success: true };
    }
    
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      });
      
      if (res.ok) {
        return { success: true };
      } else {
        const result = await res.json();
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error adding service:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get stats
  async getStats(startDate?: string, endDate?: string): Promise<{
    totalServices: number;
    totalRevenue: number;
    genderBreakdown: any;
  }> {
    if (isElectron) {
      return desktopStorage.getStats(startDate, endDate);
    }
    
    try {
      let url = '/api/data?type=stats';
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url);
      return await res.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalServices: 0,
        totalRevenue: 0,
        genderBreakdown: { male: 0, female: 0, other: 0, preferNotToSay: 0 },
      };
    }
  }

  // Export data (desktop only)
  exportData(): string | null {
    if (isElectron) {
      return desktopStorage.exportData();
    }
    return null;
  }

  // Import data (desktop only)
  importData(jsonString: string): boolean {
    if (isElectron) {
      return desktopStorage.importData(jsonString);
    }
    return false;
  }
}

export const dataService = new DataService();
export default dataService;
