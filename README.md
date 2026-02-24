# Just another static site maker

Create content driven sites using mdx (markdown + react) with added support of route safety.

## What is this ??

JASSM is a simple abstraction layer over [mdx-js](https://mdxjs.com/) and its vite plugin for creating a route/file aware loader for mdx file.

## Usage

0. Initialize a react app using vite

1. Install jassm

```bash
npm install @d1vij/jassm
# OR
pnpm add @d1vij/jassm
# OR
bun add @d1vij/jassm
```

2. Setup vite plugin in vite config

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import jassm from "jassm/plugin";

export default defineConfig({
    plugins: [
        jassm(), // Put jassm plugin before react's plugin
        react(),
    ],
});
```

3. Create a folder with `.mdx` assets

```bash
mkdir assets/mdx
cd assets/mdx
echo "# This is a Heading" > sample.mdx
```

4. Setup a mdx registry

```ts
// src/Registry.tsx

import { generateRegistry } from "jassm";

export const registry = generateRegistry({
    modules: import.meta.glob("/src/assets/mdx/**/*.mdx"),
    source: "/src/assets/mdx",
    mountOn: "/root",
    records: {
        "/sample": "/example.mdx",
    },
});
```

5. Setup style classes

```ts
// src/stylesmap.ts
import type { StyleClassesMap } from "jassm";

// import stylesheet
import "myStyles.css";

export const stylesmap: StyleClassesMap = {
    header: "myHeader",
    paragraph: "pee",
};
```

Or using css modules

```ts
import styles from "myStyles.module.css";

import type { StyleClassesMap } from "jassm";

export const stylesmap: StyleClassesMap = {
    header: styles.myHeader,
    paragraph: styles.pee,
};
```

6. Using the registry in any other component

```tsx
// importing defined registry
import { registry } from "./Registry";

// importing styles map
import {stylesmap} from "./stylesmap";

import {MDXFromComponent} from "jassm";

export default function Content() {
    const Component = registry["/root/sample"];
    return (
        <div>
            <MDXFromComponent
                SourceComponent={Component}
                styles={stylesmap}

                {/* Optional fallback component for suspense*/}
                fallback={<div>Loading</div>}
            />
        <div/>
    )
}
```

Using `MDXSourceComponent` automatically sets up the required enclosing StyleContext and Suspense component.

The setup can also be done manually as follows

```tsx
import { StyleContext, Elements } from "jassm";

import { registry } from "./Registry";
import { stylesmap } from "./stylesmap";

import { Suspense } from "react";

export default function MyLoader() {
    const Component = registry["/root/sample"];

    return (
        <div>
            <StyleContext styles={stylesmap}>
                <Suspense>
                    <Component components={Elements} />
                </Suspense>
            </StyleContext>
        </div>
    );
}
```
