/**
 * Telling a person something is happening, or has happened: a spinner, a progress bar, and the
 * snackbar ("Saved", "Copied", "Could not reach the server") that appears at the bottom and leaves
 * by itself.
 */
import { type Node } from '@flybyme/mesh-web';
/** Something is loading and there is no telling how long. `label` is what a screen reader hears. */
export declare function spinner(label?: string): Node;
/**
 * How far along something is: `value` from 0 to 1, or undefined while it cannot be told (the bar
 * then sweeps). Read in a binding, so a signal moves it.
 */
export declare function progress(value: () => number | undefined, label: string): Node;
export interface Snack {
    readonly id: number;
    readonly message: string;
    readonly tone: 'neutral' | 'good' | 'bad';
}
/**
 * The messages on screen. One per site, made at module level and shown by `Snackbars` in the
 * layout; anything that knows it can `show`:
 *
 * ```ts
 * export const snacks = new SnackQueue();
 * snacks.show('Saved');
 * snacks.show('Could not save: the name is taken', 'bad');
 * ```
 *
 * A message stays four seconds (seven for a failure, which takes longer to read); three at most
 * are on screen, the oldest leaving first.
 */
export declare class SnackQueue {
    #private;
    readonly items: import("@flybyme/mesh-web").Signal<readonly Snack[]>;
    show(message: string, tone?: Snack['tone']): void;
    dismiss(id: number): void;
}
export interface SnackbarsProps {
    readonly queue: SnackQueue;
}
declare const Snackbars_base: (abstract new (init: import("@flybyme/mesh-web").ComponentInit<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<SnackbarsProps>;
}>) => import("@flybyme/mesh-web").ComponentBase<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<SnackbarsProps>;
}>) & {
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<SnackbarsProps>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<SnackbarsProps>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<SnackbarsProps>;
    }>): T;
};
/** Where a `SnackQueue`'s messages appear: mount once, in the layout. */
export declare class Snackbars extends Snackbars_base {
    render(): Node;
}
export {};
//# sourceMappingURL=feedback.d.ts.map