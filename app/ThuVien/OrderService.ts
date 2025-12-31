import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { withTimeout } from '@/app/ThuVien/withTimeout';
import { LoggerService } from '@/app/ThuVien/LoggerService';

export interface Order {
  id: string;
  ma_don: string;
  ten_khach: string | null;
  sdt: string | null;
  dia_chi: string | null;
  ghi_chu: string | null;
  trang_thai: string;
  tong_tien: number;
  nguoi_tao: string;
  tao_luc: string;
  cap_nhat_luc: string;
}

export interface OrderItem {
  id: string;
  don_hang_id: string;
  ten_san_pham: string | null;
  so_luong: number;
  don_gia: number;
  thanh_tien: number;
}

export interface CreateOrderData {
  ten_khach?: string;
  sdt?: string;
  dia_chi?: string;
  ghi_chu?: string;
  items: Array<{
    ten_san_pham: string;
    so_luong: number;
    don_gia: number;
  }>;
}

export class OrderService {
  /**
   * Tạo đơn hàng mới (auto set nguoi_tao = auth.uid())
   */
  static async createOrder(data: CreateOrderData): Promise<string | null> {
    try {
      // Tính tổng tiền
      const tongTien = data.items.reduce((sum, item) => sum + (item.so_luong * item.don_gia), 0);

      // Insert đơn hàng (remove withTimeout due to type complexity)
      const { data: orderData, error: orderError } = await supabase
        .from('don_hang')
        .insert({
          ten_khach: data.ten_khach,
          sdt: data.sdt,
          dia_chi: data.dia_chi,
          ghi_chu: data.ghi_chu,
          tong_tien: tongTien,
          trang_thai: 'moi',
          nguoi_tao: (await supabase.auth.getUser()).data.user?.id,
        })
        .select('id')
        .single();

      if (orderError) {
        LoggerService.error('OrderService', 'Error creating order', orderError);
        return null;
      }

      // Insert items
      if (data.items.length > 0) {
        const itemsToInsert = data.items.map(item => ({
          don_hang_id: orderData.id,
          ten_san_pham: item.ten_san_pham,
          so_luong: item.so_luong,
          don_gia: item.don_gia,
        }));

        const { error: itemsError } = await supabase
          .from('don_hang_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Error creating order items:', itemsError);
        }
      }

      return orderData.id;
    } catch (error) {
      console.error('OrderService.createOrder error:', error);
      return null;
    }
  }

  /**
   * Lấy danh sách đơn hàng của user hiện tại
   */
  static async getMyOrders(limit = 50): Promise<{ orders: Order[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('don_hang')
        .select('*')
        .order('tao_luc', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching orders:', error.message);
        return { orders: [], error: error.message };
      }

      // ✅ Safe null check
      const orders = (data ?? []) as Order[];
      return { orders, error: null };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('OrderService.getMyOrders error:', errorMsg);
      return { orders: [], error: errorMsg };
    }
  }

  /**
   * Lấy chi tiết đơn hàng (bao gồm items)
   */
  static async getOrderById(orderId: string): Promise<{ order: Order; items: OrderItem[] } | null> {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('don_hang')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        return null;
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from('don_hang_items')
        .select('*')
        .eq('don_hang_id', orderId);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        return { order: orderData as Order, items: [] };
      }

      return {
        order: orderData as Order,
        items: itemsData as OrderItem[],
      };
    } catch (error) {
      console.error('OrderService.getOrderById error:', error);
      return null;
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  static async updateOrderStatus(orderId: string, trangThai: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('don_hang')
        .update({ trang_thai: trangThai })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('OrderService.updateOrderStatus error:', error);
      return false;
    }
  }

  /**
   * Lấy đơn hàng gần nhất
   */
  static async getLatestOrder(): Promise<{ order: Order | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('don_hang')
        .select('*')
        .order('tao_luc', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching latest order:', error);
        return { order: null, error: error.message };
      }

      return { order: data as Order, error: null };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('OrderService.getLatestOrder error:', errorMsg);
      return { order: null, error: errorMsg };
    }
  }

  /**
   * Format trạng thái đơn hàng thành tiếng Việt
   */
  static formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'moi': '🆕 Mới',
      'dang_xu_ly': '⏳ Đang xử lý',
      'dang_giao': '🚚 Đang giao',
      'hoan_thanh': '✅ Hoàn thành',
      'huy': '❌ Đã hủy',
    };
    return statusMap[status] || status;
  }

  /**
   * Format số tiền VND
   */
  static formatMoney(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
}
