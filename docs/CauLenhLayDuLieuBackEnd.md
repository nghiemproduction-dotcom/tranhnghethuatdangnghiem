-- ============================================================
-- GENERATE AI CONTEXT (MARKDOWN FORMAT)
-- Chạy cái này -> Copy kết quả -> Paste cho AI
-- ============================================================

SELECT 
    E'# DATABASE SCHEMA DOCUMENTATION\n\n' ||
    string_agg(
        E'## Table: ' || table_name || E'\n' ||
        '| Column | Type | Nullable | Default | Extra |\n' ||
        '|---|---|---|---|---|\n' ||
        columns_info || E'\n' ||
        CASE WHEN constraints_info IS NOT NULL THEN E'> Constraints:\n' || constraints_info || E'\n' ELSE '' END ||
        E'\n',
        E'\n'
    )
FROM (
    SELECT 
        t.table_name,
        string_agg(
            '| ' || c.column_name || 
            ' | ' || c.data_type || 
            ' | ' || c.is_nullable || 
            ' | ' || COALESCE(LEFT(c.column_default, 20) || '...', '-') || 
            ' | ' || 
            CASE 
                WHEN pk.column_name IS NOT NULL THEN '🔑 PK' 
                WHEN fk.column_name IS NOT NULL THEN '🔗 FK -> ' || fk.foreign_table_name || '.' || fk.foreign_column_name
                ELSE '' 
            END || ' |',
            E'\n' ORDER BY c.ordinal_position
        ) as columns_info,
        (
            SELECT string_agg('- ' || con.constraint_type || ': ' || con.constraint_name, E'\n')
            FROM information_schema.table_constraints con
            WHERE con.table_name = t.table_name AND con.table_schema = 'public' AND con.constraint_type != 'PRIMARY KEY' -- PK đã hiện ở cột rồi
        ) as constraints_info
    FROM information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
    
    -- Lấy thông tin Primary Key
    LEFT JOIN (
        SELECT kcu.table_name, kcu.column_name
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
    ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name

    -- Lấy thông tin Foreign Key
    LEFT JOIN (
        SELECT 
            kcu.table_name, kcu.column_name, 
            ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
    ) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name

    WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
    GROUP BY t.table_name
) as schema_generator;