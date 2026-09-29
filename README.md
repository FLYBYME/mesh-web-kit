# @flybyme/mesh-web-kit

The pieces every mesh-web site needs, built once on the app model, so no site rebuilds its own
header, list row, table, filter bar, create form and delete-confirmation — each slightly
differently.

```ts
import { pageHeader, filterBar, dataTable, listRow, ConfirmButton, commandForm, loaded } from '@flybyme/mesh-web-kit';
import '@flybyme/mesh-web-kit/kit.css';
```

mesh-web is a **peer** dependency: the page has one copy of it, shared by the site and the kit (one
`Router`, one renderer). A site's build bundles the kit like any other library.

The reference app — a small DNS console with sign-in, a guard, a paged and sortable list with its
state in the URL, forms built from commands, and confirm dialogs — is `examples/console`
(`npm run example:console`, http://localhost:5191). Copy its shape.

## What is in it

| Piece | Kind | For |
|---|---|---|
| `pageHeader(title, actions)` | function | a page's title and its buttons |
| `panel(title, body, actions)` | function | a titled card (its accessible name is the title) |
| `stat(label, value)`, `stats([...])` | function | a number with its label |
| `loaded(resource, ready, { label })` | function | loading / failed / here, for anything fetched |
| `emptyState(title, detail, action)` | function | "nothing here", which can name the current search |
| `list(items, key, row)`, `listRow({...})`, `badge(label, tone)` | function | a list of things, each row the same shape |
| `filterBar<F>()` | factory → component | a search box and one typed filter, bound to the page's signals |
| `dataTable<Row>()` | factory → component | typed rows, sortable in the table or by the server (`sort`) |
| `Pager` | component | previous/next as real links; the URL is the state |
| `ConfirmButton` | component | asks first; shows a failure instead of swallowing it |
| `commandForm(command, fields)` | factory → component | a form for a command; errors beside their fields |
| `ago`, `plural`, `bytes` | functions | "3 days ago", "1 zone", "1.5 KB" |

## The rules

Every piece follows these. A piece that would break one does not belong in the kit.

1. **No services, no fetching, no domain.** Nothing here injects a service, calls an api, or knows
   what a zone or a repository is. Data comes in as props; what the person did goes out through a
   callback prop or a command.
2. **A component only if it remembers something.** A confirm button remembers whether it is open;
   a table, its sort; a form, what was typed. Anything that does not is a function returning nodes.
3. **Generic is a factory, declared once per type, at module level.**
   `const ZoneTable = dataTable<Zone>()` — so every `cell` is checked against `Zone`. (A class cannot
   hand its own type parameter to the `Component({...})` it extends.)
4. **Rules live on commands, not in forms.** A form built with `commandForm` has no validation of
   its own; the command's input schema decides, and each issue comes back beside its field. A rule
   written in a form is a second copy of the server's rule, and it will drift.
   An **empty field is not sent**, so the schema's `.default(...)` applies. For a required field
   that means zod says "Required" unless told otherwise, so give it the same words both ways:
   `z.string({ required_error: m }).trim().min(1, m)`.
5. **Destructive actions ask first.** Delete is a `ConfirmButton`, never a bare button with a
   `catch {}` behind it.
6. **Typed end to end.** No `as any`, no `as never`.
7. **Accessible by default.** Real `<label for>`, dialogs with focus handling, `aria-sort`,
   `aria-invalid`, `role="alert"` for failures.
8. **Every piece has a browser test that presses it** (`test/kit.browser.test.ts`).

## A page built on it

```ts
const ZoneTable = dataTable<Zone>();
const ZoneFilterBar = filterBar<'all' | 'signed' | 'unsigned'>();

export class ZonesView extends View({ inject: { zones: Zones, router: Router }, title: 'Zones' }) {
    readonly list = resource(() => this.inject.zones.list());
    readonly search = signal('');
    readonly filter = signal<'all' | 'signed' | 'unsigned'>('all');
    readonly CreateZone = commandForm(this.inject.zones.create, { name: { label: 'Domain' } });

    render(): Node {
        return [
            pageHeader('Zones'),
            this.mount(ZoneFilterBar, { search: this.search, filter: this.filter, label: 'zones', options: [...] }),
            loaded(this.list, (zones) => this.mount(ZoneTable, {
                label: 'Zones', rows: () => shown(zones()), key: (z) => z.id,
                columns: [
                    { header: 'Name', cell: (z) => text(() => z().name) },
                    { header: '', cell: (z) => this.mount(ConfirmButton, {
                        label: 'Delete', question: `Delete ${z().name}?`, run: () => this.inject.zones.remove.run({ id: z().id }),
                    }) },
                ],
            })),
            this.mount(this.CreateZone, {}),
        ];
    }
}
```

The page owns the data (through its service), the state (its signals), and the arrangement; the kit
owns how each piece looks and behaves.

## Restyling

Set the tokens; do not override the rules:

```css
:root { --kit-accent: #0a7; --kit-accent-ink: #fff; --kit-radius: 4px; }
```

The defaults are system colours, so the kit follows the page's `color-scheme`. Every class is
`kit-*`; the stylesheet touches nothing of the site's own.

## Developing

```
npm test                  typecheck, then every browser test (the kit's and the console's)
npm run example:console   the reference console on :5191, on this repository's source
npm run build             dist/ (what a site installs)
```
