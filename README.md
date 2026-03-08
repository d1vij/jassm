# Just another static site maker

Create content-driven sites using MDX (Markdown + React) with TypeScript-powered
autocompletion and route awareness.

---

## What is this?

JASSM is a lightweight abstraction layer over [mdx-js](https://mdxjs.com/) and
its Vite plugin for building route-aware MDX registries.

It creates a single source of truth for MDX pages and exposes:

- type-safe route keys
- lazy React components
- metadata registries
- raw module exports

The developer experience is similar to TanStack Router or Elysia where
route definitions produce strongly typed APIs.

---

## Usage

## 0. Initialize a React app using Vite

```bash
npm create vite@latest
```

---

## 1. Install JASSM

```bash
npm install @d1vij/jassm
# OR
pnpm add @d1vij/jassm
# OR
bun add @d1vij/jassm
```

---

## 2. Setup the Vite plugin

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import jassm from "@d1vij/jassm/plugin";

export default defineConfig({
    plugins: [
        jassm(), // must come before react plugin
        react(),
    ],
});
```

---

## 3. Create a folder with `.mdx` assets

Example project structure:

```text
src/
  assets/
    mdx/
      sample.mdx
      sample.meta.ts
```

Example MDX file:

```mdx
# Hello world

This is my first mdx page.
```

Example metadata file:

```ts
export default {
    title: "Sample Page",
};
```

---

## 4. Create an MDX registry

The registry maps `filesystem MDX files -> route keys`.

```ts
// src/content/registry.ts

import { Registry } from "@d1vij/jassm";

export const registry = new Registry({
    modulesGlob: import.meta.glob("/src/assets/mdx/**/*.mdx"),

    metadataGlob: import.meta.glob("/src/assets/mdx/**/*.meta.ts", {
        eager: true,
        import: "default",
    }),

    root: "/src/assets/mdx",

    // virtual mount point for routes
    virtual: "/blog",
});
```

Given the file:

```text
/src/assets/mdx/sample.mdx
```

The generated route becomes:

```text
/blog/sample
```

All routes are available in:

```ts
registry.keys;
```

---

## 5. Setup style classes

JASSM maps MDX elements to CSS classes using a StyleClassesMap.

## Using global CSS

```ts
// src/stylesmap.ts

import type { StyleClassesMap } from "@d1vij/jassm";

import "./styles.css";

export const stylesmap: StyleClassesMap = {
    header: "myHeader",
    paragraph: "myParagraph",
};
```

---

### Using CSS modules

```ts
import styles from "./styles.module.css";

import type { StyleClassesMap } from "@d1vij/jassm";

export const stylesmap: StyleClassesMap = {
    header: styles.header,
    paragraph: styles.paragraph,
};
```

---

## 6. Using the registry in a component

```tsx
import { registry } from "./content/registry";
import { stylesmap } from "./stylesmap";

import { MDXFromComponent } from "@d1vij/jassm";

import { use } from "react";

type ExportType = {
    meta: {
        title: string;
    };
};

export default function Content() {
    const Component = registry.getComponent("/blog/sample");

    const exports = use(registry.getExport<ExportType>("/blog/sample"));

    return (
        <div>
            <h1>{exports.meta.title}</h1>

            <MDXFromComponent
                SourceComponent={Component}
                styles={stylesmap}
                fallback={<div>Loading...</div>}
            />
        </div>
    );
}
```

`MDXFromComponent` automatically provides:

- `StyleContext`
- `Suspense`
- MDX element mappings

---

## Manual setup (advanced)

You can manually compose the rendering pipeline.

```tsx
import { StyleContext, Elements } from "@d1vij/jassm";

import { registry } from "./content/registry";
import { stylesmap } from "./stylesmap";

import { Suspense } from "react";

export default function Loader() {
    const Component = registry.getComponent("/blog/sample");

    return (
        <StyleContext styles={stylesmap}>
            <Suspense fallback={<div>Loading</div>}>
                <Component components={Elements} />
            </Suspense>
        </StyleContext>
    );
}
```

---

## Metadata access

Metadata files (`*.meta.ts`) are eagerly loaded and accessible through the registry.

```ts
const metadata = registry.getMetadata("/blog/sample");

console.log(metadata.title);
```

---

## Registry utilities

The registry exposes:

```ts
registry.keys; // all route keys
registry.components; // lazy components
registry.exports; // raw module exports
registry.metadata; // metadata registry
```

It also provides a **consistency checker**:

```ts
registry.diffKeys();
```

This verifies that:

- components
- exports
- metadata

all share the same route keys.

---

## Multiple content directories

Multiple registries can be merged:

```ts
import { CoalescedRegistry } from "@d1vij/jassm";

const registry = new CoalescedRegistry(
    blogRegistry,
    docsRegistry,
    guidesRegistry,
);
```

This produces a single unified registry.

---
