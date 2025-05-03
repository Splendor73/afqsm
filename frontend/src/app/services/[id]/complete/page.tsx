"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { FaArrowLeft, FaCheck, FaSpinner, FaTimes } from 'react-icons/fa';

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

export default function CompleteServicePage() {
  const params = useParams();
  const serviceId = params.id as string;
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  
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
          if (data.service.status === 'Completed') {
            // Service is already completed, redirect to service details
            router.push(`/services/${serviceId}`);
            return;
          }
          setService(data.service);
        } else {
          setError(data.error || 'Failed to fetch service details');
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setError(`Error connecting to the server: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchService();
  }, [serviceId, router]);
  
  // Complete service handler
  const handleCompleteService = async () => {
    if (!service) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const apiBaseUrl = `http://${window.location.hostname}:5017/api/services/${service.service_id}/complete`;
      console.log('Completing service at:', apiBaseUrl);
      
      const response = await fetch(apiBaseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completion_notes: completionNotes
        })
      });
      
      const data = await response.json();
      console.log('Service completion response:', data);
      
      if (data.success) {
        // Redirect back to service details
        router.push(`/services/${service.service_id}`);
      } else {
        // Handle specific error messages
        if (data.error && data.error.includes("Not enough stock")) {
          setError(`Inventory Error: ${data.error}. Please update inventory before completing this service.`);
        } else if (data.error && data.error.includes("already completed")) {
          setError(`This service has already been completed. Refreshing page...`);
          // Wait 2 seconds and redirect to service details
          setTimeout(() => {
            router.push(`/services/${service.service_id}`);
          }, 2000);
        } else {
          setError(data.error || 'Failed to complete service');
        }
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error completing service:', err);
      
      // Try to parse the error if it's a response error
      if (err instanceof Error && err.message.includes('status:')) {
        const statusMatch = err.message.match(/status: (\d+)/);
        if (statusMatch && statusMatch[1] === '400') {
          setError('Could not complete this service. It may have insufficient inventory or be in an invalid state.');
        } else if (statusMatch && statusMatch[1] === '404') {
          setError('Service not found. It may have been deleted.');
        } else if (statusMatch && statusMatch[1] === '500') {
          setError('Server error. Please try again later or contact support.');
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
      }
      
      setIsSubmitting(false);
    }
  };
  
  // Cancel button handler
  const handleCancel = () => {
    router.push(`/services/${serviceId}`);
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
      <div className="flex items-center gap-3">
        <Link href={`/services/${service.service_id}`} className="text-blue-600 hover:text-blue-800">
          <FaArrowLeft />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Complete Service #{service.service_id}</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Service Summary</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
            <p className="font-medium">{service.machine_serial || 'N/A'} - {service.model_name || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
              Service Type
            </h3>
            <p className="font-medium capitalize">{service.service_type || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
              Service Date
            </h3>
            <p className="font-medium">{formatDate(service.service_date)}</p>
          </div>
          
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
              Technician
            </h3>
            <p className="font-medium">{service.technician_name || 'Not assigned'}</p>
          </div>
        </div>
        
        {service.notes && (
          <div className="mb-6">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
              Service Notes
            </h3>
            <p className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm">{service.notes}</p>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">
            Parts Used
          </h3>
          {service.parts && service.parts.length > 0 ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {service.parts.map((part) => (
                  <li key={part.part_id} className="py-2 flex justify-between">
                    <span>{part.part_name || 'Unknown Part'}</span>
                    <span className="font-medium">x{part.quantity || 0}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No parts assigned.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Complete Service</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Enter any completion notes and mark this service as completed. This will update inventory levels for any parts used.
        </p>
        
        <div className="mb-4">
          <label 
            htmlFor="completion_notes" 
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Completion Notes
          </label>
          <textarea
            id="completion_notes"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Enter any notes about the service completion..."
            className="form-input min-h-32"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleCompleteService}
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin h-4 w-4" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FaCheck className="h-4 w-4" />
                <span>Mark as Completed</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="btn-outline flex items-center gap-2"
          >
            <FaTimes className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
}