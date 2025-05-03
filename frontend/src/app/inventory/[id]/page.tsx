"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaEdit, FaBoxOpen, FaTools } from 'react-icons/fa';
import { useParams } from 'next/navigation';

// Define types for our data
interface Part {
  part_id: number;
  name: string;
  price: number;
  stock: number;
  category_name: string;
  location: string;
  last_order_date: string;
  threshold: number;
  description: string;
  sku: string;
  supplier: string;
  supplier_part_no: string;
  category_id: number;
}

interface ServiceHistoryItem {
  service_id: number;
  service_date: string;
  client_name: string;
  machine_serial: string;
  quantity: number;
  technician_name: string;
}

interface OrderHistoryItem {
  order_id: number;
  order_date: string;
  supplier_name: string;
  po_number: string;
  quantity: number;
  unit_cost: number;
}

// Helper function for stable date formatting
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    // Use explicit formatting instead of locale-dependent methods
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (err) {
    return 'Invalid Date';
  }
}

export default function PartDetailPage() {
  const params = useParams();
  const partId = Number(params.id);
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [relatedParts, setRelatedParts] = useState<Part[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch part details from the API
    const fetchPartDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch the part details
        const response = await fetch(`http://localhost:5017/api/parts/${partId}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch part details');
        }
        
        setPart(data.part);
        
        // Fetch service history for this part
        try {
          const serviceResponse = await fetch(`http://localhost:5017/api/parts/${partId}/service-history`);
          if (serviceResponse.ok) {
            const serviceData = await serviceResponse.json();
            if (serviceData.success) {
              setServiceHistory(serviceData.history || []);
            }
          }
        } catch (serviceErr) {
          console.error('Error fetching service history:', serviceErr);
          // Non-critical error, continue with application
        }
        
        // Fetch order history for this part
        try {
          const orderResponse = await fetch(`http://localhost:5017/api/parts/${partId}/order-history`);
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            if (orderData.success) {
              setOrderHistory(orderData.history || []);
            }
          }
        } catch (orderErr) {
          console.error('Error fetching order history:', orderErr);
          // Non-critical error, continue with application
        }
        
        // If we have a category_id, fetch related parts
        if (data.part && data.part.category_id) {
          try {
            const relatedResponse = await fetch(
              `http://localhost:5017/api/parts?category=${data.part.category_id}&exclude=${partId}&limit=3`
            );
            
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              if (relatedData.success) {
                setRelatedParts(relatedData.parts || []);
              }
            }
          } catch (relatedErr) {
            console.error('Error fetching related parts:', relatedErr);
            // Non-critical error, continue with application
          }
        }
      } catch (err: any) {
        console.error('Error fetching part details:', err);
        setError(err.message || 'Failed to fetch part details');
      } finally {
        setLoading(false);
      }
    };
    
    if (partId) {
      fetchPartDetails();
    }
  }, [partId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !part) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Part Not Found</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {error || "The part you're looking for doesn't exist or has been removed."}
        </p>
        <Link href="/inventory" className="btn-primary mt-6 inline-block">
          Return to Inventory
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/inventory" className="mr-4 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
          <FaArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">{part.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'details' 
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'service-history' 
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                onClick={() => setActiveTab('service-history')}
              >
                Service History
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'order-history' 
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                onClick={() => setActiveTab('order-history')}
              >
                Order History
              </button>
            </div>
            
            <div className="py-4">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-400">{part.description || 'No description available.'}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 pt-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Category</p>
                      <p className="font-medium">{part.category_name || 'Uncategorized'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">SKU</p>
                      <p className="font-medium">{part.sku || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Supplier</p>
                      <p className="font-medium">{part.supplier || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Supplier Part No.</p>
                      <p className="font-medium">{part.supplier_part_no || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                      <p className="font-medium">{part.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Last Order Date</p>
                      <p className="font-medium">{formatDate(part.last_order_date)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'service-history' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Service Usage History</h3>
                  {serviceHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Client</th>
                            <th className="px-4 py-2 text-left">Machine ID</th>
                            <th className="px-4 py-2 text-left">Quantity</th>
                            <th className="px-4 py-2 text-left">Technician</th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviceHistory.map(history => (
                            <tr key={history.service_id} className="border-b border-slate-200 dark:border-slate-700">
                              <td className="px-4 py-2">
                                {formatDate(history.service_date)}
                              </td>
                              <td className="px-4 py-2">{history.client_name}</td>
                              <td className="px-4 py-2">{history.machine_serial}</td>
                              <td className="px-4 py-2">{history.quantity}</td>
                              <td className="px-4 py-2">{history.technician_name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">No service history available for this part.</p>
                  )}
                </div>
              )}
              
              {activeTab === 'order-history' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Purchase Order History</h3>
                  {orderHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Supplier</th>
                            <th className="px-4 py-2 text-left">PO Number</th>
                            <th className="px-4 py-2 text-left">Quantity</th>
                            <th className="px-4 py-2 text-left">Unit Price</th>
                            <th className="px-4 py-2 text-left">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderHistory.map(order => (
                            <tr key={order.order_id} className="border-b border-slate-200 dark:border-slate-700">
                              <td className="px-4 py-2">
                                {formatDate(order.order_date)}
                              </td>
                              <td className="px-4 py-2">{order.supplier_name}</td>
                              <td className="px-4 py-2">{order.po_number}</td>
                              <td className="px-4 py-2">{order.quantity}</td>
                              <td className="px-4 py-2">${Number(order.unit_cost).toFixed(2)}</td>
                              <td className="px-4 py-2">
                                ${(Number(order.quantity) * Number(order.unit_cost)).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">No order history available for this part.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
            <h3 className="font-medium text-lg mb-4">Inventory Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Current Stock</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold">{part.stock}</p>
                  <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                    part.stock === 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500' : 
                    part.stock <= part.threshold ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' : 
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                  }`}>
                    {part.stock === 0 ? 'Out of Stock' : part.stock <= part.threshold ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Stock Threshold</p>
                <p className="font-medium">{part.threshold}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Price</p>
                <p className="text-2xl font-semibold">${Number(part.price).toFixed(2)}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Stock Value</p>
                <p className="font-medium">${(Number(part.price) * part.stock).toFixed(2)}</p>
              </div>
              
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                <Link 
                  href={`/inventory/${part.part_id}/edit`} 
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <FaEdit className="h-4 w-4" />
                  <span>Edit Part</span>
                </Link>
                
                <Link 
                  href={`/inventory/${part.part_id}/stock`} 
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <FaTools className="h-4 w-4" />
                  <span>Adjust Stock</span>
                </Link>
                
                {/* Order More button removed */}
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
            <h3 className="font-medium text-lg mb-4">Related Parts</h3>
            <div className="space-y-3">
              {relatedParts.length > 0 ? (
                relatedParts.map(relatedPart => (
                  <Link 
                    key={relatedPart.part_id}
                    href={`/inventory/${relatedPart.part_id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  >
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded">
                      <FaBoxOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium">{relatedPart.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Stock: {relatedPart.stock} · ${Number(relatedPart.price).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No related parts found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}