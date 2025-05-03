"use client";

import Link from 'next/link';
import { FaFileInvoiceDollar, FaTools, FaUserFriends, FaBoxOpen } from 'react-icons/fa';
import { useEffect, useState } from 'react';

// Interface definitions
interface DashboardStats {
  quotationsCount: number;
  servicesCount: number;
  clientsCount: number;
  partsCount: number;
}

interface Quotation {
  quotation_id: number;
  client_name: string;
  cfm_requirement: number;
  total_amount: number;
  date: string;
}

interface Service {
  service_id: number;
  machine_serial: string;
  service_type: string;
  client_name: string;
  service_date: string;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    quotationsCount: 0,
    servicesCount: 0,
    clientsCount: 0,
    partsCount: 0
  });
  const [recentQuotations, setRecentQuotations] = useState<Quotation[]>([]);
  const [upcomingServices, setUpcomingServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch quotations
        const quotationsRes = await fetch(`http://${window.location.hostname}:5017/api/quotations`);
        if (!quotationsRes.ok) throw new Error('Failed to fetch quotations');
        const quotationsData = await quotationsRes.json();
        
        // Fetch services
        const servicesRes = await fetch(`http://${window.location.hostname}:5017/api/services`);
        if (!servicesRes.ok) throw new Error('Failed to fetch services');
        const servicesData = await servicesRes.json();
        
        // Fetch clients
        const clientsRes = await fetch(`http://${window.location.hostname}:5017/api/clients`);
        if (!clientsRes.ok) throw new Error('Failed to fetch clients');
        const clientsData = await clientsRes.json();
        
        // Fetch parts
        const partsRes = await fetch(`http://${window.location.hostname}:5017/api/parts`);
        if (!partsRes.ok) throw new Error('Failed to fetch parts');
        const partsData = await partsRes.json();
        
        // Update stats
        setStats({
          quotationsCount: quotationsData.success ? quotationsData.quotations.length : 0,
          servicesCount: servicesData.success ? servicesData.services.filter((s: any) => s.status === 'Scheduled').length : 0,
          clientsCount: clientsData.success ? clientsData.clients.length : 0,
          partsCount: partsData.success ? partsData.parts.length : 0
        });
        
        // Get recent quotations
        if (quotationsData.success) {
          setRecentQuotations(quotationsData.quotations.slice(0, 5));
        }
        
        // Get upcoming services
        if (servicesData.success) {
          const scheduledServices = servicesData.services
            .filter((s: any) => s.status === 'Scheduled')
            .sort((a: any, b: any) => new Date(a.service_date).getTime() - new Date(b.service_date).getTime())
            .slice(0, 5);
          setUpcomingServices(scheduledServices);
        }
        
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  // Dashboard stat cards definition
  const statCards = [
    { 
      name: 'Active Quotations', 
      value: stats.quotationsCount.toString(), 
      icon: FaFileInvoiceDollar, 
      color: 'bg-blue-500', 
      link: '/quotations' 
    },
    { 
      name: 'Scheduled Services', 
      value: stats.servicesCount.toString(), 
      icon: FaTools, 
      color: 'bg-green-500', 
      link: '/services' 
    },
    { 
      name: 'Clients', 
      value: stats.clientsCount.toString(), 
      icon: FaUserFriends, 
      color: 'bg-purple-500', 
      link: '/clients' 
    },
    { 
      name: 'Parts Inventory', 
      value: stats.partsCount.toString(), 
      icon: FaBoxOpen, 
      color: 'bg-amber-500', 
      link: '/inventory' 
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <Link 
            href="/quotations/new" 
            className="btn-primary flex items-center justify-center"
          >
            <span>Create Quotation</span>
          </Link>
          <Link 
            href="/services/new" 
            className="btn-secondary flex items-center justify-center"
          >
            <span>Schedule Service</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.name} href={stat.link} className="block">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</p>
                  <p className="mt-1 text-3xl font-semibold">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Recent Quotations</h2>
            <Link href="/quotations" className="text-sm link-gradient">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentQuotations.length > 0 ? (
              recentQuotations.map((quotation) => (
                <Link key={quotation.quotation_id} href={`/quotations/${quotation.quotation_id}`}>
                  <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg hover:bg-slate-100/80 transition-colors duration-200">
                    <div>
                      <p className="font-medium">{quotation.client_name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        CFM: {quotation.cfm_requirement}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${quotation.total_amount?.toLocaleString() || '0'}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(quotation.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center py-4 text-slate-500">No recent quotations</p>
            )}
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-5 border border-white/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Upcoming Services</h2>
            <Link href="/services" className="text-sm link-gradient">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingServices.length > 0 ? (
              upcomingServices.map((service) => (
                <Link key={service.service_id} href={`/services/${service.service_id}`}>
                  <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg hover:bg-slate-100/80 transition-colors duration-200">
                    <div>
                      <p className="font-medium">Machine #{service.machine_serial}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {service.service_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{service.client_name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(service.service_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center py-4 text-slate-500">No upcoming services</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
