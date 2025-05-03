"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { FaSave, FaArrowLeft, FaPlus, FaMinus, FaSearch, FaBuilding, FaTools, FaSpinner } from 'react-icons/fa';
import { format, addDays, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';

// Interface definitions
interface Company {
  client_id: number;
  name: string;
}

interface Machine {
  machine_id: number;
  machine_serial: string;
  model_name: string;
  type: string;
  client_id: number;
  client_name: string;
  last_service?: string;
}

interface Technician {
  technician_id: number;
  name: string;
  specialization?: string;
  availability?: boolean;
}

interface Part {
  part_id: number;
  name: string;
  price: number;
  stock: number;
  category_name?: string;
}

interface SelectedPart {
  partId: number;
  quantity: number;
}

type FormValues = {
  machineId: number;
  serviceType: string;
  serviceDate: string;
  technicianId: number;
  notes: string;
};

export default function NewServicePage() {
  const router = useRouter();
  const [selectedParts, setSelectedParts] = useState<Array<SelectedPart>>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCompanyOptions, setShowCompanyOptions] = useState(false);
  const [companySearchResults, setCompanySearchResults] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companySearchRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const formattedToday = format(today, 'yyyy-MM-dd');
  const defaultDate = format(addDays(today, 7), 'yyyy-MM-dd');
  
  // Fetch all clients for company search
  const searchCompaniesDebounced = useCallback(async (searchTerm: string) => {
      setIsLoadingCompanies(true);
      try {
        const response = await fetch(`http://${window.location.hostname}:5017/api/clients`);
        const data = await response.json();
        
        if (data.success) {
          const clients: Company[] = data.clients || [];
          if (!searchTerm.trim()) {
            setCompanySearchResults(clients);
          } else {
            const term = searchTerm.toLowerCase();
            const filtered = clients.filter(client => 
              client.name.toLowerCase().includes(term)
            );
            setCompanySearchResults(filtered);
          }
        } else {
          console.error('Error fetching companies:', data.error);
          setCompanySearchResults([]);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        setCompanySearchResults([]);
      } finally {
        setIsLoadingCompanies(false);
      }
    }, []);
  
  // Fetch technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      setIsLoadingTechnicians(true);
      try {
        const response = await fetch(`http://${window.location.hostname}:5017/api/technicians`);
        const data = await response.json();
        
        if (data.success) {
          setTechnicians(data.technicians || []);
        } else {
          console.error('Error fetching technicians:', data.error);
          setTechnicians([]);
        }
      } catch (error) {
        console.error('Error fetching technicians:', error);
        setTechnicians([]);
      } finally {
        setIsLoadingTechnicians(false);
      }
    };
    
    fetchTechnicians();
  }, []);
  
  // Fetch parts
  useEffect(() => {
    const fetchParts = async () => {
      setIsLoadingParts(true);
      try {
        const response = await fetch(`http://${window.location.hostname}:5017/api/parts`);
        const data = await response.json();
        
        if (data.success) {
          setParts(data.parts || []);
        } else {
          console.error('Error fetching parts:', data.error);
          setParts([]);
        }
      } catch (error) {
        console.error('Error fetching parts:', error);
        setParts([]);
      } finally {
        setIsLoadingParts(false);
      }
    };
    
    fetchParts();
  }, []);
  
  // Search for companies when the search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCompaniesDebounced(companySearch);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [companySearch, searchCompaniesDebounced]);
  
  // Load machines when company changes
  const loadMachines = useCallback(async (company: Company) => {
    if (!company) return;
    
    setIsLoadingMachines(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5017/api/clients/${company.client_id}/machines`);
      const data = await response.json();
      
      if (data.success) {
        setMachines(data.machines || []);
      } else {
        console.error('Error loading machines:', data.error);
        setMachines([]);
      }
    } catch (error) {
      console.error('Error loading machines:', error);
      setMachines([]);
    } finally {
      setIsLoadingMachines(false);
    }
  }, []);
  
  // Load machines when company changes
  useEffect(() => {
    if (selectedCompany) {
      setMachines([]);
      loadMachines(selectedCompany);
    }
  }, [selectedCompany, loadMachines]);

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
  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowCompanyOptions(false);
    setCompanySearch('');
    // Fix for the setValue TypeScript error - use an explicit number type
    setValue('machineId', 0 as const);
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      machineId: 0,
      serviceType: 'small',
      serviceDate: defaultDate,
      technicianId: 0,
      notes: '',
    }
  });

  const selectedMachineId = watch('machineId');
  const selectedMachine = machines.find(m => m.machine_id === Number(selectedMachineId));
  const selectedServiceType = watch('serviceType');

  // Auto-select required parts based on service type
  const autoSelectParts = (serviceType: string) => {
    let autoSelectedParts: Array<SelectedPart> = [];
    
    // Find appropriate part IDs from the database parts
    // Air filters are typically category 1, oil filters category 2, separator elements category 3, lubricants category 4
    const airFilters = parts.filter(p => p.category_name?.toLowerCase().includes('air filter'));
    const oilFilters = parts.filter(p => p.category_name?.toLowerCase().includes('oil filter'));
    const separators = parts.filter(p => p.category_name?.toLowerCase().includes('separator'));
    const lubricants = parts.filter(p => p.category_name?.toLowerCase().includes('lubricant'));
    const belts = parts.filter(p => p.category_name?.toLowerCase().includes('belt'));
    
    if (serviceType === 'small') {
      // Small service typically requires air filter and oil filter
      if (airFilters.length > 0) {
        autoSelectedParts.push({ partId: airFilters[0].part_id, quantity: 1 });
      }
      if (oilFilters.length > 0) {
        autoSelectedParts.push({ partId: oilFilters[0].part_id, quantity: 1 });
      }
      if (lubricants.length > 0) {
        autoSelectedParts.push({ partId: lubricants[0].part_id, quantity: 2 });
      }
    } else if (serviceType === 'big') {
      // Big service requires more parts
      if (airFilters.length > 0) {
        autoSelectedParts.push({ partId: airFilters[0].part_id, quantity: 1 });
      }
      if (oilFilters.length > 0) {
        autoSelectedParts.push({ partId: oilFilters[0].part_id, quantity: 1 });
      }
      if (separators.length > 0) {
        autoSelectedParts.push({ partId: separators[0].part_id, quantity: 1 });
      }
      if (lubricants.length > 0) {
        autoSelectedParts.push({ partId: lubricants[0].part_id, quantity: 5 });
      }
      if (belts.length > 0) {
        autoSelectedParts.push({ partId: belts[0].part_id, quantity: 1 });
      }
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
      const part = parts.find(p => p.part_id === item.partId);
      return total + (part ? part.price * item.quantity : 0);
    }, 0);
  };

  // Fetch technician availability when service date changes
  const selectedServiceDate = watch('serviceDate');
  
  useEffect(() => {
    const checkTechnicianAvailability = async () => {
      if (!selectedServiceDate) return;
      
      setIsCheckingAvailability(true);
      try {
        const response = await fetch(
          `http://${window.location.hostname}:5017/api/technicians/availability?date=${selectedServiceDate}`
        );
        
        if (!response.ok) {
          throw new Error(`Error checking availability: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Update technicians with availability information
          setTechnicians(prevTechnicians => 
            prevTechnicians.map(tech => {
              // Find this technician in the availability data
              const availabilityInfo = data.availability.find(
                (a: any) => a.technician_id === tech.technician_id
              );
              
              return {
                ...tech,
                // Set availability based on returned data
                availability: availabilityInfo ? !availabilityInfo.is_busy : true
              };
            })
          );
        } else {
          console.error('Error fetching availability:', data.error);
        }
      } catch (error) {
        console.error('Error checking technician availability:', error);
      } finally {
        setIsCheckingAvailability(false);
      }
    };
    
    checkTechnicianAvailability();
  }, [selectedServiceDate]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate machine id
      if (!data.machineId || isNaN(Number(data.machineId)) || Number(data.machineId) <= 0) {
        setError('Please select a valid machine');
        return;
      }

      // Validate technician id
      if (!data.technicianId || isNaN(Number(data.technicianId)) || Number(data.technicianId) <= 0) {
        setError('Please select a valid technician');
        return;
      }

      // Map selected parts to format expected by API
      const partsForApi = selectedParts.map(item => ({
        part_id: item.partId,
        quantity: item.quantity
      }));

      // Prepare service data
      const serviceData = {
        machine_id: Number(data.machineId),
        service_type: data.serviceType,
        service_date: data.serviceDate,
        technician_id: Number(data.technicianId),
        notes: data.notes,
        status: 'Scheduled',
        parts: partsForApi
      };

      console.log('Sending service data:', serviceData);

      // Send to API
      const response = await fetch(`http://${window.location.hostname}:5017/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      });
      
      const result = await response.json();

      if (result.success) {
        // Navigate back to services list
        router.push('/services');
      } else {
        // Handle specific error types
        if (result.error && result.error.includes("Not enough stock")) {
          setError(`Inventory Error: ${result.error}. Please update inventory before scheduling this service with completed status.`);
        } else if (result.error && result.error.includes("Machine not found")) {
          setError("The selected machine could not be found. It may have been deleted.");
        } else if (result.error && result.error.includes("Technician not found")) {
          setError("The selected technician could not be found. They may have been removed from the system.");
        } else if (result.error && result.error.includes("Part with ID")) {
          setError(`${result.error}. One of the selected parts may no longer be available.`);
        } else {
          setError(result.error || 'Failed to schedule service');
        }
      }
    } catch (err: any) {
      console.error('Error scheduling service:', err);
      
      // Try to parse the error if it's a response error
      if (err.message && err.message.includes('status:')) {
        const statusMatch = err.message.match(/status: (\d+)/);
        if (statusMatch && statusMatch[1] === '400') {
          setError('Invalid request. Please check your data and try again.');
        } else if (statusMatch && statusMatch[1] === '404') {
          setError('One or more selected items not found. They may have been deleted.');
        } else if (statusMatch && statusMatch[1] === '500') {
          setError('Server error. Please try again later or contact support.');
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/services" className="text-blue-600 hover:text-blue-800">
          <FaArrowLeft />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Schedule Service</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

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
                      <span>{selectedCompany.name}</span>
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
                              key={company.client_id}
                              className={`px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                selectedCompany?.client_id === company.client_id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                              onClick={() => handleSelectCompany(company)}
                            >
                              {company.name}
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
                    Machine from {selectedCompany.name}
                  </label>
                  
                  <select
                    id="machineId"
                    {...register('machineId', { 
                      required: 'Machine is required',
                      validate: (value: any) => {
                        const numValue = Number(value);
                        return (!isNaN(numValue) && numValue > 0) || 'Please select a machine';
                      }
                    })}
                    className="form-input"
                  >
                    <option value={0}>Select a machine</option>
                    {machines.map((machine) => (
                      <option key={machine.machine_id} value={machine.machine_id}>
                        {machine.machine_serial} - {machine.model_name}
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
                      <span className="font-medium">{selectedMachine.client_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Machine ID:</span>{' '}
                      <span className="font-medium">{selectedMachine.machine_serial}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Model:</span>{' '}
                      <span className="font-medium">{selectedMachine.model_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Type:</span>{' '}
                      <span className="font-medium">{selectedMachine.type}</span>
                    </div>
                    {selectedMachine.last_service && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Last Service:</span>{' '}
                        <span className="font-medium">
                          {new Date(selectedMachine.last_service).toLocaleDateString()}
                        </span>
                      </div>
                    )}
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
                {isLoadingTechnicians ? (
                  <div className="flex items-center">
                    <FaSpinner className="animate-spin mr-2 text-blue-500" />
                    <span>Loading technicians...</span>
                  </div>
                ) : isCheckingAvailability ? (
                  <div className="flex items-center">
                    <FaSpinner className="animate-spin mr-2 text-blue-500" />
                    <span>Checking availability...</span>
                  </div>
                ) : (
                  <>
                    <select
                      id="technicianId"
                      {...register('technicianId', { 
                        required: 'Technician is required',
                        validate: (value: any) => {
                          const numValue = Number(value);
                          return (!isNaN(numValue) && numValue > 0) || 'Please select a technician';
                        }
                      })}
                      className="form-input"
                    >
                      <option key="default" value={0}>Select a technician</option>
                      {technicians.map((tech, index) => (
                        <option 
                          key={tech.technician_id ? `tech-${tech.technician_id}` : `tech-index-${index}`} 
                          value={tech.technician_id || 0}
                          disabled={!tech.technician_id || tech.availability === false}
                          className={tech.availability === false ? "text-red-500" : ""}
                        >
                          {tech.name} {tech.specialization ? `- ${tech.specialization}` : ''}
                          {!tech.technician_id && ' (unavailable)'}
                          {tech.technician_id && tech.availability === false && ' (busy on selected date)'}
                          {tech.technician_id && tech.availability === true && ' (available)'}
                        </option>
                      ))}
                    </select>
                    {errors.technicianId && (
                      <p className="form-error">{errors.technicianId.message}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      Technician availability is shown based on the selected service date
                    </p>
                  </>
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
            {isLoadingParts ? (
              <div className="flex items-center justify-center p-8">
                <FaSpinner className="w-6 h-6 text-blue-500 animate-spin" />
                <span className="ml-2">Loading parts inventory...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {parts.map((part) => {
                  const selectedPart = selectedParts.find(p => p.partId === part.part_id);
                  const isSelected = !!selectedPart;
                  
                  return (
                    <div 
                      key={part.part_id} 
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
                        ${Number(part.price).toFixed(2)}
                      </p>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => removePart(part.part_id)}
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
                          onClick={() => addPart(part.part_id)}
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
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Service Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Machine ID:</span>
                <span className="font-semibold">{selectedMachine?.machine_serial || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Client:</span>
                <span className="font-semibold">{selectedMachine?.client_name || selectedCompany?.name || 'Not selected'}</span>
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
                      const part = parts.find(p => p.part_id === item.partId);
                      if (!part) return null;
                      return (
                        <li key={item.partId} className="flex justify-between text-sm">
                          <span>{part.name}</span>
                          <div className="text-right">
                            <span className="font-medium">x{item.quantity}</span>
                            <span className="text-slate-500 dark:text-slate-400 ml-2">
                              ${(Number(part.price) * item.quantity).toFixed(2)}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="h-4 w-4 animate-spin" />
                <span>Scheduling...</span>
              </>
            ) : (
              <>
                <FaSave className="h-4 w-4" />
                <span>Schedule Service</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}