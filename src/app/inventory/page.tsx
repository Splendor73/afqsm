"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSearch, FaFilter, FaPlus, FaSyncAlt, FaFileExport, FaHistory, FaTools } from 'react-icons/fa';

// Sample data for demonstration
// In a real application, this would be fetched from an API
const sampleParts = [
  { id: 1, name: 'Air Filter', price: 89.99, stock: 35, category: 'Filters', location: 'Shelf A1', lastOrder: '2023-10-15', threshold: 10 },
  { id: 2, name: 'Oil Filter', price: 45.50, stock: 28, category: 'Filters', location: 'Shelf A2', lastOrder: '2023-10-15', threshold: 10 },
  { id: 3, name: 'Separator Element', price: 125.75, stock: 15, category: 'Filters', location: 'Shelf A3', lastOrder: '2023-09-20', threshold: 5 },
  { id: 4, name: 'Lubricant (1L)', price: 18.99, stock: 50, category: 'Lubricants', location: 'Shelf B1', lastOrder: '2023-11-01', threshold: 15 },
  { id: 5, name: 'Belt Kit', price: 75.25, stock: 12, category: 'Mechanical', location: 'Shelf C1', lastOrder: '2023-09-10', threshold: 5 },
  { id: 6, name: 'Motor Bearings', price: 95.00, stock: 8, category: 'Mechanical', location: 'Shelf C2', lastOrder: '2023-08-15', threshold: 3 },
  { id: 7, name: 'Pressure Sensor', price: 120.50, stock: 5, category: 'Electronics', location: 'Shelf D1', lastOrder: '2023-10-05', threshold: 2 },
  { id: 8, name: 'Control Board', price: 350.00, stock: 3, category: 'Electronics', location: 'Shelf D2', lastOrder: '2023-07-20', threshold: 1 },
  { id: 9, name: 'Gasket Set', price: 35.99, stock: 22, category: 'Seals', location: 'Shelf E1', lastOrder: '2023-09-15', threshold: 8 },
  { id: 10, name: 'O-Ring Kit', price: 19.95, stock: 30, category: 'Seals', location: 'Shelf E2', lastOrder: '2023-10-10', threshold: 10 },
  { id: 11, name: 'Air-End Rebuild Kit', price: 895.00, stock: 2, category: 'Rebuild Kits', location: 'Shelf F1', lastOrder: '2023-06-15', threshold: 1 },
  { id: 12, name: 'Intake Valve Kit', price: 245.75, stock: 4, category: 'Valves', location: 'Shelf G1', lastOrder: '2023-08-20', threshold: 2 },
];

const categories = [...new Set(sampleParts.map(part => part.category))];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filteredParts, setFilteredParts] = useState(sampleParts);
  
  // Filter and sort parts whenever filters or sort options change
  useEffect(() => {
    let result = [...sampleParts];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(part => 
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filterCategory !== 'All') {
      result = result.filter(part => part.category === filterCategory);
    }
    
    // Apply stock filter
    if (stockFilter === 'Low') {
      result = result.filter(part => part.stock <= part.threshold);
    } else if (stockFilter === 'Out') {
      result = result.filter(part => part.stock === 0);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'stock') {
        comparison = a.stock - b.stock;
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredParts(result);
  }, [searchTerm, filterCategory, stockFilter, sortBy, sortDirection]);
  
  // Toggle sort direction when clicking on the same sort option
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  // Calculate total inventory value
  const totalValue = filteredParts.reduce((sum, part) => sum + (part.price * part.stock), 0);
  
  // Count items with low stock
  const lowStockCount = sampleParts.filter(part => part.stock <= part.threshold).length;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <Link 
            href="/inventory/new" 
            className="btn-primary flex items-center justify-center gap-2"
          >
            <FaPlus className="h-4 w-4" />
            <span>Add New Part</span>
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
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Parts</p>
              <p className="mt-1 text-3xl font-semibold">{sampleParts.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <FaTools className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Low Stock Items</p>
              <p className="mt-1 text-3xl font-semibold">{lowStockCount}</p>
            </div>
            <div className="bg-amber-500 p-3 rounded-lg">
              <FaHistory className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Categories</p>
              <p className="mt-1 text-3xl font-semibold">{categories.length}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <FaFilter className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Value</p>
              <p className="mt-1 text-3xl font-semibold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <FaSyncAlt className="h-6 w-6 text-white" />
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
              placeholder="Search parts..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:border-blue-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              className="rounded-lg border px-3 py-2"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              className="rounded-lg border px-3 py-2"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="All">All Stock Levels</option>
              <option value="Low">Low Stock</option>
              <option value="Out">Out of Stock</option>
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
                    Part Name
                    {sortBy === 'name' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSort('category')}
                  >
                    Category
                    {sortBy === 'category' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSort('price')}
                  >
                    Price
                    {sortBy === 'price' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  <button 
                    className="flex items-center gap-1"
                    onClick={() => handleSort('stock')}
                  >
                    Stock
                    {sortBy === 'stock' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold">Location</th>
                <th className="px-4 py-3 text-left font-semibold">Last Order</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map((part) => (
                <tr key={part.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/inventory/${part.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {part.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{part.category}</td>
                  <td className="px-4 py-3">${part.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      part.stock === 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500' : 
                      part.stock <= part.threshold ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' : 
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                    }`}>
                      {part.stock === 0 ? 'Out of Stock' : part.stock <= part.threshold ? 'Low Stock' : 'In Stock'}
                    </span>
                    <span className="ml-2">{part.stock}</span>
                  </td>
                  <td className="px-4 py-3">{part.location}</td>
                  <td className="px-4 py-3">{part.lastOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link 
                        href={`/inventory/edit/${part.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </Link>
                      <Link 
                        href={`/services/new?partId=${part.id}`}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Use in Service
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredParts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">No parts found matching your filters.</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Low Stock Items</h2>
            <Link href="/inventory?filter=low" className="text-sm link-gradient">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {sampleParts
              .filter(part => part.stock <= part.threshold)
              .slice(0, 5)
              .map((part) => (
                <div key={part.id} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg hover:bg-slate-100/80 transition-colors duration-200">
                  <div>
                    <Link href={`/inventory/${part.id}`} className="font-medium hover:text-blue-600 dark:hover:text-blue-400">
                      {part.name}
                    </Link>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{part.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{part.stock} in stock</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Threshold: {part.threshold}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Recent Part Usage</h2>
            <Link href="/services" className="text-sm link-gradient">
              View all services
            </Link>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg hover:bg-slate-100/80 transition-colors duration-200">
                <div>
                  <p className="font-medium">
                    <Link href={`/inventory/${i+1}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {sampleParts[i % sampleParts.length].name}
                    </Link>
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Used in Service #{1000 + i}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Qty: {i + 1}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(Date.now() - (i + 1) * 86400000 * 2).toLocaleDateString()}
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