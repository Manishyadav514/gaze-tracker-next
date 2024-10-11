// nex-pwa config didn't work, getting typerror
// const isExport = process.env.NEXT_PHASE === 'phase-export';
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   disable: isExport || process.env.NODE_ENV === 'development',
//   register: true,
//   skipWaiting: true,
// });

// const nextConfig = {
//   reactStrictMode: true,
//   swcMinify: true,
//   output: isExport ? undefined : 'export',
//   compiler: {
//     removeConsole: process.env.NODE_ENV !== 'development',
//   },
// };

// module.exports = withPWA(nextConfig);

// next.config.js without PWA
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  compiler: {
    removeConsole: process.env.NODE_ENV !== 'development',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
