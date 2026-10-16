/**
 * Copy text component: displays a value with a copy button, remembering the copied state.
 */
import { Component, element, props, signal, text, } from '@flybyme/mesh-web';
export class CopyText extends Component({ props: props() }) {
    copied = signal(false);
    #timer;
    copy = this.on(async () => {
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
    dispose() {
        if (this.#timer !== undefined) {
            clearTimeout(this.#timer);
        }
    }
    render() {
        const val = () => (typeof this.props.value === 'function' ? this.props.value() : this.props.value);
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
//# sourceMappingURL=copy-text.js.map