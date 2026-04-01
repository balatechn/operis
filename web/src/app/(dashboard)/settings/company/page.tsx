'use client';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button, Input } from '@/components/ui';
import { Building2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

interface Company {
  id: string; name: string; industry?: string; plan: string; maxUsers: number;
  status: string; adminEmail: string; phone?: string; gstin?: string; address?: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  pending_approval: 'bg-yellow-50 text-yellow-700',
  on_hold: 'bg-orange-50 text-orange-700',
  rejected: 'bg-red-50 text-red-700',
  suspended: 'bg-gray-100 text-gray-600',
};

export default function CompanyProfilePage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [form, setForm] = useState({ name: '', industry: '', phone: '', gstin: '', address: '' });
  const [saving, setSaving] = useState(false);

  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ['company', user?.companyId],
    queryFn: () => api.get(`/companies/${user?.companyId}`).then((r) => r.data),
    enabled: !!user?.companyId,
  });

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || '',
        industry: company.industry || '',
        phone: company.phone || '',
        gstin: company.gstin || '',
        address: company.address || '',
      });
    }
  }, [company]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/companies/${user?.companyId}`, form);
      qc.invalidateQueries({ queryKey: ['company'] });
      toast.success('Company profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-gray-400">Loading company details...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
          <Building2 className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update your company information</p>
        </div>
      </div>

      {/* Status Banner */}
      {company && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Plan</p>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">{company.plan}</p>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Max Users</p>
              <p className="font-semibold text-gray-900 dark:text-white">{company.maxUsers}</p>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[company.status] || 'bg-gray-100 text-gray-600'}`}>
                {company.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Company Name *" placeholder="Acme Manufacturing" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Industry" placeholder="Food & Beverages" value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            <Input label="Phone" placeholder="+91 98765 43210" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Input label="GST Number" placeholder="22AAAAA0000A1Z5" value={form.gstin}
            onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
          <Input label="Address" placeholder="123 Industrial Area, City" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="pt-2">
            <Button type="submit" loading={saving} icon={Save}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
