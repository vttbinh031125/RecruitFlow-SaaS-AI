import type { NextConfig } from 'next';
import { loadEnvConfig } from '@next/env';
loadEnvConfig('../..');
const config: NextConfig = {
  transpilePackages: ['@recruitflow/shared'],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_TARGET || 'http://127.0.0.1:3000'}/api/:path*`,
      },
    ];
  },
};
export default config;
