import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        panel: "#101826",
        line: "#243041",
        accentA: "#60a5fa",
        accentB: "#f472b6",
        positive: "#34d399",
        neutral: "#94a3b8",
        negative: "#fb7185"
      }
    }
  },
  plugins: []
};

export default config;
