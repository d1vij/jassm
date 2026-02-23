import { cn } from "@d1vij/shit-i-always-use";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, JSX } from "./types";

export default function HorizontalLine(_: ElementProps<"hr">): JSX {
    const styles = useStyles();
    return <hr className={cn(styles.horizontal_line)} />;
}
