"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { FaSave, FaArrowLeft, FaPlus, FaMinus, FaSearch, FaBuilding, FaTools, FaSpinner } from 'react-icons/fa';
import { format, addDays } from 'date-fns';

// Sample data for demonstration - In a real app, this would come from an API
const sampleMachines = [
  { id: 'M10045', client: 'ABC Manufacturing', model: 'Standard 200 CFM', type: 'Fixed Bit', lastService: '2023-09-25' },
  { id: 'M10098', client: 'XYZ Industries', model: 'Pro Series 600 CFM', type: 'VFD', lastService: '2023-09-28' },
  { id: 'M10056', client: 'Global Solutions', model: 'Standard 200 CFM', type: 'Fixed Bit', lastService: '2023-09-15' },
  { id: 'M10078', client: 'Tech Innovations', model: 'Pro Series 900 CFM', type: 'VFD', lastService: '2023-09-10' },
  { id: 'M10112', client: 'City Services', model: 'Performance 350 CFM', type: 'Fixed Bit', lastService: '2023-10-05' },
  { id: 'M10132', client: 'Metro Facilities', model: 'Industrial 500 CFM', type: 'Fixed Bit', lastService: '2023-10-12' },
  // In a real application, this list could contain thousands of machines
];

const sampleTechnicians = [
  { id: 1, name: 'John Smith', specialization: 'VFD Systems' },
  { id: 2, name: 'Emma Johnson', specialization: 'All Models' },
  { id: 3, name: 'Robert Davis', specialization: 'Fixed Bit Systems' },
];

const sampleParts = [
  { id: 1, name: 'Air Filter', price: 89.99, stock: 35 },
  { id: 2, name: 'Oil Filter', price: 45.50, stock: 28 },
  { id: 3, name: 'Separator Element', price: 125.75, stock: 15 },
  { id: 4, name: 'Lubricant (1L)', price: 18.99, stock: 50 },
  { id: 5, name: 'Belt Kit', price: 75.25, stock: 12 },
  { id: 6, name: 'Motor Bearings', price: 95.00, stock: 8 },
  { id: 7, name: 'Pressure Sensor', price: 120.50, stock: 5 },
  { id: 8, name: 'Control Board', price: 350.00, stock: 3 },
];

// Simulated API call to fetch companies
const fetchCompanies = async (searchTerm: string) => {
  // In a real app, this would be an API call
  console.log(`Fetching companies with search term: ${searchTerm}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get unique companies from machines and filter by search term
  const allCompanies = Array.from(new Set(sampleMachines.map(machine => machine.client))).sort();
  
  if (!searchTerm.trim()) {
    return allCompanies;
  }
  
  const term = searchTerm.toLowerCase();
  return allCompanies.filter(company => company.toLowerCase().includes(term));
};

// Simulated API call to fetch machines for a company
const fetchMachinesByCompany = async (companyName: string, page = 1, limit = 20) => {
  // In a real app, this would be an API call with pagination
  console.log(`Fetching machines for company: ${companyName}, page: ${page}, limit: ${limit}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const filteredMachines = sampleMachines.filter(machine => machine.client === companyName);
  
  // Calculate pagination
  const totalItems = filteredMachines.length;
  const totalPages = Math.ceil(totalItems / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const items = filteredMachines.slice(start, end);
  
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

type FormValues = {
  machineId: string;
  serviceType: string;
  serviceDate: string;
  technicianId: number;
  notes: string;
};

export default function NewServicePage() {
  const [selectedParts, setSelectedParts] = useState<Array<{ partId: number, quantity: number }>>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [showCompanyOptions, setShowCompanyOptions] = useState(false);
  const [companySearchResults, setCompanySearchResults] = useState<string[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [machines, setMachines] = useState<typeof sampleMachines>([]);
  const [currentMachinesPage, setCurrentMachinesPage] = useState(1);
  const [totalMachinesPages, setTotalMachinesPages] = useState(1);
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const companySearchRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const formattedToday = format(today, 'yyyy-MM-dd');
  const defaultDate = format(addDays(today, 7), 'yyyy-MM-dd');
  
  // Debounced search for companies
  const searchCompaniesDebounced = useCallback(async (searchTerm: string) => {
    setIsLoadingCompanies(true);
    try {
      const results = await fetchCompanies(searchTerm);
      setCompanySearchResults(results);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanySearchResults([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, []);
  
  // Search for companies when the search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCompaniesDebounced(companySearch);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [companySearch, searchCompaniesDebounced]);
  
  // Load machines when company changes
  const loadMachines = useCallback(async (company: string, page = 1) => {
    if (!company) return;
    
    setIsLoadingMachines(true);
    try {
      const result = await fetchMachinesByCompany(company, page);
      setMachines(prev => page === 1 ? result.items : [...prev, ...result.items]);
      setCurrentMachinesPage(page);
      setTotalMachinesPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Error loading machines:', error);
    } finally {
      setIsLoadingMachines(false);
    }
  }, []);
  
  // Load machines when company changes
  useEffect(() => {
    if (selectedCompany) {
      setMachines([]);
      loadMachines(selectedCompany, 1);
    }
  }, [selectedCompany, loadMachines]);
  
  // Load more machines
  const loadMoreMachines = useCallback(() => {
    if (currentMachinesPage < totalMachinesPages && !isLoadingMachines) {
      loadMachines(selectedCompany, currentMachinesPage + 1);
    }
  }, [currentMachinesPage, isLoadingMachines, loadMachines, selectedCompany, totalMachinesPages]);

  // Handle click outside to close company options
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (companySearchRef.current && !companySearchRef.current.contains(event.target as Node)) {
        setShowCompanyOptions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Select company and close dropdown
  const handleSelectCompany = (company: string) => {
    setSelectedCompany(company);
    setShowCompanyOptions(false);
    setCompanySearch('');
    setValue('machineId', '');
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      machineId: '',
      serviceType: 'small',
      serviceDate: defaultDate,
      technicianId: 0,
      notes: '',
    }
  });

  const selectedMachineId = watch('machineId');
  const selectedMachine = machines.find(m => m.id === selectedMachineId) || 
                        sampleMachines.find(m => m.id === selectedMachineId);
  const selectedServiceType = watch('serviceType');

  // Auto-select required parts based on service type
  const autoSelectParts = (serviceType: string) => {
    let autoSelectedParts: Array<{ partId: number, quantity: number }> = [];
    
    if (serviceType === 'small') {
      // Small service typically requires air filter and oil filter
      autoSelectedParts = [
        { partId: 1, quantity: 1 }, // Air Filter
        { partId: 2, quantity: 1 }, // Oil Filter
        { partId: 4, quantity: 2 }, // Lubricant
      ];
    } else if (serviceType === 'big') {
      // Big service requires more parts
      autoSelectedParts = [
        { partId: 1, quantity: 1 }, // Air Filter
        { partId: 2, quantity: 1 }, // Oil Filter
        { partId: 3, quantity: 1 }, // Separator Element
        { partId: 4, quantity: 5 }, // Lubricant
        { partId: 5, quantity: 1 }, // Belt Kit
      ];
    }
    
    setSelectedParts(autoSelectedParts);
  };

  const addPart = (partId: number) => {
    const existingIndex = selectedParts.findIndex(p => p.partId === partId);
    if (existingIndex >= 0) {
      const updated = [...selectedParts];
      updated[existingIndex].quantity += 1;
      setSelectedParts(updated);
    } else {
      setSelectedParts([...selectedParts, { partId, quantity: 1 }]);
    }
  };

  const removePart = (partId: number) => {
    const existingIndex = selectedParts.findIndex(p => p.partId === partId);
    if (existingIndex >= 0) {
      const updated = [...selectedParts];
      if (updated[existingIndex].quantity > 1) {
        updated[existingIndex].quantity -= 1;
      } else {
        updated.splice(existingIndex, 1);
      }
      setSelectedParts(updated);
    }
  };

  const getTotalPartsPrice = () => {
    return selectedParts.reduce((total, item) => {
      const part = sampleParts.find(p => p.id === item.partId);
      return total + (part ? part.price * item.quantity : 0);
    }, 0);
  };

  const onSubmit = (data: FormValues) => {
    const serviceData = {
      ...data,
      parts: selectedParts,
      totalPartsPrice: getTotalPartsPrice(),
      machine: selectedMachine,
      technician: sampleTechnicians.find(t => t.id === data.technicianId),
    };
    
    console.log('Scheduling service:', serviceData);
    // In a real app, we would send this to the server
    alert('Service scheduled successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/services" className="text-blue-600 hover:text-blue-800">
          <FaArrowLeft />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Schedule Service</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Service Information</h2>
            <form className="space-y-4">
              {/* Company Selection */}
              <div ref={companySearchRef}>
                <label className="form-label flex items-center">
                  <FaBuilding className="mr-2 text-slate-500" />
                  Company
                </label>
                
                {/* Company selection field */}
                <div className="relative">
                  {/* Show selected company or search input */}
                  {selectedCompany && !showCompanyOptions ? (
                    <div 
                      className="form-input flex justify-between items-center cursor-pointer"
                      onClick={() => setShowCompanyOptions(true)}
                    >
                      <span>{selectedCompany}</span>
                      <FaSearch className="w-4 h-4 text-gray-500" />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaSearch className="w-4 h-4 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        className="form-input pl-10"
                        placeholder="Search for company..."
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        onFocus={() => setShowCompanyOptions(true)}
                      />
                      {isLoadingCompanies && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <FaSpinner className="w-4 h-4 text-gray-500 animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Company options dropdown */}
                  {showCompanyOptions && (
                    <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-lg">
                      {companySearchResults.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                          {companySearchResults.map((company) => (
                            <li 
                              key={company}
                              className={`px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                selectedCompany === company ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                              onClick={() => handleSelectCompany(company)}
                            >
                              {company}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-center py-2 text-slate-500">
                          {isLoadingCompanies ? 'Loading...' : 'No companies found'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Machine Selection - Only show if company is selected */}
              {selectedCompany && (
                <div>
                  <label htmlFor="machineId" className="form-label flex items-center">
                    <FaTools className="mr-2 text-slate-500" />
                    Machine from {selectedCompany}
                  </label>
                  
                  <select
                    id="machineId"
                    {...register('machineId', { required: 'Machine is required' })}
                    className="form-input"
                  >
                    <option value="">Select a machine</option>
                    {machines.map((machine) => (
                      <option key={machine.id} value={machine.id}>
                        {machine.id} - {machine.model}
                      </option>
                    ))}
                  </select>
                  
                  {machines.length === 0 && isLoadingMachines && (
                    <div className="flex items-center justify-center py-2">
                      <FaSpinner className="animate-spin mr-2 text-blue-500" />
                      <span>Loading machines...</span>
                    </div>
                  )}
                  
                  {machines.length === 0 && !isLoadingMachines && (
                    <p className="text-amber-600 text-sm mt-1">No machines found for this company.</p>
                  )}
                  
                  {/* Load more machines button - visible if there are more pages */}
                  {currentMachinesPage < totalMachinesPages && machines.length > 0 && (
                    <button
                      type="button"
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      onClick={loadMoreMachines}
                      disabled={isLoadingMachines}
                    >
                      {isLoadingMachines ? (
                        <>
                          <FaSpinner className="animate-spin mr-1" />
                          Loading more...
                        </>
                      ) : (
                        <>Load more machines ({machines.length} of {totalMachinesPages * 20})</>
                      )}
                    </button>
                  )}
                  
                  {errors.machineId && (
                    <p className="form-error">{errors.machineId.message}</p>
                  )}
                </div>
              )}

              {selectedMachine && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Machine Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Client:</span>{' '}
                      <span className="font-medium">{selectedMachine.client}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Machine ID:</span>{' '}
                      <span className="font-medium">{selectedMachine.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Model:</span>{' '}
                      <span className="font-medium">{selectedMachine.model}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Type:</span>{' '}
                      <span className="font-medium">{selectedMachine.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Last Service:</span>{' '}
                      <span className="font-medium">{new Date(selectedMachine.lastService).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Service Type</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <label className="flex items-center bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        value="small"
                        {...register('serviceType')}
                        className="mr-2"
                        onChange={() => autoSelectParts('small')}
                      />
                      <div>
                        <p className="font-medium">Small Service</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Basic maintenance</p>
                      </div>
                    </label>
                    <label className="flex items-center bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        value="big"
                        {...register('serviceType')}
                        className="mr-2"
                        onChange={() => autoSelectParts('big')}
                      />
                      <div>
                        <p className="font-medium">Big Service</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive overhaul</p>
                      </div>
                    </label>
                  </div>
                  {errors.serviceType && (
                    <p className="form-error">{errors.serviceType.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="serviceDate" className="form-label">
                    Service Date
                  </label>
                  <input
                    id="serviceDate"
                    type="date"
                    {...register('serviceDate', { required: 'Service date is required' })}
                    className="form-input"
                    min={formattedToday}
                  />
                  {errors.serviceDate && (
                    <p className="form-error">{errors.serviceDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="technicianId" className="form-label">
                  Assign Technician
                </label>
                <select
                  id="technicianId"
                  {...register('technicianId', { 
                    required: 'Technician is required',
                    validate: (value: number) => value !== 0 || 'Please select a technician' 
                  })}
                  className="form-input"
                >
                  <option value={0}>Select a technician</option>
                  {sampleTechnicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} - {tech.specialization}
                    </option>
                  ))}
                </select>
                {errors.technicianId && (
                  <p className="form-error">{errors.technicianId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="form-label">
                  Service Notes
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
            <h2 className="text-xl font-semibold mb-4">Parts Required</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sampleParts.map((part) => {
                const selectedPart = selectedParts.find(p => p.partId === part.id);
                const isSelected = !!selectedPart;
                
                return (
                  <div 
                    key={part.id} 
                    className={`border rounded-lg p-3 ${
                      isSelected ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20' : 
                      'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium">{part.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        part.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                        part.stock > 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                      }`}>
                        Stock: {part.stock}
                      </span>
                    </div>
                    <p className="text-sm mb-2">
                      ${part.price.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => removePart(part.id)}
                        className="p-1 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        disabled={!isSelected}
                      >
                        <FaMinus className="h-4 w-4" />
                      </button>
                      <span className="font-medium">
                        {selectedPart?.quantity || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => addPart(part.id)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        disabled={selectedPart?.quantity === part.stock}
                      >
                        <FaPlus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Service Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Machine ID:</span>
                <span className="font-semibold">{selectedMachine?.id || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Client:</span>
                <span className="font-semibold">{selectedMachine?.client || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Service Type:</span>
                <span className="font-semibold capitalize">{selectedServiceType || 'Not selected'}</span>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="font-medium">Parts Required:</h3>
                {selectedParts.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedParts.map((item) => {
                      const part = sampleParts.find(p => p.id === item.partId);
                      if (!part) return null;
                      return (
                        <li key={item.partId} className="flex justify-between text-sm">
                          <span>{part.name}</span>
                          <div className="text-right">
                            <span className="font-medium">x{item.quantity}</span>
                            <span className="text-slate-500 dark:text-slate-400 ml-2">
                              ${(part.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No parts selected yet.</p>
                )}
              </div>
              <div className="flex justify-between text-lg pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300">Total Parts Cost:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  ${getTotalPartsPrice().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            onClick={handleSubmit(onSubmit)}
          >
            <FaSave className="h-4 w-4" />
            <span>Schedule Service</span>
          </button>
        </div>
      </div>
    </div>
  );
} 