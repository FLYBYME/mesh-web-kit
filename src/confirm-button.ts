/**
 * A button that asks first. Every destructive action on a site should be one of these: nothing is
 * deleted by a single stray click, and a failure is shown where the person is looking instead of
 * vanishing into a `catch {}`.
 *
 * A component because it remembers things: whether the question is open, whether the action is
 * running, and what went wrong.
 */

import { Component, dialog, element, props, signal, text, when, type Node } from '@flybyme/mesh-web';

export interface ConfirmButtonProps {
    /** On the button: "Delete". */
    readonly label: string;
    /** In the dialog: "Delete example.com and all its records?". */
    readonly question: string;
    /** On the confirming button: "Delete zone". Defaults to `label`. */
    readonly confirm?: string;
    readonly run: () => Promise<unknown>;
    /** `danger` (the default) for something that cannot be undone. */
    readonly tone?: 'danger' | 'neutral';
}

export class ConfirmButton extends Component({ props: props<ConfirmButtonProps>() }) {
    readonly open = signal(false);
    readonly busy = signal(false);
    readonly problem = signal<string | undefined>(undefined);

    readonly ask = this.on(() => { this.problem.set(undefined); this.open.set(true); });
    readonly cancel = this.on(() => { if (!this.busy()) this.open.set(false); });
    readonly go = this.on(() => void this.#confirmed());

    render(): Node {
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
                                    props: { class: 'kit-button', 'data-tone': tone, disabled: this.busy },
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

    async #confirmed(): Promise<void> {
        this.busy.set(true);
        this.problem.set(undefined);
        try {
            await this.props.run();
            this.open.set(false);
        } catch (error) {
            this.problem.set(error instanceof Error ? error.message : String(error));
        } finally {
            this.busy.set(false);
        }
    }
}
