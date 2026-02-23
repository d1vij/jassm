import { cn } from "@d1vij/shit-i-always-use";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, JSX } from "./types";
export default function Preformatted(props: ElementProps<"pre">): JSX {
    const styles = useStyles();

    return <pre className={cn(styles.preformatted)}>{props.children}</pre>;
}
