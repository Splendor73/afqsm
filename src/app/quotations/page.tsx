"use client";

import Link from 'next/link';
import { useState } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

// Sample data for demonstration
const sampleQuotations = [
  { id: 1, client: 'ABC Manufacturing', date: '2023-11-15', cfm: 800, total: 15600, status: 'Pending' },
  { id: 2, client: 'XYZ Industries', date: '2023-11-10', cfm: 1200, total: 22400, status: 'Approved' },
  { id: 3, client: 'Global Solutions', date: '2023-11-05', cfm: 500, total: 9800, status: 'Completed' },
  { id: 4, client: 'Tech Innovations', date: '2023-10-28', cfm: 1500, total: 28900, status: 'Approved' },
  { id: 5, client: 'City Services', date: '2023-10-20', cfm: 650, total: 12700, status: 'Pending' },
  { id: 6, client: 'Metro Facilities', date: '2023-10-15', cfm: 900, total: 18200, status: 'Completed' },
  { id: 7, client: 'Harbor Enterprises', date: '2023-10-10', cfm: 1100, total: 21500, status: 'Pending' },
  { id: 8, client: 'Summit Corp', date: '2023-10-05', cfm: 750, total: 14800, status: 'Approved' },
];

export default function QuotationsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Filter quotations based on search term and status filter
  const filteredQuotations = sampleQuotations.filter(quote => {
    const matchesSearch = quote.client.toLowerCase().includes(search.toLowerCase()) || 
                         quote.cfm.toString().includes(search) ||
                         quote.total.toString().includes(search);
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
                  key={quote.id} 
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3 font-medium">{quote.id}</td>
                  <td className="px-4 py-3">{quote.client}</td>
                  <td className="px-4 py-3">{new Date(quote.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{quote.cfm.toLocaleString()} CFM</td>
                  <td className="px-4 py-3">${quote.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${quote.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                        quote.status === 'Approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                      }`}
                    >
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/quotations/${quote.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/quotations/${quote.id}/edit`}
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
      </div>
    </div>
  );
} 