/**
 * Modal dialog component and command modal factory.
 *
 * Built on mesh-web's `dialog` primitive: accessible title, focus trap, Escape key handling,
 * and backdrop dismissal. Full-screen on mobile viewports.
 */
import { Component, dialog, element, props, signal, text, } from '@flybyme/mesh-web';
import { commandForm } from './command-form.js';
export class Modal extends Component({ props: props() }) {
    #internalOpen = signal(false);
    #isOpen = () => (this.props.open !== undefined ? this.props.open() : this.#internalOpen());
    #open = () => {
        if (this.props.open !== undefined) {
            this.props.open.set(true);
        }
        else {
            this.#internalOpen.set(true);
        }
    };
    #close = () => {
        if (this.props.open !== undefined) {
            this.props.open.set(false);
        }
        else {
            this.#internalOpen.set(false);
        }
        this.props.onClose?.();
    };
    openAction = this.on(this.#open);
    closeAction = this.on(this.#close);
    #renderTrigger() {
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
    render() {
        const titleVal = () => (typeof this.props.title === 'function' ? this.props.title() : this.props.title);
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
export function commandModal(command, fields) {
    const Form = commandForm(command, fields);
    return class CommandModal extends Component({ props: props() }) {
        #open = signal(false);
        #close = () => {
            if (this.props.open !== undefined) {
                this.props.open.set(false);
            }
            else {
                this.#open.set(false);
            }
        };
        #onDone = (result) => {
            this.#close();
            this.props.onDone?.(result);
        };
        #onCancel = () => {
            this.#close();
            this.props.onCancel?.();
        };
        render() {
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
//# sourceMappingURL=modal.js.map