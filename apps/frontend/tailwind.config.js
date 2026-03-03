/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#014d33",
          hover: "#01402b",
        },
        accent: {
          DEFAULT: "#ec494a",
          hover: "#d43d3e",
        },
        light: {
          DEFAULT: "#f0f9f6",
        }
      }
    },
  },
  plugins: [],
}

