import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#173F34",
          light: "#215345",
          dark: "#0F2A23",
        },
        sage: {
          DEFAULT: "#E9EDE5",
          light: "#F3F6F0",
          dark: "#D2DAD0",
        },
        ivory: {
          DEFAULT: "#F8F6F0",
          pure: "#FCFBF9",
          muted: "#EDE9DF",
        },
        earth: {
          DEFAULT: "#B69B73",
          light: "#C7B08D",
          dark: "#9E825A",
        },
        olive: {
          DEFAULT: "#68776B",
          light: "#829285",
          dark: "#4E5B50",
        },
        charcoal: {
          DEFAULT: "#1E3029",
          soft: "#2C3D36",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 4px 20px -2px rgba(23, 63, 52, 0.06)",
        card: "0 10px 30px -4px rgba(23, 63, 52, 0.08)",
        elevated: "0 20px 40px -6px rgba(23, 63, 52, 0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;
