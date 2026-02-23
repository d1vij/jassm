import { cn } from "@d1vij/shit-i-always-use";
import { useMemo, useState } from "react";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, JSX } from "./types";

export function Anchor(props: ElementProps<"a">): JSX {
    const selfOrigin = useMemo(
        () => new URL(window.location.href).origin.toString(),
        [],
    );
    const styles = useStyles();
    const [target] = useState<"_self" | "_blank">(() => {
        const href = props.href;

        if (href?.match(/^#.*/)) {
            return "_self";
        }
        const targetOrigin = new URL(props.href ?? "").origin.toString();
        return targetOrigin === selfOrigin ? "_self" : "_blank";
    });

    return (
        <a className={cn(styles.anchor)} target={target} href={props.href}>
            {props.children}
        </a>
    );
}
