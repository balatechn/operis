'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button, Input } from '@/components/ui';
import { Plus, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

interface RawMaterial {
  id: string; name: string; code?: string; category: string; unit: string;
  categoryId?: string; uomId?: string; currentStock: number; minimumStock: number;
  reorderPoint: number; costPerUnit: number; isActive?: boolean;
}
interface Uom { id: string; code: string; name: string; }
interface Category { id: string; name: string; type: string; }

const defaultForm = {
  name: '', code: '', categoryId: '', uomId: '', minimumStock: '0',
  reorderPoint: '0', costPerUnit: '0', description: '',
};

export default function RawMaterialsMasterPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RawMaterial | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState('');

  const { data: materials = [], isLoading } = useQuery<RawMaterial[]>({
    queryKey: ['raw-materials'],
    queryFn: () => api.get('/raw-materials').then((r) => r.data),
  });

  const { data: uoms = [] } = useQuery<Uom[]>({
    queryKey: ['uom'],
    queryFn: () => api.get('/settings/uom').then((r) => r.data),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/settings/categories', { params: { type: 'raw_material' } }).then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) => {
      const payload = {
        ...data,
        minimumStock: parseFloat(data.minimumStock) || 0,
        reorderPoint: parseFloat(data.reorderPoint) || 0,
        costPerUnit: parseFloat(data.costPerUnit) || 0,
        // Pass category/unit strings from selected FK records for backward compat
        category: categories.find((c) => c.id === data.categoryId)?.name || data.categoryId,
        unit: uoms.find((u) => u.id === data.uomId)?.code || data.uomId,
      };
      return editing
        ? api.patch(`/raw-materials/${editing.id}`, payload).then((r) => r.data)
        : api.post('/raw-materials', payload).then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['raw-materials'] });
      toast.success(editing ? 'Material updated' : 'Material created');
      closeModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (m: RawMaterial) => {
    setEditing(m);
    setForm({
      name: m.name, code: m.code || '', categoryId: m.categoryId || '',
      uomId: m.uomId || '', minimumStock: m.minimumStock.toString(),
      reorderPoint: m.reorderPoint.toString(), costPerUnit: m.costPerUnit.toString(),
      description: '',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(defaultForm); };

  const filtered = materials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.code || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Raw Material Master</h1>
          <p className="text-sm text-gray-500 mt-1">Define raw materials with category, UOM and reorder rules</p>
        </div>
        <Button onClick={openAdd} icon={Plus}>Add Material</Button>
      </div>

      <div className="max-w-xs">
        <Input placeholder="Search by name or code..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Category</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">UOM</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Stock</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Min Stock</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Cost/Unit</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No materials found.</td></tr>
            ) : filtered.map((m) => (
              <tr key={m.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 ${m.currentStock <= m.minimumStock ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{m.name}</td>
                <td className="px-4 py-3 text-gray-500">{m.category}</td>
                <td className="px-4 py-3 text-gray-500">{m.unit}</td>
                <td className={`px-4 py-3 font-mono font-medium ${m.currentStock <= m.minimumStock ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                  {m.currentStock}
                </td>
                <td className="px-4 py-3 text-gray-500">{m.minimumStock}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">₹{m.costPerUnit}</td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-indigo-600 transition-colors">
                    <Pencil className="w-4 h-4" />
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{editing ? 'Edit Material' : 'Add Raw Material'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Input label="Material Name *" placeholder="Whole Milk" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <Input label="Code" placeholder="RM001" value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Unit of Measure</label>
                  <select value={form.uomId} onChange={(e) => setForm({ ...form, uomId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                    <option value="">Select UOM</option>
                    {uoms.map((u) => <option key={u.id} value={u.id}>{u.code} — {u.name}</option>)}
                  </select>
                </div>
                <Input label="Min Stock" type="number" placeholder="50" value={form.minimumStock}
                  onChange={(e) => setForm({ ...form, minimumStock: e.target.value })} />
                <Input label="Reorder Point" type="number" placeholder="100" value={form.reorderPoint}
                  onChange={(e) => setForm({ ...form, reorderPoint: e.target.value })} />
                <div className="col-span-2">
                  <Input label="Cost per Unit (₹)" type="number" placeholder="45.50" value={form.costPerUnit}
                    onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} />
                </div>
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
