"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSave, FaArrowLeft, FaPlus, FaMinus, FaCalculator, FaSearch, FaFilter, FaMagic, FaChartPie } from 'react-icons/fa';

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

type FormValues = {
  clientId: string;
  clientName: string;
  contactInfo: string;
  cfmRequirement: number;
  notes: string;
};

export default function NewQuotationPage() {
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const urlClientId = searchParams.get('clientId');
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      clientId: urlClientId || '',
      clientName: '',
      contactInfo: '',
      cfmRequirement: 0,
      notes: '',
    }
  });

  // Watch the cfmRequirement field to access its current value
  const cfmRequirement = watch('cfmRequirement');
  const clientId = watch('clientId');

  const [selectedMachines, setSelectedMachines] = useState<Array<{ modelId: number, quantity: number }>>([]);
  const [optimizedSelection, setOptimizedSelection] = useState<Array<{ modelId: number, quantity: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  const [optimizedResults, setOptimizedResults] = useState<{
    machines: Array<{
      model_id: number;
      quantity: number;
      name: string;
      type: string;
      cfm_capacity: number;
      price: number;
    }>;
    total_cfm: number;
    total_cost: number;
    cfm_requirement: number;
  } | null>(null);
  
  // Model filtering and search state
  const [modelSearch, setModelSearch] = useState('');
  const [modelType, setModelType] = useState('all');
  const [modelCategory, setModelCategory] = useState('all');
  const [cfmMin, setCfmMin] = useState<number | undefined>(undefined);
  const [cfmMax, setCfmMax] = useState<number | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [models, setModels] = useState<MachineModel[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Client selection state
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Available categories and types from the models
  const [modelCategories, setModelCategories] = useState<string[]>(['all']);
  const [modelTypes, setModelTypes] = useState<string[]>(['all']);
  
  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        const response = await fetch(`http://${window.location.hostname}:5017/api/clients`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setClients(data.clients);
        } else {
          throw new Error(data.error || 'Failed to fetch clients');
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoadingClients(false);
      }
    };
    
    fetchClients();
  }, []);

  // Fetch all machine models once
  useEffect(() => {
    const fetchAllModels = async () => {
      try {
        const response = await fetch(`http://${window.location.hostname}:5017/api/machine-models`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Extract unique categories and types
          const models = data.models as MachineModel[];
          const categories = Array.from(new Set(
            models.map(model => model.category || 'Uncategorized')
          )) as string[];
          setModelCategories(['all', ...categories]);
          
          const types = Array.from(new Set(
            models.map(model => model.type)
          )) as string[];
          setModelTypes(['all', ...types]);
          
          // Initial models loading will happen in loadModels
        } else {
          throw new Error(data.error || 'Failed to fetch machine models');
        }
      } catch (err) {
        console.error('Error fetching machine models:', err);
      }
    };
    
    fetchAllModels();
  }, []);
  
  // Handle client selection
  useEffect(() => {
    if (clientId) {
      const selectedClient = clients.find(c => c.client_id === Number(clientId));
      if (selectedClient) {
        setValue('clientName', selectedClient.name);
      }
    }
  }, [clientId, clients, setValue]);

  // Handle URL client selection
  useEffect(() => {
    if (urlClientId && clients.length > 0) {
      const selectedClient = clients.find(c => c.client_id === Number(urlClientId));
      if (selectedClient) {
        setValue('clientId', urlClientId);
        setValue('clientName', selectedClient.name);
      }
    }
  }, [urlClientId, clients, setValue]);

  // Fetch models with filters
  const loadModels = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (modelSearch) {
        queryParams.append('search', modelSearch);
      }
      
      if (modelType !== 'all') {
        queryParams.append('type', modelType);
      }
      
      if (modelCategory !== 'all') {
        queryParams.append('category', modelCategory);
      }
      
      if (cfmMin !== undefined) {
        queryParams.append('cfm_min', cfmMin.toString());
      }
      
      if (cfmMax !== undefined) {
        queryParams.append('cfm_max', cfmMax.toString());
      }
      
      queryParams.append('page', page.toString());
      queryParams.append('limit', '12'); // Show 12 models per page
      
      const response = await fetch(`http://${window.location.hostname}:5017/api/machine-models?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setModels(prev => page === 1 ? data.models : [...prev, ...data.models]);
        setCurrentPage(page);
        setTotalPages(Math.ceil(data.models.length / 12)); // Simple pagination calculation
        setTotalItems(data.models.length);
      } else {
        throw new Error(data.error || 'Failed to fetch machine models');
      }
    } catch (err) {
      console.error('Error loading models:', err);
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

  // Enhanced optimization - calls backend API for intelligent optimization
  const optimizeSelection = async (cfmTarget: number) => {
    if (!cfmTarget || cfmTarget <= 0) {
      setSubmitError('Please enter a valid CFM requirement for optimization');
      return;
    }
    
    try {
      setOptimizationLoading(true);
      setSubmitError(null);
      
      const response = await fetch(`http://${window.location.hostname}:5017/api/quotations/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cfm_requirement: cfmTarget
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to optimize quotation');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Store the full optimization results
        setOptimizedResults(data.recommendations);
        
        // Convert to the expected format for our application
        const optimizedMachines = data.recommendations.machines.map((machine: {
          model_id: number;
          quantity: number;
        }) => ({
          modelId: machine.model_id,
          quantity: machine.quantity
        }));
        
        setOptimizedSelection(optimizedMachines);
      } else {
        throw new Error(data.error || 'Optimization failed');
      }
    } catch (err: any) {
      console.error('Error during optimization:', err);
      setSubmitError(err.message);
    } finally {
      setOptimizationLoading(false);
    }
  };

  const applyOptimizedSelection = () => {
    if (optimizedSelection.length > 0) {
      setSelectedMachines(optimizedSelection);
      setOptimizedSelection([]);
      setOptimizedResults(null);
    }
  };

  const getTotalCfm = (machines: Array<{ modelId: number, quantity: number }>) => {
    return machines.reduce((total, machine) => {
      const model = models.find(m => m.model_id === machine.modelId);
      return total + (model ? model.cfm_capacity * machine.quantity : 0);
    }, 0);
  };

  const getTotalCost = (machines: Array<{ modelId: number, quantity: number }>) => {
    return machines.reduce((total, machine) => {
      const model = models.find(m => m.model_id === machine.modelId);
      return total + (model ? model.price * machine.quantity : 0);
    }, 0);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      if (selectedMachines.length === 0) {
        setSubmitError('You must select at least one machine model');
        return;
      }
      
      const totalCost = getTotalCost(selectedMachines);
      
      // Map machines to the format expected by the API
      const items = selectedMachines.map(machine => {
        const model = models.find(m => m.model_id === machine.modelId);
        return {
          model_id: machine.modelId,
          quantity: machine.quantity,
          unit_price: model ? model.price : 0,
          description: model ? model.name : ''
        };
      });
      
      const quotationData = {
        client_id: data.clientId ? Number(data.clientId) : null,
        client_name: data.clientName,
        contact_info: data.contactInfo,
        cfm_requirement: data.cfmRequirement,
        total_amount: totalCost,
        notes: data.notes,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        status: 'Pending',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        items
      };
      
      console.log('Saving quotation:', quotationData);
      
      const response = await fetch(`http://${window.location.hostname}:5017/api/quotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quotationData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        router.push('/quotations');
      } else {
        throw new Error(result.error || 'Failed to create quotation');
      }
    } catch (err: any) {
      console.error('Error creating quotation:', err);
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/quotations" className="text-blue-600 hover:text-blue-800">
          <FaArrowLeft />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New Quotation</h1>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error creating quotation</p>
          <p>{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Client Information</h2>
            <form id="quotation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="clientId" className="form-label">
                    Existing Client
                  </label>
                  <select
                    id="clientId"
                    {...register('clientId')}
                    className="form-input"
                    defaultValue=""
                  >
                    <option value="">Select existing client (optional)</option>
                    {clients.map(client => (
                      <option key={client.client_id} value={client.client_id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                <div>
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
                      onClick={() => optimizeSelection(Number(cfmRequirement))}
                      className="btn-secondary flex items-center gap-2"
                      disabled={!cfmRequirement || optimizationLoading}
                    >
                      {optimizationLoading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          <span>Optimizing...</span>
                        </>
                      ) : (
                        <>
                          <FaMagic className="h-4 w-4" />
                          <span>Optimize</span>
                        </>
                      )}
                    </button>
                  </div>
                  {errors.cfmRequirement && (
                    <p className="form-error">{errors.cfmRequirement.message}</p>
                  )}
                </div>
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
                  <div key={model.model_id} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{model.name}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-200 dark:bg-slate-700">
                        {model.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mb-1">{model.category}</div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      Capacity: <span className="font-semibold text-slate-700 dark:text-slate-300">{model.cfm_capacity} CFM</span>
                    </p>
                    <p className="text-sm mb-4">
                      Price: <span className="font-semibold">${model.price.toLocaleString()}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => removeMachine(model.model_id)}
                        className="p-1 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        disabled={!selectedMachines.some(m => m.modelId === model.model_id)}
                      >
                        <FaMinus className="h-4 w-4" />
                      </button>
                      <span className="font-medium">
                        {selectedMachines.find(m => m.modelId === model.model_id)?.quantity || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => addMachine(model.model_id)}
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
                      const model = models.find(m => m.model_id === item.modelId);
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

          {optimizedResults && (
            <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <FaChartPie className="h-5 w-5" />
                <span>AI Optimized Configuration</span>
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Our AI analyzed all available models and found the most cost-effective configuration for your {optimizedResults.cfm_requirement.toLocaleString()} CFM requirement:
                </p>
                <ul className="space-y-2 mt-3">
                  {optimizedResults.machines.map((machine) => (
                    <li key={machine.model_id} className="bg-white/50 backdrop-blur-sm rounded p-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{machine.name}</div>
                          <div className="flex items-center text-xs text-slate-500">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded mr-2">{machine.type}</span>
                            <span>{machine.cfm_capacity.toLocaleString()} CFM</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">x{machine.quantity}</div>
                          <div className="text-xs text-slate-500">${machine.price.toLocaleString()}/unit</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-blue-200 dark:border-blue-800/50 flex justify-between">
                  <span className="font-medium">Total CFM:</span>
                  <span className="font-semibold">{optimizedResults.total_cfm.toLocaleString()} CFM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Cost:</span>
                  <span className="font-semibold">${optimizedResults.total_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-blue-600">
                  <span>Efficiency:</span>
                  <span>{(optimizedResults.total_cfm / optimizedResults.total_cost).toFixed(2)} CFM/$</span>
                </div>
                <button
                  type="button"
                  className="w-full btn-primary mt-2 flex items-center justify-center gap-2"
                  onClick={applyOptimizedSelection}
                >
                  <FaMagic className="h-4 w-4" />
                  <span>Apply This Configuration</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            form="quotation-form"
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            disabled={isSubmitting}
          >
            <FaSave className="h-4 w-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Save Quotation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
} 