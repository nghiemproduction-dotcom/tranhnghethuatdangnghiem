'use server'
import { genericCreate, genericUpdate, genericDelete } from '@/app/phonglamviec/generic-actions'

const TABLE = 'nhan_su';
const PATH = '/phonglamviec';
export async function createnhansu3(data: any) { return await genericCreate(TABLE, data, PATH); }
export async function updatenhansu3(id: string, data: any) { return await genericUpdate(TABLE, id, data, PATH); }
export async function deletenhansu3(id: string) { return await genericDelete(TABLE, id, PATH); }
export async function deleteBulknhansu3(ids: string[]) {
  try {
    await Promise.all(ids.map(id => genericDelete(TABLE, id, PATH)));
    return { success: true };
  } catch (e: any) { return { success: false, message: e.message }; }
}