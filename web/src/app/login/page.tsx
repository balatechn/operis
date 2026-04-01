'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button, Input } from '@/components/ui';
import { Factory, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

type Tab = 'login' | 'register';

const PLANS = [
  { value: 'basic', label: 'Basic', desc: 'Up to 10 users', price: 'Free trial' },
  { value: 'standard', label: 'Standard', desc: 'Up to 25 users', price: '₹2,999/mo' },
  { value: 'enterprise', label: 'Enterprise', desc: 'Up to 100 users', price: '₹7,999/mo' },
];

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('login');
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // Register state
  const [regData, setRegData] = useState({
    companyName: '', industry: '', plan: 'basic',
    adminName: '', adminEmail: '', adminPassword: '', confirmPassword: '',
    phone: '', gstin: '', address: '',
  });
  const [regLoading, setRegLoading] = useState(false);

  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to Operis!');
      router.push('/dashboard');
    } catch {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.adminPassword !== regData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (regData.adminPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setRegLoading(true);
    try {
      await api.post('/companies/register', {
        companyName: regData.companyName,
        industry: regData.industry,
        plan: regData.plan,
        adminName: regData.adminName,
        adminEmail: regData.adminEmail,
        adminPassword: regData.adminPassword,
        phone: regData.phone,
        gstin: regData.gstin,
        address: regData.address,
      });
      toast.success('Registration submitted! You will be notified once approved.');
      setTab('login');
      setRegData({ companyName: '', industry: '', plan: 'basic', adminName: '', adminEmail: '', adminPassword: '', confirmPassword: '', phone: '', gstin: '', address: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <Factory className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Operis</h1>
          <p className="mt-1 text-sm text-gray-500">Manufacturing Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-4 text-sm font-semibold rounded-tl-2xl transition-colors ${tab === 'login' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-4 text-sm font-semibold rounded-tr-2xl transition-colors ${tab === 'register' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Register Company
            </button>
          </div>

          <div className="p-8">
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <Input label="Email address" type="email" placeholder="you@company.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                <Input label="Password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                <Button type="submit" loading={loading} className="w-full mt-2" size="lg">Sign in</Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Company Details</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Input label="Company Name *" placeholder="Acme Manufacturing"
                      value={regData.companyName} onChange={(e) => setRegData({ ...regData, companyName: e.target.value })} required />
                  </div>
                  <Input label="Industry" placeholder="Food & Beverages"
                    value={regData.industry} onChange={(e) => setRegData({ ...regData, industry: e.target.value })} />
                  <Input label="Phone" placeholder="+91 98765 43210"
                    value={regData.phone} onChange={(e) => setRegData({ ...regData, phone: e.target.value })} />
                  <div className="col-span-2">
                    <Input label="Address" placeholder="123 Industrial Area, City"
                      value={regData.address} onChange={(e) => setRegData({ ...regData, address: e.target.value })} />
                  </div>
                  <Input label="GST Number" placeholder="22AAAAA0000A1Z5"
                    value={regData.gstin} onChange={(e) => setRegData({ ...regData, gstin: e.target.value })} />
                </div>

                {/* Plan Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Subscription Plan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLANS.map((p) => (
                      <button key={p.value} type="button" onClick={() => setRegData({ ...regData, plan: p.value })}
                        className={`p-2 rounded-xl border-2 text-left transition-all ${regData.plan === p.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'}`}>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{p.label}</div>
                        <div className="text-xs text-gray-500">{p.desc}</div>
                        <div className="text-xs font-semibold text-indigo-600 mt-1">{p.price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Admin Account</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Admin Name *" placeholder="Full Name"
                      value={regData.adminName} onChange={(e) => setRegData({ ...regData, adminName: e.target.value })} required />
                    <div className="col-span-2">
                      <Input label="Admin Email *" type="email" placeholder="admin@company.com"
                        value={regData.adminEmail} onChange={(e) => setRegData({ ...regData, adminEmail: e.target.value })} required />
                    </div>
                    <Input label="Password *" type="password" placeholder="Min. 8 characters"
                      value={regData.adminPassword} onChange={(e) => setRegData({ ...regData, adminPassword: e.target.value })} required />
                    <Input label="Confirm Password *" type="password" placeholder="Repeat password"
                      value={regData.confirmPassword} onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })} required />
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs rounded-xl p-3">
                  Your registration will be reviewed and activated by our team within 24 hours.
                </div>

                <Button type="submit" loading={regLoading} className="w-full" size="lg">
                  Submit Registration
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Operis © {new Date().getFullYear()} · Manufacturing Management System
        </p>
      </div>
    </div>
  );
}

