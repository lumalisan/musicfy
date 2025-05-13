import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import clerk from '@clerk/astro';
import { dark } from '@clerk/themes';

// https://astro.build/config
export default defineConfig({
  integrations: [
    clerk({
      appearance: {
        baseTheme: [dark],
      },
    }),
    react(),
  ],
  adapter: netlify(),
  output: 'server',
  vite: {
    plugins: [tailwindcss()],
  },
});
