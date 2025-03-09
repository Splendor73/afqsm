"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import { FaSave, FaArrowLeft, FaPlus, FaMinus, FaCalculator } from 'react-icons/fa';

// Sample machine models for demonstration
const machineModels = [
  { id: 1, name: 'Standard 200 CFM', type: 'Fixed Bit', cfm: 200, price: 3500 },
  { id: 2, name: 'Performance 350 CFM', type: 'Fixed Bit', cfm: 350, price: 5800 },
  { id: 3, name: 'Industrial 500 CFM', type: 'Fixed Bit', cfm: 500, price: 8200 },
  { id: 4, name: 'Pro Series 300 CFM', type: 'VFD', cfm: 300, price: 6200 },
  { id: 5, name: 'Pro Series 600 CFM', type: 'VFD', cfm: 600, price: 11500 },
  { id: 6, name: 'Pro Series 900 CFM', type: 'VFD', cfm: 900, price: 17800 },
];

type FormValues = {
  clientName: string;
  contactInfo: string;
  cfmRequirement: number;
  notes: string;
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
                    {...register('contactInfo', { required: 'Contact info is required' })}
                    className="form-input"
                    placeholder="Email or phone"
                  />
                  {errors.contactInfo && (
                    <p className="form-error">{errors.contactInfo.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label htmlFor="cfmRequirement" className="form-label">
                    CFM Requirement
                  </label>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="cfmRequirement"
                      control={control}
                      rules={{ required: 'CFM requirement is required', min: { value: 1, message: 'Must be greater than 0' } }}
                      render={({ field }) => (
                        <input
                          id="cfmRequirement"
                          type="number"
                          className="form-input"
                          placeholder="e.g. 1000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />
                    <span className="text-sm text-slate-500">CFM</span>
                  </div>
                  {errors.cfmRequirement && (
                    <p className="form-error">{errors.cfmRequirement.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => optimizeSelection(control._formValues.cfmRequirement)}
                >
                  <FaCalculator className="h-4 w-4" />
                  <span>Optimize Selection</span>
                </button>
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
            <h2 className="text-xl font-semibold mb-4">Machine Selection</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {machineModels.map((model) => (
                  <div key={model.id} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{model.name}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-200 dark:bg-slate-700">
                        {model.type}
                      </span>
                    </div>
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
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quotation Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Machines:</span>
                <span className="font-semibold">
                  {selectedMachines.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total CFM:</span>
                <span className="font-semibold">{getTotalCfm(selectedMachines).toLocaleString()} CFM</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-slate-700 dark:text-slate-300">Total Cost:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  ${getTotalCost(selectedMachines).toLocaleString()}
                </span>
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