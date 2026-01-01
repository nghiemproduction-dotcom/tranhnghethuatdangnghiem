-- FIX 2: Kiểm tra xem có notifications nào và user_id match không
SELECT 
    COUNT(*) as total_notifications,
    COUNT(DISTINCT user_id) as unique_users,
    user_id
FROM notifications
GROUP BY user_id
ORDER BY COUNT(*) DESC
LIMIT 10;
