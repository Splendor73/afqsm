"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

// Interface for a quotation
interface Quotation {
  quotation_id: number;
  client_id?: number;
  client_name: string;
  date: string;
  cfm_requirement?: number;
  total_amount: number;
  status: string;
  notes?: string;
  valid_until?: string;
  contact_info?: string;
}

export default function QuotationsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch quotations from API
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = `http://${window.location.hostname}:5017/api/quotations`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setQuotations(data.quotations);
        } else {
          throw new Error(data.error || 'Failed to fetch quotations');
        }
      } catch (err: any) {
        console.error('Error fetching quotations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuotations();
  }, []);

  // Filter quotations based on search term and status filter
  const filteredQuotations = quotations.filter(quote => {
    const clientName = quote.client_name || '';
    const cfmReq = quote.cfm_requirement ? String(quote.cfm_requirement) : '';
    const total = String(quote.total_amount);
    
    const matchesSearch = 
      clientName.toLowerCase().includes(search.toLowerCase()) || 
      cfmReq.includes(search) ||
      total.includes(search);
    
    const matchesFilter = filter === 'all' || quote.status.toLowerCase() === filter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quotations</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage client quotations</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            href="/quotations/new" 
            className="btn-primary flex items-center justify-center"
          >
            <span>Create Quotation</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading quotations</p>
          <p>{error}</p>
        </div>
      )}

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Search by client, CFM, or amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 sm:w-64">
            <FaFilter className="w-4 h-4 text-gray-500" />
            <select
              className="form-input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">ID</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">CFM</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotations.map((quote) => (
                    <tr 
                      key={quote.quotation_id} 
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3 font-medium">{quote.quotation_id}</td>
                      <td className="px-4 py-3">{quote.client_name}</td>
                      <td className="px-4 py-3">{new Date(quote.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{quote.cfm_requirement ? `${quote.cfm_requirement.toLocaleString()} CFM` : '-'}</td>
                      <td className="px-4 py-3">${quote.total_amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${quote.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                            quote.status.toLowerCase() === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                          }`}
                        >
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/quotations/${quote.quotation_id}`}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View
                          </Link>
                          <Link 
                            href={`/quotations/${quote.quotation_id}/edit`}
                            className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredQuotations.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">No quotations found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 