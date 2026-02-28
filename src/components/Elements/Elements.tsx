import type { MDXComponents } from "mdx/types";
import { Anchor } from "./Anchor";
import BlockQuote from "./BlockQuote";
import { Bold } from "./Bold";
import Code from "./Code";
import { Header } from "./Heading";
import HorizontalLine from "./HorizontalLine";
import Image from "./Image";
import { Italics } from "./Italics";
import List, { ListItem } from "./List";
import { Paragraph } from "./Paragraph";
import Preformatted from "./Preformatted";
import { Striked } from "./Striked";
import {
    Table,
    TableBody,
    TableData,
    TableHead,
    TableHeadCell,
    TableRow,
} from "./Table";

export type MDXComponent = MDXComponents[number];

export const BaseElementTags = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "a",
    "em",
    "del",
    "strong",
    "code",
    "blockquote",
    "pre",
    "p",
    "hr",
    "ol",
    "ul",
    "li",
    "img",
    "table",
    "thead",
    "tbody",
    "th",
    "tr",
    "td",
] as const;
export const BaseElements: Record<
    (typeof BaseElementTags)[number],
    MDXComponent
> = {
    // Headings
    h1: (props) => Header({ ...props, level: 1 }),
    h2: (props) => Header({ ...props, level: 2 }),
    h3: (props) => Header({ ...props, level: 3 }),
    h4: (props) => Header({ ...props, level: 4 }),
    h5: (props) => Header({ ...props, level: 5 }),
    h6: (props) => Header({ ...props, level: 6 }),

    a: Anchor,
    em: Italics,
    del: Striked,
    strong: Bold,
    code: Code,
    blockquote: BlockQuote,
    pre: Preformatted,
    p: Paragraph,
    hr: HorizontalLine,

    ol: (props) => List({ ...props, type: "ordered" }),
    ul: (props) => List({ ...props, type: "unordered" }),
    li: ListItem,

    img: Image,

    table: Table,
    thead: TableHead,
    tbody: TableBody,
    th: TableHeadCell,
    tr: TableRow,
    td: TableData,
} as const satisfies MDXComponents;
export default BaseElements;
