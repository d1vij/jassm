import type { MDXComponent } from "@/components/Elements/Elements";
import {
    BaseElements,
    type BaseElementTags,
} from "@/components/Elements/Elements";
import type { MDXFromComponent } from "../components/Loader";
export type Element = MDXComponent | React.FunctionComponent;

/**
 *  Generate Element object passable to {@link MDXFromComponent.components} prop.
 * Its recommended that atleast one Element map contains the base elements.
 * The inbuilt elements
 * @param elements Map of custom elements
 * @param baseElements Include the inbuilt elements in the map set (default `true`)
 * @returns Map of {@link Element}
 *
 * @example
 * import MapElement from "@/components/Map";
 * import CommentSection from "@/components/CommentSection"
 * const elements = generateElementsFrom({MapElement, CommentSection}); // default baseElements is true, so inbuilt elements would be included.
 *
 * // then later on
 * // defined elements along with inbuilt ones would be available in the .mdx files
 * <MDXFromComponent elements={elements}/>
 *
 */
export function generateElementsFrom<
    E extends Record<string, Element>,
    B extends boolean = true,
>(
    elements: E,
    baseElements: B = true as B,
): {
    [K in B extends true
        ? keyof E | (typeof BaseElementTags)[number]
        : keyof E]: Element;
} {
    if (baseElements) {
        return { ...BaseElements, ...elements } as const;
    } else return { ...elements } as const;
}
