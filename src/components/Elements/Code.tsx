import { cn } from "@d1vij/shit-i-always-use";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, JSX } from "./types";

export default function Code(props: ElementProps<"code">): JSX {
    const styles = useStyles();
    const lang = /language-(\w+)/.exec(props.className || "")?.[1];
    return (
        <code className={cn(styles.code, lang && `language-${lang}`)}>
            {props.children}
        </code>
    );
}
