/**
 * How a page and its parts are framed: the header at the top of a page, a titled panel, one
 * number with its label, plain surfaces, cards, settings sections, and toolbars.
 * Functions — none of this has state.
 */
import { type Node } from '@flybyme/mesh-web';
/** A page's title and the actions beside it ("New zone", "Refresh"). */
export declare function pageHeader(title: string | (() => string), actions?: readonly Node[]): Node;
/** A titled card. Its accessible name is the title, so a test (or a screen reader) can find it. */
export declare function panel(title: string, body: Node, actions?: readonly Node[]): Node;
/** One number with its label. `data-stat` is the label, lowercased, with spaces as dashes. */
export declare function stat(label: string, value: () => number | string): Node;
/** A row of stats. */
export declare function stats(children: readonly Node[]): Node;
export interface BoxOptions {
    readonly tone?: 'neutral' | 'accent' | 'danger' | 'good' | 'warn';
    readonly padding?: 'none' | 'sm' | 'md' | 'lg';
}
/** A plain bordered surface, with no title. */
export declare function box(body: Node, options?: BoxOptions): Node;
export interface CardOptions {
    readonly href?: string | (() => string);
    readonly actions?: readonly Node[];
}
/** A clickable summary for grids of things. */
export declare function card(title: string | (() => string), body: Node, options?: CardOptions): Node;
/** A heading with its content, for settings pages ("General", "Danger zone"). */
export declare function section(title: string | (() => string), body: Node, actions?: readonly Node[]): Node;
/** A row of controls that wraps on a phone. */
export declare function toolbar(left: Node | readonly Node[], right?: Node | readonly Node[], options?: {
    readonly label?: string;
}): Node;
//# sourceMappingURL=layout.d.ts.map