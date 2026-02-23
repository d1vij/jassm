import fs from "node:fs/promises";
import path from "node:path";
import { type StyleClasses, StyleClassesList } from "@/lib/StyleContext";

const STYLESHEET_PATH = path.join(
    path.dirname(__filename),
    "../../assets/stylesheet.css",
);
const STYLESHEET_MAP_PATH = path.join(
    path.dirname(STYLESHEET_PATH),
    "stylesheet_map.ts",
);
let content = StyleClassesList.map((s) => `.${s} { /**/ }`)
    .join("\n\n")
    .trim();
await fs.writeFile(STYLESHEET_PATH, content);
console.log(`stylesheet generated at ${STYLESHEET_PATH}`);

content = JSON.stringify(
    Object.fromEntries(StyleClassesList.map((s) => [s, null])) as Record<
        StyleClasses,
        null
    >,
    null,
    4,
);
await fs.writeFile(
    STYLESHEET_MAP_PATH,
    [
        "// Remove unused keys",
        `const stylemap: Record<string, string> = ${content}`,
    ].join("\n"),
);
console.log(`stylemap generated at ${STYLESHEET_MAP_PATH}`);
