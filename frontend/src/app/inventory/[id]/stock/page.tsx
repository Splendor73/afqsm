"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaPlus, FaMinus } from 'react-icons/fa';
import React from 'react';

export default function AdjustStockPage() {
  const params = useParams();
  const partId = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [part, setPart] = useState<{
    part_id: number;
    name: string;
    stock: number;
    category_name: string;
    price: number;
    sku: string;
  } | null>(null);
  
  const [adjustment, setAdjustment] = useState({
    quantity: '0',
    notes: '',
    reference_type: 'Manual Adjustment'
  });
  
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');

  // Fetch part data
  useEffect(() => {
    if (!partId) return;
    
    async function fetchPart() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:5017/api/parts/${partId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setPart(data.part);
        } else {
          throw new Error(data.error || 'Failed to fetch part data');
        }
      } catch (err: any) {
        console.error('Error fetching part:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPart();
  }, [partId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdjustment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partId) {
      setError('Part ID is missing');
      return;
    }
    
    if (!adjustment.quantity.trim() || isNaN(Number(adjustment.quantity)) || Number(adjustment.quantity) <= 0) {
      setError('Valid quantity is required (must be greater than 0)');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Convert quantity to positive or negative based on adjustment type
      const quantity = adjustmentType === 'add' 
        ? Number(adjustment.quantity) 
        : -Number(adjustment.quantity);
      
      const response = await fetch(`http://localhost:5017/api/parts/${partId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity,
          notes: adjustment.notes,
          reference_type: adjustment.reference_type
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Changed redirect to main inventory page instead of part detail page
        router.push('/inventory');
        router.refresh();
      } else {
        setError(data.error || 'Failed to update stock');
      }
    } catch (err: any) {
      console.error('Error updating stock:', err);
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

  if (!part) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Part not found</span>
        <p className="mt-2">
          <Link href="/inventory" className="underline">
            Return to inventory
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Adjust Stock</h1>
        <Link
          href={`/inventory/${partId}`}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="h-4 w-4" />
          <span>Back to Part</span>
        </Link>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20 mb-6">
        <h2 className="text-xl font-semibold mb-4">Part Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{part.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">SKU</p>
            <p className="font-medium">{part.sku || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{part.category_name || 'Uncategorized'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Stock</p>
            <p className="font-medium text-xl">{part.stock}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-medium">${Number(part.price).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/20">
        <h2 className="text-xl font-semibold mb-4">Stock Adjustment</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Adjustment Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                    adjustmentType === 'add' 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setAdjustmentType('add')}
                >
                  <FaPlus className="h-4 w-4" />
                  <span>Add Stock</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                    adjustmentType === 'remove' 
                      ? 'bg-red-100 text-red-800 border border-red-300' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setAdjustmentType('remove')}
                >
                  <FaMinus className="h-4 w-4" />
                  <span>Remove Stock</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="block text-sm font-medium">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                step="1"
                required
                value={adjustment.quantity}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-sm text-gray-500">
                {adjustmentType === 'add' ? 'Adding' : 'Removing'} {adjustment.quantity} units. 
                New stock will be: {
                  adjustmentType === 'add' 
                    ? part.stock + Number(adjustment.quantity || 0)
                    : Math.max(0, part.stock - Number(adjustment.quantity || 0))
                }
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="reference_type" className="block text-sm font-medium">
                Reference Type
              </label>
              <select
                id="reference_type"
                name="reference_type"
                value={adjustment.reference_type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Manual Adjustment">Manual Adjustment</option>
                <option value="Purchase Order">Purchase Order</option>
                <option value="Service Usage">Service Usage</option>
                <option value="Inventory Count">Inventory Count</option>
                <option value="Return">Return</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={adjustment.notes}
                onChange={handleChange}
                placeholder="Reason for adjustment..."
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href={`/inventory/${partId}`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-2 ${
                adjustmentType === 'add'
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              {submitting ? 'Processing...' : (
                <>
                  {adjustmentType === 'add' ? <FaPlus className="h-4 w-4" /> : <FaMinus className="h-4 w-4" />}
                  <span>{adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}