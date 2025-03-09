import Link from 'next/link';
import { FaFileInvoiceDollar, FaTools, FaUserFriends, FaBoxOpen } from 'react-icons/fa';

// Sample data for demonstration
const stats = [
  { name: 'Active Quotations', value: '24', icon: FaFileInvoiceDollar, color: 'bg-blue-500', link: '/quotations' },
  { name: 'Scheduled Services', value: '18', icon: FaTools, color: 'bg-green-500', link: '/services' },
  { name: 'Clients', value: '42', icon: FaUserFriends, color: 'bg-purple-500', link: '/clients' },
  { name: 'Parts Inventory', value: '137', icon: FaBoxOpen, color: 'bg-amber-500', link: '/inventory' },
];

export default function Home() {
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
        {stats.map((stat) => (
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg hover:bg-slate-100/80 transition-colors duration-200">
                <div>
                  <p className="font-medium">Client {i + 1}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">CFM: {(i + 1) * 200}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${((i + 1) * 1250).toLocaleString()}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            ))}
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg hover:bg-slate-100/80 transition-colors duration-200">
                <div>
                  <p className="font-medium">Machine #{1000 + i}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {i % 2 === 0 ? 'Small Service' : 'Big Service'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Client {i + 1}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(Date.now() + (i + 1) * 86400000).toLocaleDateString()}
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
