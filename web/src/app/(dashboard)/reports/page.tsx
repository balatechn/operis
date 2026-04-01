'use client';
import Link from 'next/link';
import { FileText, ClipboardList, Archive, BarChart2, Factory, Box, TrendingUp, PackageCheck, ArrowRight } from 'lucide-react';

const REPORTS = [
  { name: 'Purchase Report', desc: 'All purchase orders by vendor, date and status', href: '/reports/purchase', icon: FileText, color: 'bg-blue-50 text-blue-600' },
  { name: 'GRN Report', desc: 'Goods received notes with material and batch details', href: '/reports/grn', icon: ClipboardList, color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Consumption Report', desc: 'Raw material consumption grouped by production batch', href: '/reports/consumption', icon: Archive, color: 'bg-purple-50 text-purple-600' },
  { name: 'Stock Ledger', desc: 'Complete stock movement history for each material', href: '/reports/stock-ledger', icon: BarChart2, color: 'bg-cyan-50 text-cyan-600' },
  { name: 'Production Report', desc: 'Production orders with output, wastage and efficiency', href: '/reports/production', icon: Factory, color: 'bg-green-50 text-green-600' },
  { name: 'Finished Goods Report', desc: 'FG inventory movements and quality status', href: '/reports/finished-goods', icon: Box, color: 'bg-teal-50 text-teal-600' },
  { name: 'Sales Report', desc: 'Sales orders, invoicing and dispatch summaries', href: '/reports/sales', icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
  { name: 'Packing Report', desc: 'Packing orders with batch, SKU and quantities', href: '/reports/packing', icon: PackageCheck, color: 'bg-rose-50 text-rose-600' },
];

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Access all operational and analytical reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          return (
            <Link key={report.href} href={report.href}
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${report.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{report.name}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{report.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
