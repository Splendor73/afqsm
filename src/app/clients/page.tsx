"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSearch, FaFilter, FaPlus, FaSyncAlt, FaFileExport, FaUserPlus, FaChartLine } from 'react-icons/fa';

// Sample data for demonstration
// In a real application, this would be fetched from an API
const sampleClients = [
  { 
    id: 1, 
    name: 'ABC Manufacturing', 
    contactPerson: 'John Smith', 
    email: 'john.smith@abcmfg.com', 
    phone: '(555) 123-4567', 
    address: '123 Industrial Way, Phoenix, AZ 85001', 
    industry: 'Manufacturing',
    machines: 5,
    lastService: '2023-11-10',
    status: 'Active'
  },
  { 
    id: 2, 
    name: 'XYZ Industries', 
    contactPerson: 'Emily Johnson', 
    email: 'emily.j@xyzind.com', 
    phone: '(555) 234-5678', 
    address: '456 Factory Blvd, Tempe, AZ 85281', 
    industry: 'Industrial Equipment',
    machines: 8,
    lastService: '2023-11-05',
    status: 'Active'
  },
  { 
    id: 3, 
    name: 'Global Solutions', 
    contactPerson: 'Michael Chen', 
    email: 'mchen@globalsol.com', 
    phone: '(555) 345-6789', 
    address: '789 Business Park, Scottsdale, AZ 85251', 
    industry: 'Energy',
    machines: 3,
    lastService: '2023-10-28',
    status: 'Active'
  },
  { 
    id: 4, 
    name: 'Tech Innovations', 
    contactPerson: 'Sarah Williams', 
    email: 'sarah@techinnovate.com', 
    phone: '(555) 456-7890', 
    address: '101 Tech Center, Chandler, AZ 85224', 
    industry: 'Technology',
    machines: 2,
    lastService: '2023-10-15',
    status: 'Active'
  },
  { 
    id: 5, 
    name: 'City Services', 
    contactPerson: 'Robert Davis', 
    email: 'rdavis@cityservices.org', 
    phone: '(555) 567-8901', 
    address: '234 Municipal Ave, Mesa, AZ 85210', 
    industry: 'Government',
    machines: 6,
    lastService: '2023-09-30',
    status: 'Inactive'
  },
  { 
    id: 6, 
    name: 'Metro Facilities', 
    contactPerson: 'Jennifer Lopez', 
    email: 'jlopez@metrofac.com', 
    phone: '(555) 678-9012', 
    address: '567 Urban Street, Glendale, AZ 85301', 
    industry: 'Facilities Management',
    machines: 10,
    lastService: '2023-09-22',
    status: 'Active'
  },
  { 
    id: 7, 
    name: 'Desert Operations', 
    contactPerson: 'David Wilson', 
    email: 'dwilson@desertops.com', 
    phone: '(555) 789-0123', 
    address: '890 Hot Springs Rd, Surprise, AZ 85374', 
    industry: 'Mining',
    machines: 12,
    lastService: '2023-09-15',
    status: 'Active'
  },
  { 
    id: 8, 
    name: 'Valley Medical Center', 
    contactPerson: 'Lisa Garcia', 
    email: 'lgarcia@valleymed.org', 
    phone: '(555) 890-1234', 
    address: '321 Hospital Way, Phoenix, AZ 85006', 
    industry: 'Healthcare',
    machines: 4,
    lastService: '2023-08-25',
    status: 'Active'
  },
  { 
    id: 9, 
    name: 'Sunrise Foods', 
    contactPerson: 'Kevin Brown', 
    email: 'kbrown@sunrisefoods.com', 
    phone: '(555) 901-2345', 
    address: '432 Produce Lane, Gilbert, AZ 85295', 
    industry: 'Food Processing',
    machines: 7,
    lastService: '2023-08-10',
    status: 'Inactive'
  },
  { 
    id: 10, 
    name: 'Mountain Construction', 
    contactPerson: 'Amanda Taylor', 
    email: 'ataylor@mountainconstruct.com', 
    phone: '(555) 012-3456', 
    address: '543 Builder Road, Peoria, AZ 85345', 
    industry: 'Construction',
    machines: 9,
    lastService: '2023-07-30',
    status: 'Active'
  },
];

const industries = [...new Set(sampleClients.map(client => client.industry))];

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filteredClients, setFilteredClients] = useState(sampleClients);
  
  // Filter and sort clients whenever filters or sort options change
  useEffect(() => {
    let result = [...sampleClients];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industry.toLowerCase().includes(searchTerm.toLowerCase())
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
        comparison = new Date(b.lastService).getTime() - new Date(a.lastService).getTime();
      } else if (sortBy === 'machines') {
        comparison = a.machines - b.machines;
      } else if (sortBy === 'industry') {
        comparison = a.industry.localeCompare(b.industry);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredClients(result);
  }, [searchTerm, filterIndustry, filterStatus, sortBy, sortDirection]);
  
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
  const activeClientCount = sampleClients.filter(client => client.status === 'Active').length;
  
  // Count total machines
  const totalMachines = sampleClients.reduce((sum, client) => sum + client.machines, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <Link 
            href="/clients/new" 
            className="btn-primary flex items-center justify-center gap-2"
          >
            <FaUserPlus className="h-4 w-4" />
            <span>Add New Client</span>
          </Link>
          <button 
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <FaFileExport className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Clients</p>
              <p className="mt-1 text-3xl font-semibold">{sampleClients.length}</p>
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
            <div className="bg-purple-500 p-3 rounded-lg">
              <FaFilter className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Machines</p>
              <p className="mt-1 text-3xl font-semibold">{totalMachines}</p>
            </div>
            <div className="bg-amber-500 p-3 rounded-lg">
              <FaChartLine className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:border-blue-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              className="rounded-lg border px-3 py-2"
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
            >
              <option value="All">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            
            <select
              className="rounded-lg border px-3 py-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left font-semibold">
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSort('name')}
                  >
                    Client Name
                    {sortBy === 'name' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold">Contact Person</th>
                <th className="px-4 py-3 text-left font-semibold">
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSort('industry')}
                  >
                    Industry
                    {sortBy === 'industry' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSort('machines')}
                  >
                    Machines
                    {sortBy === 'machines' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSort('lastService')}
                  >
                    Last Service
                    {sortBy === 'lastService' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/clients/${client.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{client.contactPerson}</td>
                  <td className="px-4 py-3">{client.industry}</td>
                  <td className="px-4 py-3">{client.machines}</td>
                  <td className="px-4 py-3">{client.lastService}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link 
                        href={`/clients/edit/${client.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </Link>
                      <Link 
                        href={`/services/new?clientId=${client.id}`}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Schedule Service
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredClients.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">No clients found matching your filters.</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Recent Services</h2>
            <Link href="/services" className="text-sm link-gradient">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg hover:bg-slate-100/80 transition-colors duration-200">
                <div>
                  <Link href={`/clients/${i % sampleClients.length + 1}`} className="font-medium hover:text-blue-600 dark:hover:text-blue-400">
                    {sampleClients[i % sampleClients.length].name}
                  </Link>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Machine #{1000 + i}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {i % 2 === 0 ? 'Small Service' : 'Big Service'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(Date.now() - (i + 1) * 86400000 * 3).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Recent Quotations</h2>
            <Link href="/quotations" className="text-sm link-gradient">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg hover:bg-slate-100/80 transition-colors duration-200">
                <div>
                  <Link href={`/clients/${(i + 3) % sampleClients.length + 1}`} className="font-medium hover:text-blue-600 dark:hover:text-blue-400">
                    {sampleClients[(i + 3) % sampleClients.length].name}
                  </Link>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {(i + 1) * 300} CFM required
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${((i + 1) * 2250).toLocaleString()}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(Date.now() - (i + 1) * 86400000 * 5).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 