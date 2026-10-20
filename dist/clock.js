/**
 * The time, moving. `ago` turns a time into words once; something has to hand it a new "now" for the
 * words to stay true between updates ("12s ago" counting up, not "just now" until the next event).
 */
import { Component, element, props, signal, text, } from '@flybyme/mesh-web';
import { ago } from './format.js';
/**
 * The time in milliseconds, as a signal that moves every `everyMs` (default a second) and stops when
 * its owner goes. Read it where a figure depends on the time: `ago(at, now())`, "not reporting" after
 * two minutes, a countdown.
 */
export function clock(owner, everyMs = 1000) {
    const now = signal(Date.now());
    const timer = setInterval(() => now.set(Date.now()), everyMs);
    owner.onDispose(() => clearInterval(timer));
    return now;
}
/** A time ago that keeps counting by itself, its exact time on hover. */
export class TimeAgo extends Component({ props: props() }) {
    now = clock(this.cx);
    render() {
        const at = () => (typeof this.props.at === 'function' ? this.props.at() : this.props.at);
        const stale = () => {
            const iso = at();
            const after = this.props.staleAfterMs;
            return after !== undefined && iso !== undefined && this.now() - Date.parse(iso) > after;
        };
        const words = () => (stale()
            ? this.props.staleText ?? 'not reporting'
            : ago(at(), this.now(), { seconds: this.props.seconds ?? true, short: this.props.short ?? true }));
        const exact = () => {
            const iso = at();
            return iso === undefined ? '' : new Date(iso).toLocaleString();
        };
        return element('Span', {
            props: { class: 'kit-time-ago', title: exact, 'data-stale': () => (stale() ? 'true' : 'false') },
            children: [text(words)],
        });
    }
}
//# sourceMappingURL=clock.js.map