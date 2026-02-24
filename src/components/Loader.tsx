import type { MDXComponents, MDXProps } from "mdx/types";
import { Suspense } from "react";
import { type StyleClassesMap, StyleContext } from "@/lib";
import { Elements } from "./Elements";
import type { JSX } from "./Elements/types";

export type MDXFromComponentProps = {
    SourceComponent: React.ComponentType<MDXProps>;
    styles: StyleClassesMap;
    elements?: MDXComponents;
    fallback?: React.ReactNode;
};

/**
 * Simple way to directly load a component from the Registry
 */
export function MDXFromComponent({
    SourceComponent,
    styles,
    fallback,
    elements = Elements,
}: MDXFromComponentProps): JSX {
    return (
        <StyleContext value={styles}>
            <Suspense fallback={fallback}>
                <SourceComponent components={elements} />
            </Suspense>
        </StyleContext>
    );
}
