/**
 * Choices a person makes in place: filter chips, a switch, segmented buttons. Each is bound to a
 * signal the page owns (`Settable`, the filter bar's shape), and is a component because it needs
 * `this.on`. The generic ones are factories, declared once per value type at module level:
 *
 * ```ts
 * const KindChips = chips<'a' | 'mx' | 'txt'>();
 * const RangeButtons = segmented<'1h' | '24h' | '7d'>();
 * ```
 */

import { Component, element, props, text, type Node } from '@flybyme/mesh-web';
import type { FilterOption, Settable } from './filter-bar.js';

export interface ChipsProps<V extends string> {
    /** The chosen values; none chosen means "all", as a filter reads it. */
    readonly value: Settable<readonly V[]>;
    readonly options: readonly FilterOption<V>[];
    readonly label: string;
}

/** Filter chips: any number of options on or off. */
export function chips<V extends string>() {
    return class Chips extends Component({ props: props<ChipsProps<V>>() }) {
        render(): Node {
            const { value, options, label } = this.props;

            return element('Row', {
                props: { class: 'kit-chips', role: 'group', 'aria-label': label },
                children: options.map((option) => {
                    const on = (): boolean => value().includes(option.value);

                    return element('Button', {
                        props: { class: 'kit-chip', type: 'button', 'aria-pressed': () => String(on()) },
                        intents: {
                            activate: {
                                action: this.on(() => {
                                    value.set(on() ? value().filter((v) => v !== option.value) : [...value(), option.value]);
                                }),
                            },
                        },
                        children: [text(option.label)],
                    });
                }),
            });
        }
    };
}

/** A chip that only shows something: a tag on a record, with no action. */
export function chip(label: string | (() => string)): Node {
    return element('Text', { props: { class: 'kit-chip', 'data-static': 'true' }, children: [text(label)] });
}

export interface SwitchProps {
    readonly checked: Settable<boolean>;
    readonly label: string;
    readonly disabled?: boolean | (() => boolean);
}

/** A setting that takes effect the moment it is flipped (not a form field to be saved later). */
export class Switch extends Component({ props: props<SwitchProps>() }) {
    readonly flip = this.on(() => {
        this.props.checked.set(!this.props.checked());
    });

    render(): Node {
        const { checked, label, disabled } = this.props;

        return element('Row', {
            props: { class: 'kit-switch-row' },
            children: [
                element('Button', {
                    props: {
                        class: 'kit-switch',
                        type: 'button',
                        role: 'switch',
                        'aria-checked': () => String(checked()),
                        'aria-label': label,
                        ...(disabled !== undefined ? { disabled } : {}),
                    },
                    intents: { activate: { action: this.flip } },
                    children: [element('Text', { props: { class: 'kit-switch-thumb', 'aria-hidden': 'true' } })],
                }),
                element('Text', { props: { class: 'kit-switch-label', 'aria-hidden': 'true' }, children: [text(label)] }),
            ],
        });
    }
}

export interface SegmentedProps<V extends string> {
    readonly value: Settable<V>;
    readonly options: readonly FilterOption<V>[];
    readonly label: string;
}

/** Two to five options, exactly one chosen: a range ("1 h, 24 h, 7 d"), a view ("List, Grid"). */
export function segmented<V extends string>() {
    return class Segmented extends Component({ props: props<SegmentedProps<V>>() }) {
        render(): Node {
            const { value, options, label } = this.props;

            return element('Row', {
                props: { class: 'kit-segmented', role: 'group', 'aria-label': label },
                children: options.map((option) => element('Button', {
                    props: {
                        class: 'kit-segment',
                        type: 'button',
                        'aria-pressed': () => String(value() === option.value),
                    },
                    intents: { activate: { action: this.on(() => value.set(option.value)) } },
                    children: [text(option.label)],
                })),
            });
        }
    };
}

/** A line between two groups of things. */
export function divider(): Node {
    return element('Divider', { props: { class: 'kit-divider' } });
}

/**
 * A short explanation shown on hover and on keyboard focus. The tip is also the trigger's
 * accessible description, so it is never hover-only.
 */
export function tooltip(trigger: Node, tip: string): Node {
    return element('Text', {
        props: { class: 'kit-tooltip' },
        children: [
            trigger,
            element('Text', { props: { class: 'kit-tooltip-tip', role: 'tooltip' }, children: [text(tip)] }),
        ],
    });
}
