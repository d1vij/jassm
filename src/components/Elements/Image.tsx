import { cn } from "@d1vij/shit-i-always-use";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, JSX } from "./types";

export default function Image(props: ElementProps<"img">): JSX {
    const styles = useStyles();
    return (
        <img
            className={cn(styles.image)}
            alt={props.alt}
            title={props.title}
            src={props.src}
        />
    );
}
