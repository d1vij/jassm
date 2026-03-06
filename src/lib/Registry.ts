/**
 * Type aware MDX registry built around `import.meta.glob`.
 *
 * Features:
 * - Derives route keys from file paths at compile time
 * - Lazy-loads MDX React components for use inside `React.Suspense`
 * - Provides strongly typed access to:
 *   - Components
 *   - Module exports
 *   - Metadata extracted from each MDX file
 *
 * Guarantees:
 * - Compile-time safety for route keys
 * - Dev-time validation of glob results
 */
/** biome-ignore-all lint/suspicious/noExplicitAny: Trust me bro*/

import { lazy } from "react";

/**
 * Utility type that ensures a string starts with `/`
 */
type MustStartWithSlash<T extends string> = T extends `/${string}` ? T : never;

/**
 * Utility type that ensures a string does NOT end with `/`
 */
type MustNotEndWithSlash<T extends string> = T extends `${string}/` ? never : T;

/**
 * Valid path that:
 * - starts with `/`
 * - does not end with `/`
 */
type PathCheck<T extends string> = MustStartWithSlash<T> &
    MustNotEndWithSlash<T>;

/**
 * Type returned by `import.meta.glob`
 */
type WrappedUnknownPromise = () => Promise<unknown>;

/**
 * Shape of glob result
 */
type GlobResult<T> = Record<string, T>;

/**
 * Expected module shape of an MDX file
 */
type ImportedModule = () => Promise<{ default: React.ComponentType }>;

/**
 * Removes `.mdx` extension from a path
 */
type StripExtension<T extends string> = T extends `${infer P}.mdx` ? P : T;

/**
 * Replace filesystem root with a virtual route prefix
 *
 * Example:
 *
 * `/src/content/foo.mdx`
 * root = `/src/content`
 * virtual = `/blog`
 *
 * Result:
 * `/blog/foo`
 */
type ReplaceRoot<
    P extends string,
    Root extends string,
    Virtual extends string,
> = P extends `${Root}${infer Rest}`
    ? `${Virtual}${StripExtension<Rest>}`
    : never;

/**
 * Derives the route keys produced by the registry
 *
 * Example:
 *
 * `/src/blog/foo.mdx`
 * → `/blog/foo`
 */
type RouteKey<
    Modules extends Record<string, unknown>,
    Root extends string,
    Virtual extends string,
> = ReplaceRoot<Extract<keyof Modules, string>, Root, Virtual>;

/**
 * Options passed to {@link generateRegistry}
 */
export type RegistryOptions<
    /**
     * Metadata type extracted from MDX modules
     */
    MetaType,
    /**
     * Result of `import.meta.glob`
     */
    Modules extends GlobResult<WrappedUnknownPromise>,
    /**
     * Filesystem root directory of MDX files
     */
    Root extends string,
    /**
     * Virtual route prefix where MDX routes should mount
     */
    Virtual extends string,
> = {
    /**
     * Module map returned from `import.meta.glob`
     */
    modulesGlob: Modules;

    /**
     * Metadata extracted from each MDX file
     */
    metadataGlob: { [K in keyof Modules]: MetaType };

    /**
     * Filesystem root path
     */
    root: PathCheck<Root>;

    /**
     * Virtual route mount point
     */
    virtual: PathCheck<Virtual>;
};

/**
 * Internal function used by {@link Registry}.
 *
 * Builds registry mappings for:
 * - keys
 * - metadata
 * - components
 * - exports
 */
export function generateRegistry<
    MetaType,
    Modules extends GlobResult<WrappedUnknownPromise>,
    Root extends string,
    Virtual extends string,
>({
    modulesGlob,
    metadataGlob,
    root,
    virtual,
}: RegistryOptions<MetaType, Modules, Root, Virtual>): {
    /**
     * List of route keys
     */
    keys: RouteKey<Modules, Root, Virtual>[];

    /**
     * Metadata registry
     */
    metadata: Record<RouteKey<Modules, Root, Virtual>, MetaType>;

    /**
     * React lazy component registry
     */
    components: Record<
        RouteKey<Modules, Root, Virtual>,
        React.LazyExoticComponent<React.ComponentType>
    >;

    /**
     * Raw module export registry
     */
    exports: Record<
        RouteKey<Modules, Root, Virtual>,
        Promise<Record<string, unknown>>
    >;
} {
    const paths = Object.keys(modulesGlob) as Extract<keyof Modules, string>[];

    const keys = new Array(paths.length);

    const _components: [
        string,
        React.LazyExoticComponent<React.ComponentType>,
    ][] = [];

    const _exports: [string, Promise<Record<string, unknown>>][] = [];

    const _metadata: [string, MetaType][] = [];

    for (const [idx, path] of paths.entries()) {
        /**
         * Transform filesystem path into virtual route key
         */
        const route = path
            .replace(root, virtual)
            .replace(".mdx", "") as RouteKey<Modules, Root, Virtual>;

        const loader = modulesGlob[path] as ImportedModule;

        keys[idx] = route as (typeof keys)[number];

        _components.push([route, lazy(loader)]);
        _exports.push([route, loader()]);
        _metadata.push([route, metadataGlob[path]]);
    }

    type Return = ReturnType<
        typeof generateRegistry<MetaType, Modules, Root, Virtual>
    >;

    return {
        keys,
        components: Object.fromEntries(_components) as Return["components"],

        exports: Object.fromEntries(_exports) as Return["exports"],

        metadata: Object.fromEntries(_metadata) as Return["metadata"],
    };
}

/**
 * Base class for all registry implementations.
 *
 * Provides type-safe access to:
 * - components
 * - module exports
 * - metadata
 */
abstract class AbstractRegistry<
    Keys extends string,
    Components extends Record<
        Keys,
        React.LazyExoticComponent<React.ComponentType>
    >,
    Exports extends Record<Keys, unknown>,
    Metadata extends Record<Keys, unknown>,
> {
    /**
     * List of registry keys
     */
    abstract readonly keys: readonly Keys[];

    /**
     * Lazy component registry
     */
    abstract readonly components: Components;

    /**
     * Raw module export registry
     */
    abstract readonly exports: Exports;

    /**
     * Metadata registry
     */
    abstract readonly metadata: Metadata;

    /**
     * Retrieve a React component by route key
     */
    public getComponent<Key extends Keys>(key: Key): Components[Key] {
        return this.components[key];
    }

    /**
     * Retrieve raw module exports for a route
     */
    public getExport<Key extends Keys>(key: Key): Exports[Key] {
        return this.exports[key];
    }

    /**
     * Retrieve metadata for a route
     */
    public getMetadata<Key extends Keys>(key: Key): Metadata[Key] {
        return this.metadata[key];
    }
}

/**
 * Primary registry implementation.
 *
 * Wraps {@link generateRegistry} and exposes
 * strongly typed access methods.
 */
export class Registry<
    MetaType,
    Modules extends GlobResult<WrappedUnknownPromise>,
    Root extends string,
    Virtual extends string,
> extends AbstractRegistry<
    RouteKey<Modules, Root, Virtual>,
    Record<
        RouteKey<Modules, Root, Virtual>,
        React.LazyExoticComponent<React.ComponentType>
    >,
    Record<RouteKey<Modules, Root, Virtual>, unknown>,
    Record<RouteKey<Modules, Root, Virtual>, MetaType>
> {
    readonly keys: RouteKey<Modules, Root, Virtual>[];

    readonly components: Record<
        RouteKey<Modules, Root, Virtual>,
        React.LazyExoticComponent<React.ComponentType>
    >;

    readonly exports: Record<RouteKey<Modules, Root, Virtual>, unknown>;

    readonly metadata: Record<RouteKey<Modules, Root, Virtual>, MetaType>;

    constructor(opts: RegistryOptions<MetaType, Modules, Root, Virtual>) {
        super();

        const result = generateRegistry(opts);

        this.keys = result.keys;
        this.components = result.components;
        this.exports = result.exports;
        this.metadata = result.metadata;
    }
}

/**
 * Utility types used for extracting generics
 * from registry instances.
 */

type RegistryKeys<R> =
    R extends AbstractRegistry<infer K, any, any, any> ? K : never;

type RegistryComponents<R> =
    R extends AbstractRegistry<any, infer C, any, any> ? C : never;

type RegistryExports<R> =
    R extends AbstractRegistry<any, any, infer E, any> ? E : never;

type RegistryMetadata<R> =
    R extends AbstractRegistry<any, any, any, infer M> ? M : never;

/**
 * Registry created by merging multiple {@link Registry}
 * instances into a single unified registry.
 *
 * Useful for combining multiple MDX content directories
 * into one route registry.
 */
export class CoalescedRegistry<
    Registries extends AbstractRegistry<any, any, any, any>[],
> extends AbstractRegistry<
    RegistryKeys<Registries[number]>,
    RegistryComponents<Registries[number]>,
    RegistryExports<Registries[number]>,
    RegistryMetadata<Registries[number]>
> {
    readonly keys: RegistryKeys<Registries[number]>[] = [];

    readonly components = {} as RegistryComponents<Registries[number]>;

    readonly exports = {} as RegistryExports<Registries[number]>;

    readonly metadata = {} as RegistryMetadata<Registries[number]>;

    constructor(...registries: Registries) {
        super();

        for (const registry of registries) {
            this.keys.push(
                ...(registry.keys as RegistryKeys<Registries[number]>[]),
            );

            Object.assign(this.components, registry.components);

            Object.assign(this.exports, registry.exports);

            Object.assign(this.metadata, registry.metadata);
        }
    }
}
