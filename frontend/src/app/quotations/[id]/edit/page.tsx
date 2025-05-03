"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaPlus, FaMinus } from 'react-icons/fa';
import React from 'react';

// Interfaces
interface MachineModel {
  model_id: number;
  name: string;
  type: string;
  cfm_capacity: number;
  price: number;
  category?: string;
}

interface Client {
  client_id: number;
  name: string;
}

interface QuotationItem {
  item_id?: number;
  quotation_id?: number;
  model_id: number;
  quantity: number;
  unit_price: number;
  description: string;
  model_name?: string;
  cfm_capacity?: number;
  type?: string;
}

interface Quotation {
  quotation_id: number;
  client_id: number | null;
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

export default function EditQuotationPage() {
  const params = useParams();
  const quotationId = params.id as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [models, setModels] = useState<MachineModel[]>([]);
  const [selectedItems, setSelectedItems] = useState<QuotationItem[]>([]);
  
  // Fetch quotation data, clients and machine models
  useEffect(() => {
    if (!quotationId) return;
    
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch clients
        const clientsResponse = await fetch(`http://${window.location.hostname}:5017/api/clients`);
        if (!clientsResponse.ok) {
          throw new Error(`Error fetching clients: ${clientsResponse.status}`);
        }
        const clientsData = await clientsResponse.json();
        
        if (clientsData.success) {
          setClients(clientsData.clients);
        }
        
        // Fetch machine models
        const modelsResponse = await fetch(`http://${window.location.hostname}:5017/api/machine-models`);
        if (!modelsResponse.ok) {
          throw new Error(`Error fetching models: ${modelsResponse.status}`);
        }
        const modelsData = await modelsResponse.json();
        
        if (modelsData.success) {
          setModels(modelsData.models);
        }
        
        // Fetch quotation details
        const quotationResponse = await fetch(`http://${window.location.hostname}:5017/api/quotations/${quotationId}`);
        if (!quotationResponse.ok) {
          throw new Error(`Error: ${quotationResponse.status}`);
        }
        
        const quotationData = await quotationResponse.json();
        
        if (quotationData.success) {
          setQuotation(quotationData.quotation);
          setSelectedItems(quotationData.quotation.items);
        } else {
          throw new Error(quotationData.error || 'Failed to fetch quotation data');
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [quotationId]);

  const handleQuotationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (!quotation) return;
    
    setQuotation(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        [name]: name === 'client_id' ? (value ? Number(value) : null) : 
                name === 'cfm_requirement' || name === 'total_amount' ? Number(value) : 
                value
      };
    });
  };

  const addItem = () => {
    if (models.length === 0) return;
    
    // Default to first model
    const defaultModel = models[0];
    
    const newItem: QuotationItem = {
      model_id: defaultModel.model_id,
      quantity: 1,
      unit_price: defaultModel.price,
      description: defaultModel.name,
      model_name: defaultModel.name,
      cfm_capacity: defaultModel.cfm_capacity,
      type: defaultModel.type
    };
    
    setSelectedItems(prev => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    setSelectedItems(prev => {
      const updated = [...prev];
      
      if (field === 'model_id') {
        const modelId = Number(value);
        const selectedModel = models.find(m => m.model_id === modelId);
        
        if (selectedModel) {
          updated[index] = {
            ...updated[index],
            model_id: modelId,
            unit_price: selectedModel.price,
            description: selectedModel.name,
            model_name: selectedModel.name,
            cfm_capacity: selectedModel.cfm_capacity,
            type: selectedModel.type
          };
        }
      } else if (field === 'quantity') {
        updated[index] = {
          ...updated[index],
          quantity: Number(value)
        };
      } else if (field === 'unit_price') {
        updated[index] = {
          ...updated[index],
          unit_price: Number(value)
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value
        };
      }
      
      return updated;
    });
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const calculateTotalCfm = () => {
    return selectedItems.reduce((total, item) => {
      const model = models.find(m => m.model_id === item.model_id);
      return total + (model ? model.cfm_capacity * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quotationId || !quotation) {
      setError('Quotation data is missing');
      return;
    }
    
    if (!quotation.client_name) {
      setError('Client name is required');
      return;
    }

    if (!quotation.contact_info) {
      setError('Contact information is required');
      return;
    }

    if (selectedItems.length === 0) {
      setError('At least one item is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const totalAmount = calculateTotal();
      const totalCfm = calculateTotalCfm();
      
      // Prepare items for API
      const items = selectedItems.map(item => ({
        model_id: item.model_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        description: item.description
      }));
      
      // Prepare quotation data
      const updatedQuotation = {
        ...quotation,
        total_amount: totalAmount,
        cfm_requirement: quotation.cfm_requirement || totalCfm,
        items
      };
      
      const response = await fetch(`http://${window.location.hostname}:5017/api/quotations/${quotationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuotation),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        router.push(`/quotations/${quotationId}`);
        router.refresh();
      } else {
        throw new Error(data.error || 'Failed to update quotation');
      }
    } catch (err: any) {
      console.error('Error updating quotation:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Quotation not found</span>
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Quotation #{quotationId}</h1>
        <Link
          href={`/quotations/${quotationId}`}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="h-4 w-4" />
          <span>Back to Quotation</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20">
          <h2 className="text-xl font-semibold mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="client_id" className="block text-sm font-medium">
                Existing Client
              </label>
              <select
                id="client_id"
                name="client_id"
                value={quotation.client_id || ''}
                onChange={handleQuotationChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select existing client (optional)</option>
                {clients.map(client => (
                  <option key={client.client_id} value={client.client_id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="client_name" className="block text-sm font-medium">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="client_name"
                name="client_name"
                value={quotation.client_name || ''}
                onChange={handleQuotationChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contact_info" className="block text-sm font-medium">
                Contact Information <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contact_info"
                name="contact_info"
                value={quotation.contact_info || ''}
                onChange={handleQuotationChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={quotation.status}
                onChange={handleQuotationChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="cfm_requirement" className="block text-sm font-medium">
                CFM Requirement
              </label>
              <input
                type="number"
                id="cfm_requirement"
                name="cfm_requirement"
                value={quotation.cfm_requirement}
                onChange={handleQuotationChange}
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="valid_until" className="block text-sm font-medium">
                Valid Until
              </label>
              <input
                type="date"
                id="valid_until"
                name="valid_until"
                value={quotation.valid_until || ''}
                onChange={handleQuotationChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={quotation.notes || ''}
                onChange={handleQuotationChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quotation Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1.5"
            >
              <FaPlus className="h-3 w-3" />
              <span>Add Item</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {selectedItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price ($)
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={item.model_id}
                            onChange={(e) => handleItemChange(index, 'model_id', e.target.value)}
                            className="block w-full rounded-md border border-gray-300 py-1.5 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                          >
                            {models.map((model) => (
                              <option key={model.model_id} value={model.model_id}>
                                {model.name} ({model.cfm_capacity} CFM)
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="block w-24 rounded-md border border-gray-300 py-1.5 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                            className="block w-32 rounded-md border border-gray-300 py-1.5 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          ${(item.quantity * item.unit_price).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaMinus className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium">
                        Total:
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        ${calculateTotal().toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium">
                        Total CFM:
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        {calculateTotalCfm().toLocaleString()} CFM
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No items added yet. Click "Add Item" to add machine models to this quotation.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            href={`/quotations/${quotationId}`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2"
          >
            {submitting ? 'Saving...' : (
              <>
                <FaSave className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 