"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

// Interfaces
interface QuotationItem {
  item_id: number;
  quotation_id: number;
  model_id: number;
  quantity: number;
  unit_price: number;
  description: string;
  model_name: string;
  cfm_capacity: number;
  type: string;
}

interface Quotation {
  quotation_id: number;
  client_id: number;
  client_name: string;
  date: string;
  cfm_requirement: number;
  total_amount: number;
  status: string;
  notes: string;
  valid_until: string;
  contact_info: string;
  items: QuotationItem[];
}

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id;
  
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://${window.location.hostname}:5017/api/quotations/${quotationId}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setQuotation(data.quotation);
        } else {
          throw new Error(data.error || 'Failed to fetch quotation');
        }
      } catch (err: any) {
        console.error('Error fetching quotation:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (quotationId) {
      fetchQuotation();
    }
  }, [quotationId]);

  // Update quotation status
  const updateStatus = async (newStatus: string) => {
    if (!quotation) return;
    
    try {
      setIsUpdating(true);
      
      const response = await fetch(`http://${window.location.hostname}:5017/api/quotations/${quotationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update quotation status in state
        setQuotation(prev => prev ? {...prev, status: newStatus} : null);
      } else {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper function for formatting dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error || 'Quotation not found'}</span>
          <p className="mt-2">
            <Link href="/quotations" className="underline">
              Return to quotations list
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and quotation info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/quotations" 
            className="p-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm hover:bg-white/60"
          >
            <FaArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Quotation #{quotation.quotation_id}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            quotation.status.toLowerCase() === 'pending'
              ? 'bg-yellow-100 text-yellow-800' 
              : quotation.status.toLowerCase() === 'approved'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
          }`}>
            {quotation.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href={`/quotations/${quotation.quotation_id}/edit`}
            className="btn-secondary flex items-center gap-2"
          >
            <FaEdit className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="space-y-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-4">Client Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Client Name</p>
                <p className="font-medium">{quotation.client_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Contact Information</p>
                <p className="font-medium">{quotation.contact_info || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Quotation Date</p>
                <p className="font-medium">{formatDate(quotation.date)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Valid Until</p>
                <p className="font-medium">{formatDate(quotation.valid_until)}</p>
              </div>
            </div>
          </div>

          {quotation.status === 'Pending' && (
            <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => updateStatus('Approved')}
                  disabled={isUpdating}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <FaCheck className="h-4 w-4" />
                  Approve Quotation
                </button>
                <button 
                  onClick={() => updateStatus('Rejected')}
                  disabled={isUpdating}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <FaTimes className="h-4 w-4" />
                  Reject Quotation
                </button>
              </div>
            </div>
          )}

          {quotation.notes && (
            <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <p className="text-sm text-slate-600 whitespace-pre-line">
                {quotation.notes}
              </p>
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="lg:col-span-2">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Quotation Items</h2>
              <div>
                <span className="text-slate-500">Total:</span>
                <span className="ml-2 text-xl font-bold">${quotation.total_amount.toLocaleString()}</span>
              </div>
            </div>
            
            {quotation.cfm_requirement > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center justify-between">
                <div>
                  <p className="text-blue-700 font-medium">CFM Requirement</p>
                  <p className="text-blue-500">{quotation.cfm_requirement.toLocaleString()} CFM</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-700 font-medium">Total CFM</p>
                  <p className="text-blue-500">
                    {quotation.items.reduce((total, item) => 
                      total + (item.cfm_capacity * item.quantity), 0).toLocaleString()} CFM
                  </p>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      CFM
                    </th>
                    <th className="px-6 py-3 bg-slate-50 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 bg-slate-50 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 bg-slate-50 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {quotation.items.map((item) => (
                    <tr key={item.item_id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {item.model_name || item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {item.type || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {item.cfm_capacity ? `${item.cfm_capacity.toLocaleString()} CFM` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                        ${item.unit_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        ${(item.unit_price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50">
                    <td colSpan={4} className="px-6 py-4 text-sm font-medium text-slate-500">
                      Total
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700 text-right">
                      {quotation.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                      ${quotation.total_amount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 