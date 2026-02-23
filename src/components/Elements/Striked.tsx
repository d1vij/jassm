import { cn } from "@d1vij/shit-i-always-use";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, JSX } from "./types";

export function Striked(props: ElementProps<"del">): JSX {
    const styles = useStyles();
    return <span className={cn(styles.striked)}>{props.children}</span>;
}
