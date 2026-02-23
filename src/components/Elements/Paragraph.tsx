import { cn } from "@d1vij/shit-i-always-use";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, JSX } from "./types";

export function Paragraph(props: ElementProps<"p">): JSX {
    const styles = useStyles();
    return <p className={cn(styles.paragraph)}>{props.children}</p>;
}
