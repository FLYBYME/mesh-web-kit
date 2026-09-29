/**
 * A list of things, each row the same shape: a title (usually a link), badges, an optional line of
 * detail, a meta line, and actions on the right.
 *
 * The row takes **nodes**, not data. A zone row and a repository row differ in what is in them, not
 * in their shape, so the shape is what is shared; each page fills it in. A link is built by the page
 * (`this.mount(Link, …)` needs a host), then handed in.
 */
import { each, element, text } from '@flybyme/mesh-web';
export function listRow(parts, props = {}) {
    return element('ListItem', {
        props: { class: 'kit-row', ...props },
        children: [
            element('Stack', {
                props: { class: 'kit-row-main' },
                children: [
                    element('Row', { props: { class: 'kit-row-title' }, children: [parts.title, ...(parts.badges ?? [])] }),
                    ...(parts.detail === undefined ? [] : [element('Text', { props: { class: 'kit-muted' }, children: [parts.detail] })]),
                ],
            }),
            element('Row', {
                props: { class: 'kit-row-side' },
                children: [
                    ...(parts.meta === undefined ? [] : [element('Text', { props: { class: 'kit-muted' }, children: [parts.meta] })]),
                    element('Row', { props: { class: 'kit-actions' }, children: parts.actions ?? [] }),
                ],
            }),
        ],
    });
}
/**
 * The list around the rows: keyed, so a row that stays keeps its DOM (and anything open inside it)
 * when the list changes around it.
 */
export function list(items, key, row, props = {}) {
    return element('List', {
        props: { class: 'kit-list', ...(props.label === undefined ? {} : { 'aria-label': props.label }) },
        children: [each(items, key, row)],
    });
}
/** A small label: a status, a flag. `tone` picks the kit's colour for it. */
export function badge(label, tone = 'neutral') {
    return element('Badge', { props: { class: 'kit-badge', 'data-tone': tone }, children: [text(label)] });
}
//# sourceMappingURL=list.js.map