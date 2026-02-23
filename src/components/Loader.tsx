import type { MDXComponents, MDXProps } from "mdx/types";
import { Suspense } from "react";
import { type StyleClassesMap, StyleContext } from "@/lib";
import { Elements } from "./Elements";
import type { JSX } from "./Elements/types";

export type MDXFromComponentProps = {
    SourceComponent: React.ComponentType<MDXProps>;
    styles: StyleClassesMap;
    elements?: MDXComponents;
};

/**
 * Simple way to directly load a component from the Registry
 */
export function MDXFromComponent({
    SourceComponent,
    styles,
    elements = Elements,
}: MDXFromComponentProps): JSX {
    return (
        <StyleContext value={styles}>
            <Suspense>
                <SourceComponent components={elements} />
            </Suspense>
        </StyleContext>
    );
}
