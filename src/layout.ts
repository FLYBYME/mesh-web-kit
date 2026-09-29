/**
 * How a page and its parts are framed: the header at the top of a page, a titled panel, one
 * number with its label. Functions — none of this has state.
 */

import { element, text, type Node } from '@flybyme/mesh-web';

/** A page's title and the actions beside it ("New zone", "Refresh"). */
export function pageHeader(title: string | (() => string), actions: readonly Node[] = []): Node {
    return element('Row', {
        props: { class: 'kit-page-header' },
        children: [
            element('Heading', { props: { level: 1 }, children: [text(title)] }),
            element('Row', { props: { class: 'kit-actions' }, children: actions }),
        ],
    });
}

/** A titled card. Its accessible name is the title, so a test (or a screen reader) can find it. */
export function panel(title: string, body: Node, actions: readonly Node[] = []): Node {
    return element('Card', {
        props: { class: 'kit-panel', 'aria-label': title },
        children: [
            element('Row', {
                props: { class: 'kit-panel-head' },
                children: [element('Heading', { props: { level: 2 }, children: [text(title)] }), ...actions],
            }),
            body,
        ],
    });
}

/** One number with its label. `data-stat` is the label, lowercased, with spaces as dashes. */
export function stat(label: string, value: () => number | string): Node {
    return element('Stack', {
        props: { class: 'kit-stat', 'data-stat': label.toLowerCase().replace(/\s+/g, '-') },
        children: [
            element('Text', { props: { class: 'kit-stat-value' }, children: [text(() => String(value()))] }),
            element('Text', { props: { class: 'kit-stat-label' }, children: [text(label)] }),
        ],
    });
}

/** A row of stats. */
export function stats(children: readonly Node[]): Node {
    return element('Row', { props: { class: 'kit-stats' }, children });
}
