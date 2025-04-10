import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
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
        volunteer: {
          border: 'hsl(var(--volunteer-border))',
          input: 'hsl(var(--volunteer-input))',
          ring: 'hsl(var(--volunteer-ring))',
          background: 'hsl(var(--volunteer-background))',
          foreground: 'hsl(var(--volunteer-foreground))',
          primary: {
            DEFAULT: 'hsl(var(--volunteer-primary))',
            foreground: 'hsl(var(--volunteer-primary-foreground))',
          },
          secondary: {
            DEFAULT: 'hsl(var(--volunteer-secondary))',
            foreground: 'hsl(var(--volunteer-secondary-foreground))',
          },
          destructive: {
            DEFAULT: 'hsl(var(--volunteer-destructive))',
            foreground: 'hsl(var(--volunteer-destructive-foreground))',
          },
          muted: {
            DEFAULT: 'hsl(var(--volunteer-muted))',
            foreground: 'hsl(var(--volunteer-muted-foreground))',
          },
          accent: {
            DEFAULT: 'hsl(var(--volunteer-accent))',
            foreground: 'hsl(var(--volunteer-accent-foreground))',
          },
          popover: {
            DEFAULT: 'hsl(var(--volunteer-popover))',
            foreground: 'hsl(var(--volunteer-popover-foreground))',
          },
          card: {
            DEFAULT: 'hsl(var(--volunteer-card))',
            foreground: 'hsl(var(--volunteer-card-foreground))',
          },
          sidebar: {
            DEFAULT: 'hsl(var(--volunteer-sidebar-background))',
            foreground: 'hsl(var(--volunteer-sidebar-foreground))',
            primary: 'hsl(var(--volunteer-sidebar-primary))',
            'primary-foreground': 'hsl(var(--volunteer-sidebar-primary-foreground))',
            accent: 'hsl(var(--volunteer-sidebar-accent))',
            'accent-foreground': 'hsl(var(--volunteer-sidebar-accent-foreground))',
            border: 'hsl(var(--volunteer-sidebar-border))',
            ring: 'hsl(var(--volunteer-sidebar-ring))',
          },
          // New explicit volunteer colors with fixed values
          explicit: {
            DEFAULT: '#3CAEA3', // teal
            light: '#C5E8E5',
            dark: '#297F77',
            accent: '#F6D55C',    // warm yellow
            emergency: '#ED553B', // warm orange/red
            purple: '#8B5CF6',    // purple for highlights
            text: '#343434',
            'text-light': '#6B7280',
          },
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#F43F5E",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#4F46E5",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        "admin-background": 'hsl(var(--admin-background))',
        "admin-foreground": 'hsl(var(--admin-foreground))',
        "admin-card": 'hsl(var(--admin-card))',
        "admin-card-foreground": 'hsl(var(--admin-card-foreground))',
        "admin-popover": 'hsl(var(--admin-popover))',
        "admin-popover-foreground": 'hsl(var(--admin-popover-foreground))',
        "admin-primary": 'hsl(var(--admin-primary))',
        "admin-primary-foreground": 'hsl(var(--admin-primary-foreground))',
        "admin-secondary": 'hsl(var(--admin-secondary))',
        "admin-secondary-foreground": 'hsl(var(--admin-secondary-foreground))',
        "admin-muted": 'hsl(var(--admin-muted))',
        "admin-muted-foreground": 'hsl(var(--admin-muted-foreground))',
        "admin-accent": 'hsl(var(--admin-accent))',
        "admin-accent-foreground": 'hsl(var(--admin-accent-foreground))',
        "admin-destructive": 'hsl(var(--admin-destructive))',
        "admin-destructive-foreground": 'hsl(var(--admin-destructive-foreground))',
        "admin-border": 'hsl(var(--admin-border))',
        "admin-input": 'hsl(var(--admin-input))',
        "admin-ring": 'hsl(var(--admin-ring))',
        "admin-sidebar": {
          DEFAULT: 'hsl(var(--admin-sidebar-background))',
          foreground: 'hsl(var(--admin-sidebar-foreground))',
          primary: 'hsl(var(--admin-sidebar-primary))',
          'primary-foreground': 'hsl(var(--admin-sidebar-primary-foreground))',
          accent: 'hsl(var(--admin-sidebar-accent))',
          'accent-foreground': 'hsl(var(--admin-sidebar-accent-foreground))',
          border: 'hsl(var(--admin-sidebar-border))',
          ring: 'hsl(var(--admin-sidebar-ring))'
        },
        dashboard: {
          'blue': '#4361ee',
          'indigo': '#3a0ca3',
          'purple': '#7209b7',
          'pink': '#f72585',
          'green': '#4cc9f0',
          'yellow': '#ffb703',
          'red': '#e63946',
          'gray': '#8d99ae',
        },
        chart: {
          'blue': '#4361ee',
          'indigo': '#3a0ca3',
          'purple': '#7209b7',
          'pink': '#f72585',
          'green': '#4cc9f0',
          'yellow': '#ffb703',
          'red': '#e63946',
          'orange': '#fb8500',
          'teal': '#2ec4b6',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "admin-lg": "var(--admin-radius)",
        "admin-md": "calc(var(--admin-radius) - 2px)",
        "admin-sm": "calc(var(--admin-radius) - 4px)",
        'volunteer-lg': 'var(--volunteer-radius)',
        'volunteer-md': 'calc(var(--volunteer-radius) - 2px)',
        'volunteer-sm': 'calc(var(--volunteer-radius) - 4px)',
      },
      keyframes: {
        'pulse-subtle': {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.8' },
    },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "timeline-dot-pulse": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.5)", opacity: "0.5" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "border-beam": {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "200% 0%" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "wave": {
          "0%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-25%)" },
          "100%": { transform: "translateX(0)" },
        },
        "orbit": {
          "0%": { transform: "rotate(0deg) translateX(10px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(10px) rotate(-360deg)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "table-fade": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-opacity": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "fade-out-opacity": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" }
        },
        "slide-in-bottom": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" }
        },
        "floating": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" }
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "slide-right": {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" }
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(59, 130, 246, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.8)" }
        },
        "zoom-in-out": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "timeline-dot-pulse": "timeline-dot-pulse 2s infinite",
        "border-beam": "border-beam 3s linear infinite",
        "animate-float": "float 3s ease-in-out infinite",
        "animate-wave": "wave 3s ease-in-out infinite",
        "animate-orbit": "orbit 4s linear infinite",
        "fade-out": "fade-out 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "table-fade": "table-fade 0.5s ease-out",
        "fade-in-opacity": "fade-in-opacity 0.3s ease-out",
        "fade-out-opacity": "fade-out-opacity 0.3s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.4s ease-out",
        "pulse-soft": "pulse-soft 3s infinite ease-in-out",
        "floating": "floating 3s infinite ease-in-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-right": "slide-right 0.4s ease-out",
        "glow": "glow 2s infinite ease-in-out",
        "zoom-in-out": "zoom-in-out 3s infinite ease-in-out",
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-shimmer': 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.1) 20%, transparent 40%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;