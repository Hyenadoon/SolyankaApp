import { existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'vite';

process.env.VITE_ROUTER_MODE ||= 'hash';
process.env.VITE_BASE_PATH ||= './';

await build();

for (const fileName of ['placeholder.png', 'placeholder2.png', 'placeholder.jpg', 'background.mp4']) {
  const source = join(process.cwd(), fileName);
  const destination = join(process.cwd(), 'dist', fileName);

  if (existsSync(source)) {
    copyFileSync(source, destination);
  }
}
