'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/ThuVien/UserContext';
import { BarChart3, Users, Settings, AlertCircle } from 'lucide-react';

/**
 * 📊 ADMIN DASHBOARD
 * Route: /dashboard/admin
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C69C6D] mx-auto mb-4" />
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  // No user - redirect
  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#C69C6D] mb-2">📊 Admin Dashboard</h1>
        <p className="text-white/70">
          Chào {user.ho_ten} ({user.userType === 'nhan_su' ? user.vi_tri_normalized : user.phan_loai_normalized})
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} title="Users" value="1,234" color="blue" />
        <StatCard icon={BarChart3} title="Analytics" value="85%" color="green" />
        <StatCard icon={Settings} title="Products" value="567" color="purple" />
        <StatCard icon={AlertCircle} title="Alerts" value="42" color="red" />
      </div>

      {/* SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a120f] border border-[#8B5E3C]/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-[#C69C6D] mb-4 flex items-center gap-2">
            <Users size={20} /> User Management
          </h2>
          <p className="text-white/70 mb-4">Manage system users and roles</p>
          <button className="px-4 py-2 bg-[#C69C6D] text-black rounded font-bold hover:bg-white transition-all">
            Manage Users
          </button>
        </div>

        <div className="bg-[#1a120f] border border-[#8B5E3C]/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-[#C69C6D] mb-4 flex items-center gap-2">
            <Settings size={20} /> System Settings
          </h2>
          <p className="text-white/70 mb-4">Configure system settings</p>
          <button className="px-4 py-2 bg-[#C69C6D] text-black rounded font-bold hover:bg-white transition-all">
            Settings
          </button>
        </div>

        <div className="bg-[#1a120f] border border-[#8B5E3C]/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-[#C69C6D] mb-4 flex items-center gap-2">
            <BarChart3 size={20} /> Analytics
          </h2>
          <p className="text-white/70 mb-4">View detailed analytics</p>
          <button className="px-4 py-2 bg-[#C69C6D] text-black rounded font-bold hover:bg-white transition-all">
            View Analytics
          </button>
        </div>

        <div className="bg-[#1a120f] border border-[#8B5E3C]/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-[#C69C6D] mb-4">Content Management</h2>
          <p className="text-white/70 mb-4">Manage website content</p>
          <button className="px-4 py-2 bg-[#C69C6D] text-black rounded font-bold hover:bg-white transition-all">
            Manage Content
          </button>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  color: string;
}

function StatCard({ icon: Icon, title, value, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-900/20 border-blue-500',
    green: 'text-green-400 bg-green-900/20 border-green-500',
    purple: 'text-purple-400 bg-purple-900/20 border-purple-500',
    red: 'text-red-400 bg-red-900/20 border-red-500',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <Icon size={24} />
      <p className="text-white/70 text-sm mt-2">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
