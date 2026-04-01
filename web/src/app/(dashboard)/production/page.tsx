'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Factory, Plus, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { cn, formatDate, getStatusColor } from '@/lib/utils';
import api from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import toast from 'react-hot-toast';

export default function ProductionPage() {
  const qc = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ['production-orders'],
    queryFn: () => api.get('/production').then((r) => r.data),
    refetchInterval: 15000,
  });

  const { data: stats } = useQuery({
    queryKey: ['production-stats'],
    queryFn: () => api.get('/production/stats').then((r) => r.data),
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => api.put(`/production/${id}/start`),
    onSuccess: () => { toast.success('Production started!'); qc.invalidateQueries({ queryKey: ['production-orders'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to start production'),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/production/${id}/complete`, data),
    onSuccess: () => { toast.success('Production completed!'); qc.invalidateQueries({ queryKey: ['production-orders'] }); },
    onError: () => toast.error('Failed to complete production'),
  });

  const statusColors: Record<string, string> = {
    planned: 'bg-yellow-50 text-yellow-700',
    in_progress: 'bg-blue-50 text-blue-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Production" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats?.total ?? '-', color: 'text-gray-900' },
            { label: 'Planned', value: stats?.planned ?? '-', color: 'text-yellow-600' },
            { label: 'In Progress', value: stats?.inProgress ?? '-', color: 'text-blue-600' },
            { label: 'Completed', value: stats?.completed ?? '-', color: 'text-green-600' },
          ].map((s) => (
            <Card key={s.label}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={cn('text-2xl font-bold mt-1', s.color)}>{s.value}</p>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Production Orders</h2>
          <Button size="sm"><Plus className="w-4 h-4" /> New Order</Button>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders?.map((order: any) => (
            <Card key={order.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-gray-500">{order.orderNumber}</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{order.recipeName}</p>
                </div>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColors[order.status] || 'bg-gray-50 text-gray-600')}>
                  {order.status?.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div><span className="font-medium text-gray-700">Planned:</span> {order.plannedQuantity}</div>
                <div><span className="font-medium text-gray-700">Actual:</span> {order.actualQuantity || '-'}</div>
                <div><span className="font-medium text-gray-700">Batch:</span> {order.batchNumber?.slice(-8) || '-'}</div>
                <div><span className="font-medium text-gray-700">Operator:</span> {order.assignedOperator || '-'}</div>
              </div>

              <div className="flex gap-2 pt-1">
                {order.status === 'planned' && (
                  <Button
                    size="sm"
                    onClick={() => startMutation.mutate(order.id)}
                    loading={startMutation.isPending}
                    className="flex-1"
                  >
                    <Play className="w-3.5 h-3.5" /> Start
                  </Button>
                )}
                {order.status === 'in_progress' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => completeMutation.mutate({ id: order.id, data: { actualQuantity: order.plannedQuantity, wastageQuantity: 0 } })}
                    loading={completeMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Complete
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {!orders?.length && (
            <div className="col-span-3 py-16 text-center text-gray-400">
              <Factory className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No production orders yet. Create your first one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
