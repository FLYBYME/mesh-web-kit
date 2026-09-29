/**
 * Accessibility audit with axe-core — the checker behind most browser accessibility tools — run on
 * the real, rendered DOM in a real Chrome. Returns one line per violation, so a failing test says
 * what is wrong and where, not just that something is.
 */

import axe from 'axe-core';

/** Rules about a whole page (landmarks, one h1). A piece audited alone is not a page. */
const PAGE_RULES = ['region', 'landmark-one-main', 'page-has-heading-one'];

export async function audit(root: Element, options: { readonly page?: boolean } = {}): Promise<string[]> {
    const rules = Object.fromEntries((options.page === true ? [] : PAGE_RULES).map((id) => [id, { enabled: false }]));
    const result = await axe.run(root, { resultTypes: ['violations'], rules });
    return result.violations.flatMap((v) => v.nodes.map((n) => {
        // For contrast, say which colours: "fails" is not something anyone can fix.
        const data = n.any[0]?.data as { fgColor?: string; bgColor?: string; contrastRatio?: number } | undefined;
        const colours = data?.fgColor === undefined ? '' : ` [${data.fgColor} on ${data.bgColor}, ${data.contrastRatio}:1]`;
        return `${v.id} (${v.impact ?? 'unknown'}): ${v.help} — ${n.target.join(' ')}${colours}`;
    }));
}
