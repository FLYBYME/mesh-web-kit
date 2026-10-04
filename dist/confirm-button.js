/**
 * A button that asks first. Every destructive action on a site should be one of these: nothing is
 * deleted by a single stray click, and a failure is shown where the person is looking instead of
 * vanishing into a `catch {}`.
 *
 * A component because it remembers things: whether the question is open, whether the action is
 * running, and what went wrong.
 */
import { Component, dialog, element, props, signal, text, when } from '@flybyme/mesh-web';
export class ConfirmButton extends Component({ props: props() }) {
    open = signal(false);
    busy = signal(false);
    problem = signal(undefined);
    /** What has been typed so far, when `typed` asks for it. */
    entered = signal('');
    ask = this.on(() => { this.problem.set(undefined); this.entered.set(''); this.open.set(true); });
    type = this.on((v) => this.entered.set(typeof v === 'string' ? v : ''));
    /** Whether the confirming button works: always, or once the asked-for text is typed exactly. */
    #confirmable = () => this.props.typed === undefined || this.entered().trim() === this.props.typed;
    cancel = this.on(() => { if (!this.busy())
        this.open.set(false); });
    go = this.on(() => void this.#confirmed());
    render() {
        const tone = this.props.tone ?? 'danger';
        return [
            element('Button', {
                props: { class: 'kit-button', 'data-tone': tone },
                intents: { activate: { action: this.ask } },
                children: [text(this.props.label)],
            }),
            dialog({
                open: this.open,
                props: { ariaLabel: this.props.question },
                intents: { dismiss: { action: this.cancel } },
                children: [element('Stack', {
                        props: { class: 'kit-confirm' },
                        children: [
                            element('Text', { children: [text(this.props.question)] }),
                            when(() => this.props.typed !== undefined, () => element('Stack', {
                                props: { class: 'kit-confirm-typed' },
                                children: [
                                    element('Text', { children: [text(`Type ${this.props.typed ?? ''} to confirm.`)] }),
                                    element('Input', {
                                        props: { type: 'text', 'aria-label': `Type ${this.props.typed ?? ''} to confirm`, autocomplete: 'off', value: this.entered, 'data-confirm-typed': 'true' },
                                        intents: { change: { action: this.type } },
                                    }),
                                ],
                            })),
                            when(() => this.problem() !== undefined, () => element('Text', {
                                props: { role: 'alert', class: 'kit-error' },
                                children: [text(() => this.problem() ?? '')],
                            })),
                            element('Row', {
                                props: { class: 'kit-actions' },
                                children: [
                                    element('Button', {
                                        props: { class: 'kit-button', disabled: this.busy },
                                        intents: { activate: { action: this.cancel } },
                                        children: [text('Cancel')],
                                    }),
                                    element('Button', {
                                        props: { class: 'kit-button', 'data-tone': tone, disabled: () => this.busy() || !this.#confirmable() },
                                        intents: { activate: { action: this.go } },
                                        children: [text(() => (this.busy() ? 'Working…' : this.props.confirm ?? this.props.label))],
                                    }),
                                ],
                            }),
                        ],
                    })],
            }),
        ];
    }
    async #confirmed() {
        // Not typed yet: the button is disabled, and a key press reaching here anyway does nothing.
        if (!this.#confirmable())
            return;
        this.busy.set(true);
        this.problem.set(undefined);
        try {
            await this.props.run();
            this.open.set(false);
        }
        catch (error) {
            this.problem.set(error instanceof Error ? error.message : String(error));
        }
        finally {
            this.busy.set(false);
        }
    }
}
//# sourceMappingURL=confirm-button.js.map