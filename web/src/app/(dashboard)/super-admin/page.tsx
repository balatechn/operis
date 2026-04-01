'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui';
import { CheckCircle, PauseCircle, XCircle, AlertTriangle, Building2, Users, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface Company {
  id: string; name: string; industry?: string; plan: string; maxUsers: number;
  status: string; adminEmail: string; phone?: string; gstin?: string; address?: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending_approval: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  on_hold: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  suspended: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

type TabFilter = 'pending_approval' | 'active' | 'all';

export default function SuperAdminPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabFilter>('pending_approval');
  const [reasonModal, setReasonModal] = useState<{ id: string; action: 'hold' | 'reject' } | null>(null);
  const [reason, setReason] = useState('');

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: () => api.get('/companies').then((r) => r.data),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action, body }: { id: string; action: string; body?: object }) =>
      api.patch(`/companies/${id}/${action}`, body || {}).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['companies'] });
      toast.success(`Company ${vars.action}d successfully`);
      setReasonModal(null);
      setReason('');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Action failed'),
  });

  const handleAction = (id: string, action: string, body?: object) => {
    actionMutation.mutate({ id, action, body });
  };

  const handleReasonSubmit = () => {
    if (!reasonModal) return;
    if (!reason.trim()) { toast.error('Please provide a reason'); return; }
    handleAction(reasonModal.id, reasonModal.action, { reason });
  };

  const filtered = companies.filter((c) => {
    if (tab === 'all') return true;
    return c.status === tab;
  });

  const pendingCount = companies.filter((c) => c.status === 'pending_approval').length;

  const TABS: { value: TabFilter; label: string }[] = [
    { value: 'pending_approval', label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { value: 'active', label: 'Active' },
    { value: 'all', label: 'All' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Approvals</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and manage company registrations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: companies.length, color: 'text-gray-900 dark:text-white' },
          { label: 'Pending', value: companies.filter(c => c.status === 'pending_approval').length, color: 'text-yellow-600' },
          { label: 'Active', value: companies.filter(c => c.status === 'active').length, color: 'text-green-600' },
          { label: 'Suspended/Rejected', value: companies.filter(c => ['suspended', 'rejected', 'on_hold'].includes(c.status)).length, color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Company</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Admin Email</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Plan</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Registered</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading companies...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No companies in this category.</td></tr>
            ) : filtered.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                      <p className="text-xs text-gray-400">{company.industry || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{company.adminEmail}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{company.plan}</span>
                    <span className="text-xs text-gray-400">({company.maxUsers} users)</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(company.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[company.status] || 'bg-gray-100 text-gray-600'}`}>
                    {company.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {company.status !== 'active' && (
                      <button
                        onClick={() => handleAction(company.id, 'approve')}
                        disabled={actionMutation.isPending}
                        title="Approve"
                        className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {!['on_hold', 'rejected', 'suspended'].includes(company.status) && (
                      <button
                        onClick={() => { setReasonModal({ id: company.id, action: 'hold' }); setReason(''); }}
                        title="Put on Hold"
                        className="p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 text-gray-400 hover:text-orange-600 transition-colors"
                      >
                        <PauseCircle className="w-4 h-4" />
                      </button>
                    )}
                    {company.status !== 'rejected' && (
                      <button
                        onClick={() => { setReasonModal({ id: company.id, action: 'reject' }); setReason(''); }}
                        title="Reject"
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    {company.status === 'active' && (
                      <button
                        onClick={() => handleAction(company.id, 'suspend')}
                        title="Suspend"
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reason Modal */}
      {reasonModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 capitalize">
              {reasonModal.action === 'hold' ? 'Put Company on Hold' : 'Reject Company'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">Please provide a reason that will be communicated to the company admin.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder={reasonModal.action === 'hold' ? 'e.g. Additional verification required...' : 'e.g. Incomplete documentation...'}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setReasonModal(null)} className="flex-1">Cancel</Button>
              <Button
                type="button"
                onClick={handleReasonSubmit}
                loading={actionMutation.isPending}
                className={`flex-1 ${reasonModal.action === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                {reasonModal.action === 'hold' ? 'Put on Hold' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
