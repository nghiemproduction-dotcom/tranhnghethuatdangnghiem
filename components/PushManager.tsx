'use client';
import React, { useEffect, useState } from 'react';
import { useUser } from '@/lib/UserContext';
import { BellRing, Loader2 } from 'lucide-react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// Hàm chuyển đổi key VAPID
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushManager() {
    const { user } = useUser();
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            registerServiceWorker();
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none',
            });
            
            // Check nếu đã subscribe rồi
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
        } catch (error) {
            console.error('Service Worker Error:', error);
        }
    };

    const subscribeToPush = async () => {
        if (!user || !VAPID_PUBLIC_KEY) return;
        setLoading(true);

        try {
            const registration = await navigator.serviceWorker.ready;
            
            // 1. Yêu cầu trình duyệt cấp quyền (Nó sẽ hiện popup của Chrome/Safari)
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // 2. Gửi về Server lưu lại
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: sub,
                    user_id: user.id,
                    user_agent: navigator.userAgent
                })
            });

            setSubscription(sub);
            alert("Đã bật thông báo thành công! Bạn sẽ nhận được tin tức mới nhất ngay trên màn hình khóa.");
        } catch (error) {
            console.error('Subscription failed:', error);
            alert("Vui lòng kiểm tra lại quyền thông báo trong cài đặt trình duyệt.");
        } finally {
            setLoading(false);
        }
    };

    // Nếu chưa hỗ trợ, hoặc đã đăng ký rồi thì ẩn
    if (!isSupported || subscription || !user) return null;

    return (
        <div className="fixed bottom-24 left-6 z-[8000] animate-in slide-in-from-left duration-500">
            <button 
                onClick={subscribeToPush}
                disabled={loading}
                className="flex items-center gap-3 px-4 py-3 bg-[#C69C6D] hover:bg-white text-black font-bold rounded-xl shadow-[0_0_20px_rgba(198,156,109,0.4)] transition-all active:scale-95 group"
            >
                <div className="bg-black/10 p-1.5 rounded-full">
                    {loading ? <Loader2 size={16} className="animate-spin"/> : <BellRing size={16} className="animate-wiggle"/>}
                </div>
                <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider opacity-70">Đừng bỏ lỡ</p>
                    <p className="text-xs font-black">BẬT THÔNG BÁO ĐẨY</p>
                </div>
            </button>
            <style jsx>{`
                @keyframes wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
                .animate-wiggle { animation: wiggle 0.3s ease-in-out infinite; }
            `}</style>
        </div>
    );
}