"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaEdit, FaUserTie, FaTools, FaFileInvoiceDollar, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIndustry, FaPlus, FaUser } from 'react-icons/fa';

interface Machine {
  machine_id: number;
  machine_serial: string;
  model_name: string;
  type: string;
  cfm_capacity: number;
  category: string;
  install_date: string;
  last_service_date: string;
  next_service_date: string;
  status: string;
  notes: string;
}

interface ServicePart {
  service_part_id: number;
  service_id: number;
  part_id: number;
  quantity: number;
  part_name: string;
  part_price: number;
}

interface Service {
  service_id: number;
  machine_id: number;
  machine_serial: string;
  service_type: string;
  service_date: string;
  technician_id: number;
  technician_name: string;
  status: string;
  completion_date: string;
  completion_notes: string;
  notes: string;
  model_name: string;
  machine_type: string;
  parts: ServicePart[];
}

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
  date: string;
  cfm_requirement: number;
  total_amount: number;
  status: string;
  notes: string;
  valid_until: string;
  contact_info: string;
  client_name: string;
  items: QuotationItem[];
}

interface Client {
  client_id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  machines: Machine[];
}

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id;
  const [client, setClient] = useState<Client | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [quotationsLoading, setQuotationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('machines');

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://${window.location.hostname}:5017/api/clients/${clientId}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setClient(data.client);
        } else {
          throw new Error(data.error || 'Failed to fetch client details');
        }
      } catch (err: any) {
        console.error('Error fetching client details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchServiceHistory = async () => {
      try {
        setServicesLoading(true);
        const response = await fetch(`http://${window.location.hostname}:5017/api/clients/${clientId}/services`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setServices(data.services);
        } else {
          throw new Error(data.error || 'Failed to fetch service history');
        }
      } catch (err: any) {
        console.error('Error fetching service history:', err);
      } finally {
        setServicesLoading(false);
      }
    };
    
    const fetchQuotations = async () => {
      try {
        setQuotationsLoading(true);
        const response = await fetch(`http://${window.location.hostname}:5017/api/clients/${clientId}/quotations`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setQuotations(data.quotations);
        } else {
          throw new Error(data.error || 'Failed to fetch quotations');
        }
      } catch (err: any) {
        console.error('Error fetching quotations:', err);
      } finally {
        setQuotationsLoading(false);
      }
    };
    
    if (clientId) {
      fetchClientData();
      fetchServiceHistory();
      fetchQuotations();
    }
  }, [clientId]);

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

  if (error || !client) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error || 'Client not found'}</span>
          <p className="mt-2">
            <Link href="/clients" className="underline">
              Return to clients list
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/clients" 
            className="p-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm hover:bg-white/60"
          >
            <FaArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {client.status}
          </span>
        </div>
        <Link 
          href={`/clients/${client.client_id}/edit`}
          className="btn-secondary flex items-center gap-2"
        >
          <FaEdit className="h-4 w-4" />
          Edit Client
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaUserTie className="text-blue-500" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaUser className="text-slate-400 mt-1" />
                <div>
                  <p className="font-medium">{client.contact_person}</p>
                  <p className="text-sm text-slate-500">Primary Contact</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaEnvelope className="text-slate-400 mt-1" />
                <div>
                  <p className="font-medium">{client.email || 'No email provided'}</p>
                  <p className="text-sm text-slate-500">Email</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaPhone className="text-slate-400 mt-1" />
                <div>
                  <p className="font-medium">{client.phone || 'No phone provided'}</p>
                  <p className="text-sm text-slate-500">Phone</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-slate-400 mt-1" />
                <div>
                  <p className="font-medium">{client.address || 'No address provided'}</p>
                  <p className="text-sm text-slate-500">Address</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaIndustry className="text-slate-400 mt-1" />
                <div>
                  <p className="font-medium">{client.industry || 'Not specified'}</p>
                  <p className="text-sm text-slate-500">Industry</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-4">Client Notes</h2>
            <p className="text-sm text-slate-600 whitespace-pre-line">
              {client.notes || 'No notes available for this client.'}
            </p>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link 
                href={`/services/new?clientId=${client.client_id}`}
                className="btn-primary w-full justify-center text-center"
              >
                Schedule Service
              </Link>
              <Link 
                href={`/quotations/new?clientId=${client.client_id}`}
                className="btn-secondary w-full justify-center text-center"
              >
                Create New Quotation
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px space-x-8">
              <button 
                onClick={() => setActiveTab('machines')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'machines'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Machines
              </button>
              <button 
                onClick={() => setActiveTab('service-history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'service-history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Service History
              </button>
              <button 
                onClick={() => setActiveTab('quotations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'quotations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Quotations
              </button>
            </nav>
          </div>

          {activeTab === 'machines' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Client Machines ({client.machines?.length || 0})</h2>
                <Link 
                  href={`/machines/new?clientId=${client.client_id}`}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaPlus className="h-4 w-4" />
                  Add Machine
                </Link>
              </div>
              
              {client.machines && client.machines.length > 0 ? (
                <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden border border-white/20">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Machine ID
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Model
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Install Date
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Last Service
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {client.machines.map((machine) => (
                          <tr key={machine.machine_id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              {machine.machine_serial}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {machine.model_name} ({machine.cfm_capacity} CFM)
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {machine.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {machine.install_date ? new Date(machine.install_date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {machine.last_service_date ? new Date(machine.last_service_date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                machine.status === 'Operational' 
                                  ? 'bg-green-100 text-green-800' 
                                  : machine.status === 'Needs Attention'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {machine.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link 
                                href={`/machines/${machine.machine_id}`}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                View
                              </Link>
                              <Link 
                                href={`/services/new?machineId=${machine.machine_id}`}
                                className="text-green-600 hover:text-green-900"
                              >
                                Service
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20 text-center">
                  <p className="text-slate-500 mb-4">No machines registered for this client.</p>
                  <Link 
                    href={`/machines/new?clientId=${client.client_id}`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <FaPlus className="h-4 w-4" />
                    Add First Machine
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'service-history' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Service History</h2>
                <Link 
                  href={`/services/new?clientId=${client.client_id}`}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaPlus className="h-4 w-4" />
                  Schedule Service
                </Link>
              </div>
              
              {servicesLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : services.length > 0 ? (
                <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden border border-white/20">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Machine
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Technician
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {services.map((service) => (
                          <tr key={service.service_id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {formatDate(service.service_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {service.machine_serial || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {service.service_type || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {service.technician_name || 'Not Assigned'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                service.status === 'Completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {service.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link 
                                href={`/services/${service.service_id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20 text-center">
                  <p className="text-slate-500 mb-4">No service history found for this client.</p>
                  <Link 
                    href={`/services/new?clientId=${client.client_id}`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <FaPlus className="h-4 w-4" />
                    Schedule First Service
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quotations' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Quotation History</h2>
                <Link 
                  href={`/quotations/new?clientId=${client.client_id}`}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaPlus className="h-4 w-4" />
                  New Quotation
                </Link>
              </div>
              
              {quotationsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : quotations.length > 0 ? (
                <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden border border-white/20">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            CFM Req.
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Total Amount
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Items
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 bg-slate-50 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {quotations.map((quotation) => (
                          <tr key={quotation.quotation_id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {formatDate(quotation.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {quotation.cfm_requirement ? `${quotation.cfm_requirement.toLocaleString()} CFM` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              ${quotation.total_amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {quotation.items ? quotation.items.length : 0} items
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                quotation.status.toLowerCase() === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : quotation.status.toLowerCase() === 'approved'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {quotation.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link 
                                href={`/quotations/${quotation.quotation_id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20 text-center">
                  <p className="text-slate-500 mb-4">No quotations found for this client.</p>
                  <Link 
                    href={`/quotations/new?clientId=${client.client_id}`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <FaPlus className="h-4 w-4" />
                    Create First Quotation
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}