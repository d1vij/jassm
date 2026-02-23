import { defineConfig } from "bunup";

export default defineConfig({
    entry: ["src/index.tsx", "src/vitePlugin.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    splitting: false,
    external: [
        "react",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@mdx-js/rollup",
    ],
});
