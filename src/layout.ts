/**
 * How a page and its parts are framed: the header at the top of a page, a titled panel, one
 * number with its label, plain surfaces, cards, settings sections, and toolbars.
 * Functions — none of this has state.
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
export function panel(title: string | (() => string), body: Node, actions: readonly Node[] = []): Node {
    return element('Card', {
        props: { class: 'kit-panel', 'aria-label': title },
        children: [
            element('Row', {
                props: { class: 'kit-panel-head' },
                children: [
                    element('Heading', { props: { level: 2 }, children: [text(title)] }),
                    ...(actions.length > 0 ? [
                        element('Row', { props: { class: 'kit-panel-actions' }, children: actions }),
                    ] : []),
                ],
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

export interface BoxOptions {
    readonly tone?: 'neutral' | 'accent' | 'danger' | 'good' | 'warn';
    readonly padding?: 'none' | 'sm' | 'md' | 'lg';
}

/** A plain bordered surface, with no title. */
export function box(body: Node, options: BoxOptions = {}): Node {
    return element('Stack', {
        props: {
            class: 'kit-box',
            ...(options.tone !== undefined ? { 'data-tone': options.tone } : {}),
            ...(options.padding !== undefined ? { 'data-padding': options.padding } : {}),
        },
        children: Array.isArray(body) ? body : [body],
    });
}

export interface CardOptions {
    readonly href?: string | (() => string);
    readonly actions?: readonly Node[];
}

/** A clickable summary for grids of things. */
export function card(title: string | (() => string), body: Node, options: CardOptions = {}): Node {
    const titleVal = typeof title === 'function' ? title : () => title;
    const titleText = typeof title === 'function' ? title() : title;

    const titleNode = options.href !== undefined
        ? element('Link', {
            props: { href: options.href, class: 'kit-card-title-link' },
            children: [text(titleVal)],
        })
        : text(titleVal);

    return element('Card', {
        props: {
            class: `kit-card ${options.href !== undefined ? 'kit-card-clickable' : ''}`.trim(),
            'aria-label': titleText,
        },
        children: [
            element('Row', {
                props: { class: 'kit-card-head' },
                children: [
                    element('Heading', { props: { level: 3, class: 'kit-card-title' }, children: [titleNode] }),
                    ...(options.actions !== undefined && options.actions.length > 0 ? [
                        element('Row', { props: { class: 'kit-actions kit-card-actions' }, children: options.actions }),
                    ] : []),
                ],
            }),
            element('Stack', {
                props: { class: 'kit-card-body' },
                children: Array.isArray(body) ? body : [body],
            }),
        ],
    });
}

/** A heading with its content, for settings pages ("General", "Danger zone"). */
export function section(
    title: string | (() => string),
    body: Node,
    actions: readonly Node[] = []
): Node {
    const titleVal = typeof title === 'function' ? title : () => title;
    const titleText = typeof title === 'function' ? title() : title;

    return element('Card', {
        props: {
            class: 'kit-section',
            'aria-label': titleText,
        },
        children: [
            element('Row', {
                props: { class: 'kit-section-head' },
                children: [
                    element('Heading', { props: { level: 2 }, children: [text(titleVal)] }),
                    ...(actions.length > 0 ? [
                        element('Row', { props: { class: 'kit-actions' }, children: actions }),
                    ] : []),
                ],
            }),
            element('Stack', {
                props: { class: 'kit-section-body' },
                children: Array.isArray(body) ? body : [body],
            }),
        ],
    });
}

/** A row of controls that wraps on a phone. */
export function toolbar(
    left: Node | readonly Node[],
    right: Node | readonly Node[] = [],
    options: { readonly label?: string } = {}
): Node {
    return element('Row', {
        props: {
            class: 'kit-toolbar',
            role: 'toolbar',
            'aria-label': options.label ?? 'Toolbar',
        },
        children: [
            element('Row', {
                props: { class: 'kit-toolbar-left' },
                children: Array.isArray(left) ? left : [left],
            }),
            element('Row', {
                props: { class: 'kit-toolbar-right' },
                children: Array.isArray(right) ? right : [right],
            }),
        ],
    });
}
