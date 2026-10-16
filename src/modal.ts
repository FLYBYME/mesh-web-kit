/**
 * Modal dialog component and command modal factory.
 *
 * Built on mesh-web's `dialog` primitive: accessible title, focus trap, Escape key handling,
 * and backdrop dismissal. Full-screen on mobile viewports.
 */

import {
    Component, dialog, element, props, signal, text,
    type Command, type Node, type Signal,
} from '@flybyme/mesh-web';
import { commandForm, type CommandFormProps, type Fields } from './command-form.js';

export interface ModalProps {
    readonly title: string | (() => string);
    readonly body: Node;
    readonly actions?: readonly Node[];
    /** A trigger button or node, a label string, or a function that receives the open callback. */
    readonly trigger?: Node | string | ((open: () => void) => Node);
    /** Controlled open signal: if supplied, the modal reflects and updates this signal. */
    readonly open?: Signal<boolean>;
    readonly onClose?: () => void;
}

export class Modal extends Component({ props: props<ModalProps>() }) {
    readonly #internalOpen = signal(false);

    readonly #isOpen = (): boolean => (this.props.open !== undefined ? this.props.open() : this.#internalOpen());

    readonly #open = (): void => {
        if (this.props.open !== undefined) {
            this.props.open.set(true);
        } else {
            this.#internalOpen.set(true);
        }
    };

    readonly #close = (): void => {
        if (this.props.open !== undefined) {
            this.props.open.set(false);
        } else {
            this.#internalOpen.set(false);
        }
        this.props.onClose?.();
    };

    readonly openAction = this.on(this.#open);
    readonly closeAction = this.on(this.#close);

    #renderTrigger(): Node {
        const tr = this.props.trigger;
        if (tr === undefined) {
            return [];
        }
        if (typeof tr === 'function') {
            return tr(this.#open);
        }
        if (typeof tr === 'string') {
            return element('Button', {
                props: { class: 'kit-button', type: 'button' },
                intents: { activate: { action: this.openAction } },
                children: [text(tr)],
            });
        }
        return element('Row', {
            props: { class: 'kit-modal-trigger' },
            intents: { activate: { action: this.openAction } },
            children: Array.isArray(tr) ? tr : [tr],
        });
    }

    render(): Node {
        const titleVal = (): string => (typeof this.props.title === 'function' ? this.props.title() : this.props.title);
        const titleText = typeof this.props.title === 'function' ? this.props.title() : this.props.title;

        return [
            this.#renderTrigger(),
            dialog({
                open: this.#isOpen,
                props: {
                    ariaLabel: titleText,
                    class: 'kit-modal-dialog',
                },
                intents: { dismiss: { action: this.closeAction } },
                children: [
                    element('Stack', {
                        props: { class: 'kit-modal' },
                        children: [
                            element('Row', {
                                props: { class: 'kit-modal-head' },
                                children: [
                                    element('Heading', {
                                        props: { level: 2 },
                                        children: [text(titleVal)],
                                    }),
                                    element('Button', {
                                        props: {
                                            class: 'kit-modal-close',
                                            type: 'button',
                                            'aria-label': 'Close dialog',
                                        },
                                        intents: { activate: { action: this.closeAction } },
                                        children: [text('✕')],
                                    }),
                                ],
                            }),
                            element('Stack', {
                                props: { class: 'kit-modal-body' },
                                children: Array.isArray(this.props.body) ? this.props.body : [this.props.body],
                            }),
                            ...(this.props.actions !== undefined && this.props.actions.length > 0 ? [
                                element('Row', {
                                    props: { class: 'kit-actions kit-modal-actions' },
                                    children: this.props.actions,
                                }),
                            ] : []),
                        ],
                    }),
                ],
            }),
        ];
    }
}

export interface CommandModalProps<I, O> extends CommandFormProps<I, O> {
    readonly title?: string | (() => string);
    readonly trigger?: Node | string | ((open: () => void) => Node);
    readonly open?: Signal<boolean>;
}

export function commandModal<I extends object, O>(command: Command<I, O>, fields: Fields<I>) {
    const Form = commandForm(command, fields);

    return class CommandModal extends Component({ props: props<CommandModalProps<I, O>>() }) {
        readonly #open = signal(false);

        readonly #close = (): void => {
            if (this.props.open !== undefined) {
                this.props.open.set(false);
            } else {
                this.#open.set(false);
            }
        };

        readonly #onDone = (result: O): void => {
            this.#close();
            this.props.onDone?.(result);
        };

        readonly #onCancel = (): void => {
            this.#close();
            this.props.onCancel?.();
        };

        render(): Node {
            const openSignal = this.props.open ?? this.#open;
            const title = this.props.title ?? command.title;
            const trigger = this.props.trigger ?? command.title;

            return this.mount(Modal, {
                title,
                open: openSignal,
                trigger,
                onClose: this.#onCancel,
                body: this.mount(Form, {
                    fixed: this.props.fixed,
                    initial: this.props.initial,
                    submitLabel: this.props.submitLabel ?? command.title,
                    onDone: this.#onDone,
                    onCancel: this.#onCancel,
                }),
            });
        }
    };
}
