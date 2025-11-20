'use client';

import { useState, useEffect } from 'react';

export default function ServiceForm({ onServiceLogged }: { onServiceLogged: () => void }) {
  const [formData, setFormData] = useState({
    serviceName: '',
    serviceDate: new Date().toISOString().split('T')[0], // Automatically set to today's date
    amountPaid: '',
    customerGender: 'Male',
    notes: ''
  });
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  // Fetch service options from API
  useEffect(() => {
    const fetchServiceOptions = async () => {
      try {
        const response = await fetch('/api/data?type=service-options');
        const options = await response.json();
        setServiceOptions(options);
      } catch (error) {
        console.error('Error fetching service options:', error);
        // Fallback to default options if API fails
        setServiceOptions([
          'ফটোকপি',
          'জন্ম নিবন্ধন আবেদন',
          'ভূমি কর',
          'চাকরির আবেদন',
          'আইডি কার্ড আবেদন'
        ]);
      }
    };

    fetchServiceOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Service logged successfully!' });
        // Reset form but keep today's date
        setFormData({
          serviceName: '',
          serviceDate: new Date().toISOString().split('T')[0], // Reset to today's date
          amountPaid: '',
          customerGender: 'Male',
          notes: ''
        });
        // Notify parent component
        onServiceLogged();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to log service' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
      console.error('Error logging service:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Log New Service</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-1">
              Service Name *
            </label>
            <select
              id="serviceName"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a service</option>
              {serviceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="serviceDate" className="block text-sm font-medium text-gray-700 mb-1">
              Service Date *
            </label>
            <input
              type="date"
              id="serviceDate"
              name="serviceDate"
              value={formData.serviceDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly // Make it read-only since it's auto-set to today
            />
          </div>
          
          <div>
            <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-1">
              Amount Paid *
            </label>
            <input
              type="number"
              id="amountPaid"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label htmlFor="customerGender" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Gender *
            </label>
            <select
              id="customerGender"
              name="customerGender"
              value={formData.customerGender}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer Not To Say">Prefer Not To Say</option>
            </select>
          </div>
          
          {/* Removed customerIdentifier field as requested */}
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional details about the service"
          ></textarea>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Logging Service...' : 'Log Service'}
          </button>
        </div>
        
        {message && (
          <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}