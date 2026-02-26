/**
 * Type aware MDX File and Exports registry
 * All components can be directly imported and loaded in React.Suspense without the Promise shenanigans
 * Has 'dev time' as well as compile time safety
 */

import { lazy, type ExoticComponent } from "react";

/**
 * File extension(s) to accept
 */
export type MDXFile = `${string}.mdx`;

/**
 *  Type of value returned in the object of `import.meta.glob`
 */
type ImportedModule = () => Promise<{ default: React.ComponentType }>;

// Expands the object type so that its visible on hover
type MustStartWithSlash<T extends string> = T extends `/${string}` ? T : never;
type MustNotEndWithSlash<T extends string> = T extends `${string}/` ? never : T;

/**
 * Options passed to {@link generateRegistries}
 */
export type MDXRegistryOptions<
    /**
     * Source
     */
    S extends string,
    /**
     * Mount on
     */
    M extends string,
    /**
     * Record
     */
    R extends Record<string, string>,
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

export type RegistryKey<
    S extends string,
    M extends string,
    R extends Record<string, string>,
> = keyof RegistryOf<unknown, S, M, R>;

/**
 * Constructor for any generic registry with keys in the format of `mount-path/virtual-path` for each virual path passed in {@link MDXRegistryOptions.records}
 */
export type RegistryOf<
    T,
    S extends string,
    M extends string,
    R extends Record<string, string>,
> = {
    [K in keyof MDXRegistryOptions<
        S,
        M,
        R
    >["records"] as `${MDXRegistryOptions<S, M, R>["mountOn"]}${Extract<K, string>}`]: T;
};

/**
 * Registry of react components
 */
export type ComponentRegistry<
    S extends string,
    M extends string,
    R extends Record<string, string>,
> = RegistryOf<React.LazyExoticComponent<React.ComponentType>, S, M, R>;

/**
 * Registry of promise objects equivalent to return type of `import(<path>)`
 */
export type ExportsRegistry<
    S extends string,
    M extends string,
    R extends Record<string, string>,
> = RegistryOf<Promise<Record<string, unknown>>, S, M, R>;

/**
 * Function to generate Registry mappings, use {@link Registry} class instead of this.
 * @param MDXRegistryOptions
 * @returns Tuple of [{@link ComponentRegistry}, {@link ExportsRegistry}]
 */
export function generateRegistries<
    S extends string,
    M extends string,
    R extends Record<string, string>,
>({
    modules,
    source,
    mountOn,
    records,
}: MDXRegistryOptions<S, M, R>): [
    ComponentRegistry<S, M, R>,
    ExportsRegistry<S, M, R>,
] {
    const components = [];
    const exports = [];

    for (const [virtual, path] of Object.entries(records)) {
        const src = `${source}${path}`;
        const loader = modules[src] as ImportedModule;
        if (!loader) {
            throw new Error(`No such file exsits as ${src}`);
        }

        components.push([`${mountOn}${virtual}`, lazy(loader)]);
        exports.push([`${mountOn}${virtual}`, import(src)]);
    }

    return [Object.fromEntries(components), Object.fromEntries(exports)];
}

/**
 * The returned export object has the type of {@link React.ComponentType} + whatever user passes
 */
export type ExportSingleType<T> = T & { default: React.ComponentType };
export type ExportAllType<T> = {
    [K in keyof T]: ExportSingleType<T[K]>;
};

/**
 * Wrapper class over {@link generateRegistries}. Provides methods to access components and exports from typesafe keys
 */
export class Registry<
    S extends string,
    M extends string,
    R extends Record<string, string>,
> {
    private readonly components: ComponentRegistry<S, M, R>;
    private readonly exports: ExportsRegistry<S, M, R>;

    constructor(registryOpts: MDXRegistryOptions<S, M, R>) {
        [this.components, this.exports] = generateRegistries<S, M, R>(
            registryOpts,
        );
    }

    public getComponent(
        key: RegistryKey<S, M, R>,
    ): ComponentRegistry<S, M, R>[RegistryKey<S, M, R>] {
        // this shouldnt be undefined since build time safety
        // from invalid paths is provided by vite
        return this.components[key];
    }

    public getComponents(): ComponentRegistry<S, M, R> {
        return this.components;
    }

    public getExport<T extends object = object>(
        key: RegistryKey<S, M, R>,
    ): ExportSingleType<T> {
        return this.exports[key] as ExportSingleType<T>;
    }
    public getExports<
        T extends Record<RegistryKey<S, M, R>, object> = Record<
            RegistryKey<S, M, R>,
            object
        >,
    >(): ExportAllType<T> {
        return this.exports as unknown as ExportAllType<T>;
    }
}
