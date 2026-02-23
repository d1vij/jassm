import { cn } from "@d1vij/shit-i-always-use";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, JSX } from "./types";

export function Italics(props: ElementProps<"em">): JSX {
    const styles = useStyles();
    return <span className={cn(styles.italic)}>{props.children}</span>;
}
