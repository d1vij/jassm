import { defineConfig } from "bunup";

export default defineConfig({
    define: {
        "process.env.NODE_ENV": "'production'",
    },
    entry: ["src/index.ts", "src/vitePlugin.ts"],
    format: ["esm"],
    dts: true,
    splitting: true,
    external: [
        "vite",
        "react",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@mdx-js/rollup",
    ],
});
