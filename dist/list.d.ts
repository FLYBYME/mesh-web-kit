/**
 * A list of things, each row the same shape: a title (usually a link), badges, an optional line of
 * detail, a meta line, and actions on the right.
 *
 * The row takes **nodes**, not data. A zone row and a repository row differ in what is in them, not
 * in their shape, so the shape is what is shared; each page fills it in. A link is built by the page
 * (`this.mount(Link, …)` needs a host), then handed in.
 */
import { type Node } from '@flybyme/mesh-web';
export interface ListRowParts {
    readonly title: Node;
    readonly badges?: readonly Node[];
    /** A second line under the title — a description. */
    readonly detail?: Node;
    /** Small print: counts, dates. */
    readonly meta?: Node;
    readonly actions?: readonly Node[];
}
export declare function listRow(parts: ListRowParts, props?: {
    readonly [name: string]: string | (() => string);
}): Node;
/**
 * The list around the rows: keyed, so a row that stays keeps its DOM (and anything open inside it)
 * when the list changes around it.
 */
export declare function list<T>(items: () => readonly T[], key: (item: T) => string, row: (item: () => T) => Node, props?: {
    readonly label?: string;
}): Node;
/** A small label: a status, a flag. `tone` picks the kit's colour for it. */
export declare function badge(label: string | (() => string), tone?: 'neutral' | 'good' | 'warn' | 'bad' | (() => 'neutral' | 'good' | 'warn' | 'bad')): Node;
//# sourceMappingURL=list.d.ts.map