import type { NextConfig } from 'next';
import path from 'path';

const config: NextConfig = {
  output: 'standalone',
  // Monorepo: trace files from the repository root so the standalone build includes workspace packages
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@ridean/shared', '@ridean/web-core'],
  poweredByHeader: false,
  reactStrictMode: true,
};

export default config;
