import { cn, useClipboardText } from "@d1vij/shit-i-always-use";
import { useRef } from "react";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, JSX } from "./types";

type TableActionButtonProps = {
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};
function TableActionButton({ label, onClick }: TableActionButtonProps) {
    const styles = useStyles();
    return (
        <button
            onClick={onClick}
            className={cn(styles.table_action_button)}
            type="button"
        >
            {label}
        </button>
    );
}

type TableAsJson = {
    readonly meta: {
        readonly rows: number; // excluding heading row
        readonly columns: number;
    };
    readonly headings: string[];
    readonly rows: {
        column: TableAsJson["headings"][number];
        content: string;
    }[][];
};

function getTableAsJson(elm: HTMLTableElement): TableAsJson {
    const headings: TableAsJson["headings"] = [];

    const theadElms =
        elm.querySelectorAll<HTMLTableHeaderCellElement>("thead > tr > th");

    theadElms.forEach((th) => {
        headings.push(th.innerText.trim());
    });

    const rows: TableAsJson["rows"] = [];

    const rowElms = elm.querySelectorAll<HTMLTableRowElement>("tbody > tr");

    rowElms.forEach((tr) => {
        const row: (typeof rows)[number] = [];

        tr.querySelectorAll<HTMLTableCellElement>("td").forEach((td, idx) => {
            row.push({
                column: headings[idx] ?? idx.toString(),
                content: td.innerText.trim(),
            });
        });

        rows.push(row);
    });

    return {
        meta: {
            columns: headings.length,
            rows: rowElms.length,
        },
        headings,
        rows,
    };
}

function getTableJsonAsCsv(json: TableAsJson): string {
    const heading = json.headings.join(",");

    const rows = json.rows
        .map((row) => row.map((cell) => cell.content).join(","))
        .join("\n");

    return [heading, rows].join("\n");
}

function getTableJsonAsHtml(json: TableAsJson): string {
    const heading = json.headings.map((h) => `<th>${h}</th>`).join("");

    const rows = json.rows.map((row) => {
        const cells = row.map((c) => `<td>${c.content}</td>`).join("");
        return `<tr>${cells}</tr>`;
    });

    return [
        "<table>",
        "<thead>",
        `<tr>${heading}</tr>`,
        "</thead>",
        "<tbody>",
        ...rows,
        "</tbody>",
        "</table>",
    ].join("\n");
}

function getTableJsonAsMarkdown(json: TableAsJson): string {
    const heading = `|${json.headings.join("|")}|`;

    const separator = `|${json.headings.map(() => "-----").join("|")}|`;

    const rows = json.rows.map(
        (row) => `|${row.map((cell) => cell.content).join("|")}|`,
    );

    return [heading, separator, ...rows].join("\n");
}

export function Table(props: ElementProps<"table">): JSX {
    const styles = useStyles();
    const ref = useRef<HTMLTableElement>(null);
    const { copy } = useClipboardText();

    function copyAs(_as: "html" | "csv" | "json" | "markdown") {
        return async () => {
            const elm = ref.current;
            if (!elm) return;
            const json = getTableAsJson(elm);
            let extractedText: string;
            switch (_as) {
                case "html":
                    extractedText = getTableJsonAsHtml(json);
                    break;
                case "csv":
                    extractedText = getTableJsonAsCsv(json);
                    break;
                case "markdown":
                    extractedText = getTableJsonAsMarkdown(json);
                    break;
                case "json":
                    extractedText = JSON.stringify(json, null, 4);
                    break;
                default:
                    _as as never;
                    return;
            }

            await copy(extractedText);
        };
    }

    return (
        <div className={cn(styles.table_container)}>
            <table ref={ref} className={cn(styles.table)}>
                {props.children}
            </table>
            <details className={cn(styles.table_action_buttons_details)}>
                <summary className={cn(styles.table_action_buttons_summary)}>
                    Copy
                </summary>
                <TableActionButton label="HTML" onClick={copyAs("html")} />
                <TableActionButton label="CSV" onClick={copyAs("csv")} />
                <TableActionButton label="Json" onClick={copyAs("json")} />
                <TableActionButton
                    label="Markdown"
                    onClick={copyAs("markdown")}
                />
            </details>
        </div>
    );
}

export function TableHead(props: ElementProps<"thead">): JSX {
    const styles = useStyles();
    return <thead className={cn(styles.table_head)}>{props.children}</thead>;
}

export function TableBody(props: ElementProps<"tbody">): JSX {
    const styles = useStyles();
    return <tbody className={cn(styles.table_body)}>{props.children}</tbody>;
}

export function TableRow(props: ElementProps<"tr">): JSX {
    const styles = useStyles();
    return <tr className={cn(styles.table_row)}>{props.children}</tr>;
}
export function TableHeadCell(props: ElementProps<"th">): JSX {
    const styles = useStyles();
    return <th className={cn(styles.table_head_cell)}>{props.children}</th>;
}

export function TableData(props: ElementProps<"td">): JSX {
    const styles = useStyles();
    return <td className={cn(styles.table_data)}>{props.children}</td>;
}
