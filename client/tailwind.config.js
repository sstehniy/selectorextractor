/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "rgb(250, 250, 250)",
          100: "rgb(245, 245, 245)",
          200: "rgb(229, 229, 229)",
          300: "rgb(212, 212, 212)",
          400: "rgb(163, 163, 163)",
          500: "rgb(115, 115, 115)",
          600: "rgb(38, 38, 38)",
          700: "rgb(64, 64, 64)",
          800: "rgb(38, 38, 38)",
          900: "rgb(23, 23, 23)",
        },
        neutral: {
          0: "rgb(255, 255, 255)",
          50: "rgb(250, 250, 250)",
          100: "rgb(245, 245, 245)",
          200: "rgb(229, 229, 229)",
          300: "rgb(212, 212, 212)",
          400: "rgb(163, 163, 163)",
          500: "rgb(115, 115, 115)",
          600: "rgb(82, 82, 82)",
          700: "rgb(64, 64, 64)",
          800: "rgb(38, 38, 38)",
          900: "rgb(23, 23, 23)",
          950: "rgb(10, 10, 10)",
        },
        error: {
          50: "rgb(254, 242, 242)",
          100: "rgb(254, 226, 226)",
          200: "rgb(254, 202, 202)",
          300: "rgb(252, 165, 165)",
          400: "rgb(248, 113, 113)",
          500: "rgb(239, 68, 68)",
          600: "rgb(220, 38, 38)",
          700: "rgb(185, 28, 28)",
          800: "rgb(153, 27, 27)",
          900: "rgb(127, 29, 29)",
        },
        warning: {
          50: "rgb(240, 249, 255)",
          100: "rgb(224, 242, 254)",
          200: "rgb(186, 230, 253)",
          300: "rgb(125, 211, 252)",
          400: "rgb(56, 189, 248)",
          500: "rgb(14, 165, 233)",
          600: "rgb(2, 132, 199)",
          700: "rgb(3, 105, 161)",
          800: "rgb(7, 89, 133)",
          900: "rgb(12, 74, 110)",
        },
        success: {
          50: "rgb(240, 253, 244)",
          100: "rgb(220, 252, 231)",
          200: "rgb(187, 247, 208)",
          300: "rgb(134, 239, 172)",
          400: "rgb(74, 222, 128)",
          500: "rgb(34, 197, 94)",
          600: "rgb(22, 163, 74)",
          700: "rgb(21, 128, 61)",
          800: "rgb(22, 101, 52)",
          900: "rgb(20, 83, 45)",
        },
        "brand-primary": "rgb(38, 38, 38)",
        "default-font": "rgb(23, 23, 23)",
        "subtext-color": "rgb(115, 115, 115)",
        "neutral-border": "rgb(229, 229, 229)",
        white: "rgb(255, 255, 255)",
        "default-background": "rgb(255, 255, 255)",
        // Keep shadcn/ui compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      fontSize: {
        caption: [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "400",
            letterSpacing: "0em",
          },
        ],
        "caption-bold": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "500",
            letterSpacing: "0em",
          },
        ],
        body: [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "400",
            letterSpacing: "0em",
          },
        ],
        "body-bold": [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "500",
            letterSpacing: "0em",
          },
        ],
        "heading-3": [
          "16px",
          {
            lineHeight: "20px",
            fontWeight: "600",
            letterSpacing: "0em",
          },
        ],
        "heading-2": [
          "20px",
          {
            lineHeight: "24px",
            fontWeight: "600",
            letterSpacing: "0em",
          },
        ],
        "heading-1": [
          "30px",
          {
            lineHeight: "36px",
            fontWeight: "600",
            letterSpacing: "0em",
          },
        ],
        "monospace-body": [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "400",
            letterSpacing: "0em",
          },
        ],
      },
      fontFamily: {
        caption: "Figtree",
        "caption-bold": "Figtree",
        body: "Figtree",
        "body-bold": "Figtree",
        "heading-3": "Figtree",
        "heading-2": "Figtree",
        "heading-1": "Figtree",
        "monospace-body": "monospace",
      },
      boxShadow: {
        sm: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
        default: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
        md: "0px 4px 16px -2px rgba(0, 0, 0, 0.08), 0px 2px 4px -1px rgba(0, 0, 0, 0.08)",
        lg: "0px 12px 32px -4px rgba(0, 0, 0, 0.08), 0px 4px 8px -2px rgba(0, 0, 0, 0.08)",
        overlay:
          "0px 12px 32px -4px rgba(0, 0, 0, 0.08), 0px 4px 8px -2px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        DEFAULT: "8px",
        lg: "12px",
        full: "9999px",
        // Keep shadcn/ui compatibility
        "shadcn-lg": "var(--radius)",
        "shadcn-md": "calc(var(--radius) - 2px)",
        "shadcn-sm": "calc(var(--radius) - 4px)",
      },
      container: {
        padding: {
          DEFAULT: "16px",
          sm: "calc((100vw + 16px - 640px) / 2)",
          md: "calc((100vw + 16px - 768px) / 2)",
          lg: "calc((100vw + 16px - 1024px) / 2)",
          xl: "calc((100vw + 16px - 1280px) / 2)",
          "2xl": "calc((100vw + 16px - 1536px) / 2)",
        },
      },
      spacing: {
        112: "28rem",
        144: "36rem",
        192: "48rem",
        256: "64rem",
        320: "80rem",
      },
      screens: {
        mobile: {
          max: "767px",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
