/** @type {import('next').NextConfig} */
const path = require("path")

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
      "onnxruntime-web": path.resolve(__dirname, "node_modules/onnxruntime-web/dist/ort.min.js"),
      "onnxruntime-web/webgpu": path.resolve(__dirname, "node_modules/onnxruntime-web/dist/ort.webgpu.min.js"),
    };
    config.experiments = { ...(config.experiments || {}), asyncWebAssembly: true, topLevelAwait: true };
    config.module.rules.push({ test: /\.wasm$/, type: "webassembly/async" });
    return config;
  },
};

module.exports = nextConfig;


