import { preview } from 'vite';

await preview({
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
});

setInterval(() => {}, 2147483647);
