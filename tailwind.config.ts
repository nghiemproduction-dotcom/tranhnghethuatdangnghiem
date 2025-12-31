import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // 👈 Dòng này quan trọng nhất
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Lora', 'system-ui', 'sans-serif'],
        'mono': ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;