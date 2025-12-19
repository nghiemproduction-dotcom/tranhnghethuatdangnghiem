export const SUPABASE_TYPES = [
    {
        group: '1. Định danh & Khóa chính',
        types: [
            { value: 'uuid', label: 'UUID (Khóa chính chuẩn)' },
            { value: 'int8', label: 'BigInt (Số nguyên lớn)' },
            { value: 'int4', label: 'Integer (Số nguyên thường)' },
        ]
    },
    {
        group: '2. Chuỗi & Văn bản',
        types: [
            { value: 'text', label: 'Text (Văn bản dài)' },
            { value: 'varchar', label: 'Varchar (Có giới hạn)' },
            { value: 'char', label: 'Char (Cố định)' },
        ]
    },
    {
        group: '3. Số học & Tiền tệ',
        types: [
            { value: 'numeric', label: 'Numeric (Tiền tệ/Chính xác)' },
            { value: 'float8', label: 'Float8 (Số thực lớn)' },
            { value: 'float4', label: 'Float4 (Số thực nhỏ)' },
            { value: 'int2', label: 'SmallInt (Số rất nhỏ)' },
        ]
    },
    {
        group: '4. Thời gian & Ngày tháng',
        types: [
            { value: 'timestamptz', label: 'Datetime (Có múi giờ)' },
            { value: 'timestamp', label: 'Timestamp (Không múi giờ)' },
            { value: 'date', label: 'Date (Ngày tháng)' },
            { value: 'time', label: 'Time (Giờ phút)' },
        ]
    },
    {
        group: '5. Logic & Dữ liệu phức tạp',
        types: [
            { value: 'boolean', label: 'Boolean (Đúng/Sai)' },
            { value: 'jsonb', label: 'JSONB (Dữ liệu động/NoSQL)' },
            { value: 'json', label: 'JSON (Lưu text thuần)' },
            { value: 'text[]', label: 'Array (Mảng Link/Tag)' }, // Quan trọng: Đã fix lỗi array
            { value: 'vector', label: 'Vector (AI Embeddings)' },
        ]
    }
];