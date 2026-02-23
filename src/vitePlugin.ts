import mdx, { type Options as MDXOptions } from "@mdx-js/rollup";
import type { Plugin } from "vite";

/**
 * Vite plugin to support MDX conversion.
 * Users wont have to explicitly setup their vite config
 */
export function MDXLoaderPlugin(opts?: MDXOptions): Plugin {
    return mdx(opts);
}

export default MDXLoaderPlugin;
