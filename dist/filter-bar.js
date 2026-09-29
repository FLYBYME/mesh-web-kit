/**
 * A search box and one filter, bound to two signals the page owns.
 *
 * The page keeps the state (it may want it in the URL; it filters with it), so the bar is only the
 * two controls — but the controls need `this.on`, so it is a component. Generic over the filter's
 * values, so it is a factory, declared once per filter type at module level:
 *
 * ```ts
 * const ZoneFilterBar = filterBar<'all' | 'signed' | 'unsigned'>();
 * this.mount(ZoneFilterBar, { search: this.search, filter: this.filter, options, label: 'zones' })
 * ```
 *
 * A value the select reports that is not one of `options` is ignored rather than trusted.
 */
import { Component, element, props, text } from '@flybyme/mesh-web';
export function filterBar() {
    return class FilterBar extends Component({ props: props() }) {
        render() {
            const { search, filter, options, label } = this.props;
            return element('Row', {
                props: { class: 'kit-filter-bar' },
                children: [
                    element('Input', {
                        props: { type: 'search', class: 'kit-search', 'aria-label': `Search ${label}`, placeholder: `Search ${label}…`, value: search },
                        intents: { change: { action: this.on((v) => search.set(typeof v === 'string' ? v : '')) } },
                    }),
                    element('Select', {
                        props: { 'aria-label': `Filter ${label}`, value: filter },
                        intents: {
                            change: {
                                action: this.on((v) => {
                                    const found = options.find((o) => o.value === v);
                                    if (found !== undefined)
                                        filter.set(found.value);
                                }),
                            },
                        },
                        children: options.map((o) => element('Option', { props: { value: o.value }, children: [text(o.label)] })),
                    }),
                ],
            });
        }
    };
}
//# sourceMappingURL=filter-bar.js.map