/**
 * The blocks a public site's pages are made of: a hero, full-width bands, a grid of features, plan
 * cards, a call to action, a picture, footer columns, and the card a sign-in page centres.
 *
 * Functions, like the layout pieces: text and nodes in, nodes out. Links are passed in as nodes,
 * so a site uses its router's `Link` and the kit never knows a URL.
 */
import { element, text } from '@flybyme/mesh-web';
/** The top of a home page: one headline on a gradient field. */
export function hero(parts) {
    return element('Stack', {
        props: { class: 'kit-hero', 'data-art': String(parts.art !== undefined) },
        children: [element('Row', {
                props: { class: 'kit-hero-inner' },
                children: [
                    element('Stack', {
                        props: { class: 'kit-hero-text' },
                        children: [
                            ...(parts.eyebrow !== undefined ? [element('Text', { props: { class: 'kit-eyebrow' }, children: [text(parts.eyebrow)] })] : []),
                            element('Heading', { props: { level: 1, class: 'kit-hero-title' }, children: [text(parts.title)] }),
                            element('Text', { props: { class: 'kit-hero-lead' }, children: [text(parts.lead)] }),
                            ...(parts.actions !== undefined ? [element('Row', { props: { class: 'kit-actions kit-hero-actions' }, children: parts.actions })] : []),
                            ...(parts.note !== undefined ? [element('Text', { props: { class: 'kit-hero-note' }, children: [text(parts.note)] })] : []),
                        ],
                    }),
                    ...(parts.art !== undefined ? [element('Stack', { props: { class: 'kit-hero-art' }, children: [parts.art] })] : []),
                ],
            })],
    });
}
/** A full-width stripe of the page with its content centred at the site's width. */
export function band(body, options = {}) {
    const name = options.title ?? options.label;
    return element('Stack', {
        props: {
            class: 'kit-band',
            'data-tone': options.tone ?? 'plain',
            role: 'region',
            ...(name !== undefined ? { 'aria-label': name } : {}),
        },
        children: [element('Stack', {
                props: { class: 'kit-band-inner' },
                children: [
                    ...(options.title !== undefined ? [element('Stack', {
                            props: { class: 'kit-band-head' },
                            children: [
                                ...(options.eyebrow !== undefined ? [element('Text', { props: { class: 'kit-eyebrow' }, children: [text(options.eyebrow)] })] : []),
                                element('Heading', { props: { level: 2, class: 'kit-band-title' }, children: [text(options.title)] }),
                                ...(options.lead !== undefined ? [element('Text', { props: { class: 'kit-band-lead' }, children: [text(options.lead)] })] : []),
                            ],
                        })] : []),
                    ...(Array.isArray(body) ? body : [body]),
                ],
            })],
    });
}
/** Features in a grid: three across on a wide screen, one on a phone. */
export function featureGrid(features) {
    return element('Stack', {
        props: { class: 'kit-feature-grid' },
        children: features.map((f) => element('Stack', {
            props: { class: 'kit-feature' },
            children: [
                ...(f.mark !== undefined ? [element('Text', { props: { class: 'kit-feature-mark', 'aria-hidden': 'true' }, children: [text(f.mark)] })] : []),
                element('Heading', { props: { level: 3, class: 'kit-feature-title' }, children: [text(f.title)] }),
                element('Text', { props: { class: 'kit-feature-body' }, children: [text(f.body)] }),
                ...(f.link !== undefined ? [f.link] : []),
            ],
        })),
    });
}
export function planCard(parts) {
    return element('Card', {
        props: { class: 'kit-plan', 'data-featured': String(parts.featured === true), 'aria-label': parts.name },
        children: [
            ...(parts.featured === true && parts.ribbon !== undefined ? [element('Text', { props: { class: 'kit-plan-ribbon' }, children: [text(parts.ribbon)] })] : []),
            element('Heading', { props: { level: 3, class: 'kit-plan-name' }, children: [text(parts.name)] }),
            element('Row', {
                props: { class: 'kit-plan-price' },
                children: [
                    element('Text', { props: { class: 'kit-plan-amount' }, children: [text(parts.price)] }),
                    ...(parts.period !== undefined ? [element('Text', { props: { class: 'kit-plan-period' }, children: [text(parts.period)] })] : []),
                ],
            }),
            ...(parts.summary !== undefined ? [element('Text', { props: { class: 'kit-plan-summary' }, children: [text(parts.summary)] })] : []),
            element('List', {
                props: { class: 'kit-plan-features' },
                children: parts.features.map((f) => element('ListItem', { children: [text(f)] })),
            }),
            ...(parts.action !== undefined ? [element('Row', { props: { class: 'kit-plan-action' }, children: [parts.action] })] : []),
        ],
    });
}
/** Plan cards side by side, wrapping on a phone. */
export function planGrid(cards) {
    return element('Stack', { props: { class: 'kit-plan-grid' }, children: cards });
}
/** The closing ask of a page: a title, a line, and the buttons, on the gradient. */
export function ctaBand(title, body, actions) {
    return element('Stack', {
        props: { class: 'kit-cta', role: 'region', 'aria-label': title },
        children: [element('Stack', {
                props: { class: 'kit-cta-inner' },
                children: [
                    element('Heading', { props: { level: 2, class: 'kit-cta-title' }, children: [text(title)] }),
                    element('Text', { props: { class: 'kit-cta-body' }, children: [text(body)] }),
                    element('Row', { props: { class: 'kit-actions kit-cta-actions' }, children: actions }),
                ],
            })],
    });
}
/**
 * A picture by URL. Drawn as the background of a box with `role="img"`, which keeps the kit to the
 * renderer's primitives; `alt` is its accessible name and must say what the picture shows.
 */
export function picture(src, alt, options = {}) {
    return element('Stack', {
        props: {
            class: 'kit-picture',
            role: 'img',
            'aria-label': alt,
            'data-framed': String(options.framed === true),
            style: `background-image: url("${src.replace(/"/g, '%22')}"); aspect-ratio: ${options.ratio ?? 1.6};`,
        },
    });
}
/** A site's footer: the brand and a line about it, columns of links, and a bottom line. */
export function footer(about, columns, bottom) {
    return element('Stack', {
        props: { class: 'kit-footer', role: 'contentinfo' },
        children: [element('Stack', {
                props: { class: 'kit-footer-inner' },
                children: [
                    element('Row', {
                        props: { class: 'kit-footer-top' },
                        children: [
                            element('Stack', { props: { class: 'kit-footer-about' }, children: Array.isArray(about) ? about : [about] }),
                            ...columns.map((c) => element('Stack', {
                                props: { class: 'kit-footer-column', role: 'group', 'aria-label': c.heading },
                                children: [
                                    element('Text', { props: { class: 'kit-footer-heading' }, children: [text(c.heading)] }),
                                    ...c.links,
                                ],
                            })),
                        ],
                    }),
                    element('Row', { props: { class: 'kit-footer-bottom' }, children: Array.isArray(bottom) ? bottom : [bottom] }),
                ],
            })],
    });
}
/** The card a sign-in, sign-up or reset page centres on the screen. */
export function authCard(title, lead, body, foot) {
    return element('Stack', {
        props: { class: 'kit-auth' },
        children: [element('Card', {
                props: { class: 'kit-auth-card', 'aria-label': title },
                children: [
                    element('Heading', { props: { level: 1, class: 'kit-auth-title' }, children: [text(title)] }),
                    element('Text', { props: { class: 'kit-auth-lead' }, children: [text(lead)] }),
                    element('Stack', { props: { class: 'kit-auth-body' }, children: Array.isArray(body) ? body : [body] }),
                    ...(foot !== undefined ? [element('Stack', { props: { class: 'kit-auth-foot' }, children: Array.isArray(foot) ? foot : [foot] })] : []),
                ],
            })],
    });
}
//# sourceMappingURL=blocks.js.map