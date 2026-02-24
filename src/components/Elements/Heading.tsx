import { cn, useClipboardText } from "@d1vij/shit-i-always-use";
import { useEffect, useRef, useState } from "react";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, HeaderLevels, JSX } from "./types";

// maybe some onclick action can be defined as custom prop or function while loading it client side
export function Header(
    props: ElementProps<`h${HeaderLevels}`> & {
        // holy fuck typescript
        level: HeaderLevels;
    },
): JSX {
    const styles = useStyles();
    const headerRef = useRef<HTMLButtonElement>(null);

    const [id, setId] = useState("");
    const { copy } = useClipboardText();

    async function handleClick() {
        const url = new URL(`/#${id}`, window.location.origin).toString();
        console.log("clicked");
        await copy(url);
    }

    useEffect(() => {
        if (!headerRef.current) return;

        const raw = headerRef.current.textContent ?? "";

        const safe = raw
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "") // remove illegal chars
            .trim()
            .replace(/\s+/g, "-")
            .slice(0, 30);

        setId(safe);
    }, []);

    // const H = `h${props.level}` as unknown as JSX;
    return (
        <h1 className={cn(styles.header, styles[`header_${props.level}`])}>
            <button
                onClick={() => void handleClick()} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void
                ref={headerRef}
                id={id}
                className={cn(styles.header_button)}
                type="button"
            >
                {props.children}
            </button>
        </h1>
    );
}
