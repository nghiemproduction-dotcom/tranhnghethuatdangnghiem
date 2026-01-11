// app/components/cacchucnang/ChucNangGeneric/lib/dal.ts
import 'server-only'; 

import { cache } from 'react';
// import { cookies } from 'next/headers'; // Bỏ nếu createClient tự xử lý
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { GenericTableConfig, GenericResponse } from './types';
import { FieldConfig } from "@/app/types/core"; // 🟢 FIX: Import thêm cái này để định kiểu

/**
 * 1. CORE AUTH CHECK
 */
const getSupabaseSession = cache(async () => {
  // const cookieStore = await cookies(); // Có thể bỏ nếu createClient() không cần tham số
  const supabase = await createClient(); 

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }
  return { supabase, user };
});

/**
 * 2. GENERIC FETCH LIST (RSC Optimized)
 */
export const fetchGenericList = cache(async <T>(
  config: GenericTableConfig<T>,
  params: { page?: number; limit?: number; search?: string; filter?: any }
): Promise<GenericResponse<T>> => {
  const { supabase } = await getSupabaseSession();
  
  const page = params.page || 1;
  const limit = params.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from(config.tableName)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false }) 
    .range(from, to);

  // Search Logic
  if (params.search) {
    const textFields = config.fields
      // 🟢 FIX LỖI: Thêm kiểu (f: FieldConfig)
      .filter((f: FieldConfig) => f.type === 'text' || f.type === 'email' || f.type === 'phone')
      .map((f: FieldConfig) => `${f.key}.ilike.%${params.search}%`)
      .join(',');
    
    if (textFields) {
      query = query.or(textFields);
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error(`Error fetching ${config.tableName}:`, error);
    return { data: [], count: 0, error: error.message };
  }

  const mappedData = config.dtoMapper ? data.map(config.dtoMapper) : data;

  return { data: mappedData, count: count || 0 };
});

/**
 * 3. GET SINGLE ITEM
 */
export const fetchGenericItem = cache(async <T>(
  config: GenericTableConfig<T>,
  id: string
): Promise<T | null> => {
  const { supabase } = await getSupabaseSession();

  const { data, error } = await supabase
    .from(config.tableName)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return config.dtoMapper ? config.dtoMapper(data) : data;
});