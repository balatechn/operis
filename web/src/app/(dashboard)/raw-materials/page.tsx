'use client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Package, Plus, AlertTriangle, Clock } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { cn, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import toast from 'react-hot-toast';

export default function RawMaterialsPage() {
  const [activeTab, setActiveTab] = useState<'stock' | 'low' | 'expiry'>('stock');

  const { data: materials, refetch } = useQuery({
    queryKey: ['raw-materials'],
    queryFn: () => api.get('/raw-materials').then((r) => r.data),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => api.get('/raw-materials/low-stock').then((r) => r.data),
  });

  const { data: expiryAlerts } = useQuery({
    queryKey: ['expiry-alerts'],
    queryFn: () => api.get('/raw-materials/expiry-alerts').then((r) => r.data),
  });

  const { data: dashboard } = useQuery({
    queryKey: ['rm-dashboard'],
    queryFn: () => api.get('/raw-materials/dashboard').then((r) => r.data),
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Raw Materials" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Materials', value: dashboard?.totalMaterials ?? '-', icon: <Package className="w-4 h-4" />, color: 'text-indigo-600' },
            { label: 'Low Stock', value: dashboard?.lowStockCount ?? '-', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-600' },
            { label: 'Expiry Alerts', value: dashboard?.expiryAlertCount ?? '-', icon: <Clock className="w-4 h-4" />, color: 'text-orange-600' },
          ].map((s) => (
            <Card key={s.label} className="flex items-center gap-3">
              <span className={s.color}>{s.icon}</span>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[{ key: 'stock', label: 'All Stock' }, { key: 'low', label: `Low Stock (${lowStock?.length ?? 0})` }, { key: 'expiry', label: `Expiry Alerts (${expiryAlerts?.length ?? 0})` }].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all', activeTab === tab.key ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-50')}
            >
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <Button size="sm"><Plus className="w-4 h-4" /> Add Material</Button>
        </div>

        {/* Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  {['Code', 'Name', 'Category', 'Current Stock', 'Min Stock', 'Unit', 'Location', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {(activeTab === 'stock' ? materials : activeTab === 'low' ? lowStock : expiryAlerts?.map((e: any) => e.material))?.map((rm: any) => {
                  const isLow = Number(rm.currentStock) <= Number(rm.minimumStock);
                  return (
                    <tr key={rm.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{rm.code}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{rm.name}</td>
                      <td className="px-4 py-3 text-gray-500">{rm.category || '-'}</td>
                      <td className={cn('px-4 py-3 font-semibold', isLow ? 'text-red-600' : 'text-gray-900 dark:text-white')}>{rm.currentStock}</td>
                      <td className="px-4 py-3 text-gray-500">{rm.minimumStock}</td>
                      <td className="px-4 py-3 text-gray-500">{rm.unit}</td>
                      <td className="px-4 py-3 text-gray-500">{rm.warehouse || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', isLow ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50')}>
                          {isLow ? 'Low' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!materials?.length && (
                  <tr><td colSpan={8} className="py-12 text-center text-gray-400">No raw materials found. Add your first material.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
