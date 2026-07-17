import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Static export — the site is deployed as static assets on Cloudflare Workers
  output: 'export',
  turbopack: {
    root: import.meta.dirname,
  },
};

export default withMDX(config);
