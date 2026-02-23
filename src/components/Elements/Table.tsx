import { cn } from "@d1vij/shit-i-always-use";
import { useStyles } from "@/lib/StyleContext";
import type { ElementProps, JSX } from "./types";

export function Table(props: ElementProps<"table">): JSX {
    const styles = useStyles();
    return <table className={cn(styles.table)}>{props.children}</table>;
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
