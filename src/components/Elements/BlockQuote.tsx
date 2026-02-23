import { cn } from "@d1vij/shit-i-always-use";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, JSX } from "./types";

export default function BlockQuote(props: ElementProps<"blockquote">): JSX {
    const styles = useStyles();
    return (
        <blockquote className={cn(styles.blockquote)}>
            {props.children}
        </blockquote>
    );
}
