-- Tạo RPC để lấy schema bảng
-- Chạy script này trong Supabase SQL Editor

-- Xóa function cũ nếu tồn tại
DROP FUNCTION IF EXISTS get_table_columns(text);
DROP FUNCTION IF EXISTS get_table_schema(text);

-- 1. RPC get_table_columns (đơn giản)
CREATE OR REPLACE FUNCTION get_table_columns(t_name text)
RETURNS TABLE(column_name text, data_type text, is_nullable text) AS $$
BEGIN
    RETURN QUERY
    SELECT c.column_name::text, c.data_type::text, c.is_nullable::text
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = t_name
    ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RPC get_table_schema (chi tiết hơn, cho useDuLieuLevel3)
CREATE OR REPLACE FUNCTION get_table_schema(t_name text)
RETURNS TABLE(
    column_name text,
    data_type text,
    is_nullable text,
    column_default text,
    character_maximum_length int,
    numeric_precision int,
    numeric_scale int
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text,
        c.column_default::text,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = t_name
    ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;