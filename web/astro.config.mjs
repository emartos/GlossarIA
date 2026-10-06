import { defineConfig, passthroughImageService } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  image: {
    service: passthroughImageService(),
  },
  srcDir: 'src',
  publicDir: 'public',
});
