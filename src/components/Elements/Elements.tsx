import type { MDXComponents } from "mdx/types";
import { Anchor } from "./Anchor";
import BlockQuote from "./BlockQuote";
import { Bold } from "./Bold";
import Code from "./Code";
import { Header } from "./Heading";
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
import HorizontalLine from "./HorizontalLine";

export const Elements: MDXComponents = {
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
};

export default Elements;
