/**
 * Type aware MDX File registry
 * All components can be directly imported and loaded in React.Suspense without the Promise shenanigans
 */

import { lazy } from "react";

/**
 * File extension(s) to accept
 */
export type MDXFile = `${string}.mdx`;

/**
 * Generated registry type
 */
export type LazyRegistry<T extends Record<string, MDXFile>> = {
    readonly [K in keyof T]: React.LazyExoticComponent<React.ComponentType>;
};

// Expands the object type so that its visible on hover
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
type MustStartWithSlash<T extends string> = T extends `/${string}` ? T : never;
type MustNotEndWithSlash<T extends string> = T extends `${string}/` ? never : T;

/**
 *  Type of value returned in the object of `import.meta.glob`
 */
type ImportedModule = () => Promise<{ default: React.ComponentType }>;

/**
 * Function to generate Registry mappings
 * @param MDXRegistryOptions
 * @returns
 */
export function generateRegistry<
    S extends string,
    M extends string,
    R extends Record<string, string>,
>({
    modules,
    source,
    mountOn,
    records,
}: MDXRegistryOptions<S, M, R>): Expand<
    LazyRegistry<{
        [K in keyof typeof records as `${typeof mountOn}${Extract<K, string>}`]: MDXFile;
    }>
> {
    const paths = [];
    for (const [virtual, path] of Object.entries(records)) {
        const src = `${source}${path}`;
        const loader = modules[src] as ImportedModule;
        if (!loader) {
            throw new Error(`No such file exsits as ${src}`);
        }

        paths.push([`${mountOn}${virtual}`, lazy(loader)]);
    }

    return Object.fromEntries(paths);
}

/**
 * Options passed to {@link generateRegistry}
 */
export type MDXRegistryOptions<
    S extends string = string,
    M extends string = string,
    R extends Record<string, string> = Record<string, string>,
> = {
    /**
     * Module object returned from `import.meta.glob`
     * @example import.module.glob("/src/assets/mdx/**\/*.mdx")
     */
    modules: Record<string, () => Promise<unknown>>;
    /**
     *  Directory from which to resolve the source paths in {@link MDXRegistryOptions.records}
     */
    source: MustNotEndWithSlash<S> & MustStartWithSlash<S>;
    /**
     * Virtual base path on which to mount the key of {@link MDXRegistryOptions.records}
     */
    mountOn: MustNotEndWithSlash<M> & MustStartWithSlash<M>;
    /**
     * Mappings of virtual path to file paths under {@link MDXRegistryOptions.source}
     */
    records: {
        // if key is a string
        [K in keyof R]: K extends string
            ? // it shouldnt end with slash and should start with slash
              MustNotEndWithSlash<K> & MustStartWithSlash<K> extends never
                ? // if the above condition is false, it shouldnt exist
                  never
                : // if key is valid, check if value is valid
                  R[K] extends MustStartWithSlash<R[K]> & MDXFile
                  ? R[K]
                  : // if it isint, it shouldnt exist
                    never
            : // if the key is not a stirng, it shouldnt exist
              never;
    };
};
