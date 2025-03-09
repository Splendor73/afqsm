"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaEdit, FaBoxOpen, FaShoppingCart, FaTools } from 'react-icons/fa';
import { useParams } from 'next/navigation';

// Sample data for demonstration - In a real app, this would come from an API
const sampleParts = [
  { id: 1, name: 'Air Filter', price: 89.99, stock: 35, category: 'Filters', location: 'Shelf A1', lastOrder: '2023-10-15', threshold: 10, description: 'High-quality air filter for all compressor models.', sku: 'AF-10035', supplier: 'CompAir Components', supplierPartNo: 'CAF-443-X' },
  { id: 2, name: 'Oil Filter', price: 45.50, stock: 28, category: 'Filters', location: 'Shelf A2', lastOrder: '2023-10-15', threshold: 10, description: 'Standard oil filter for regular maintenance.', sku: 'OF-10028', supplier: 'CompAir Components', supplierPartNo: 'COF-228-S' },
  { id: 3, name: 'Separator Element', price: 125.75, stock: 15, category: 'Filters', location: 'Shelf A3', lastOrder: '2023-09-20', threshold: 5, description: 'Oil separator element for efficiency improvement.', sku: 'SE-10015', supplier: 'CompAir Components', supplierPartNo: 'CSE-115-L' },
  { id: 4, name: 'Lubricant (1L)', price: 18.99, stock: 50, category: 'Lubricants', location: 'Shelf B1', lastOrder: '2023-11-01', threshold: 15, description: 'Premium synthetic lubricant for all compressor types.', sku: 'LB-10050', supplier: 'PressureLube Inc.', supplierPartNo: 'PLI-001-S' },
  { id: 5, name: 'Belt Kit', price: 75.25, stock: 12, category: 'Mechanical', location: 'Shelf C1', lastOrder: '2023-09-10', threshold: 5, description: 'Complete belt replacement kit including tensioner.', sku: 'BK-10012', supplier: 'MechaDrive Systems', supplierPartNo: 'MDS-BK-122' },
  { id: 6, name: 'Motor Bearings', price: 95.00, stock: 8, category: 'Mechanical', location: 'Shelf C2', lastOrder: '2023-08-15', threshold: 3, description: 'High-temperature rated motor bearings for continuous operation.', sku: 'MB-10008', supplier: 'MechaDrive Systems', supplierPartNo: 'MDS-MB-095' },
  { id: 7, name: 'Pressure Sensor', price: 120.50, stock: 5, category: 'Electronics', location: 'Shelf D1', lastOrder: '2023-10-05', threshold: 2, description: 'Digital pressure sensor with improved accuracy.', sku: 'PS-10005', supplier: 'TechControl Electronics', supplierPartNo: 'TCE-PS-450' },
  { id: 8, name: 'Control Board', price: 350.00, stock: 3, category: 'Electronics', location: 'Shelf D2', lastOrder: '2023-07-20', threshold: 1, description: 'Main control board with advanced diagnostic capabilities.', sku: 'CB-10003', supplier: 'TechControl Electronics', supplierPartNo: 'TCE-CB-350' },
  { id: 9, name: 'Gasket Set', price: 35.99, stock: 22, category: 'Seals', location: 'Shelf E1', lastOrder: '2023-09-15', threshold: 8, description: 'Complete gasket set for head rebuild.', sku: 'GS-10022', supplier: 'SealTech Industries', supplierPartNo: 'STI-GS-35' },
  { id: 10, name: 'O-Ring Kit', price: 19.95, stock: 30, category: 'Seals', location: 'Shelf E2', lastOrder: '2023-10-10', threshold: 10, description: 'Assorted O-rings for various maintenance needs.', sku: 'ORK-10030', supplier: 'SealTech Industries', supplierPartNo: 'STI-ORK-20' },
  { id: 11, name: 'Air-End Rebuild Kit', price: 895.00, stock: 2, category: 'Rebuild Kits', location: 'Shelf F1', lastOrder: '2023-06-15', threshold: 1, description: 'Complete air-end rebuild kit with all necessary components.', sku: 'ARK-10002', supplier: 'CompAir Components', supplierPartNo: 'CAK-895-XL' },
  { id: 12, name: 'Intake Valve Kit', price: 245.75, stock: 4, category: 'Valves', location: 'Shelf G1', lastOrder: '2023-08-20', threshold: 2, description: 'Intake valve assembly with improved flow design.', sku: 'IVK-10004', supplier: 'ValveTech Precision', supplierPartNo: 'VTP-IV-245' },
];

// Sample service history for the part
const sampleServiceHistory = [
  { id: 1, date: '2023-11-10', client: 'Tech Innovations', machineId: 'M10078', quantity: 1, technician: 'John Smith' },
  { id: 2, date: '2023-10-25', client: 'ABC Manufacturing', machineId: 'M10045', quantity: 1, technician: 'John Smith' },
  { id: 3, date: '2023-09-18', client: 'XYZ Industries', machineId: 'M10098', quantity: 2, technician: 'Emma Johnson' },
];

// Sample order history for the part
const sampleOrderHistory = [
  { id: 1, date: '2023-10-15', quantity: 10, supplier: 'CompAir Components', poNumber: 'PO-2023-089', unitPrice: 85.50 },
  { id: 2, date: '2023-07-22', quantity: 15, supplier: 'CompAir Components', poNumber: 'PO-2023-045', unitPrice: 82.75 },
  { id: 3, date: '2023-04-10', quantity: 20, supplier: 'CompAir Components', poNumber: 'PO-2023-022', unitPrice: 80.00 },
];

// Define part type
type Part = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  location: string;
  lastOrder: string;
  threshold: number;
  description: string;
  sku: string;
  supplier: string;
  supplierPartNo: string;
};

export default function PartDetailPage() {
  const params = useParams();
  const partId = Number(params.id);
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  
  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchPart = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const foundPart = sampleParts.find(p => p.id === partId);
        if (foundPart) {
          setPart(foundPart as Part);
        }
      } catch (error) {
        console.error('Error fetching part details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPart();
  }, [partId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!part) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Part Not Found</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">The part you&apos;re looking for doesn&apos;t exist or has been removed.</p>
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
                  <p className="text-slate-600 dark:text-slate-400">{part.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 pt-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Category</p>
                      <p className="font-medium">{part.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">SKU</p>
                      <p className="font-medium">{part.sku}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Supplier</p>
                      <p className="font-medium">{part.supplier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Supplier Part No.</p>
                      <p className="font-medium">{part.supplierPartNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                      <p className="font-medium">{part.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Last Order Date</p>
                      <p className="font-medium">{part.lastOrder}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'service-history' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Service Usage History</h3>
                  {sampleServiceHistory.length > 0 ? (
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
                          {sampleServiceHistory.map(history => (
                            <tr key={history.id} className="border-b border-slate-200 dark:border-slate-700">
                              <td className="px-4 py-2">{history.date}</td>
                              <td className="px-4 py-2">{history.client}</td>
                              <td className="px-4 py-2">{history.machineId}</td>
                              <td className="px-4 py-2">{history.quantity}</td>
                              <td className="px-4 py-2">{history.technician}</td>
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
                  {sampleOrderHistory.length > 0 ? (
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
                          {sampleOrderHistory.map(order => (
                            <tr key={order.id} className="border-b border-slate-200 dark:border-slate-700">
                              <td className="px-4 py-2">{order.date}</td>
                              <td className="px-4 py-2">{order.supplier}</td>
                              <td className="px-4 py-2">{order.poNumber}</td>
                              <td className="px-4 py-2">{order.quantity}</td>
                              <td className="px-4 py-2">${order.unitPrice.toFixed(2)}</td>
                              <td className="px-4 py-2">${(order.quantity * order.unitPrice).toFixed(2)}</td>
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
                <p className="text-2xl font-semibold">${part.price.toFixed(2)}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Stock Value</p>
                <p className="font-medium">${(part.price * part.stock).toFixed(2)}</p>
              </div>
              
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                <Link 
                  href={`/inventory/edit/${part.id}`} 
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <FaEdit className="h-4 w-4" />
                  <span>Edit Part</span>
                </Link>
                
                <Link 
                  href={`/services/new?partId=${part.id}`} 
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <FaTools className="h-4 w-4" />
                  <span>Use in Service</span>
                </Link>
                
                <button 
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <FaShoppingCart className="h-4 w-4" />
                  <span>Order More</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
            <h3 className="font-medium text-lg mb-4">Related Parts</h3>
            <div className="space-y-3">
              {sampleParts
                .filter(p => p.category === part.category && p.id !== part.id)
                .slice(0, 3)
                .map(relatedPart => (
                  <Link 
                    key={relatedPart.id}
                    href={`/inventory/${relatedPart.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  >
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded">
                      <FaBoxOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium">{relatedPart.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Stock: {relatedPart.stock} · ${relatedPart.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 