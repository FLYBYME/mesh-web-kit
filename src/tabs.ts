/**
 * Tabs navigation function.
 *
 * Renders a row of tabs where each tab is an accessible link (`role="tab"`),
 * with `aria-selected` and `aria-current="page"` on the active tab.
 * The container has `role="tablist"` and scrolls sideways within itself on phone screens.
 */

import { element, text, type Node } from '@flybyme/mesh-web';

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

export function tabs(
    items: readonly TabItem[],
    linkOrOptions?: TabLink | TabsOptions
): Node {
    const hasCustomLink = typeof linkOrOptions === 'function' || linkOrOptions?.link !== undefined;
    const link: TabLink | undefined = typeof linkOrOptions === 'function'
        ? linkOrOptions
        : linkOrOptions?.link;

    const label = typeof linkOrOptions === 'object' ? linkOrOptions.label : undefined;

    return element('Row', {
        props: {
            class: 'kit-tabs',
            role: 'tablist',
            ...(label !== undefined ? { 'aria-label': label } : {}),
        },
        children: items.map((tab) => {
            const isActive = tab.active === true;
            const activeClass = isActive ? ' active kit-tab-active' : '';
            const tabProps: Record<string, string> = {
                role: 'tab',
                class: `kit-tab${activeClass}`.trim(),
                'aria-selected': isActive ? 'true' : 'false',
            };
            if (isActive) {
                tabProps['aria-current'] = 'page';
            }
            if (tab.id !== undefined) {
                tabProps['data-tab'] = tab.id;
            }

            if (!hasCustomLink || link === undefined) {
                return element('Link', {
                    props: {
                        ...tabProps,
                        href: tab.href,
                        class: `kit-tab kit-tab-link${activeClass}`.trim(),
                    },
                    children: [text(tab.label)],
                });
            }

            const linkNode = link(
                tab.href,
                `kit-tab-link${activeClass}`.trim(),
                [text(tab.label)]
            );
            return element('Text', {
                props: tabProps,
                children: [linkNode],
            });
        }),
    });
}
