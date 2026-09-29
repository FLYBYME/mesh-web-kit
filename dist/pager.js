/**
 * Previous / next, as real links. The URL is the state — page 3 is `?page=3` — so it survives a
 * reload, a shared link and the back button. A component only because `Link` is mounted; it keeps
 * no state of its own.
 */
import { Component, element, Link, props, text, when } from '@flybyme/mesh-web';
export class Pager extends Component({
    props: props(),
}) {
    render() {
        const { page, pages, href } = this.props;
        return element('Row', {
            props: { class: 'kit-pager', role: 'navigation', 'aria-label': 'Pages' },
            children: [
                // `href` as a function: the `when` keeps the link while the page changes under it.
                when(() => page() > 1, () => this.mount(Link, { href: () => href(page() - 1), children: [text('← Previous')] })),
                element('Text', { props: { 'data-page-of': '' }, children: [text(() => `Page ${page()} of ${Math.max(pages(), 1)}`)] }),
                when(() => page() < pages(), () => this.mount(Link, { href: () => href(page() + 1), children: [text('Next →')] })),
            ],
        });
    }
}
//# sourceMappingURL=pager.js.map