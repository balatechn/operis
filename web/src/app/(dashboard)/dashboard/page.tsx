'use client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Package, Factory, ShoppingCart, Truck, AlertTriangle, TrendingUp, Box, FlaskConical } from 'lucide-react';
import { Card, StatCard, Badge } from '@/components/ui';
import { cn, formatCurrency, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';

export default function DashboardPage() {
  const { data: overview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => api.get('/dashboard/overview').then((r) => r.data),
    refetchInterval: 30000,
  });

  const { data: salesTrend } = useQuery({
    queryKey: ['sales-trend'],
    queryFn: () => api.get('/dashboard/sales-trend').then((r) => r.data),
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventory-health'],
    queryFn: () => api.get('/dashboard/inventory').then((r) => r.data),
  });

  const { data: efficiency } = useQuery({
    queryKey: ['production-efficiency'],
    queryFn: () => api.get('/dashboard/production-efficiency').then((r) => r.data),
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Dashboard" />
      <div className="flex-1 overflow-auto p-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Raw Materials" value={overview?.rawMaterials ?? '-'} icon={<Package className="w-5 h-5" />} color="blue" />
          <StatCard title="Production Orders" value={overview?.productionOrders ?? '-'} icon={<Factory className="w-5 h-5" />} color="purple" />
          <StatCard title="Sales Orders" value={overview?.salesOrders ?? '-'} icon={<ShoppingCart className="w-5 h-5" />} color="green" />
          <StatCard title="Finished Goods" value={overview?.finishedGoods ?? '-'} icon={<Box className="w-5 h-5" />} color="orange" />
        </div>

        {/* Alert Row */}
        {overview?.alerts && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Low Stock RM', value: overview.alerts.lowStockRM, color: 'red' },
              { label: 'Active Production', value: overview.alerts.activeProduction, color: 'blue' },
              { label: 'Pending Dispatch', value: overview.alerts.pendingDispatch, color: 'orange' },
              { label: 'Pending POs', value: overview.alerts.pendingPOs, color: 'yellow' },
            ].map((alert) => (
              <Card key={alert.label} className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 text-${alert.color}-500 flex-shrink-0`} />
                <div>
                  <p className="text-xs text-gray-500">{alert.label}</p>
                  <p className={`text-lg font-bold text-${alert.color}-600`}>{alert.value}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Sales Trend
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesTrend || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => formatCurrency(val)} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Factory className="w-4 h-4 text-purple-500" /> Production Efficiency
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={efficiency?.slice(0, 10) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="orderNumber" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="planned" fill="#e0e7ff" radius={[4, 4, 0, 0]} name="Planned" />
                <Bar dataKey="actual" fill="#6366f1" radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Inventory Health */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" /> Raw Material Inventory Health
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Material', 'Current Stock', 'Min Stock', 'Status'].map((h) => (
                    <th key={h} className="pb-2 text-left text-xs font-medium text-gray-500 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {(inventory?.rawMaterials || []).map((rm: any) => (
                  <tr key={rm.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-white">{rm.name}</td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">{rm.currentStock}</td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">{rm.minimumStock}</td>
                    <td className="py-2.5">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(rm.status))}>
                        {rm.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!inventory?.rawMaterials?.length && (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">No data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
