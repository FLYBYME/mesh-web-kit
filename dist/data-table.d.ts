/**
 * A table of typed rows, with sortable columns.
 *
 * Generic over the row, so it is a factory, called once per row type at module level:
 *
 * ```ts
 * const ZoneTable = dataTable<Zone>();
 * this.mount(ZoneTable, { label: 'Zones', rows, key: (z) => z.id, columns: [...] })
 * ```
 *
 * Every column's `cell` is then checked against `Zone`.
 *
 * The rows are the caller's — the table never fetches, filters or pages. Sorting is either the
 * table's own state (every row on screen: give columns `compare`) or the caller's (paged rows: give
 * columns `sortKey` and pass a controlled `sort`, so the server sorts before it pages).
 */
import { type Node } from '@flybyme/mesh-web';
export interface Column<Row> {
    readonly header: string;
    readonly cell: (row: () => Row) => Node;
    /** Sortable here, in the table: right when every row is on screen. */
    readonly compare?: (a: Row, b: Row) => number;
    /** Sortable by whoever owns the rows (see `DataTableProps.sort`): right when they are paged. */
    readonly sortKey?: string;
    readonly align?: 'start' | 'end';
}
export interface Sort {
    readonly key: string;
    readonly direction: 1 | -1;
}
export interface DataTableProps<Row> {
    /** The table's accessible name. */
    readonly label: string;
    readonly rows: () => readonly Row[];
    readonly key: (row: Row) => string;
    readonly columns: readonly Column<Row>[];
    /**
     * A controlled sort. Given, the table only shows it and reports clicks; the owner sorts. A paged
     * list must: sorting one page of a server-paged list sorts the wrong rows.
     */
    readonly sort?: {
        readonly current: () => Sort | undefined;
        change(next: Sort): void;
    };
}
export declare function dataTable<Row>(): {
    new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<DataTableProps<Row>>;
    }>): {
        readonly localSort: import("@flybyme/mesh-web").Signal<Sort | undefined>;
        readonly current: () => Sort | undefined;
        readonly sorted: () => readonly Row[];
        render(): Node;
        "__#private@#header"(column: Column<Row>): Node;
        readonly cx: import("@flybyme/mesh-web").Capabilities<readonly [], unknown>;
        readonly inject: import("@flybyme/mesh-web").Injected<import("@flybyme/mesh-web").None>;
        readonly props: DataTableProps<Row>;
        on(fn: (value?: import("@flybyme/mesh-web").IntentValue) => void): import("@flybyme/mesh-web").Action;
        mount<C extends import("@flybyme/mesh-web").ComponentClass>(component: C & import("@flybyme/mesh-web").CheckNeeds<C, readonly []>, ...args: import("@flybyme/mesh-web").MountArgs<C>): Node;
    };
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<DataTableProps<Row>>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<DataTableProps<Row>>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<DataTableProps<Row>>;
    }>): T;
};
//# sourceMappingURL=data-table.d.ts.map