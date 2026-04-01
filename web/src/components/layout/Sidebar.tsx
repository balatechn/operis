'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import {
  LayoutDashboard, ShoppingCart, Package, FlaskConical,
  Factory, Box, PackageCheck, Truck, Settings, BarChart2,
  ChevronLeft, Menu, Sun, Moon, LogOut, Shield,
  Users, Ruler, Tag, List, Building2, ChevronDown,
  FileText, ClipboardList, TrendingUp, Archive,
} from 'lucide-react';

const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Purchase & GRN', href: '/purchase', icon: ShoppingCart },
  { name: 'Raw Materials', href: '/raw-materials', icon: Package },
  { name: 'Recipes / BOM', href: '/recipes', icon: FlaskConical },
  { name: 'Production', href: '/production', icon: Factory },
  { name: 'Finished Goods', href: '/finished-goods', icon: Box },
  { name: 'Packing', href: '/packing', icon: PackageCheck },
  { name: 'Sales & Dispatch', href: '/sales', icon: Truck },
];

const settingsNav = [
  { name: 'Company Profile', href: '/settings/company', icon: Building2 },
  { name: 'Users', href: '/settings/users', icon: Users },
  { name: 'Unit of Measure', href: '/settings/uom', icon: Ruler },
  { name: 'Categories', href: '/settings/categories', icon: Tag },
  { name: 'Raw Mat. Master', href: '/settings/raw-materials', icon: Package },
  { name: 'Item Master', href: '/settings/items', icon: List },
];

const reportsNav = [
  { name: 'Purchase Report', href: '/reports/purchase', icon: FileText },
  { name: 'GRN Report', href: '/reports/grn', icon: ClipboardList },
  { name: 'Consumption', href: '/reports/consumption', icon: Archive },
  { name: 'Stock Ledger', href: '/reports/stock-ledger', icon: BarChart2 },
  { name: 'Production', href: '/reports/production', icon: Factory },
  { name: 'Finished Goods', href: '/reports/finished-goods', icon: Box },
  { name: 'Sales Report', href: '/reports/sales', icon: TrendingUp },
  { name: 'Packing Report', href: '/reports/packing', icon: PackageCheck },
];

function NavGroup({ icon: Icon, label, children, collapsed, defaultOpen = false }: {
  icon: React.ElementType; label: string; children: React.ReactNode;
  collapsed: boolean; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (collapsed) {
    return (
      <div className="relative group">
        <button className="flex items-center justify-center w-full p-2.5 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
          <Icon className="w-5 h-5 flex-shrink-0" />
        </button>
      </div>
    );
  }
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all mt-2"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </div>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const { user, logout, isSuperAdmin, isAdmin } = useAuthStore();

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const NavLink = ({ href, icon: Icon, name }: { href: string; icon: React.ElementType; name: string }) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link href={href} className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
        active ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100'
      )}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span>{name}</span>}
      </Link>
    );
  };

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Operis</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {mainNav.map((item) => <NavLink key={item.href} {...item} />)}

        {/* Reports Group */}
        <NavGroup icon={BarChart2} label="Reports" collapsed={collapsed}>
          {reportsNav.map((item) => <NavLink key={item.href} {...item} />)}
        </NavGroup>

        {/* Settings Group — admin/super_admin only */}
        {isAdmin() && (
          <NavGroup icon={Settings} label="Settings" collapsed={collapsed}>
            {settingsNav.map((item) => <NavLink key={item.href} {...item} />)}
          </NavGroup>
        )}

        {/* Super Admin — super_admin only */}
        {isSuperAdmin() && (
          <div className="mt-2">
            <NavLink href="/super-admin" icon={Shield} name="Company Approvals" />
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <button onClick={toggleDark} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
          {darkMode ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        {!collapsed && user && (
          <div className="px-3 py-2 mt-2">
            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
