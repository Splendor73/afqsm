"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { FaArrowLeft, FaPrint, FaTools, FaUser, FaCalendar, FaClipboardList, FaSpinner } from 'react-icons/fa';

// Service type definitions
interface ServicePart {
  part_id: number;
  service_part_id: number;
  service_id: number;
  quantity: number;
  part_name: string;
  part_price: number;
}

interface Service {
  service_id: number;
  machine_id: number;
  client_id: number;
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

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const apiBaseUrl = `http://${window.location.hostname}:5017/api/services/${serviceId}`;
        console.log('Fetching service details from:', apiBaseUrl);
        
        const response = await fetch(apiBaseUrl);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Service details response:', data);
        
        if (data.success) {
          setService(data.service);
        } else {
          setError(data.error || 'Failed to fetch service details');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Error fetching service:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchService();
  }, [serviceId]);
  
  // Calculate total parts cost
  const getTotalPartsPrice = () => {
    if (!service?.parts || !service.parts.length) return 0;
    
    return service.parts.reduce((total, part) => {
      return total + (part.part_price * part.quantity);
    }, 0);
  };
  
  // Format date nicely
  const formatDate = (dateString?: string) => {
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
      return 'Invalid date';
    }
  };
  
  // Handle print action
  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  if (error || !service) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || "Service not found"}</p>
        <div className="mt-4">
          <Link 
            href="/services"
            className="btn-secondary"
          >
            Back to Services
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/services" className="text-blue-600 hover:text-blue-800">
            <FaArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Service #{service.service_id}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="btn-outline flex items-center gap-2"
          >
            <FaPrint />
            <span>Print</span>
          </button>
          {service.status === 'Scheduled' && (
            <Link
              href={`/services/${service.service_id}/complete`}
              className="btn-primary"
            >
              Complete Service
            </Link>
          )}
        </div>
      </div>

      <div className="print:hidden bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${service.status === 'Scheduled' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' 
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'}`}
          >
            {service.status}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {service.status === 'Scheduled' 
              ? `Scheduled for ${formatDate(service.service_date)}`
              : `Completed on ${formatDate(service.completion_date)}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Service Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                    <FaTools className="mr-1" /> Service Type
                  </h3>
                  <p className="font-medium capitalize">{service.service_type || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                    <FaCalendar className="mr-1" /> Service Date
                  </h3>
                  <p className="font-medium">{formatDate(service.service_date)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                    <FaUser className="mr-1" /> Technician
                  </h3>
                  <p className="font-medium">{service.technician_name || 'Not assigned'}</p>
                </div>
                <div>
                  <h3 className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                    Status
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${service.status === 'Scheduled' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'}`}
                  >
                    {service.status}
                  </span>
                </div>
              </div>
              
              {service.notes && (
                <div>
                  <h3 className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                    <FaClipboardList className="mr-1" /> Notes
                  </h3>
                  <p className="text-sm">{service.notes}</p>
                </div>
              )}
              
              {service.completion_notes && (
                <div>
                  <h3 className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                    Completion Notes
                  </h3>
                  <p className="text-sm">{service.completion_notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Parts Used</h2>
            {service.parts && service.parts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Part Name</th>
                      <th className="px-4 py-3">Unit Price</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3 rounded-tr-lg">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.parts.map((part) => (
                      <tr 
                        key={part.part_id} 
                        className="border-b border-slate-200 dark:border-slate-700"
                      >
                        <td className="px-4 py-3 font-medium">{part.part_name || 'Unknown Part'}</td>
                        <td className="px-4 py-3">${typeof part.part_price === 'number' ? part.part_price.toFixed(2) : '0.00'}</td>
                        <td className="px-4 py-3">{part.quantity || 0}</td>
                        <td className="px-4 py-3 font-medium">
                          ${((typeof part.part_price === 'number' ? part.part_price : 0) * (part.quantity || 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th colSpan={3} className="px-4 py-3 text-right">Total:</th>
                      <th className="px-4 py-3">${getTotalPartsPrice().toFixed(2)}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-center py-4 text-slate-500 dark:text-slate-400">
                No parts used for this service.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Client & Machine Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                  Client
                </h3>
                <p className="font-medium">{service.client_name || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                  Machine
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Serial:</span>{' '}
                      <span className="font-medium">{service.machine_serial || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Model:</span>{' '}
                      <span className="font-medium">{service.model_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Type:</span>{' '}
                      <span className="font-medium">{service.machine_type || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <Link
                  href={`/clients/${service.client_id}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Client Details
                </Link>
              </div>
            </div>
          </div>

          <div className="card print:hidden">
            <h2 className="text-xl font-semibold mb-4">Service Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Service ID:</span>
                <span className="font-semibold">#{service.service_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Type:</span>
                <span className="font-semibold capitalize">{service.service_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Date:</span>
                <span className="font-semibold">{formatDate(service.service_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Status:</span>
                <span className={`font-semibold ${
                  service.status === 'Scheduled' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  {service.status}
                </span>
              </div>
              <div className="flex justify-between text-lg pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300">Total Parts Cost:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  ${getTotalPartsPrice().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}