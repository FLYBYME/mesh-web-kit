/**
 * How a page and its parts are framed: the header at the top of a page, a titled panel, one
 * number with its label. Functions — none of this has state.
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
//# sourceMappingURL=layout.d.ts.map