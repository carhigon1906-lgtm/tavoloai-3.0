/** @type {import('next').NextConfig} */
const path = require("path")

const ortEntry = require.resolve("onnxruntime-web")
const ortRoot = path.dirname(path.dirname(ortEntry))
const ortMin = path.join(ortRoot, "dist/ort.min.js")
const ortWebgpuMin = path.join(ortRoot, "dist/ort.webgpu.min.js")

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
      "onnxruntime-web$": ortMin,
      "onnxruntime-web/webgpu$": ortWebgpuMin,
    };
    config.experiments = { ...(config.experiments || {}), asyncWebAssembly: true, topLevelAwait: true };
    config.module.rules.push({ test: /\.wasm$/, type: "webassembly/async" });
    return config;
  },
};

module.exports = nextConfig;


