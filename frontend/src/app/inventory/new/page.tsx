"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

interface Category {
  category_id: number;
  name: string;
}

export default function NewPartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [partData, setPartData] = useState({
    name: '',
    sku: '',
    category_id: '',
    price: '',
    stock: '0',
    threshold: '5',
    location: '',
    description: '',
    supplier: '',
    supplier_part_no: ''
  });

  // Fetch categories on load
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:5017/api/part-categories');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.categories);
        } else {
          console.error('Failed to fetch categories:', data.error);
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPartData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!partData.name.trim()) {
      setError('Part name is required');
      return;
    }

    if (!partData.price.trim() || isNaN(Number(partData.price)) || Number(partData.price) < 0) {
      setError('Valid price is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const numericData = {
        ...partData,
        price: Number(partData.price),
        stock: Number(partData.stock),
        threshold: Number(partData.threshold),
        category_id: partData.category_id ? Number(partData.category_id) : null
      };
      
      const response = await fetch('http://localhost:5017/api/parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(numericData),
      });

      const data = await response.json();
      
      if (data.success) {
        router.push('/inventory');
        router.refresh();
      } else {
        setError(data.error || 'Failed to add part');
      }
    } catch (err: any) {
      console.error('Error adding part:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add New Part</h1>
        <Link
          href="/inventory"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="h-4 w-4" />
          <span>Back to Inventory</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Part Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={partData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="sku" className="block text-sm font-medium">
                SKU
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={partData.sku}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category_id" className="block text-sm font-medium">
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                value={partData.category_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={loadingCategories}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                required
                value={partData.price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="stock" className="block text-sm font-medium">
                Current Stock
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                min="0"
                value={partData.stock}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="threshold" className="block text-sm font-medium">
                Low Stock Threshold
              </label>
              <input
                type="number"
                id="threshold"
                name="threshold"
                min="0"
                value={partData.threshold}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium">
                Storage Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={partData.location}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="supplier" className="block text-sm font-medium">
                Supplier
              </label>
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={partData.supplier}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="supplier_part_no" className="block text-sm font-medium">
                Supplier Part Number
              </label>
              <input
                type="text"
                id="supplier_part_no"
                name="supplier_part_no"
                value={partData.supplier_part_no}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={partData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/inventory"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2"
            >
              {loading ? 'Saving...' : (
                <>
                  <FaSave className="h-4 w-4" />
                  <span>Save Part</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 