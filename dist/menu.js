/**
 * Menu component: a button that opens a short list of actions.
 *
 * Closes on Escape and outside click. Arrow keys navigate between items.
 */
var _a;
import { command, Component, element, props, signal, text, when, } from '@flybyme/mesh-web';
export class Menu extends Component({ props: props() }) {
    static #activeMenu = undefined;
    open = signal(false);
    activeIndex = signal(0);
    #toggle = () => {
        const next = !this.open();
        this.open.set(next);
        this.activeIndex.set(0);
        if (next) {
            _a.#activeMenu = this;
        }
        else if (_a.#activeMenu === this) {
            _a.#activeMenu = undefined;
        }
    };
    #close = () => {
        this.open.set(false);
        if (_a.#activeMenu === this) {
            _a.#activeMenu = undefined;
        }
    };
    toggleAction = this.on(this.#toggle);
    closeAction = this.on(this.#close);
    down = command({
        title: 'Next menu item',
        key: 'arrowdown',
        run: () => {
            const active = _a.#activeMenu;
            if (active !== undefined && active.props.items.length > 0) {
                active.activeIndex.set((active.activeIndex() + 1) % active.props.items.length);
            }
        },
    });
    up = command({
        title: 'Previous menu item',
        key: 'arrowup',
        run: () => {
            const active = _a.#activeMenu;
            if (active !== undefined && active.props.items.length > 0) {
                active.activeIndex.set((active.activeIndex() - 1 + active.props.items.length) % active.props.items.length);
            }
        },
    });
    esc = command({
        title: 'Close menu',
        key: 'escape',
        run: () => {
            const active = _a.#activeMenu;
            if (active !== undefined) {
                active.#close();
            }
        },
    });
    dispose() {
        if (_a.#activeMenu === this) {
            _a.#activeMenu = undefined;
        }
    }
    render() {
        const tone = this.props.tone ?? 'neutral';
        return element('Stack', {
            props: { class: 'kit-menu-host' },
            children: [
                element('Button', {
                    props: {
                        class: 'kit-button',
                        'data-tone': tone,
                        'aria-haspopup': 'menu',
                        'aria-expanded': () => String(this.open()),
                    },
                    intents: { activate: { action: this.toggleAction } },
                    children: [text(this.props.label)],
                }),
                when(this.open, () => element('Stack', {
                    props: { class: 'kit-menu-backdrop', 'data-menu-backdrop': 'true', 'aria-label': 'Close menu' },
                    intents: { activate: { action: this.closeAction } },
                })),
                when(this.open, () => element('Stack', {
                    props: {
                        class: 'kit-menu',
                        role: 'menu',
                        'aria-label': this.props.label,
                    },
                    intents: { dismiss: { action: this.closeAction } },
                    children: this.props.items.map((item, index) => element('Button', {
                        props: {
                            role: 'menuitem',
                            class: () => `kit-menu-item ${this.activeIndex() === index ? 'kit-menu-item-active' : ''}`.trim(),
                            'data-active': () => (this.activeIndex() === index ? 'true' : 'false'),
                            ...(item.tone !== undefined ? { 'data-tone': item.tone } : {}),
                            disabled: item.disabled,
                        },
                        intents: {
                            activate: {
                                action: this.on(() => {
                                    this.#close();
                                    void item.run();
                                }),
                            },
                        },
                        children: [text(item.label)],
                    })),
                })),
            ],
        });
    }
}
_a = Menu;
//# sourceMappingURL=menu.js.map