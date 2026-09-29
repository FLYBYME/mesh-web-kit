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
import { Component, each, element, props, signal, text } from '@flybyme/mesh-web';
export function dataTable() {
    return class DataTable extends Component({ props: props() }) {
        localSort = signal(undefined);
        current = () => this.props.sort?.current() ?? this.localSort();
        sorted = () => {
            const rows = this.props.rows();
            if (this.props.sort !== undefined)
                return rows;
            const sort = this.localSort();
            const compare = this.props.columns.find((c) => c.header === sort?.key)?.compare;
            if (sort === undefined || compare === undefined)
                return rows;
            return [...rows].sort((a, b) => compare(a, b) * sort.direction);
        };
        render() {
            const { columns, key, label } = this.props;
            return element('Table', {
                props: { class: 'kit-table', 'aria-label': label },
                children: [
                    element('TableHead', {
                        children: [element('TableRow', { children: columns.map((column) => this.#header(column)) })],
                    }),
                    element('TableBody', {
                        children: [each(this.sorted, key, (row) => element('TableRow', {
                                children: columns.map((column) => element('TableCell', {
                                    props: { 'data-align': column.align ?? 'start' },
                                    children: [column.cell(row)],
                                })),
                            }))],
                    }),
                ],
            });
        }
        // `#`, not `private`: a class returned from a function cannot declare TS-private members.
        #header(column) {
            const controlled = this.props.sort;
            // Controlled columns are named by `sortKey`; local ones by their header.
            const key = controlled === undefined
                ? (column.compare === undefined ? undefined : column.header)
                : column.sortKey;
            if (key === undefined) {
                return element('TableHeaderCell', { props: { scope: 'col' }, children: [text(column.header)] });
            }
            const direction = () => {
                const sort = this.current();
                return sort?.key === key ? sort.direction : undefined;
            };
            const toggle = () => {
                const next = { key, direction: direction() === 1 ? -1 : 1 };
                if (controlled === undefined)
                    this.localSort.set(next);
                else
                    controlled.change(next);
            };
            return element('TableHeaderCell', {
                props: {
                    scope: 'col',
                    'aria-sort': () => {
                        const d = direction();
                        return d === undefined ? 'none' : d === 1 ? 'ascending' : 'descending';
                    },
                },
                children: [element('Button', {
                        props: { class: 'kit-sort' },
                        intents: { activate: { action: this.on(toggle) } },
                        children: [text(() => {
                                const d = direction();
                                return `${column.header}${d === undefined ? '' : d === 1 ? ' ▲' : ' ▼'}`;
                            })],
                    })],
            });
        }
    };
}
//# sourceMappingURL=data-table.js.map