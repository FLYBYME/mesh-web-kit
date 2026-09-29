/**
 * The three states of anything fetched — loading, failed, here — and what "nothing here" looks
 * like. Drawn the same way everywhere, so a site never invents its own spinner or error line.
 *
 * Functions, not components: none of this remembers anything.
 */
import { describe, each, element, text, when } from '@flybyme/mesh-web';
/**
 * The one row of a one-row list, for a detail page.
 *
 * A detail page reads its row as `find({ query: { id } })` rather than `get`, so the row follows
 * the server's events like any list does, and a delete takes it away. This narrows that list to its
 * row, for `loaded`: nothing until the first fetch, then the row — or, when there is none (a wrong
 * id, or deleted since), a failure saying `missing`.
 */
export function one(rows, missing) {
    const gone = new Error(missing);
    return {
        data: () => rows.data()?.[0],
        error: () => rows.error() ?? (rows.data()?.length === 0 ? gone : null),
    };
}
function message(error) {
    return error instanceof Error ? error.message : describe(error);
}
/**
 * `ready` gets the data as an accessor and is built **once**: a refetch or a live event updates what
 * is on screen through the accessor instead of tearing it down, so a table keeps its sort and a panel
 * its scroll while it refreshes.
 */
export function loaded(resource, ready, options = {}) {
    return [
        when(() => resource.error() !== null, () => element('Text', {
            props: { role: 'alert', class: 'kit-error' },
            children: [text(() => { const error = resource.error(); return error === null ? '' : message(error); })],
        })),
        when(() => resource.error() === null && resource.data() === undefined, () => element('Text', {
            props: { 'aria-busy': 'true', class: 'kit-loading' },
            children: [text(options.label ?? 'Loading…')],
        })),
        each(() => { const data = resource.data(); return data === undefined ? [] : [data]; }, () => 'data', ready),
    ];
}
/** Functions for text that follows state — an empty search result names the current search. */
export function emptyState(title, detail, action) {
    return element('Stack', {
        props: { class: 'kit-empty', 'data-empty': '' },
        children: [
            element('Heading', { props: { level: 3 }, children: [text(title)] }),
            ...(detail === undefined ? [] : [element('Text', { children: [text(detail)] })]),
            ...(action === undefined ? [] : [action]),
        ],
    });
}
//# sourceMappingURL=states.js.map