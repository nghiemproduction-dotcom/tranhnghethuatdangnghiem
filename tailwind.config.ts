import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 🟢 CẬP NHẬT: Sử dụng biến CSS từ Next.js Font
        // Class 'font-serif' sẽ dùng Playfair Display (có tiếng Việt)
        serif: ["var(--font-playfair)", "ui-serif", "Georgia", "serif"],

        // Class 'font-sans' sẽ dùng Inter (có tiếng Việt)
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],

        // Giữ nguyên mono hoặc tùy chỉnh thêm nếu cần
        mono: ["Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
