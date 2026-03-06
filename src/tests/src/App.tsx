import type { JSX } from "@d1vij/shit-i-always-use";
import { useMemo } from "react";
import { MDXFromComponent } from "@/components";
import { Registry } from "@/lib";

const r = new Registry({
    modulesGlob: import.meta.glob("/src/assets/subjects/**/*.mdx"),
    metadataGlob: import.meta.glob("/src/assets/subjects/**/*.meta.ts", {
        eager: true,
        import: "a",
    }),
    root: "/src/assets/subjects",
    virtual: "/subjects",
});

export default function App(): JSX {
    const component = r.getComponent("/subjects/foo");
    const v = useMemo(() => r.getMetadata("/subjects/foo"), []);

    return (
        <div>
            <MDXFromComponent source={component} styles={{}} />
            {v}a{/*{r.keys.join(", ")}*/}
        </div>
    );
}
