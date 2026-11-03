/**
 * The blocks a public site's pages are made of: a hero, full-width bands, a grid of features, plan
 * cards, a call to action, a picture, footer columns, and the card a sign-in page centres.
 *
 * Functions, like the layout pieces: text and nodes in, nodes out. Links are passed in as nodes,
 * so a site uses its router's `Link` and the kit never knows a URL.
 */
import { type Node } from '@flybyme/mesh-web';
export interface HeroParts {
    /** A short line above the title: "Hosting, DNS and mail". */
    readonly eyebrow?: string;
    readonly title: string;
    readonly lead: string;
    readonly actions?: readonly Node[];
    /** A line under the buttons: "No card needed". */
    readonly note?: string;
    /** A picture beside the text on a wide screen, under it on a phone. */
    readonly art?: Node;
}
/** The top of a home page: one headline on a gradient field. */
export declare function hero(parts: HeroParts): Node;
export interface BandOptions {
    /** `plain` is the page, `tint` a step off it, `dark` the dark band whatever the scheme. */
    readonly tone?: 'plain' | 'tint' | 'dark';
    readonly eyebrow?: string;
    readonly title?: string;
    readonly lead?: string;
    /** The band's accessible name, when it has no title. */
    readonly label?: string;
}
/** A full-width stripe of the page with its content centred at the site's width. */
export declare function band(body: Node, options?: BandOptions): Node;
export interface Feature {
    readonly title: string;
    readonly body: string;
    /** One or two characters, or an emoji-free glyph, shown in the tinted square. */
    readonly mark?: string;
    readonly link?: Node;
}
/** Features in a grid: three across on a wide screen, one on a phone. */
export declare function featureGrid(features: readonly Feature[]): Node;
export interface PlanCardParts {
    readonly name: string;
    /** As it should read: "$5", "Free". */
    readonly price: string;
    /** "a month". */
    readonly period?: string;
    readonly summary?: string;
    readonly features: readonly string[];
    readonly action?: Node;
    /** The one plan to draw the eye to; at most one per row. */
    readonly featured?: boolean;
    /** The featured plan's ribbon: "Most chosen". */
    readonly ribbon?: string;
}
export declare function planCard(parts: PlanCardParts): Node;
/** Plan cards side by side, wrapping on a phone. */
export declare function planGrid(cards: readonly Node[]): Node;
/** The closing ask of a page: a title, a line, and the buttons, on the gradient. */
export declare function ctaBand(title: string, body: string, actions: readonly Node[]): Node;
export interface PictureOptions {
    /** Width over height; 16/10 when not given. */
    readonly ratio?: number;
    /** Framed as a window, with a thin top bar: for screenshots of the product. */
    readonly framed?: boolean;
}
/**
 * A picture by URL. Drawn as the background of a box with `role="img"`, which keeps the kit to the
 * renderer's primitives; `alt` is its accessible name and must say what the picture shows.
 */
export declare function picture(src: string, alt: string, options?: PictureOptions): Node;
export interface FooterColumn {
    readonly heading: string;
    readonly links: readonly Node[];
}
/** A site's footer: the brand and a line about it, columns of links, and a bottom line. */
export declare function footer(about: Node, columns: readonly FooterColumn[], bottom: Node): Node;
/** The card a sign-in, sign-up or reset page centres on the screen. */
export declare function authCard(title: string, lead: string, body: Node, foot?: Node): Node;
//# sourceMappingURL=blocks.d.ts.map