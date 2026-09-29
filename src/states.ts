/**
 * The three states of anything fetched — loading, failed, here — and what "nothing here" looks
 * like. Drawn the same way everywhere, so a site never invents its own spinner or error line.
 *
 * Functions, not components: none of this remembers anything.
 */

import { describe, each, element, text, when, type CallError, type Node } from '@flybyme/mesh-web';

export interface LoadedOptions {
    /** What is loading, for the busy text: "Loading zones…". */
    readonly label?: string;
}

/**
 * Anything fetched: a `resource(...)`, or a live collection from `cx.models` (whose rows the server
 * keeps current over its event stream, so it never goes back to "loading" after the first fetch).
 */
export interface Loadable<T> {
    data(): T | undefined;
    error(): Error | CallError<string> | null;
}

function message(error: Error | CallError<string>): string {
    return error instanceof Error ? error.message : describe(error);
}

/**
 * `ready` gets the data as an accessor and is built **once**: a refetch or a live event updates what
 * is on screen through the accessor instead of tearing it down, so a table keeps its sort and a panel
 * its scroll while it refreshes.
 */
export function loaded<T>(resource: Loadable<T>, ready: (data: () => T) => Node, options: LoadedOptions = {}): Node {
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
export function emptyState(title: string | (() => string), detail?: string | (() => string), action?: Node): Node {
    return element('Stack', {
        props: { class: 'kit-empty', 'data-empty': '' },
        children: [
            element('Heading', { props: { level: 3 }, children: [text(title)] }),
            ...(detail === undefined ? [] : [element('Text', { children: [text(detail)] })]),
            ...(action === undefined ? [] : [action]),
        ],
    });
}
