/**
 * The time, moving. `ago` turns a time into words once; something has to hand it a new "now" for the
 * words to stay true between updates ("12s ago" counting up, not "just now" until the next event).
 */

import {
    Component, element, props, signal, text,
    type Node, type Reactive, type ReadonlySignal,
} from '@flybyme/mesh-web';
import { ago } from './format.js';

/** What owns a clock: any unit's `cx` (a view's, a component's, a service's). */
export interface ClockOwner {
    onDispose(fn: () => void): void;
}

/**
 * The time in milliseconds, as a signal that moves every `everyMs` (default a second) and stops when
 * its owner goes. Read it where a figure depends on the time: `ago(at, now())`, "not reporting" after
 * two minutes, a countdown.
 */
export function clock(owner: ClockOwner, everyMs = 1000): ReadonlySignal<number> {
    const now = signal(Date.now());
    const timer = setInterval(() => now.set(Date.now()), everyMs);
    owner.onDispose(() => clearInterval(timer));

    return now;
}

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

/** A time ago that keeps counting by itself, its exact time on hover. */
export class TimeAgo extends Component({ props: props<TimeAgoProps>() }) {
    readonly now = clock(this.cx);

    render(): Node {
        const at = (): string | undefined => (typeof this.props.at === 'function' ? this.props.at() : this.props.at);

        const stale = (): boolean => {
            const iso = at();
            const after = this.props.staleAfterMs;
            return after !== undefined && iso !== undefined && this.now() - Date.parse(iso) > after;
        };

        const words = (): string => (stale()
            ? this.props.staleText ?? 'not reporting'
            : ago(at(), this.now(), { seconds: this.props.seconds ?? true, short: this.props.short ?? true }));

        const exact = (): string => {
            const iso = at();
            return iso === undefined ? '' : new Date(iso).toLocaleString();
        };

        return element('Span', {
            props: { class: 'kit-time-ago', title: exact, 'data-stale': () => (stale() ? 'true' : 'false') },
            children: [text(words)],
        });
    }
}
