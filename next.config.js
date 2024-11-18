const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  compiler: {
    removeConsole: process.env.NODE_ENV !== 'development',
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        encoding: require.resolve('encoding'), // Alias encoding
      };
    }

    config.module.rules.push({
      test: /face-api\.js$/,
      use: 'null-loader',
    });

    return config;
  },
};

module.exports = nextConfig;
