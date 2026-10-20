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
export { loaded, emptyState, one, type Loadable, type LoadableList, type LoadedOptions } from './states.js';
export { pageHeader, panel, stat, stats, box, type BoxOptions, card, type CardOptions, section, toolbar } from './layout.js';
export { list, listRow, badge, type ListRowParts } from './list.js';
export { filterBar, type FilterBarProps, type FilterOption, type Settable } from './filter-bar.js';
export { dataTable, type Column, type DataTableProps, type Sort } from './data-table.js';
export { Pager } from './pager.js';
export { ConfirmButton, type ConfirmButtonProps } from './confirm-button.js';
export { commandForm, type CommandFormProps, type Field, type Fields } from './command-form.js';
export { Modal, type ModalProps, commandModal, type CommandModalProps } from './modal.js';
export { tabs, type TabItem, type TabLink, type TabsOptions } from './tabs.js';
export { Menu, type MenuItem, type MenuProps } from './menu.js';
export { CopyText, copyText, type CopyTextProps } from './copy-text.js';
export { ago, plural, bytes, type AgoOptions } from './format.js';
export { clock, TimeAgo, type ClockOwner, type TimeAgoProps } from './clock.js';
//# sourceMappingURL=index.d.ts.map