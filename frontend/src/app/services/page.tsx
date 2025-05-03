"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { FaSearch, FaFilter, FaSpinner } from 'react-icons/fa';

// Service type definition
interface ServicePart {
  part_id: number;
  service_id: number;
  quantity: number;
  part_name: string;
  part_price: number;
}

interface Service {
  service_id: number;
  machine_id: number;
  machine_serial: string;
  client_name: string;
  model_name: string;
  machine_type: string;
  service_type: string;
  service_date: string;
  technician_id: number;
  technician_name: string;
  status: string;
  completion_date?: string;
  completion_notes?: string;
  notes?: string;
  parts: ServicePart[];
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Safely format date to prevent hydration errors
  const formatDateSafe = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      // First try parseISO
      let date;
      try {
        date = parseISO(dateString);
        // Check if the resulting date is valid
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date from parseISO');
        }
      } catch (parseErr) {
        // If parseISO fails, try native Date parsing
        date = new Date(dateString);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date from Date constructor');
        }
      }
      
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      console.error('Invalid date:', dateString, e);
      return 'Invalid Date';
    }
  };

  // Safely check if date is before/after for filtering
  const isDateBefore = (dateString: string, compareDate: Date) => {
    try {
      let date;
      try {
        date = parseISO(dateString);
        if (isNaN(date.getTime())) {
          date = new Date(dateString);
        }
      } catch {
        date = new Date(dateString);
      }
      
      return isBefore(date, compareDate);
    } catch (e) {
      return false;
    }
  };

  const isDateAfter = (dateString: string, compareDate: Date) => {
    try {
      let date;
      try {
        date = parseISO(dateString);
        if (isNaN(date.getTime())) {
          date = new Date(dateString);
        }
      } catch {
        date = new Date(dateString);
      }
      
      return isAfter(date, compareDate);
    } catch (e) {
      return false;
    }
  };

  const isDateSameDay = (dateString: string, compareDate: Date) => {
    try {
      let date;
      try {
        date = parseISO(dateString);
        if (isNaN(date.getTime())) {
          date = new Date(dateString);
        }
      } catch {
        date = new Date(dateString);
      }
      
      return format(date, 'yyyy-MM-dd') === format(compareDate, 'yyyy-MM-dd');
    } catch (e) {
      return false;
    }
  };
  
  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Using window.location.hostname instead of hardcoded IP for better compatibility
        const apiBaseUrl = `http://${window.location.hostname}:5017/api/services`;
        console.log('Fetching from URL:', apiBaseUrl);
        
        const response = await fetch(apiBaseUrl);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
          setServices(data.services || []);
        } else {
          setError(data.error || 'Failed to fetch services');
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(`Error connecting to the server: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);
  
  // Filter services based on search and filters
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      ((service.machine_serial || '').toLowerCase()).includes(search.toLowerCase()) || 
      ((service.client_name || '').toLowerCase()).includes(search.toLowerCase()) ||
      ((service.technician_name || '').toLowerCase()).includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'scheduled' && service.status === 'Scheduled') ||
                          (statusFilter === 'completed' && service.status === 'Completed');
    
    const today = new Date();
    const matchesDate = 
      dateFilter === 'all' || 
      (dateFilter === 'past' && isDateBefore(service.service_date, today)) ||
      (dateFilter === 'future' && isDateAfter(service.service_date, today)) ||
      (dateFilter === 'today' && isDateSameDay(service.service_date, today));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Services</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule and manage maintenance services for machines</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            href="/services/new" 
            className="btn-primary flex items-center justify-center"
          >
            <span>Schedule Service</span>
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Search by machine ID, client, or technician..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="w-4 h-4 text-gray-500" />
              <select
                className="form-input w-full sm:w-40"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <select
              className="form-input w-full sm:w-40"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="past">Past Services</option>
              <option value="future">Future Services</option>
              <option value="today">Today</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <p className="text-slate-500 mt-2">Please try again later or contact support.</p>
          </div>
        ) : (
          <>
            {services.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">No services found. Please add services to see them here.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">ID</th>
                        <th className="px-4 py-3">Machine ID</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Service Type</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Technician</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((service) => (
                        <tr 
                          key={service.service_id} 
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="px-4 py-3 font-medium">{service.service_id}</td>
                          <td className="px-4 py-3">{service.machine_serial || 'N/A'}</td>
                          <td className="px-4 py-3">{service.client_name || 'N/A'}</td>
                          <td className="px-4 py-3">{service.service_type || 'N/A'}</td>
                          <td className="px-4 py-3">{formatDateSafe(service.service_date)}</td>
                          <td className="px-4 py-3">{service.technician_name || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${service.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                              }`}
                            >
                              {service.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Link 
                                href={`/services/${service.service_id}`}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                View
                              </Link>
                              {service.status === 'Scheduled' && (
                                <Link 
                                  href={`/services/${service.service_id}/complete`}
                                  className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300"
                                >
                                  Complete
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredServices.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">No services found matching your criteria.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}