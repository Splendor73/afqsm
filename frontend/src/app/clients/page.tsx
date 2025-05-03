"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSearch, FaFilter, FaSyncAlt, FaFileExport, FaUserPlus, FaChartLine } from 'react-icons/fa';

// Define types for client data
interface Client {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  machines: number;
  lastService: string;
  status: string;
}

// Replace sample data with API fetching
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  
  // Fetch clients data from the backend API
  useEffect(() => {
    async function fetchClients() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5017/api/clients');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.success) {
          // Transform the data to match the expected format
          const formattedClients: Client[] = data.clients.map((client: any) => ({
            id: client.client_id,
            name: client.name,
            contactPerson: client.contact_person || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            industry: client.industry || 'Unknown',
            machines: client.machines_count || 0,
            lastService: client.last_service_date || '',
            status: client.status || 'Active'
          }));
          
          setClients(formattedClients);
          setFilteredClients(formattedClients);
        } else {
          throw new Error(data.error || 'Failed to fetch clients');
        }
      } catch (err: any) {
        console.error('Error fetching clients:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchClients();
  }, []);
  
  // Get unique industries from fetched data
  const industries = clients.length ? [...new Set(clients.map(client => client.industry))] : [];
  
  // Filter and sort clients whenever filters or sort options change
  useEffect(() => {
    if (!clients.length) return;
    
    let result = [...clients];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.contactPerson && client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.industry && client.industry.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply industry filter
    if (filterIndustry !== 'All') {
      result = result.filter(client => client.industry === filterIndustry);
    }
    
    // Apply status filter
    if (filterStatus !== 'All') {
      result = result.filter(client => client.status === filterStatus);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'lastService') {
        if (a.lastService && b.lastService) {
          comparison = new Date(b.lastService).getTime() - new Date(a.lastService).getTime();
        }
      } else if (sortBy === 'machines') {
        comparison = a.machines - b.machines;
      } else if (sortBy === 'industry') {
        comparison = a.industry.localeCompare(b.industry);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredClients(result);
  }, [clients, searchTerm, filterIndustry, filterStatus, sortBy, sortDirection]);
  
  // Toggle sort direction when clicking on the same sort option
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  // Count active clients
  const activeClientCount = clients.filter(client => client.status === 'Active').length;
  
  // Count total machines
  const totalMachines = clients.reduce((sum, client) => sum + (client.machines || 0), 0);
  
  // Handle error and loading states
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <p className="mt-2">Please check your backend connection or try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
        <div className="mt-4 md:mt-0">
          <Link 
            href="/clients/new" 
            className="btn-primary flex items-center justify-center gap-2"
          >
            <FaUserPlus className="h-4 w-4" />
            <span>Add New Client</span>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Clients</p>
              <p className="mt-1 text-3xl font-semibold">{clients.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <FaUserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Clients</p>
              <p className="mt-1 text-3xl font-semibold">{activeClientCount}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <FaSyncAlt className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Industries</p>
              <p className="mt-1 text-3xl font-semibold">{industries.length}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <FaChartLine className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Machines</p>
              <p className="mt-1 text-3xl font-semibold">{totalMachines}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <FaSyncAlt className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="h-5 w-5 text-gray-400" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
              >
                <option value="All">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <FaFilter className="h-5 w-5 text-gray-400" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {filteredClients.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No clients found matching your search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          <span>Client Name</span>
                          {sortBy === 'name' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Person
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('industry')}
                      >
                        <div className="flex items-center">
                          <span>Industry</span>
                          {sortBy === 'industry' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('machines')}
                      >
                        <div className="flex items-center">
                          <span>Machines</span>
                          {sortBy === 'machines' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('lastService')}
                      >
                        <div className="flex items-center">
                          <span>Last Service</span>
                          {sortBy === 'lastService' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            <Link href={`/clients/${client.id}`} className="hover:text-blue-600">
                              {client.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.contactPerson}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{client.email}</div>
                          <div>{client.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.industry}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.machines}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.lastService ? new Date(client.lastService).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/clients/${client.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                            View
                          </Link>
                          <Link href={`/clients/${client.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 