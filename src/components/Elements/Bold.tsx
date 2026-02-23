import { cn } from "@d1vij/shit-i-always-use";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, JSX } from "./types";

export function Bold(props: ElementProps<"strong">): JSX {
    const styles = useStyles();
    return <span className={cn(styles.bold)}>{props.children}</span>;
}
