"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaEdit, FaUserTie, FaTools, FaFileInvoiceDollar, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIndustry, FaPlus, FaUser } from 'react-icons/fa';

// Sample data for demonstration - In a real app, this would come from an API
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
    status: 'Active',
    notes: 'Established client since 2015. Prefers service on weekdays only.'
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
    status: 'Active',
    notes: 'Multiple locations. Main contact is Emily. Alternate contact: Mark Davis (Operations Manager)'
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
    status: 'Active',
    notes: 'Requires special PPE for on-site visits. 24-hour notice needed for all service visits.'
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
    status: 'Active',
    notes: 'Clean room environment - special protocols apply. Contact Sarah 24 hours before arrival.'
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
    status: 'Inactive',
    notes: 'Currently under contract review. Expect to resume services in Q1 2024.'
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
    status: 'Active',
    notes: 'Manages multiple properties. Service scheduling must go through central office.'
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
    status: 'Active',
    notes: 'Remote location. Requires 4x4 vehicle access. Satellite phone recommended as backup.'
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
    status: 'Active',
    notes: 'Critical systems - service interruptions must be minimized. Weekend service available.'
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
    status: 'Inactive',
    notes: 'Currently expanding facility. Service contracts on hold until expansion complete.'
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
    status: 'Active',
    notes: 'Multiple job sites. Contact office for current machine locations.'
  },
];

// Sample machines for the client
const sampleMachines = [
  { id: 'M10045', clientId: 1, model: 'Standard 200 CFM', type: 'Fixed Bit', installDate: '2020-05-12', lastService: '2023-11-10', status: 'Operational' },
  { id: 'M10046', clientId: 1, model: 'Performance 350 CFM', type: 'Fixed Bit', installDate: '2020-05-12', lastService: '2023-11-08', status: 'Operational' },
  { id: 'M10087', clientId: 1, model: 'Pro Series 600 CFM', type: 'VFD', installDate: '2021-08-03', lastService: '2023-10-25', status: 'Needs Attention' },
  { id: 'M10112', clientId: 1, model: 'Industrial 500 CFM', type: 'Fixed Bit', installDate: '2022-03-17', lastService: '2023-10-05', status: 'Operational' },
  { id: 'M10134', clientId: 1, model: 'Pro Series 300 CFM', type: 'VFD', installDate: '2022-11-30', lastService: '2023-09-20', status: 'Operational' },
  
  { id: 'M10098', clientId: 2, model: 'Pro Series 600 CFM', type: 'VFD', installDate: '2021-02-15', lastService: '2023-11-05', status: 'Operational' },
  { id: 'M10099', clientId: 2, model: 'Pro Series 900 CFM', type: 'VFD', installDate: '2021-02-15', lastService: '2023-11-05', status: 'Operational' },
  
  { id: 'M10056', clientId: 3, model: 'Standard 200 CFM', type: 'Fixed Bit', installDate: '2019-11-20', lastService: '2023-10-28', status: 'Operational' },
  
  { id: 'M10078', clientId: 4, model: 'Pro Series 900 CFM', type: 'VFD', installDate: '2020-08-10', lastService: '2023-10-15', status: 'Operational' },
];

// Sample service history
const sampleServiceHistory = [
  { id: 1, clientId: 1, machineId: 'M10045', date: '2023-11-10', type: 'Big Service', technician: 'John Smith', parts: ['Air Filter', 'Oil Filter', 'Separator Element', 'Lubricant (5L)'], notes: 'Completed as scheduled. All systems operating normally.' },
  { id: 2, clientId: 1, machineId: 'M10046', date: '2023-11-08', type: 'Small Service', technician: 'John Smith', parts: ['Air Filter', 'Oil Filter'], notes: 'Customer requested inspection of belt tension. Adjusted and now operating correctly.' },
  { id: 3, clientId: 1, machineId: 'M10087', date: '2023-10-25', type: 'Emergency Repair', technician: 'Robert Davis', parts: ['Control Board', 'Pressure Sensor'], notes: 'Machine was shutting down intermittently. Replaced faulty control board and recalibrated.' },
  { id: 4, clientId: 1, machineId: 'M10112', date: '2023-10-05', type: 'Small Service', technician: 'Emma Johnson', parts: ['Air Filter', 'Oil Filter'], notes: 'Routine maintenance completed.' },
  { id: 5, clientId: 1, machineId: 'M10134', date: '2023-09-20', type: 'Big Service', technician: 'John Smith', parts: ['Air Filter', 'Oil Filter', 'Separator Element', 'Lubricant (5L)', 'Belt Kit'], notes: 'Replaced worn belt kit. Recommended monitoring for the next month.' },
];

// Sample quotation history
const sampleQuotations = [
  { id: 101, clientId: 1, date: '2023-10-15', cfmRequired: 800, description: 'New installation for west building expansion', total: 14500, status: 'Accepted' },
  { id: 85, clientId: 1, date: '2023-07-22', cfmRequired: 350, description: 'Replacement for aging unit in Building C', total: 5800, status: 'Accepted' },
  { id: 62, clientId: 1, date: '2023-04-05', cfmRequired: 1200, description: 'High-capacity system for new production line', total: 21750, status: 'Declined' },
  { id: 43, clientId: 1, date: '2023-01-18', cfmRequired: 600, description: 'Additional capacity for main facility', total: 11500, status: 'Accepted' },
];

// Define types for our data structures
type Client = {
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
  notes: string;
};

type Machine = {
  id: string;
  clientId: number;
  model: string;
  type: string;
  installDate: string;
  lastService: string;
  status: string;
};

type Service = {
  id: number;
  clientId: number;
  machineId: string;
  date: string;
  type: string;
  technician: string;
  parts: string[];
  notes: string;
};

type Quotation = {
  id: number;
  clientId: number;
  date: string;
  cfmRequired: number;
  description: string;
  total: number;
  status: string;
};

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = Number(params.id);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('machines');
  const [clientMachines, setClientMachines] = useState<Machine[]>([]);
  const [serviceHistory, setServiceHistory] = useState<Service[]>([]);
  const [quotationHistory, setQuotationHistory] = useState<Quotation[]>([]);
  
  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchClientData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Find client
        const foundClient = sampleClients.find(c => c.id === clientId);
        if (foundClient) {
          setClient(foundClient as Client);
          
          // Get client's machines
          const machines = sampleMachines.filter(m => m.clientId === clientId);
          setClientMachines(machines);
          
          // Get client's service history
          const services = sampleServiceHistory.filter(s => s.clientId === clientId);
          setServiceHistory(services);
          
          // Get client's quotation history
          const quotations = sampleQuotations.filter(q => q.clientId === clientId);
          setQuotationHistory(quotations);
        }
      } catch (error) {
        console.error('Error fetching client details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [clientId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Client Not Found</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">The client you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/clients" className="btn-primary mt-6 inline-block">
          Return to Clients
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/clients" className="mr-4 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
          <FaArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">{client.name}</h1>
        <span className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${
          client.status === 'Active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
        }`}>
          {client.status}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
            <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
              <FaUserTie className="h-4 w-4 text-blue-500" />
              <span>Contact Information</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FaUser className="h-4 w-4 text-slate-400 mt-1" />
                <div>
                  <p className="font-medium">{client.contactPerson}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Primary Contact</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FaEnvelope className="h-4 w-4 text-slate-400 mt-1" />
                <div>
                  <a href={`mailto:${client.email}`} className="font-medium hover:text-blue-600 dark:hover:text-blue-400">
                    {client.email}
                  </a>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FaPhone className="h-4 w-4 text-slate-400 mt-1" />
                <div>
                  <a href={`tel:${client.phone}`} className="font-medium hover:text-blue-600 dark:hover:text-blue-400">
                    {client.phone}
                  </a>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="h-4 w-4 text-slate-400 mt-1" />
                <div>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(client.address)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {client.address}
                  </a>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Address</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FaIndustry className="h-4 w-4 text-slate-400 mt-1" />
                <div>
                  <p className="font-medium">{client.industry}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Industry</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Link 
                href={`/clients/edit/${client.id}`} 
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <FaEdit className="h-4 w-4" />
                <span>Edit Client</span>
              </Link>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
            <h3 className="font-medium text-lg mb-4">Client Notes</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {client.notes}
            </p>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
            <h3 className="font-medium text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                href={`/services/new?clientId=${client.id}`} 
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <FaTools className="h-4 w-4" />
                <span>Schedule Service</span>
              </Link>
              
              <Link 
                href={`/quotations/new?clientId=${client.id}`} 
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <FaFileInvoiceDollar className="h-4 w-4" />
                <span>Create Quotation</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'machines' 
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                onClick={() => setActiveTab('machines')}
              >
                Machines
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'services' 
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                onClick={() => setActiveTab('services')}
              >
                Service History
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'quotations' 
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                onClick={() => setActiveTab('quotations')}
              >
                Quotations
              </button>
            </div>
            
            <div className="py-4">
              {activeTab === 'machines' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Client Machines ({clientMachines.length})</h3>
                    <Link 
                      href={`/machines/new?clientId=${client.id}`}
                      className="btn-sm btn-primary flex items-center gap-2"
                    >
                      <FaPlus className="h-3 w-3" />
                      Add Machine
                    </Link>
                  </div>
                  
                  {clientMachines.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-2 text-left">Machine ID</th>
                            <th className="px-4 py-2 text-left">Model</th>
                            <th className="px-4 py-2 text-left">Type</th>
                            <th className="px-4 py-2 text-left">Install Date</th>
                            <th className="px-4 py-2 text-left">Last Service</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientMachines.map(machine => (
                            <tr key={machine.id} className="border-b border-slate-200 dark:border-slate-700">
                              <td className="px-4 py-2 font-medium">
                                <Link href={`/machines/${machine.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                                  {machine.id}
                                </Link>
                              </td>
                              <td className="px-4 py-2">{machine.model}</td>
                              <td className="px-4 py-2">{machine.type}</td>
                              <td className="px-4 py-2">{machine.installDate}</td>
                              <td className="px-4 py-2">{machine.lastService}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  machine.status === 'Operational' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' 
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500'
                                }`}>
                                  {machine.status}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex gap-2">
                                  <Link 
                                    href={`/services/new?machineId=${machine.id}`}
                                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                  >
                                    Service
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">No machines found for this client.</p>
                  )}
                </div>
              )}
              
              {activeTab === 'services' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Service History</h3>
                  
                  {serviceHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Machine</th>
                            <th className="px-4 py-2 text-left">Service Type</th>
                            <th className="px-4 py-2 text-left">Technician</th>
                            <th className="px-4 py-2 text-left">Parts Used</th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviceHistory.map(service => (
                            <tr key={service.id} className="border-b border-slate-200 dark:border-slate-700">
                              <td className="px-4 py-2">{service.date}</td>
                              <td className="px-4 py-2">
                                <Link href={`/machines/${service.machineId}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                                  {service.machineId}
                                </Link>
                              </td>
                              <td className="px-4 py-2">{service.type}</td>
                              <td className="px-4 py-2">{service.technician}</td>
                              <td className="px-4 py-2">
                                <ul className="list-disc list-inside text-sm">
                                  {service.parts.map((part: string, index: number) => (
                                    <li key={index}>{part}</li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">No service history available for this client.</p>
                  )}
                </div>
              )}
              
              {activeTab === 'quotations' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Quotation History</h3>
                    <Link 
                      href={`/quotations/new?clientId=${client.id}`}
                      className="btn-sm btn-primary flex items-center gap-2"
                    >
                      <FaPlus className="h-3 w-3" />
                      New Quotation
                    </Link>
                  </div>
                  
                  {quotationHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Description</th>
                            <th className="px-4 py-2 text-left">CFM Required</th>
                            <th className="px-4 py-2 text-left">Total</th>
                            <th className="px-4 py-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quotationHistory.map(quote => (
                            <tr key={quote.id} className="border-b border-slate-200 dark:border-slate-700">
                              <td className="px-4 py-2 font-medium">
                                <Link href={`/quotations/${quote.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                                  #{quote.id}
                                </Link>
                              </td>
                              <td className="px-4 py-2">{quote.date}</td>
                              <td className="px-4 py-2">{quote.description}</td>
                              <td className="px-4 py-2">{quote.cfmRequired} CFM</td>
                              <td className="px-4 py-2">${quote.total.toLocaleString()}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  quote.status === 'Accepted' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                                }`}>
                                  {quote.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">No quotation history available for this client.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 