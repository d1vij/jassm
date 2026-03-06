/** biome-ignore-all lint/suspicious/noExplicitAny: Trust me bro*/

// TODO: Add path typings to get methods
// TODO: Update readme
/**
 * Type aware MDX registry built around import.meta.glob.
 */

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
type StripExtension<T extends string> = T extends `${infer Rest}.mdx`
    ? Rest
    : T;

/**
 * Derives the route keys produced by the registry and
 * replace filesystem root with a virtual route prefix
 *
 * Example:
 *
 * `/src/content/foo.mdx`
 * root = `/src/content`
 * virtual = `/blog`
 * Result:
 * `/blog/foo`
 */
type RouteKey<
    Modules extends Record<string, unknown>,
    Root extends string,
    Virtual extends string,
> = keyof {
    [K in keyof Modules as K extends `${string}${Root}/${infer Rest}.mdx`
        ? `${Virtual}/${Rest}`
        : never]: true;
} &
    string;

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

    // TODO: Add checks to ensure metadataGlob is eagerly loaded module
    metadataGlob: {
        [K in keyof Modules as `${StripExtension<Extract<K, string>>}.meta.ts`]: MetaType;
    };

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
    Modules extends Record<string, WrappedUnknownPromise>,
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

    const keys = [] as RouteKey<Modules, Root, Virtual>[];

    const _components: [
        string,
        React.LazyExoticComponent<React.ComponentType>,
    ][] = [];

    const _exports: [string, Promise<Record<string, unknown>>][] = [];

    const _metadata: [string, MetaType][] = [];

    console.log(metadataGlob);
    for (const path of paths) {
        /**
         * Transform filesystem path into virtual route key
         * 1. Replace the root to virtual path
         *    - For path /src/assets/subjects/chemistry with root as /src/assets/subjects and
         *      virtual path /subjects the route becomes /subjects/chemistry
         */
        const route = path
            .replace(root, virtual)
            // strip out extension to get just the path
            .replace(".mdx", "") as RouteKey<Modules, Root, Virtual>;

        const loader = modulesGlob[path] as ImportedModule;

        keys.push(route);

        _components.push([route, lazy(loader)]);
        _exports.push([route, loader()]);
        const metaLoader = metadataGlob[
            path.replace(".mdx", ".meta.ts") as keyof typeof metadataGlob
        ] as MetaType;
        console.log(typeof metaLoader);

        _metadata.push([route, metaLoader]);
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
    Key extends string,
    Components extends Record<
        Key,
        React.LazyExoticComponent<React.ComponentType>
    >,
    Exports extends Record<Key, unknown>,
    Metadata extends Record<Key, unknown>,
> {
    /**
     * List of registry keys
     */
    // BUG: Somehow Key is collapsing to type never
    abstract readonly keys: readonly Key[];

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

    // NOTE: Until i figure out why the Key generic is resolving to never
    // all get methods will accpet any string and would throw error incase
    // the value is not found in any map

    private get<R extends Components | Exports | Metadata, K extends keyof R>(
        _from: R,
        key: K,
    ) {
        const value = _from[key];
        if (!value) {
            // TODO: CHANGE
            throw new Error(
                `Invalid key passed ${key.toString()} to access whatever the fuck we were extractign`,
            );
        }

        return value;
    }

    /**
     * Retrieve a React component by route key
     */
    public getComponent(key: string): Components[keyof Components] {
        return this.get(this.components, key as keyof Components);
    }

    /**
     * Retrieve raw module exports for a route
     */
    public getExport(key: string): Exports[keyof Exports] {
        return this.get(this.exports, key as keyof Exports);
    }

    /**
     * Retrieve metadata for a route
     */
    public getMetadata(key: string): Metadata[keyof Metadata] {
        return this.get(this.metadata, key as keyof Metadata);
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
    Modules extends Record<`${Root}/${string}.mdx`, WrappedUnknownPromise>,
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
