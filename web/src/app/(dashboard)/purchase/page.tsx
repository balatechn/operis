'use client';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Plus, FileText } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';

export default function PurchasePage() {
  const { data: pos } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => api.get('/purchase/orders').then((r) => r.data),
  });

  const { data: grns } = useQuery({
    queryKey: ['grns'],
    queryFn: () => api.get('/purchase/grns').then((r) => r.data),
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.get('/purchase/vendors').then((r) => r.data),
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Purchase & Receiving" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-indigo-500" />
            <div>
              <p className="text-xs text-gray-500">Purchase Orders</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{pos?.length ?? '-'}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-xs text-gray-500">GRNs</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{grns?.length ?? '-'}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-xs text-gray-500">Vendors</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{vendors?.length ?? '-'}</p>
            </div>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Purchase Orders</h2>
          <Button size="sm"><Plus className="w-4 h-4" /> New PO</Button>
        </div>

        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {['PO Number', 'Vendor', 'Total Amount', 'Status', 'Expected Delivery', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {pos?.map((po: any) => (
                <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-indigo-600">{po.poNumber}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{po.vendor?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatCurrency(po.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(po.status))}>{po.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{po.expectedDeliveryDate ? formatDate(po.expectedDeliveryDate) : '-'}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost">View</Button>
                  </td>
                </tr>
              ))}
              {!pos?.length && (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No purchase orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </Card>

        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent GRNs</h2>
          <Button size="sm" variant="secondary"><Plus className="w-4 h-4" /> New GRN</Button>
        </div>

        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {['GRN Number', 'PO Number', 'QC Status', 'Received At', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {grns?.map((grn: any) => (
                <tr key={grn.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-green-600">{grn.grnNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{grn.purchaseOrder?.poNumber || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(grn.overallQCStatus))}>{grn.overallQCStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(grn.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost">View</Button>
                  </td>
                </tr>
              ))}
              {!grns?.length && (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">No GRNs yet.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
