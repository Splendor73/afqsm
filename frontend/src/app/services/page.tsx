"use client";

import { useState } from 'react';
import Link from 'next/link';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { FaSearch, FaFilter } from 'react-icons/fa';

// Sample data for demonstration
const sampleServices = [
  { 
    id: 1, 
    machineId: 'M10045', 
    client: 'ABC Manufacturing', 
    serviceType: 'Small Service', 
    date: '2023-11-25', 
    technician: 'John Smith',
    status: 'Scheduled',
    parts: [
      { id: 1, name: 'Air Filter', quantity: 1 },
      { id: 2, name: 'Oil Filter', quantity: 1 }
    ]
  },
  { 
    id: 2, 
    machineId: 'M10098', 
    client: 'XYZ Industries', 
    serviceType: 'Big Service', 
    date: '2023-11-28', 
    technician: 'Emma Johnson',
    status: 'Scheduled',
    parts: [
      { id: 1, name: 'Air Filter', quantity: 1 },
      { id: 2, name: 'Oil Filter', quantity: 1 },
      { id: 3, name: 'Separator Element', quantity: 1 },
      { id: 4, name: 'Lubricant', quantity: 5 }
    ]
  },
  { 
    id: 3, 
    machineId: 'M10056', 
    client: 'Global Solutions', 
    serviceType: 'Small Service', 
    date: '2023-11-15', 
    technician: 'Robert Davis',
    status: 'Completed',
    parts: [
      { id: 1, name: 'Air Filter', quantity: 1 },
      { id: 2, name: 'Oil Filter', quantity: 1 }
    ]
  },
  { 
    id: 4, 
    machineId: 'M10078', 
    client: 'Tech Innovations', 
    serviceType: 'Big Service', 
    date: '2023-11-10', 
    technician: 'John Smith',
    status: 'Completed',
    parts: [
      { id: 1, name: 'Air Filter', quantity: 1 },
      { id: 2, name: 'Oil Filter', quantity: 1 },
      { id: 3, name: 'Separator Element', quantity: 1 },
      { id: 4, name: 'Lubricant', quantity: 5 }
    ]
  },
  { 
    id: 5, 
    machineId: 'M10112', 
    client: 'City Services', 
    serviceType: 'Small Service', 
    date: '2023-12-05', 
    technician: 'Emma Johnson',
    status: 'Scheduled',
    parts: [
      { id: 1, name: 'Air Filter', quantity: 1 },
      { id: 2, name: 'Oil Filter', quantity: 1 }
    ]
  },
  { 
    id: 6, 
    machineId: 'M10132', 
    client: 'Metro Facilities', 
    serviceType: 'Big Service', 
    date: '2023-12-12', 
    technician: 'Robert Davis',
    status: 'Scheduled',
    parts: [
      { id: 1, name: 'Air Filter', quantity: 1 },
      { id: 2, name: 'Oil Filter', quantity: 1 },
      { id: 3, name: 'Separator Element', quantity: 1 },
      { id: 4, name: 'Lubricant', quantity: 5 }
    ]
  },
];

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  const filteredServices = sampleServices.filter(service => {
    const matchesSearch = 
      service.machineId.toLowerCase().includes(search.toLowerCase()) || 
      service.client.toLowerCase().includes(search.toLowerCase()) ||
      service.technician.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || service.status.toLowerCase() === statusFilter.toLowerCase();
    
    const serviceDate = parseISO(service.date);
    const today = new Date();
    const matchesDate = 
      dateFilter === 'all' || 
      (dateFilter === 'past' && isBefore(serviceDate, today)) ||
      (dateFilter === 'future' && isAfter(serviceDate, today)) ||
      (dateFilter === 'today' && format(serviceDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'));
    
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
                  key={service.id} 
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3 font-medium">{service.id}</td>
                  <td className="px-4 py-3">{service.machineId}</td>
                  <td className="px-4 py-3">{service.client}</td>
                  <td className="px-4 py-3">{service.serviceType}</td>
                  <td className="px-4 py-3">{format(parseISO(service.date), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3">{service.technician}</td>
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
                        href={`/services/${service.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </Link>
                      {service.status === 'Scheduled' && (
                        <Link 
                          href={`/services/${service.id}/complete`}
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
      </div>
    </div>
  );
} 