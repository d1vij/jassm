import { createContext, useContext } from "react";

/**
 * List of default style classes
 */
export const StyleClassesList = [
    "header",
    "header_1",
    "header_2",
    "header_3",
    "header_4",
    "header_5",
    "header_6",
    "header_icon",
    "anchor",
    "button",
    "bold",
    "italic",
    "span",
    "striked",
    "paragraph",
    "code",
    "preformatted",
    "blockquote",
    "horizontal_line",
    "image",
    "list",
    "unordered_list",
    "ordered_list",
    "list_item",
    "table",
    "table_head",
    "table_head_cell",
    "table_body",
    "table_row",
    "table_data",
] as const;

export type StyleClasses = (typeof StyleClassesList)[number];
export type StyleClassesMap = Partial<{
    [K in StyleClasses]: string;
}>;

/**
 * Context which defines styles for the loaded component(s)
 */
export const StyleContext: React.Context<StyleClassesMap> =
    createContext<StyleClassesMap>({});

/**
 *  Hook to get defined style classes map
 * @returns {@link StyleClassesMap}
 */
export function useStyles(): StyleClassesMap {
    return useContext(StyleContext);
}
