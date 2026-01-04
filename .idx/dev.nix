{ pkgs, ... }: {
  # 1. Chọn kênh phần mềm ổn định
  channel = "stable-24.05";

  # 2. Cài đặt công cụ hệ thống (Node.js 20 là chuẩn cho Next.js mới)
  packages = [
    pkgs.nodejs_20
  ];

  # 3. Cấu hình các biến môi trường hệ thống (nếu cần)
  env = {};

  # 4. Cấu hình IDX
  idx = {
    # Tự động cài Extension xịn cho Next.js/React
    extensions = [
      "dbaeumer.vscode-eslint"       # Bắt lỗi code
      "esbenp.prettier-vscode"       # Format code đẹp
      "bradlc.vscode-tailwindcss"    # Nếu bạn dùng Tailwind (nên có)
    ];

    # --- TỰ ĐỘNG HÓA (Thêm cái này cho nhàn) ---
    workspace = {
      # Chạy khi tạo mới workspace (lần đầu tiên clone về)
      onCreate = {
        npm-install = "npm install --no-audit --prefer-offline";
      };
      # Chạy mỗi khi mở lại workspace (Start)
      onStart = {
        # Có thể thêm lệnh gì đó nếu thích, ví dụ: git pull
      };
    };

    # --- PREVIEW (Đoạn code chuẩn của bạn) ---
    previews = {
      enable = true;
      previews = {
        web = {
          command = [
            "npm"
            "run"
            "dev"
            "--"
            "--port"
            "$PORT"
            "--hostname"
            "0.0.0.0"
          ];
          manager = "web";
        };
      };
    };
  };
}