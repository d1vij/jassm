import { defineConfig } from "bunup";

export default defineConfig({
    define: {
        "process.env.NODE_ENV": "'production'",
    },
    entry: ["src/index.ts", "src/vitePlugin.ts"],
    format: ["esm"],
    dts: true,
    minify: true,
    clean: true,
    splitting: true,
    external: [
        "react",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@mdx-js/rollup",
    ],
});
