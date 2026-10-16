/**
 * Tabs navigation function.
 *
 * Renders a row of tabs where each tab is an accessible link (`role="tab"`),
 * with `aria-selected` and `aria-current="page"` on the active tab.
 * The container has `role="tablist"` and scrolls sideways within itself on phone screens.
 */
import { type Node } from '@flybyme/mesh-web';
export type TabLink = (href: string, className: string, children: readonly Node[]) => Node;
export interface TabItem {
    readonly id?: string;
    readonly label: string;
    readonly href: string;
    readonly active?: boolean;
}
export interface TabsOptions {
    readonly link?: TabLink;
    readonly label?: string;
}
export declare function tabs(items: readonly TabItem[], linkOrOptions?: TabLink | TabsOptions): Node;
//# sourceMappingURL=tabs.d.ts.map