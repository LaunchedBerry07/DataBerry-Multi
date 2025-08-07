import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(264, 89%, 95%)",
          100: "hsl(264, 89%, 90%)",
          500: "hsl(264, 89%, 71%)",
          600: "hsl(261, 85%, 60%)",
          700: "hsl(261, 85%, 43%)",
          900: "hsl(261, 85%, 25%)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Berry theme colors
        purple: {
          50: "hsl(264, 89%, 95%)",
          100: "hsl(264, 89%, 90%)",
          500: "hsl(264, 89%, 71%)",
          600: "hsl(261, 85%, 60%)",
          700: "hsl(261, 85%, 43%)",
          900: "hsl(261, 85%, 25%)",
        },
        cyan: {
          50: "hsl(190, 100%, 95%)",
          100: "hsl(190, 100%, 90%)",
          400: "hsl(190, 100%, 69%)",
          500: "hsl(190, 100%, 59%)",
          600: "hsl(190, 100%, 49%)",
          700: "hsl(221, 100%, 54%)",
        },
        pink: {
          50: "hsl(330, 100%, 95%)",
          100: "hsl(330, 100%, 90%)",
          400: "hsl(330, 100%, 78%)",
          500: "hsl(330, 100%, 68%)",
          600: "hsl(330, 100%, 58%)",
          700: "hsl(330, 75%, 43%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        'modern': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'modern-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
        'purple-gradient': 'linear-gradient(135deg, hsl(264, 89%, 71%) 0%, hsl(261, 85%, 43%) 100%)',
        'cyan-gradient': 'linear-gradient(135deg, hsl(190, 100%, 59%) 0%, hsl(221, 100%, 54%) 100%)',
        'pink-gradient': 'linear-gradient(135deg, hsl(330, 100%, 68%) 0%, hsl(330, 75%, 43%) 100%)',
        'berry-gradient': 'linear-gradient(135deg, hsl(264, 89%, 71%) 0%, hsl(190, 100%, 59%) 50%, hsl(330, 100%, 68%) 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
