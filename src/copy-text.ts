/**
 * Copy text component: displays a value with a copy button, remembering the copied state.
 */

import {
    Component, element, props, signal, text,
    type Node,
} from '@flybyme/mesh-web';

export interface CopyTextProps {
    readonly value: string | (() => string);
    readonly label?: string;
}

export class CopyText extends Component({ props: props<CopyTextProps>() }) {
    readonly copied = signal(false);
    #timer: ReturnType<typeof setTimeout> | undefined;

    readonly copy = this.on(async () => {
        const val = typeof this.props.value === 'function' ? this.props.value() : this.props.value;
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(val);
        }
        this.copied.set(true);
        if (this.#timer !== undefined) {
            clearTimeout(this.#timer);
        }
        this.#timer = setTimeout(() => {
            this.copied.set(false);
        }, 2000);
    });

    dispose(): void {
        if (this.#timer !== undefined) {
            clearTimeout(this.#timer);
        }
    }

    render(): Node {
        const val = (): string => (typeof this.props.value === 'function' ? this.props.value() : this.props.value);
        return element('Row', {
            props: { class: 'kit-copy-text' },
            children: [
                element('Text', {
                    props: { class: 'kit-copy-value' },
                    children: [text(val)],
                }),
                element('Button', {
                    props: {
                        class: 'kit-button kit-copy-btn',
                        type: 'button',
                        'aria-label': () => (this.copied() ? 'Copied' : (this.props.label ? `Copy ${this.props.label}` : 'Copy to clipboard')),
                    },
                    intents: { activate: { action: this.copy } },
                    children: [text(() => (this.copied() ? 'Copied' : 'Copy'))],
                }),
            ],
        });
    }
}

export const copyText = CopyText;
