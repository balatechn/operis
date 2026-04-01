'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PackageCheck, Plus } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import toast from 'react-hot-toast';

export default function PackingPage() {
  const qc = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ['packing-orders'],
    queryFn: () => api.get('/packing').then((r) => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.put(`/packing/${id}/complete`),
    onSuccess: () => { toast.success('Packing completed! FG stock updated.'); qc.invalidateQueries({ queryKey: ['packing-orders'] }); },
    onError: () => toast.error('Failed to complete packing'),
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Packing" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">{orders?.length ?? 0} packing orders &bull; {orders?.filter((o: any) => o.isCompleted).length ?? 0} completed</p>
          </div>
          <Button size="sm"><Plus className="w-4 h-4" /> New Packing Order</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders?.map((order: any) => (
            <Card key={order.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-gray-500">{order.packingOrderNumber}</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{order.finishedGoodName}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.isCompleted ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {order.isCompleted ? 'Completed' : 'Pending'}
                </span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p><span className="font-medium text-gray-700">Batch:</span> {order.sourceBatchNumber}</p>
                <p><span className="font-medium text-gray-700">Bulk Qty:</span> {order.bulkQuantity}</p>
                <p><span className="font-medium text-gray-700">Pack Sizes:</span> {order.packSizes?.length ?? 0} variants</p>
                {order.packingDate && <p><span className="font-medium text-gray-700">Packed:</span> {formatDate(order.packingDate)}</p>}
              </div>
              {order.packSizes?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {order.packSizes.map((ps: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-lg">{ps.size} {ps.unit} × {ps.numberOfPacks}</span>
                  ))}
                </div>
              )}
              {!order.isCompleted && (
                <Button size="sm" className="w-full" onClick={() => completeMutation.mutate(order.id)} loading={completeMutation.isPending}>
                  <PackageCheck className="w-3.5 h-3.5" /> Complete Packing
                </Button>
              )}
            </Card>
          ))}
          {!orders?.length && (
            <div className="col-span-3 py-16 text-center text-gray-400">
              <PackageCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No packing orders yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
