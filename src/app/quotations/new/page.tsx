"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { FaSave, FaArrowLeft, FaPlus, FaMinus, FaCalculator, FaSearch, FaFilter, FaSpinner } from 'react-icons/fa';

// Sample machine models for demonstration
// In a real application, this would be fetched from an API and could include hundreds of models
const machineModels = [
  { id: 1, name: 'Standard 200 CFM', type: 'Fixed Bit', cfm: 200, price: 3500, category: 'Standard Series' },
  { id: 2, name: 'Performance 350 CFM', type: 'Fixed Bit', cfm: 350, price: 5800, category: 'Performance Series' },
  { id: 3, name: 'Industrial 500 CFM', type: 'Fixed Bit', cfm: 500, price: 8200, category: 'Industrial Series' },
  { id: 4, name: 'Pro Series 300 CFM', type: 'VFD', cfm: 300, price: 6200, category: 'Pro Series' },
  { id: 5, name: 'Pro Series 600 CFM', type: 'VFD', cfm: 600, price: 11500, category: 'Pro Series' },
  { id: 6, name: 'Pro Series 900 CFM', type: 'VFD', cfm: 900, price: 17800, category: 'Pro Series' },
];

// Simulated API function to fetch models with filtering
const fetchModels = async (params: { 
  search?: string; 
  type?: string; 
  cfmMin?: number; 
  cfmMax?: number; 
  category?: string;
  page?: number;
  limit?: number;
}) => {
  // In a real app, this would be an API call
  console.log('Fetching models with params:', params);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let filtered = [...machineModels];
  
  if (params.search) {
    const term = params.search.toLowerCase();
    filtered = filtered.filter(model => 
      model.name.toLowerCase().includes(term) || 
      model.category.toLowerCase().includes(term)
    );
  }
  
  if (params.type && params.type !== 'all') {
    filtered = filtered.filter(model => model.type === params.type);
  }
  
  if (params.category && params.category !== 'all') {
    filtered = filtered.filter(model => model.category === params.category);
  }
  
  if (params.cfmMin !== undefined) {
    filtered = filtered.filter(model => model.cfm >= params.cfmMin!);
  }
  
  if (params.cfmMax !== undefined) {
    filtered = filtered.filter(model => model.cfm <= params.cfmMax!);
  }
  
  // Calculate pagination
  const page = params.page || 1;
  const limit = params.limit || 10;
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit);
  const start = (page - 1) * limit;
  const end = Math.min(start + limit, totalItems);
  const items = filtered.slice(start, end);
  
  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasMore: page < totalPages
    }
  };
};

// Get unique model categories
const getModelCategories = () => {
  const categories = Array.from(new Set(machineModels.map(model => model.category)));
  return ['all', ...categories];
};

// Get unique model types
const getModelTypes = () => {
  const types = Array.from(new Set(machineModels.map(model => model.type)));
  return ['all', ...types];
};

type FormValues = {
  clientName: string;
  contactInfo: string;
  cfmRequirement: number;
  notes: string;
};

// Fix for Untyped function calls may not accept type arguments
const groupModelsByCategory = (models: Array<{id: number, name: string, type: string, cfm: number, price: number, category: string}>) => {
  return models.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, Array<{id: number, name: string, type: string, cfm: number, price: number, category: string}>>);
};

export default function NewQuotationPage() {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      clientName: '',
      contactInfo: '',
      cfmRequirement: 0,
      notes: '',
    }
  });

  const [selectedMachines, setSelectedMachines] = useState<Array<{ modelId: number, quantity: number }>>([]);
  const [optimizedSelection, setOptimizedSelection] = useState<Array<{ modelId: number, quantity: number }>>([]);
  
  // Model filtering and search state
  const [modelSearch, setModelSearch] = useState('');
  const [modelType, setModelType] = useState('all');
  const [modelCategory, setModelCategory] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [cfmMin, setCfmMin] = useState<number | undefined>(undefined);
  const [cfmMax, setCfmMax] = useState<number | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [models, setModels] = useState<typeof machineModels>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Available categories and types
  const modelCategories = getModelCategories();
  const modelTypes = getModelTypes();
  
  // Toggle category expansion (for category view)
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  // Fetch models with current filters
  const loadModels = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const result = await fetchModels({
        search: modelSearch,
        type: modelType === 'all' ? undefined : modelType,
        category: modelCategory === 'all' ? undefined : modelCategory,
        cfmMin,
        cfmMax,
        page,
        limit: 12 // Show 12 models per page
      });
      
      setModels(prev => page === 1 ? result.items : [...prev, ...result.items]);
      setCurrentPage(page);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.totalItems);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setIsLoading(false);
    }
  }, [modelSearch, modelType, modelCategory, cfmMin, cfmMax]);
  
  // Load models when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadModels(1);
  }, [modelSearch, modelType, modelCategory, cfmMin, cfmMax, loadModels]);
  
  // Reset filters
  const resetFilters = () => {
    setModelSearch('');
    setModelType('all');
    setModelCategory('all');
    setCfmMin(undefined);
    setCfmMax(undefined);
  };

  const addMachine = (modelId: number) => {
    const existingIndex = selectedMachines.findIndex(m => m.modelId === modelId);
    if (existingIndex >= 0) {
      const updated = [...selectedMachines];
      updated[existingIndex].quantity += 1;
      setSelectedMachines(updated);
    } else {
      setSelectedMachines([...selectedMachines, { modelId, quantity: 1 }]);
    }
  };

  const removeMachine = (modelId: number) => {
    const existingIndex = selectedMachines.findIndex(m => m.modelId === modelId);
    if (existingIndex >= 0) {
      const updated = [...selectedMachines];
      if (updated[existingIndex].quantity > 1) {
        updated[existingIndex].quantity -= 1;
      } else {
        updated.splice(existingIndex, 1);
      }
      setSelectedMachines(updated);
    }
  };

  const optimizeSelection = (cfmTarget: number) => {
    // Simple greedy algorithm (could be improved)
    const sortedModels = [...machineModels].sort((a, b) => b.cfm / b.price - a.cfm / a.price);
    const optimized: Array<{ modelId: number, quantity: number }> = [];
    let remainingCfm = cfmTarget;
    
    for (const model of sortedModels) {
      if (remainingCfm <= 0) break;
      
      const unitsNeeded = Math.floor(remainingCfm / model.cfm);
      if (unitsNeeded > 0) {
        optimized.push({ modelId: model.id, quantity: unitsNeeded });
        remainingCfm -= unitsNeeded * model.cfm;
      }
    }
    
    // Add one more machine to cover any remaining CFM
    if (remainingCfm > 0) {
      // Find the smallest machine that covers the remaining CFM
      const smallestSufficient = sortedModels
        .filter(m => m.cfm >= remainingCfm)
        .sort((a, b) => a.price - b.price)[0];
      
      if (smallestSufficient) {
        const existingIndex = optimized.findIndex(m => m.modelId === smallestSufficient.id);
        if (existingIndex >= 0) {
          optimized[existingIndex].quantity += 1;
        } else {
          optimized.push({ modelId: smallestSufficient.id, quantity: 1 });
        }
      } else {
        // If no machine covers it, add the largest available
        const largest = sortedModels[0];
        const existingIndex = optimized.findIndex(m => m.modelId === largest.id);
        if (existingIndex >= 0) {
          optimized[existingIndex].quantity += 1;
        } else {
          optimized.push({ modelId: largest.id, quantity: 1 });
        }
      }
    }
    
    setOptimizedSelection(optimized);
  };

  const getTotalCfm = (machines: Array<{ modelId: number, quantity: number }>) => {
    return machines.reduce((total, item) => {
      const model = machineModels.find(m => m.id === item.modelId);
      return total + (model ? model.cfm * item.quantity : 0);
    }, 0);
  };

  const getTotalCost = (machines: Array<{ modelId: number, quantity: number }>) => {
    return machines.reduce((total, item) => {
      const model = machineModels.find(m => m.id === item.modelId);
      return total + (model ? model.price * item.quantity : 0);
    }, 0);
  };

  const onSubmit = (data: FormValues) => {
    const quotationData = {
      ...data,
      machines: selectedMachines,
      totalCfm: getTotalCfm(selectedMachines),
      totalCost: getTotalCost(selectedMachines),
      date: new Date().toISOString(),
    };
    
    console.log('Saving quotation:', quotationData);
    // In a real app, we would send this to the server
    alert('Quotation saved successfully!');
  };

  // Group models by category for the categorized view
  const modelsByCategory = groupModelsByCategory(machineModels);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/quotations" className="text-blue-600 hover:text-blue-800">
          <FaArrowLeft />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New Quotation</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Client Information</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="clientName" className="form-label">
                    Client Name
                  </label>
                  <input
                    id="clientName"
                    {...register('clientName', { required: 'Client name is required' })}
                    className="form-input"
                    placeholder="Enter client name"
                  />
                  {errors.clientName && (
                    <p className="form-error">{errors.clientName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="contactInfo" className="form-label">
                    Contact Information
                  </label>
                  <input
                    id="contactInfo"
                    {...register('contactInfo', { required: 'Contact information is required' })}
                    className="form-input"
                    placeholder="Email or phone number"
                  />
                  {errors.contactInfo && (
                    <p className="form-error">{errors.contactInfo.message}</p>
                  )}
                </div>
              </div>

              <div className="relative">
                <label htmlFor="cfmRequirement" className="form-label">
                  CFM Requirement
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="cfmRequirement"
                    type="number"
                    {...register('cfmRequirement', { 
                      required: 'CFM requirement is required',
                      min: { value: 1, message: 'CFM must be greater than 0' }
                    })}
                    className="form-input"
                    placeholder="Required CFM"
                  />
                  <button
                    type="button"
                    onClick={() => optimizeSelection(Number(control._formValues.cfmRequirement))}
                    className="btn-secondary flex items-center gap-2"
                    disabled={!control._formValues.cfmRequirement}
                  >
                    <FaCalculator className="h-4 w-4" />
                    <span>Optimize</span>
                  </button>
                </div>
                {errors.cfmRequirement && (
                  <p className="form-error">{errors.cfmRequirement.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="form-label">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  className="form-input min-h-24"
                  placeholder="Enter any additional requirements or notes..."
                />
              </div>
            </form>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Machine Selection</h2>
              <button 
                type="button" 
                className="text-sm text-blue-600 flex items-center gap-1"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="h-3 w-3" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
            
            {/* Search and filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  className="form-input pl-10"
                  placeholder="Search for machine models..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                />
              </div>
              
              {showFilters && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label text-sm">Machine Type</label>
                      <select
                        className="form-input"
                        value={modelType}
                        onChange={(e) => setModelType(e.target.value)}
                      >
                        {modelTypes.map(type => (
                          <option key={type} value={type}>
                            {type === 'all' ? 'All Types' : type}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="form-label text-sm">Category</label>
                      <select
                        className="form-input"
                        value={modelCategory}
                        onChange={(e) => setModelCategory(e.target.value)}
                      >
                        {modelCategories.map(category => (
                          <option key={category} value={category}>
                            {category === 'all' ? 'All Categories' : category}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="form-label text-sm">CFM Range</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="form-input w-24"
                          placeholder="Min"
                          value={cfmMin || ''}
                          onChange={(e) => setCfmMin(e.target.value ? Number(e.target.value) : undefined)}
                        />
                        <span>-</span>
                        <input
                          type="number"
                          className="form-input w-24"
                          placeholder="Max"
                          value={cfmMax || ''}
                          onChange={(e) => setCfmMax(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-blue-600"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
              
              {/* Search results info */}
              <div className="text-sm text-slate-500">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    Loading models...
                  </div>
                ) : (
                  <div>Showing {models.length} of {totalItems} models</div>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Model grid view */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model) => (
                  <div key={model.id} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{model.name}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-200 dark:bg-slate-700">
                        {model.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mb-1">{model.category}</div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      Capacity: <span className="font-semibold text-slate-700 dark:text-slate-300">{model.cfm} CFM</span>
                    </p>
                    <p className="text-sm mb-4">
                      Price: <span className="font-semibold">${model.price.toLocaleString()}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => removeMachine(model.id)}
                        className="p-1 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        disabled={!selectedMachines.some(m => m.modelId === model.id)}
                      >
                        <FaMinus className="h-4 w-4" />
                      </button>
                      <span className="font-medium">
                        {selectedMachines.find(m => m.modelId === model.id)?.quantity || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => addMachine(model.id)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FaPlus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load more button */}
              {currentPage < totalPages && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => loadModels(currentPage + 1)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More Models'}
                  </button>
                </div>
              )}
              
              {models.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <p className="text-slate-500">No machine models match your filters.</p>
                  <button
                    type="button"
                    className="text-blue-600 mt-2"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quotation Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total CFM:</span>
                <span className="font-semibold">{getTotalCfm(selectedMachines).toLocaleString()} CFM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Cost:</span>
                <span className="font-semibold">${getTotalCost(selectedMachines).toLocaleString()}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="font-medium">Selected Machines:</h3>
                {selectedMachines.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedMachines.map((item) => {
                      const model = machineModels.find(m => m.id === item.modelId);
                      if (!model) return null;
                      return (
                        <li key={item.modelId} className="flex justify-between text-sm">
                          <span>{model.name} ({model.type})</span>
                          <span className="font-medium">x{item.quantity}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No machines selected yet.</p>
                )}
              </div>
            </div>
          </div>

          {optimizedSelection.length > 0 && (
            <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-300">
                Recommended Configuration
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Based on your CFM requirement, we recommend the following configuration:
                </p>
                <ul className="space-y-2">
                  {optimizedSelection.map((item) => {
                    const model = machineModels.find(m => m.id === item.modelId);
                    if (!model) return null;
                    return (
                      <li key={item.modelId} className="flex justify-between text-sm">
                        <span>{model.name} ({model.type})</span>
                        <span className="font-medium">x{item.quantity}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="pt-2 border-t border-blue-200 dark:border-blue-800/50 flex justify-between text-sm">
                  <span>Total CFM:</span>
                  <span className="font-semibold">{getTotalCfm(optimizedSelection).toLocaleString()} CFM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Cost:</span>
                  <span className="font-semibold">${getTotalCost(optimizedSelection).toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  className="w-full btn-primary mt-2"
                  onClick={() => setSelectedMachines(optimizedSelection)}
                >
                  Apply Recommendation
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            onClick={handleSubmit(onSubmit)}
          >
            <FaSave className="h-4 w-4" />
            <span>Save Quotation</span>
          </button>
        </div>
      </div>
    </div>
  );
} 