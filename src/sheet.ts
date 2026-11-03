/**
 * A side sheet: a panel that slides in from the right edge over the page, for the details of one
 * thing (a record, a log line, a deploy) without leaving the list. On a phone it takes the whole
 * screen. Built on mesh-web's `dialog`, so focus is trapped and Escape closes it, as in `Modal`.
 *
 * The page owns whether it is open: it passes a signal and sets it.
 */

import { Component, dialog, element, props, text, type Node, type Signal } from '@flybyme/mesh-web';

export interface SideSheetProps {
    readonly title: string | (() => string);
    readonly body: Node;
    readonly open: Signal<boolean>;
    readonly actions?: readonly Node[];
}

export class SideSheet extends Component({ props: props<SideSheetProps>() }) {
    readonly closeAction = this.on(() => {
        this.props.open.set(false);
    });

    render(): Node {
        const { title, body, open, actions } = this.props;
        const titleText = typeof title === 'function' ? title() : title;

        return dialog({
            open,
            props: { ariaLabel: titleText, class: 'kit-sheet-dialog' },
            intents: { dismiss: { action: this.closeAction } },
            children: [element('Stack', {
                props: { class: 'kit-sheet' },
                children: [
                    element('Row', {
                        props: { class: 'kit-sheet-head' },
                        children: [
                            element('Heading', { props: { level: 2 }, children: [text(title)] }),
                            element('Button', {
                                props: { class: 'kit-modal-close', type: 'button', 'aria-label': 'Close' },
                                intents: { activate: { action: this.closeAction } },
                                children: [text('✕')],
                            }),
                        ],
                    }),
                    element('Stack', { props: { class: 'kit-sheet-body' }, children: Array.isArray(body) ? body : [body] }),
                    ...(actions !== undefined && actions.length > 0 ? [
                        element('Row', { props: { class: 'kit-actions kit-sheet-actions' }, children: actions }),
                    ] : []),
                ],
            })],
        });
    }
}
