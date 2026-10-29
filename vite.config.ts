import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {gateway} from './server/dev-gateway.mjs';
export default defineConfig({plugins:[react(),gateway()],base:'./'});
