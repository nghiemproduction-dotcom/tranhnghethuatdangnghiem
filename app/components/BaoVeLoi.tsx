'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class BaoVeLoi extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Khi có lỗi, cập nhật state để render UI thay thế
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Ghi log lỗi (có thể mở rộng gửi về server)
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("💥 UI CÓ LỖI:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 🟢 GIAO DIỆN KHI BỊ LỖI (Vẫn chừa chỗ cho nút Sửa Code hiển thị)
      return (
        <div className="w-full h-[80vh] flex flex-col items-center justify-center p-8 text-center space-y-4 border-2 border-dashed border-red-500/30 rounded-2xl bg-red-900/10 m-4">
          <div className="p-4 bg-red-500/20 rounded-full text-red-500 animate-pulse">
             <AlertTriangle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-red-500">Giao diện khu vực này bị lỗi!</h2>
          <p className="text-gray-400 max-w-lg">
            Đừng lo, trình sửa code vẫn hoạt động. Hãy dùng nút <b className="text-blue-400">Code: ...</b> ở góc trái dưới để mở file và sửa lỗi.
          </p>
          
          {/* Hiện chi tiết lỗi để biết đường mà sửa */}
          <div className="w-full max-w-2xl bg-black/50 p-4 rounded-lg text-left overflow-auto max-h-40 border border-red-500/30">
            <code className="text-xs text-red-300 font-mono whitespace-pre-wrap">
              {this.state.error?.toString()}
            </code>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}