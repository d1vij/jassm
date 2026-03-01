import type { MDXComponents, MDXProps } from "mdx/types";
import { Suspense } from "react";
import { type StyleClassesMap, StyleContext } from "@/lib";
import { BaseElements } from "./Elements";
import type { JSX } from "./Elements/types";

export type MDXFromComponentProps = {
    source: React.ComponentType<MDXProps>;
    styles: StyleClassesMap;
    elements?: MDXComponents;
    fallback?: React.ReactNode;
};

/**
 * Simple way to directly load a component from the Registry
 */
export function MDXFromComponent({
    source: SourceComponent,
    styles,
    fallback,
    elements = BaseElements,
}: MDXFromComponentProps): JSX {
    return (
        <StyleContext value={styles}>
            <Suspense fallback={fallback}>
                <SourceComponent components={elements} />
            </Suspense>
        </StyleContext>
    );
}
