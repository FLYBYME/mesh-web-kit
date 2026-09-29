/**
 * A search box and one filter, bound to two signals the page owns.
 *
 * The page keeps the state (it may want it in the URL; it filters with it), so the bar is only the
 * two controls — but the controls need `this.on`, so it is a component. Generic over the filter's
 * values, so it is a factory, declared once per filter type at module level:
 *
 * ```ts
 * const ZoneFilterBar = filterBar<'all' | 'signed' | 'unsigned'>();
 * this.mount(ZoneFilterBar, { search: this.search, filter: this.filter, options, label: 'zones' })
 * ```
 *
 * A value the select reports that is not one of `options` is ignored rather than trusted.
 */
import { type Node } from '@flybyme/mesh-web';
export interface FilterOption<F extends string> {
    readonly value: F;
    readonly label: string;
}
/** What the bar reads and writes: a signal's shape, so a page passes its own signals. */
export interface Settable<T> {
    (): T;
    set(value: T): void;
}
export interface FilterBarProps<F extends string> {
    readonly search: Settable<string>;
    readonly filter: Settable<F>;
    readonly options: readonly FilterOption<F>[];
    /** What is being searched, for the controls' accessible names: "zones". */
    readonly label: string;
}
export declare function filterBar<F extends string>(): {
    new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<FilterBarProps<F>>;
    }>): {
        render(): Node;
        readonly cx: import("@flybyme/mesh-web").Capabilities<readonly [], unknown>;
        readonly inject: import("@flybyme/mesh-web").Injected<import("@flybyme/mesh-web").None>;
        readonly props: FilterBarProps<F>;
        on(fn: (value?: import("@flybyme/mesh-web").IntentValue) => void): import("@flybyme/mesh-web").Action;
        mount<C extends import("@flybyme/mesh-web").ComponentClass>(component: C & import("@flybyme/mesh-web").CheckNeeds<C, readonly []>, ...args: import("@flybyme/mesh-web").MountArgs<C>): Node;
    };
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<FilterBarProps<F>>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<FilterBarProps<F>>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<FilterBarProps<F>>;
    }>): T;
};
//# sourceMappingURL=filter-bar.d.ts.map