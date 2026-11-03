/**
 * Choices a person makes in place: filter chips, a switch, segmented buttons. Each is bound to a
 * signal the page owns (`Settable`, the filter bar's shape), and is a component because it needs
 * `this.on`. The generic ones are factories, declared once per value type at module level:
 *
 * ```ts
 * const KindChips = chips<'a' | 'mx' | 'txt'>();
 * const RangeButtons = segmented<'1h' | '24h' | '7d'>();
 * ```
 */
import { type Node } from '@flybyme/mesh-web';
import type { FilterOption, Settable } from './filter-bar.js';
export interface ChipsProps<V extends string> {
    /** The chosen values; none chosen means "all", as a filter reads it. */
    readonly value: Settable<readonly V[]>;
    readonly options: readonly FilterOption<V>[];
    readonly label: string;
}
/** Filter chips: any number of options on or off. */
export declare function chips<V extends string>(): {
    new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<ChipsProps<V>>;
    }>): {
        render(): Node;
        readonly cx: import("@flybyme/mesh-web").Capabilities<readonly [], unknown>;
        readonly inject: import("@flybyme/mesh-web").Injected<import("@flybyme/mesh-web").None>;
        readonly props: ChipsProps<V>;
        on(fn: (value?: import("@flybyme/mesh-web").IntentValue) => void): import("@flybyme/mesh-web").Action;
        mount<C extends import("@flybyme/mesh-web").ComponentClass>(component: C & import("@flybyme/mesh-web").CheckNeeds<C, readonly []>, ...args: import("@flybyme/mesh-web").MountArgs<C>): Node;
    };
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<ChipsProps<V>>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<ChipsProps<V>>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<ChipsProps<V>>;
    }>): T;
};
/** A chip that only shows something: a tag on a record, with no action. */
export declare function chip(label: string | (() => string)): Node;
export interface SwitchProps {
    readonly checked: Settable<boolean>;
    readonly label: string;
    readonly disabled?: boolean | (() => boolean);
}
declare const Switch_base: (abstract new (init: import("@flybyme/mesh-web").ComponentInit<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<SwitchProps>;
}>) => import("@flybyme/mesh-web").ComponentBase<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<SwitchProps>;
}>) & {
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<SwitchProps>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<SwitchProps>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<SwitchProps>;
    }>): T;
};
/** A setting that takes effect the moment it is flipped (not a form field to be saved later). */
export declare class Switch extends Switch_base {
    readonly flip: import("@flybyme/mesh-web").Action;
    render(): Node;
}
export interface SegmentedProps<V extends string> {
    readonly value: Settable<V>;
    readonly options: readonly FilterOption<V>[];
    readonly label: string;
}
/** Two to five options, exactly one chosen: a range ("1 h, 24 h, 7 d"), a view ("List, Grid"). */
export declare function segmented<V extends string>(): {
    new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<SegmentedProps<V>>;
    }>): {
        render(): Node;
        readonly cx: import("@flybyme/mesh-web").Capabilities<readonly [], unknown>;
        readonly inject: import("@flybyme/mesh-web").Injected<import("@flybyme/mesh-web").None>;
        readonly props: SegmentedProps<V>;
        on(fn: (value?: import("@flybyme/mesh-web").IntentValue) => void): import("@flybyme/mesh-web").Action;
        mount<C extends import("@flybyme/mesh-web").ComponentClass>(component: C & import("@flybyme/mesh-web").CheckNeeds<C, readonly []>, ...args: import("@flybyme/mesh-web").MountArgs<C>): Node;
    };
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<SegmentedProps<V>>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<SegmentedProps<V>>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<SegmentedProps<V>>;
    }>): T;
};
/** A line between two groups of things. */
export declare function divider(): Node;
/**
 * A short explanation shown on hover and on keyboard focus. The tip is also the trigger's
 * accessible description, so it is never hover-only.
 */
export declare function tooltip(trigger: Node, tip: string): Node;
export {};
//# sourceMappingURL=controls.d.ts.map