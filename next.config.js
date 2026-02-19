/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    esmExternals: "loose",
  },
  transpilePackages: ["@imgly/background-removal", "onnxruntime-web"],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "onnxruntime-web": require.resolve("onnxruntime-web"),
      "onnxruntime-web/webgpu": require.resolve("onnxruntime-web/webgpu"),
    };
    config.experiments = { ...(config.experiments || {}), asyncWebAssembly: true, topLevelAwait: true };
    config.module.rules.push({ test: /\.wasm$/, type: "webassembly/async" });
    return config;
  },
};

module.exports = nextConfig;


