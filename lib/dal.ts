import React from 'react';
import { createClient } from '@/utils/supabase/server';

// Safely use React.cache when available; otherwise, fall back to a no-op wrapper
const maybeCache = (React as any).cache ?? ((fn: any) => fn);

/**
 * Shared Data Access Layer (DAL)
 * - Exposes small, focused, cached helpers for common queries
 * - Uses React `cache` to avoid duplicate queries within a render / request
 * - Centralizes permission checks so business logic isn't spread across the app
 */

export type Profile = {
  id?: string;
  email?: string;
  role?: string | null;
  [key: string]: any;
};

// Get current session user (from Supabase session)
export const getSessionUser = maybeCache(async (): Promise<any | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
});

// Lookup profile by email (case-insensitive)
export const getProfileByEmail = maybeCache(async (email: string): Promise<Profile | null> => {
  if (!email) return null;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', email)
    .single();

  return profile ?? null;
});

// Get current user's profile (includes user from session + profile row)
export const getCurrentUserProfile = maybeCache(async (): Promise<{ user: any; profile: Profile | null } | null> => {
  const user = await getSessionUser();
  if (!user?.email) return null;
  const profile = await getProfileByEmail(user.email);
  return { user, profile };
});

// Check whether current user has a given role (string or list)
export const hasRole = maybeCache(async (roles: string | string[]): Promise<boolean> => {
  const rList = Array.isArray(roles) ? roles : [roles];
  const cur = await getCurrentUserProfile();
  const role = cur?.profile?.role ?? null;
  if (!role) return false;
  return rList.includes(role);
});

// Convenience guard: throw an error or return false depending on use-case
export const requireRole = maybeCache(async (roles: string | string[]) => {
  const ok = await hasRole(roles);
  if (!ok) throw new Error('FORBIDDEN: missing required role');
  return true;
});

// Lightweight helper usable when a Supabase client is already available (eg. middleware)
export const getProfileByEmailUsingClient = async (supabase: any, email: string): Promise<Profile | null> => {
  if (!email) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', email)
    .single();

  return profile ?? null;
};

// Identify a user by email (tries `nhan_su`, `khach_hang`, then `profiles`).
// This is cached for server-side usage to avoid duplicated DB lookups.
export const identifyUserByEmail = maybeCache(async (email: string) => {
  if (!email) return null;
  const supabase = await createClient();
  const cleanEmail = email.trim().toLowerCase();

  // 1) Try nhan_su
  const { data: nhanSu } = await supabase
    .from('nhan_su')
    .select('id, email, ho_ten, so_dien_thoai, hinh_anh, vi_tri_normalized')
    .eq('email', cleanEmail)
    .single();

  if (nhanSu) {
    const roleCode = nhanSu.vi_tri_normalized || 'parttime';
    return {
      id: nhanSu.id,
      email: nhanSu.email,
      ho_ten: nhanSu.ho_ten,
      so_dien_thoai: nhanSu.so_dien_thoai,
      hinh_anh: nhanSu.hinh_anh,
      userType: 'nhan_su',
      role: roleCode,
      permissions: { isAdmin: roleCode === 'admin' || roleCode === 'quanly' },
    } as any;
  }

  // 2) Try khach_hang
  const { data: khachHang } = await supabase
    .from('khach_hang')
    .select('id, email, ho_ten, so_dien_thoai, phan_loai_normalized')
    .eq('email', cleanEmail)
    .single();

  if (khachHang) {
    const roleCode = khachHang.phan_loai_normalized || 'moi';
    return {
      id: khachHang.id,
      email: khachHang.email,
      ho_ten: khachHang.ho_ten,
      so_dien_thoai: khachHang.so_dien_thoai,
      userType: 'khach_hang',
      role: roleCode,
      permissions: { isAdmin: false },
    } as any;
  }

  // 3) Fallback: profiles table
  const profile = await getProfileByEmail(cleanEmail);
  if (profile) {
    const roleCode = profile.role || 'user';
    return {
      id: profile.id,
      email: profile.email,
      userType: roleCode === 'admin' ? 'nhan_su' : 'khach_hang',
      role: roleCode,
      permissions: { isAdmin: roleCode === 'admin' },
    } as any;
  }

  return null;
});

// TODO: add more domain-specific cached helpers (orders, rooms, inventory, ...)
