/**
 * @flybyme/mesh-web-kit — the pieces every mesh-web site needs, built once on the app model.
 *
 * The rules every piece follows (README.md): no services, no fetching, no knowledge of any domain —
 * data comes in as props, what the person did goes out as callbacks or commands. A piece is a
 * component only if it remembers something; otherwise it is a function returning nodes. Anything
 * generic over a type is a factory, declared once per type at module level.
 *
 * Styles: `import '@flybyme/mesh-web-kit/kit.css'`, and set the `--kit-*` tokens to restyle.
 */
export { loaded, emptyState, one } from './states.js';
export { pageHeader, panel, stat, stats } from './layout.js';
export { list, listRow, badge } from './list.js';
export { filterBar } from './filter-bar.js';
export { dataTable } from './data-table.js';
export { Pager } from './pager.js';
export { ConfirmButton } from './confirm-button.js';
export { commandForm } from './command-form.js';
export { ago, plural, bytes } from './format.js';
//# sourceMappingURL=index.js.map