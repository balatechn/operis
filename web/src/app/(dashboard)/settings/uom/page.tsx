'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button, Input } from '@/components/ui';
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Uom {
  id: string; code: string; name: string; type: string; isActive: boolean;
}

const UOM_TYPES = ['weight', 'volume', 'count', 'length', 'area'];

const defaultForm = { code: '', name: '', type: 'weight' };

export default function UomPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Uom | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: uoms = [], isLoading } = useQuery<Uom[]>({
    queryKey: ['uom'],
    queryFn: () => api.get('/settings/uom').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      editing
        ? api.patch(`/settings/uom/${editing.id}`, data).then((r) => r.data)
        : api.post('/settings/uom', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['uom'] });
      toast.success(editing ? 'UOM updated' : 'UOM created');
      closeModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: (uom: Uom) =>
      api.patch(`/settings/uom/${uom.id}`, { isActive: !uom.isActive }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['uom'] }),
    onError: () => toast.error('Update failed'),
  });

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (uom: Uom) => { setEditing(uom); setForm({ code: uom.code, name: uom.name, type: uom.type }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(defaultForm); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unit of Measure</h1>
          <p className="text-sm text-gray-500 mt-1">Manage measurement units used across inventory and production</p>
        </div>
        <Button onClick={openAdd} icon={Plus}>Add UOM</Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Code</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Type</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : uoms.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No UOMs found. Add your first one.</td></tr>
            ) : uoms.map((uom) => (
              <tr key={uom.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{uom.code}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">{uom.name}</td>
                <td className="px-4 py-3 capitalize text-gray-500">{uom.type}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${uom.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {uom.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <button onClick={() => openEdit(uom)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-indigo-600 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleMutation.mutate(uom)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${uom.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {uom.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{editing ? 'Edit UOM' : 'Add UOM'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <Input label="Code *" placeholder="e.g. KG" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
              <Input label="Name *" placeholder="e.g. Kilogram" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white capitalize">
                  {UOM_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button>
                <Button type="submit" loading={saveMutation.isPending} className="flex-1">{editing ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
