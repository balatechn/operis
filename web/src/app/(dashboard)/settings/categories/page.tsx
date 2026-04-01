'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button, Input } from '@/components/ui';
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: string; name: string; type: string; description?: string; isActive: boolean;
}

const CAT_TYPES = [
  { value: 'raw_material', label: 'Raw Material' },
  { value: 'finished_good', label: 'Finished Good' },
  { value: 'item', label: 'Item' },
];

const defaultForm = { name: '', type: 'raw_material', description: '' };

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [filterType, setFilterType] = useState('');

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories', filterType],
    queryFn: () => api.get('/settings/categories', { params: filterType ? { type: filterType } : {} }).then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      editing
        ? api.patch(`/settings/categories/${editing.id}`, data).then((r) => r.data)
        : api.post('/settings/categories', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success(editing ? 'Category updated' : 'Category created');
      closeModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: (cat: Category) =>
      api.patch(`/settings/categories/${cat.id}`, { isActive: !cat.isActive }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
    onError: () => toast.error('Update failed'),
  });

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, type: cat.type, description: cat.description || '' });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(defaultForm); };

  const typeLabel = (type: string) => CAT_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Classify raw materials, items, and finished goods</p>
        </div>
        <Button onClick={openAdd} icon={Plus}>Add Category</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[{ value: '', label: 'All' }, ...CAT_TYPES].map((t) => (
          <button key={t.value} onClick={() => setFilterType(t.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === t.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Type</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Description</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No categories found. Add your first one.</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{cat.name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {typeLabel(cat.type)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{cat.description || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-indigo-600 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleMutation.mutate(cat)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${cat.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {cat.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{editing ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <Input label="Name *" placeholder="e.g. Dairy Products" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                  {CAT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <Input label="Description" placeholder="Optional description" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
