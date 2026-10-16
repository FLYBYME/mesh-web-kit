/**
 * Menu component: a button that opens a short list of actions.
 *
 * Closes on Escape and outside click. Arrow keys navigate between items.
 */

import {
    command, Component, element, props, signal, text, when,
    type Node,
} from '@flybyme/mesh-web';

export interface MenuItem {
    readonly label: string;
    readonly run: () => void | Promise<void>;
    readonly tone?: 'danger' | 'neutral';
    readonly disabled?: boolean;
}

export interface MenuProps {
    readonly label: string;
    readonly items: readonly MenuItem[];
    readonly tone?: 'primary' | 'neutral' | 'danger';
}

export class Menu extends Component({ props: props<MenuProps>() }) {
    static #activeMenu: Menu | undefined = undefined;

    readonly open = signal(false);
    readonly activeIndex = signal(0);

    readonly #toggle = (): void => {
        const next = !this.open();
        this.open.set(next);
        this.activeIndex.set(0);
        if (next) {
            Menu.#activeMenu = this;
        } else if (Menu.#activeMenu === this) {
            Menu.#activeMenu = undefined;
        }
    };

    readonly #close = (): void => {
        this.open.set(false);
        if (Menu.#activeMenu === this) {
            Menu.#activeMenu = undefined;
        }
    };

    readonly toggleAction = this.on(this.#toggle);
    readonly closeAction = this.on(this.#close);

    readonly down = command({
        title: 'Next menu item',
        key: 'arrowdown',
        run: () => {
            const active = Menu.#activeMenu;
            if (active !== undefined && active.props.items.length > 0) {
                active.activeIndex.set((active.activeIndex() + 1) % active.props.items.length);
            }
        },
    });

    readonly up = command({
        title: 'Previous menu item',
        key: 'arrowup',
        run: () => {
            const active = Menu.#activeMenu;
            if (active !== undefined && active.props.items.length > 0) {
                active.activeIndex.set((active.activeIndex() - 1 + active.props.items.length) % active.props.items.length);
            }
        },
    });

    readonly esc = command({
        title: 'Close menu',
        key: 'escape',
        run: () => {
            const active = Menu.#activeMenu;
            if (active !== undefined) {
                active.#close();
            }
        },
    });

    dispose(): void {
        if (Menu.#activeMenu === this) {
            Menu.#activeMenu = undefined;
        }
    }

    render(): Node {
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
