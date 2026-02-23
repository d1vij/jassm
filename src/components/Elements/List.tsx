import { cn } from "@d1vij/shit-i-always-use";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, JSX } from "./types";

export default function List(
    props: ElementProps<"ol" | "ul"> & {
        type: "ordered" | "unordered";
    },
): JSX {
    const styles = useStyles();
    const L = props.type === "ordered" ? "ol" : "ul";

    return (
        <L
            className={cn(
                styles.list,
                props.type === "ordered" && styles.ordered_list,
                props.type === "unordered" && styles.unordered_list,
            )}
        >
            {props.children}
        </L>
    );
}

export function ListItem(props: ElementProps<"li">): JSX {
    const styles = useStyles();
    return <li className={cn(styles.list_item)}>{props.children}</li>;
}
