import { supabase } from "@/utils/supabase/client";
import { LoggerService } from "@/lib/LoggerService";

// Interface khớp với DB bảng don_hang
export interface Order {
  id: string;
  ma_don: string;
  ten_khach: string | null;
  sdt: string | null;
  dia_chi: string | null;
  ghi_chu: string | null;
  trang_thai: string;
  tong_tien: number;
  nguoi_tao_id: string; // Đã sửa từ nguoi_tao -> nguoi_tao_id cho khớp DB
  tao_luc: string;
  cap_nhat_luc: string;
}

// Interface khớp với DB bảng don_hang_chi_tiet
export interface OrderItem {
  id: string;
  don_hang_id: string;
  vat_tu_id: string | null;
  ten_item_hien_thi: string | null; // Sửa từ ten_san_pham -> ten_item_hien_thi
  so_luong: number;
  don_gia: number;
  thanh_tien?: number; // Có thể tính toán ở frontend
}

// Interface dữ liệu đầu vào khi tạo đơn (từ Form)
export interface CreateOrderData {
  ten_khach?: string;
  sdt?: string;
  dia_chi?: string;
  ghi_chu?: string;
  items: Array<{
    id?: string; // Thêm id (vat_tu_id) để trừ kho nếu cần
    ten_san_pham: string;
    so_luong: number;
    don_gia: number;
  }>;
}

export class OrderService {
  /**
   * Tạo đơn hàng mới (auto set nguoi_tao_id = auth.uid())
   */
  static async createOrder(data: CreateOrderData): Promise<string | null> {
    try {
      // 1. Tính tổng tiền
      const tongTien = data.items.reduce(
        (sum, item) => sum + item.so_luong * item.don_gia,
        0
      );

      // 2. Lấy User ID hiện tại
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 3. Insert đơn hàng (Header)
      const { data: orderData, error: orderError } = await supabase
        .from("don_hang")
        .insert({
          ten_khach: data.ten_khach,
          sdt: data.sdt,
          dia_chi: data.dia_chi,
          ghi_chu: data.ghi_chu,
          tong_tien: tongTien,
          trang_thai: "moi",
          nguoi_tao_id: user?.id, // Dùng nguoi_tao_id cho chuẩn
          // kenh_ban_hang: 'web' // Có thể thêm nếu cần
        })
        .select("id")
        .single();

      if (orderError) {
        LoggerService.error("OrderService", "Error creating order", orderError);
        return null;
      }

      // 4. Insert chi tiết đơn hàng (Items)
      if (data.items.length > 0) {
        const itemsToInsert = data.items.map((item) => ({
          don_hang_id: orderData.id,
          vat_tu_id: item.id || null, // Map ID vật tư nếu có
          ten_item_hien_thi: item.ten_san_pham, // Map sang cột đúng trong DB
          so_luong: item.so_luong,
          don_gia: item.don_gia,
        }));

        const { error: itemsError } = await supabase
          .from("don_hang_chi_tiet") // ✅ Đã sửa tên bảng đúng
          .insert(itemsToInsert);

        if (itemsError) {
          console.error("Error creating order items:", itemsError);
          // Lưu ý: Nếu insert items lỗi, có thể cần xóa đơn hàng header (rollback thủ công)
        }
      }

      return orderData.id;
    } catch (error) {
      console.error("OrderService.createOrder error:", error);
      return null;
    }
  }

  /**
   * Lấy danh sách đơn hàng của user hiện tại
   */
  static async getMyOrders(
    limit = 50
  ): Promise<{ orders: Order[]; error: string | null }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return { orders: [], error: "User not logged in" };

      // Lấy đơn hàng do user tạo HOẶC user là khách hàng (dựa trên id)
      // Ở đây ta tạm lấy theo nguoi_tao_id để đơn giản
      const { data, error } = await supabase
        .from("don_hang")
        .select("*")
        .eq("nguoi_tao_id", user.id)
        .order("tao_luc", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching orders:", error.message);
        return { orders: [], error: error.message };
      }

      return { orders: (data ?? []) as Order[], error: null };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("OrderService.getMyOrders error:", errorMsg);
      return { orders: [], error: errorMsg };
    }
  }

  /**
   * Lấy chi tiết đơn hàng (bao gồm items)
   */
  static async getOrderById(
    orderId: string
  ): Promise<{ order: Order; items: OrderItem[] } | null> {
    try {
      // Lấy Header
      const { data: orderData, error: orderError } = await supabase
        .from("don_hang")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) {
        console.error("Error fetching order:", orderError);
        return null;
      }

      // Lấy Items
      const { data: itemsData, error: itemsError } = await supabase
        .from("don_hang_chi_tiet") // ✅ Đã sửa tên bảng đúng
        .select("*")
        .eq("don_hang_id", orderId);

      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
        // Vẫn trả về order nhưng không có items
        return { order: orderData as Order, items: [] };
      }

      return {
        order: orderData as Order,
        items: itemsData as OrderItem[],
      };
    } catch (error) {
      console.error("OrderService.getOrderById error:", error);
      return null;
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  static async updateOrderStatus(
    orderId: string,
    trangThai: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("don_hang")
        .update({ trang_thai: trangThai })
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order status:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("OrderService.updateOrderStatus error:", error);
      return false;
    }
  }

  /**
   * Lấy đơn hàng gần nhất
   */
  static async getLatestOrder(): Promise<{
    order: Order | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("don_hang")
        .select("*")
        .order("tao_luc", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Có thể không có đơn hàng nào
        if (error.code === "PGRST116") return { order: null, error: null };

        console.error("Error fetching latest order:", error);
        return { order: null, error: error.message };
      }

      return { order: data as Order, error: null };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("OrderService.getLatestOrder error:", errorMsg);
      return { order: null, error: errorMsg };
    }
  }

  /**
   * Format trạng thái đơn hàng thành tiếng Việt
   */
  static formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      moi: "🆕 Mới",
      dang_xu_ly: "⏳ Đang xử lý",
      dang_giao: "🚚 Đang giao",
      hoan_thanh: "✅ Hoàn thành",
      huy: "❌ Đã hủy",
      dang_san_xuat: "🔨 Đang sản xuất",
    };
    return statusMap[status] || status;
  }

  /**
   * Format số tiền VND
   */
  static formatMoney(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }
}
