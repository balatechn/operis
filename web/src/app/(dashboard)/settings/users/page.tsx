'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button, Input } from '@/components/ui';
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string; name: string; email: string; role: string; isActive: boolean;
}

const ROLES = ['admin', 'manager', 'operator', 'sales'];
const defaultForm = { name: '', email: '', password: '', role: 'operator' };

const roleBadge: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700',
  manager: 'bg-blue-50 text-blue-700',
  operator: 'bg-green-50 text-green-700',
  sales: 'bg-orange-50 text-orange-700',
};

export default function UsersPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      editing
        ? api.patch(`/users/${editing.id}`, { name: data.name, role: data.role }).then((r) => r.data)
        : api.post('/users', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(editing ? 'User updated' : 'User created');
      closeModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: (user: User) =>
      api.patch(`/users/${user.id}`, { isActive: !user.isActive }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    onError: () => toast.error('Update failed'),
  });

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(defaultForm); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members and their access roles</p>
        </div>
        <Button onClick={openAdd} icon={Plus}>Invite User</Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Email</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Role</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No users yet.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadge[u.role] || 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-indigo-600 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleMutation.mutate(u)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${u.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {u.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{editing ? 'Edit User' : 'Invite User'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <Input label="Full Name *" placeholder="John Doe" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              {!editing && (
                <>
                  <Input label="Email *" type="email" placeholder="user@company.com" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  <Input label="Password *" type="password" placeholder="Min. 8 characters" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role *</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white capitalize">
                  {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
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
