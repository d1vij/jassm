import { Registry } from "../src/lib/Registry";

const r = new Registry({
    modules: {},
    mountOn: "/virtualPath",
    source: "/src/foo/bar",
    records: {
        "/apple": "/apple/inside/banana.mdx",
        "/orange": "/apple/inside/banana.mdx",
        "/strawberry": "/apple/inside/banana.mdx",
    },
});

const c = r.getComponent("/virtualPath/orange");
const e = await r.getExport("/virtualPath/strawberry");
