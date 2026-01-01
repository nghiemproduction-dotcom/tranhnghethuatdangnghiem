-- QUERY 2B: Get detailed policy definitions with USING and WITH CHECK clauses
SELECT 
    policyname,
    cmd,
    COALESCE(qual, 'No USING clause') as using_clause,
    COALESCE(with_check, 'No WITH CHECK clause') as with_check_clause
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (policyname LIKE '%avatar%' OR policyname LIKE '%Avatar%' OR policyname LIKE '%Upload%' OR policyname LIKE '%Allow%')
ORDER BY policyname;
