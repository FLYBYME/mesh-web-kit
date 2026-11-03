/**
 * The bar at the top of every page, and the one at the bottom of a phone screen.
 *
 * `AppBar`: the brand, the site's links and its actions ("Sign in", "Get started"). On a wide screen
 * they sit in one row. On a phone (under 760px) the links and actions fold behind a menu button and
 * open as a drawer below the bar, so the bar stays one line whatever the number of links.
 *
 * The drawer closes on the menu button, on the backdrop, on Escape, and by itself when the page
 * changes: it remembers the URL it was opened on and counts as open only while that URL is on
 * screen, so a link inside it needs no wiring.
 *
 * ```ts
 * this.mount(AppBar, {
 *     brand: this.mount(Link, { href: '/', class: 'kit-brand', children: [text('Acme')] }),
 *     links: [this.mount(Link, { href: '/pricing', children: [text('Pricing')] })],
 *     actions: [element('Link', { props: { href: '/sign-in', class: 'kit-button' }, children: [text('Sign in')] })],
 * })
 * ```
 */
import { Component, element, props, Router, signal, text, when } from '@flybyme/mesh-web';
export class AppBar extends Component({ props: props(), inject: { router: Router } }) {
    /** The URL the drawer was opened on, or undefined while it is shut. */
    #openedOn = signal(undefined);
    open = () => {
        const openedOn = this.#openedOn();
        return openedOn !== undefined && openedOn === this.inject.router.here();
    };
    toggleAction = this.on(() => {
        this.#openedOn.set(this.open() ? undefined : this.inject.router.here());
    });
    closeAction = this.on(() => {
        this.#openedOn.set(undefined);
    });
    render() {
        const actions = this.props.actions ?? [];
        return element('Row', {
            props: {
                class: 'kit-app-bar',
                role: 'navigation',
                'aria-label': this.props.label ?? 'Main',
                'data-open': () => String(this.open()),
            },
            intents: { dismiss: { action: this.closeAction } },
            children: [
                element('Row', { props: { class: 'kit-app-bar-brand' }, children: [this.props.brand] }),
                element('Button', {
                    props: {
                        class: 'kit-app-bar-menu',
                        type: 'button',
                        'aria-expanded': () => String(this.open()),
                        'aria-label': () => (this.open() ? 'Close menu' : 'Open menu'),
                    },
                    intents: { activate: { action: this.toggleAction } },
                    children: [element('Text', { props: { class: 'kit-app-bar-menu-icon', 'aria-hidden': 'true' } })],
                }),
                element('Row', {
                    props: { class: 'kit-app-bar-drawer' },
                    children: [
                        element('Row', { props: { class: 'kit-app-bar-links' }, children: this.props.links }),
                        ...(actions.length > 0 ? [
                            element('Row', { props: { class: 'kit-app-bar-actions' }, children: actions }),
                        ] : []),
                    ],
                }),
                when(this.open, () => element('Stack', {
                    props: { class: 'kit-app-bar-backdrop', 'aria-label': 'Close menu' },
                    intents: { activate: { action: this.closeAction } },
                })),
            ],
        });
    }
}
/**
 * Material's navigation bar: three to five destinations along the bottom of a phone screen, for an
 * app whose pages are reached many times a session (a console, not a brochure). Shown only under
 * 760px; on a wider screen the same places belong in the app bar. The page leaves room for it with
 * `kit-has-bottom-bar` on its outermost element.
 */
export function bottomBar(items, label = 'Sections') {
    return element('Row', {
        props: { class: 'kit-bottom-bar', role: 'navigation', 'aria-label': label },
        children: items,
    });
}
/** The site's name, set as a wordmark: bold, tight, and in the accent gradient. */
export function wordmark(name) {
    return element('Text', { props: { class: 'kit-wordmark' }, children: [text(name)] });
}
//# sourceMappingURL=app-bar.js.map