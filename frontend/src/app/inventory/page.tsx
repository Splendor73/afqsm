"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSearch, FaFilter, FaPlus, FaSyncAlt, FaFileExport, FaHistory, FaTools } from 'react-icons/fa';

// Define types for inventory data
interface Part {
  part_id: number;
  name: string;
  price: number;
  stock: number;
  category_id: number;
  category_name: string;
  location: string;
  last_order_date: string;
  threshold: number;
  supplier: string;
  sku: string;
  description: string;
}

export default function InventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  
  // Fetch parts data from the backend API
  useEffect(() => {
    async function fetchParts() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5017/api/parts');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.success) {
          setParts(data.parts);
          setFilteredParts(data.parts);
        } else {
          throw new Error(data.error || 'Failed to fetch parts');
        }
      } catch (err: any) {
        console.error('Error fetching parts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchParts();
  }, []);
  
  // Get unique categories from fetched data
  const categories = parts.length 
    ? [...new Set(parts.filter(part => part.category_name).map(part => part.category_name))] 
    : [];
  
  // Filter and sort parts whenever filters or sort options change
  useEffect(() => {
    if (!parts.length) return;
    
    let result = [...parts];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(part => 
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.category_name && part.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (part.location && part.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (part.sku && part.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (filterCategory !== 'All') {
      result = result.filter(part => part.category_name === filterCategory);
    }
    
    // Apply stock filter
    if (stockFilter === 'Low') {
      result = result.filter(part => Number(part.stock) <= Number(part.threshold) && Number(part.stock) > 0);
    } else if (stockFilter === 'Out') {
      result = result.filter(part => Number(part.stock) === 0);
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
        comparison = (a.category_name || '').localeCompare(b.category_name || '');
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredParts(result);
  }, [parts, searchTerm, filterCategory, stockFilter, sortBy, sortDirection]);
  
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
  const totalValue = parts.reduce((sum, part) => sum + (Number(part.price) * part.stock), 0);
  
  // Count items with low stock
  const lowStockCount = parts.filter(part => Number(part.stock) <= Number(part.threshold) && Number(part.stock) > 0).length;
  
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
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <div className="mt-4 md:mt-0">
          <Link 
            href="/inventory/new" 
            className="btn-primary flex items-center justify-center gap-2"
          >
            <FaPlus className="h-4 w-4" />
            <span>Add New Part</span>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Parts</p>
              <p className="mt-1 text-3xl font-semibold">{parts.length}</p>
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
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {filteredParts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No parts found matching your search criteria.</p>
              </div>
            ) : (
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
                      <tr key={part.part_id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-medium">
                          <Link href={`/inventory/${part.part_id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                            {part.name}
                          </Link>
                          {part.sku && <div className="text-xs text-slate-500">SKU: {part.sku}</div>}
                        </td>
                        <td className="px-4 py-3">{part.category_name || 'Uncategorized'}</td>
                        <td className="px-4 py-3">${Number(part.price).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <span className={
                              Number(part.stock) === 0
                                ? 'text-red-600 dark:text-red-400'
                                : Number(part.stock) <= Number(part.threshold)
                                ? 'text-amber-600 dark:text-amber-400'
                                : ''
                            }>
                              {part.stock}
                            </span>
                            {(Number(part.stock) <= Number(part.threshold) && Number(part.stock) > 0) && (
                              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 text-xs rounded-full">
                                Low
                              </span>
                            )}
                            {Number(part.stock) === 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500 text-xs rounded-full">
                                Out
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{part.location || 'Not specified'}</td>
                        <td className="px-4 py-3">{part.last_order_date ? new Date(part.last_order_date).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link 
                              href={`/inventory/${part.part_id}/edit`}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Edit
                            </Link>
                            <Link 
                              href={`/inventory/${part.part_id}/stock`}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            >
                              Adjust Stock
                            </Link>
                          </div>
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