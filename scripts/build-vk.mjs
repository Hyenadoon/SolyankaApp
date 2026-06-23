import { build } from 'vite';

process.env.VITE_ROUTER_MODE ||= 'hash';
process.env.VITE_BASE_PATH ||= './';

await build();
