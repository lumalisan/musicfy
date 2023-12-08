/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        secondary: '#222831',
        primary: '#393E46',
        accent: '#FFD369',
      },
    },
  },
  safelist: [
    'bg-[#60371a]',
    'bg-[#86c7f8]',
    'bg-[#ed2377]',
    'bg-[#1e3a8a]',
    'bg-[#df24ff]',
    'bg-[#cc5400]',
    'bg-[#f2776f]',
    'bg-[#308f8d]',
  ],
  plugins: [],
};
