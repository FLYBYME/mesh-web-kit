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
import { Router, type Node } from '@flybyme/mesh-web';
export interface AppBarProps {
    readonly brand: Node;
    readonly links: readonly Node[];
    readonly actions?: readonly Node[];
    /** The navigation's accessible name. "Main" when not given. */
    readonly label?: string;
}
declare const AppBar_base: (abstract new (init: import("@flybyme/mesh-web").ComponentInit<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<AppBarProps>;
    readonly inject: {
        readonly router: typeof Router;
    };
}>) => import("@flybyme/mesh-web").ComponentBase<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<AppBarProps>;
    readonly inject: {
        readonly router: typeof Router;
    };
}>) & {
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<AppBarProps>;
        readonly inject: {
            readonly router: typeof Router;
        };
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<AppBarProps>;
        readonly inject: {
            readonly router: typeof Router;
        };
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<AppBarProps>;
        readonly inject: {
            readonly router: typeof Router;
        };
    }>): T;
};
export declare class AppBar extends AppBar_base {
    #private;
    readonly open: () => boolean;
    readonly toggleAction: import("@flybyme/mesh-web").Action;
    readonly closeAction: import("@flybyme/mesh-web").Action;
    render(): Node;
}
/**
 * Material's navigation bar: three to five destinations along the bottom of a phone screen, for an
 * app whose pages are reached many times a session (a console, not a brochure). Shown only under
 * 760px; on a wider screen the same places belong in the app bar. The page leaves room for it with
 * `kit-has-bottom-bar` on its outermost element.
 */
export declare function bottomBar(items: readonly Node[], label?: string): Node;
/** The site's name, set as a wordmark: bold, tight, and in the accent gradient. */
export declare function wordmark(name: string): Node;
export {};
//# sourceMappingURL=app-bar.d.ts.map