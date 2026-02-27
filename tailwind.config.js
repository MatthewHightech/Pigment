/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./theme.ts"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        backdrop: "rgba(0,0,0,0.45)",
        background: "#faf2e5",
        "dark-background": "#e4d2b6",
        surface: "#faf8f3",
        "surface-elevated": "#ffffff",
        "surface-overlay": "#1c1917",
        "surface-overlay-muted": "#292524",
        "overlay-button": "#44403c",
        "text-primary": "#1c1917",
        "text-secondary": "#57534e",
        "text-tertiary": "#78716c",
        "text-inverse": "#fafaf9",
        border: "#e7e5e4",
        "border-strong": "#d6d3d1",
        primary: "#b45309",
        "primary-foreground": "#ffffff",
        destructive: "#b91c1c",
        "destructive-foreground": "#ffffff",
        muted: "#f0ebe3",
        "muted-foreground": "#78716c",
      },
      borderRadius: {
        sm: "10px",
        DEFAULT: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
    },
  },
  plugins: [],
}

