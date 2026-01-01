// public/sw.js

self.addEventListener('push', function (event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  const data = event.data?.json() ?? {};
  const title = data.title || 'NghiemArt Thông Báo';
  const message = data.body || 'Bạn có thông báo mới';
  const icon = '/icon-192.png'; // Đảm bảo mày có icon này
  const badge = '/icon-192.png'; // Icon nhỏ trên thanh status (Android)
  const url = data.url || '/';

  const options = {
    body: message,
    icon: icon,
    badge: badge,
    data: { url: url }, // Lưu URL để click vào
    vibrate: [100, 50, 100], // Rung bần bật: Rung 100ms, nghỉ 50ms, rung 100ms
    actions: [
      { action: 'open', title: 'Xem ngay' },
      { action: 'close', title: 'Đóng' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Nếu app đang mở -> Focus vào nó
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Nếu app chưa mở -> Mở tab mới
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});