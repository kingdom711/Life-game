import { preview } from 'vite';

await preview({
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});

setInterval(() => {}, 2147483647);
