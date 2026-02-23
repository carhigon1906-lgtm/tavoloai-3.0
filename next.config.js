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
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "tavoloai.it" }],
        destination: "https://www.tavoloai.it/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "tavolo.ai" }],
        destination: "https://www.tavoloai.it/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.tavolo.ai" }],
        destination: "https://www.tavoloai.it/:path*",
        permanent: true,
      },
    ];
  },
  experimental: {
    esmExternals: "loose",
  },
  transpilePackages: ["@bunnio/rembg-web", "onnxruntime-web"],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "onnxruntime-node": false,
      "onnxruntime-web$": ortMin,
      "onnxruntime-web/webgpu$": ortWebgpuMin,
    };
    config.experiments = { ...(config.experiments || {}), asyncWebAssembly: true, topLevelAwait: true };
    config.module.rules.push({ test: /\.wasm$/, type: "webassembly/async" });
    config.module.rules.push({ test: /\.node$/, type: "asset/resource" });
    return config;
  },
};

module.exports = nextConfig;


