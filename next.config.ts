import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Другие настройки Next.js
  // Например:
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);