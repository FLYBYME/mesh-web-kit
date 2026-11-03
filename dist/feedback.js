/**
 * Telling a person something is happening, or has happened: a spinner, a progress bar, and the
 * snackbar ("Saved", "Copied", "Could not reach the server") that appears at the bottom and leaves
 * by itself.
 */
import { Component, each, element, props, signal, text } from '@flybyme/mesh-web';
/** Something is loading and there is no telling how long. `label` is what a screen reader hears. */
export function spinner(label = 'Loading') {
    return element('Text', {
        props: { class: 'kit-spinner', role: 'status', 'aria-label': label },
    });
}
/**
 * How far along something is: `value` from 0 to 1, or undefined while it cannot be told (the bar
 * then sweeps). Read in a binding, so a signal moves it.
 */
export function progress(value, label) {
    const percent = () => {
        const v = value();
        return v === undefined ? undefined : Math.round(Math.min(1, Math.max(0, v)) * 100);
    };
    return element('Stack', {
        props: {
            class: 'kit-progress',
            role: 'progressbar',
            'aria-label': label,
            'aria-valuemin': '0',
            'aria-valuemax': '100',
            'aria-valuenow': () => {
                const p = percent();
                return p === undefined ? '' : String(p);
            },
            'data-indeterminate': () => String(percent() === undefined),
        },
        children: [element('Stack', {
                props: {
                    class: 'kit-progress-fill',
                    style: () => {
                        const p = percent();
                        return p === undefined ? '' : `width: ${p}%`;
                    },
                },
            })],
    });
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
export class SnackQueue {
    items = signal([]);
    #next = 1;
    #timers = new Map();
    show(message, tone = 'neutral') {
        const id = this.#next;
        this.#next += 1;
        const kept = this.items().slice(-2);
        for (const old of this.items()) {
            if (!kept.includes(old))
                this.#forget(old.id);
        }
        this.items.set([...kept, { id, message, tone }]);
        this.#timers.set(id, setTimeout(() => this.dismiss(id), tone === 'bad' ? 7000 : 4000));
    }
    dismiss(id) {
        this.#forget(id);
        this.items.set(this.items().filter((s) => s.id !== id));
    }
    #forget(id) {
        const timer = this.#timers.get(id);
        if (timer !== undefined)
            clearTimeout(timer);
        this.#timers.delete(id);
    }
}
/** Where a `SnackQueue`'s messages appear: mount once, in the layout. */
export class Snackbars extends Component({ props: props() }) {
    render() {
        const { queue } = this.props;
        return element('Stack', {
            props: { class: 'kit-snackbars', role: 'status', 'aria-live': 'polite' },
            children: [each(queue.items, (s) => s.id, (snack) => element('Row', {
                    props: { class: 'kit-snackbar', 'data-tone': () => snack().tone },
                    children: [
                        element('Text', { props: { class: 'kit-snackbar-text' }, children: [text(() => snack().message)] }),
                        element('Button', {
                            props: { class: 'kit-snackbar-close', type: 'button', 'aria-label': 'Dismiss' },
                            intents: { activate: { action: this.on(() => queue.dismiss(snack().id)) } },
                            children: [text('✕')],
                        }),
                    ],
                }))],
        });
    }
}
//# sourceMappingURL=feedback.js.map