import { createContext, useContext } from "react";

/**
 * List of default style classes
 */
export const StyleClassesList = [
    "header",
    "header_button",
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
    "table_container",
    "table_action_buttons_details",
    "table_action_buttons_summary",
    "table_action_button",
    "table_action_button_html",
    "table_action_button_csv",
    "table_action_button_json",
    "table_action_button_markdown",
] as const;

export type StyleClasses = (typeof StyleClassesList)[number];
export type StyleClassesMap = Partial<{
    [K in StyleClasses]: string;
}>;

/**
 * Context which defines styles for the loaded component(s)
 */
export const StyleContext: React.Context<StyleClassesMap | null> =
    createContext<StyleClassesMap | null>(null);

/**
 *  Hook to get defined style classes map
 * @returns {@link StyleClassesMap}
 */
export function useStyles(): StyleClassesMap {
    const ctx = useContext(StyleContext);
    if (ctx === null)
        throw new Error(
            "No stylesmap found at any parent level. Either you forgot to pass the stylesmap to component loader or didnt wrap your component in StyleContext",
        );
    return ctx;
}
