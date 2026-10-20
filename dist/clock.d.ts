/**
 * The time, moving. `ago` turns a time into words once; something has to hand it a new "now" for the
 * words to stay true between updates ("12s ago" counting up, not "just now" until the next event).
 */
import { type Node, type Reactive, type ReadonlySignal } from '@flybyme/mesh-web';
/** What owns a clock: any unit's `cx` (a view's, a component's, a service's). */
export interface ClockOwner {
    onDispose(fn: () => void): void;
}
/**
 * The time in milliseconds, as a signal that moves every `everyMs` (default a second) and stops when
 * its owner goes. Read it where a figure depends on the time: `ago(at, now())`, "not reporting" after
 * two minutes, a countdown.
 */
export declare function clock(owner: ClockOwner, everyMs?: number): ReadonlySignal<number>;
export interface TimeAgoProps {
    /** When it happened (ISO); undefined reads "never". */
    readonly at: Reactive<string | undefined>;
    /** Count seconds under a minute (default true: a time ago on a live page). */
    readonly seconds?: boolean;
    /** "12s ago" rather than "12 seconds ago" (default true). */
    readonly short?: boolean;
    /** Older than this, it reads `staleText` instead: a thing that has stopped reporting. */
    readonly staleAfterMs?: number;
    readonly staleText?: string;
}
declare const TimeAgo_base: (abstract new (init: import("@flybyme/mesh-web").ComponentInit<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<TimeAgoProps>;
}>) => import("@flybyme/mesh-web").ComponentBase<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<TimeAgoProps>;
}>) & {
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<TimeAgoProps>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<TimeAgoProps>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<TimeAgoProps>;
    }>): T;
};
/** A time ago that keeps counting by itself, its exact time on hover. */
export declare class TimeAgo extends TimeAgo_base {
    readonly now: ReadonlySignal<number>;
    render(): Node;
}
export {};
//# sourceMappingURL=clock.d.ts.map