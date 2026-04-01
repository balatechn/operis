'use client';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button, Input } from '@/components/ui';
import { Plus, Pencil, ToggleLeft, ToggleRight, Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Item {
  id: string; code: string; name: string; categoryId?: string; uomId?: string;
  hsnCode?: string; gstRate?: number; sellingPrice?: number; isActive: boolean;
  category?: { name: string }; uom?: { code: string };
}
interface Uom { id: string; code: string; name: string; }
interface Category { id: string; name: string; type: string; }

const defaultForm = { code: '', name: '', categoryId: '', uomId: '', hsnCode: '', gstRate: '', sellingPrice: '', description: '' };

interface BulkError { row: number; message: string; }
interface BulkResult { created: number; errors: BulkError[]; }

export default function ItemMasterPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: () => api.get('/settings/items').then((r) => r.data),
  });

  const { data: uoms = [] } = useQuery<Uom[]>({
    queryKey: ['uom'],
    queryFn: () => api.get('/settings/uom').then((r) => r.data),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/settings/categories').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) => {
      const payload = {
        ...data,
        gstRate: data.gstRate ? parseFloat(data.gstRate) : undefined,
        sellingPrice: data.sellingPrice ? parseFloat(data.sellingPrice) : undefined,
      };
      return editing
        ? api.patch(`/settings/items/${editing.id}`, payload).then((r) => r.data)
        : api.post('/settings/items', payload).then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
      toast.success(editing ? 'Item updated' : 'Item created');
      closeModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: (item: Item) =>
      api.patch(`/settings/items/${item.id}`, { isActive: !item.isActive }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
    onError: () => toast.error('Update failed'),
  });

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (item: Item) => {
    setEditing(item);
    setForm({
      code: item.code, name: item.name, categoryId: item.categoryId || '',
      uomId: item.uomId || '', hsnCode: item.hsnCode || '',
      gstRate: item.gstRate?.toString() || '', sellingPrice: item.sellingPrice?.toString() || '',
      description: '',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(defaultForm); };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setBulkResult(null);
    try {
      const res = await api.post('/settings/items/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBulkResult(res.data);
      qc.invalidateQueries({ queryKey: ['items'] });
      if (res.data.created > 0) toast.success(`${res.data.created} items imported`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const csv = 'code,name,categoryId,uomId,hsnCode,gstRate,sellingPrice,description\nITM001,Sample Item,,,,18,100,\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'items-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Item Master</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all items with HSN codes, GST rates and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setShowBulk(!showBulk)} icon={Upload}>Bulk Upload</Button>
          <Button onClick={openAdd} icon={Plus}>Add Item</Button>
        </div>
      </div>

      {/* Bulk Upload Panel */}
      {showBulk && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200">Bulk Import via CSV</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-0.5">Upload a CSV with columns: code, name, categoryId, uomId, hsnCode, gstRate, sellingPrice, description</p>
            </div>
            <button onClick={() => { setShowBulk(false); setBulkResult(null); }} className="text-blue-400 hover:text-blue-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={downloadTemplate} size="sm">Download Template</Button>
            <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-blue-300 text-sm font-medium text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Choose CSV File'}
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
            </label>
          </div>
          {bulkResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">{bulkResult.created} items created successfully</span>
              </div>
              {bulkResult.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 max-h-40 overflow-y-auto">
                  <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-medium text-sm mb-2">
                    <AlertCircle className="w-4 h-4" />
                    {bulkResult.errors.length} errors
                  </div>
                  {bulkResult.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400">Row {err.row}: {err.message}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Code</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Category</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">UOM</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">GST %</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Selling Price</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No items found. Add your first item or import via CSV.</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{item.code}</td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                <td className="px-4 py-3 text-gray-500">{item.category?.name || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{item.uom?.code || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{item.gstRate !== undefined ? `${item.gstRate}%` : '—'}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">{item.sellingPrice !== undefined ? `₹${item.sellingPrice}` : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-indigo-600 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleMutation.mutate(item)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${item.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{editing ? 'Edit Item' : 'Add Item'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Item Code *" placeholder="ITM001" value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
                <div className="col-span-2">
                  <Input label="Item Name *" placeholder="Butter 500g" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
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
                <Input label="HSN Code" placeholder="0401" value={form.hsnCode}
                  onChange={(e) => setForm({ ...form, hsnCode: e.target.value })} />
                <Input label="GST Rate %" type="number" placeholder="18" value={form.gstRate}
                  onChange={(e) => setForm({ ...form, gstRate: e.target.value })} />
                <div className="col-span-2">
                  <Input label="Selling Price (₹)" type="number" placeholder="100" value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
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
