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
| `loaded(source, ready, { label })` | function | loading / failed / here, for a `resource(...)` or a `cx.models` collection |
| `one(rows, missing)` | function | the row of a one-row collection (`find({ query: { id } })`), for a detail page's `loaded` |
| `emptyState(title, detail, action)` | function | "nothing here", which can name the current search |
| `list(items, key, row)`, `listRow({...})`, `badge(label, tone)` | function | a list of things, each row the same shape |
| `filterBar<F>()` | factory → component | a search box and one typed filter, bound to the page's signals |
| `dataTable<Row>()` | factory → component | typed rows, sortable in the table or by the server (`sort`) |
| `Pager` | component | previous/next as real links; the URL is the state |
| `ConfirmButton` | component | asks first; shows a failure instead of swallowing it |
| `commandForm(command, fields)` | factory → component | a form for a command; errors beside their fields |
| `Modal` | component | a dialog on mesh-web's dialog primitive with title, body, actions, and focus handling |
| `commandModal(command, fields)` | factory → component | a commandForm inside a modal; closes on success and keeps field errors visible |
| `tabs(items, options)` | function | a row of tabs where each tab is a router Link, with horizontal scrolling on phone screens |
| `box(body, options)` | function | a plain bordered surface without a title |
| `card(title, body, options)` | function | a clickable summary card for grids of things |
| `section(title, body, actions)` | function | a heading with its content, for settings or detail pages |
| `toolbar(left, right)` | function | a responsive row of controls that wraps on a phone |
| `Menu` | component | a button opening a list of actions; closes on Escape and outside click, with arrow key navigation |
| `copyText(value)` / `CopyText` | component | a value with a one-click copy button and confirmation state |
| `ago`, `plural`, `bytes` | functions | "3 days ago", "1 zone", "1.5 KB"; `ago(at, now, { seconds, short })` counts seconds ("12s ago") |
| `clock(this.cx, everyMs)` | function → signal | the time, moving every second (by default) until its owner goes: hand it to `ago` or any "older than" check so the words stay true between updates |
| `TimeAgo` | component | a time ago that counts up by itself, "not reporting" past `staleAfterMs`, the exact time on hover |
| `AppBar` | component | the top bar: brand, links, actions in one row; under 760px a menu button and a drawer, which closes on Escape, the backdrop, or a change of page |
| `bottomBar(items)`, `wordmark(name)` | function | a phone's bottom navigation (hidden on a wide screen); the site name in the gradient |
| `spinner(label)`, `progress(value, label)` | function | something loading; how far along (undefined: sweeps) |
| `SnackQueue`, `Snackbars` | class, component | "Saved" at the bottom of the screen: one queue per site, `show(message, tone)`, three at most, gone after 4 s (7 s for a failure) |
| `chips<V>()`, `chip(label)` | factory → component, function | filter chips bound to a page signal; a plain tag |
| `Switch` | component | a setting that applies when flipped (`role="switch"`) |
| `segmented<V>()` | factory → component | two to five options, one chosen |
| `divider()`, `tooltip(node, tip)` | function | a line; a tip on hover and keyboard focus |
| `SideSheet` | component | details of one thing sliding in from the right; the whole screen on a phone |
| `hero`, `band`, `featureGrid`, `planCard`, `planGrid`, `ctaBand`, `picture`, `footer`, `authCard` | function | a public site's blocks: the gradient hero, full-width bands (plain, tint, dark), features, plan cards, the closing ask, a screenshot, footer columns, the sign-in card |

A data table now sits in a box that scrolls sideways, so a wide table on a phone scrolls itself and
not the page.

## The rules

Every piece follows these. A piece that would break one does not belong in the kit.

1. **No services, no fetching, no domain.** Nothing here injects a service (mesh-web's own `Router`
   aside, which `AppBar` reads to close its drawer when the page changes, as `Link` does), calls an
   api, or knows what a zone or a repository is. Data comes in as props; what the person did goes out through a
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

For a list the server streams events for, have the service hand out a `cx.models` collection
instead of a `resource`: `loaded` takes either. The collection loads once, then the server's
`<name>.created` / `.updated` / `.deleted` events change its rows in place, and so do the page's own
writes through the collection — nothing refetches, and the table under `loaded` is never rebuilt.

## Restyling

Set the tokens; do not override the rules:

```css
:root {
    --kit-accent: light-dark(#0a7, #3c9);
    --kit-gradient: linear-gradient(135deg, #087 0%, #0a5 100%);
    --kit-radius: 6px;
}
```

| Token | What |
|---|---|
| `--kit-font`, `--kit-font-mono` | the text and code fonts (load a web font yourself; the kit names it first) |
| `--kit-page`, `--kit-panel`, `--kit-raised` | the page, a panel on it, and what floats above both (menus, dialogs) |
| `--kit-ink`, `--kit-muted` | text, and quieter text (a mix of the ink, never a fixed grey) |
| `--kit-edge`, `--kit-edge-strong` | hairlines between things, and the edges of fields and buttons |
| `--kit-accent`, `--kit-accent-2`, `--kit-accent-ink`, `--kit-accent-soft`, `--kit-gradient` | the brand: links, focus, the primary button's fill and its text |
| `--kit-good`, `--kit-warn`, `--kit-bad` | status colours |
| `--kit-radius`, `--kit-radius-lg` | corners of controls, and of panels and cards |
| `--kit-gap`, `--kit-control` | spacing, and the height of every button and field (44px: a touch target) |
| `--kit-shadow-sm/md/lg`, `--kit-focus`, `--kit-ease` | depth, the focus ring, motion |

Colours use `light-dark()`, so light and dark follow the page's `color-scheme`. Every text colour
clears WCAG AA on every surface, in both; `test/a11y.browser.test.ts` checks it.

`--kit-width` is the width a public site's bands centre their content at; `--kit-dark`,
`--kit-dark-ink` and `--kit-dark-muted` colour the dark band.

**The bridge.** kit.css also sets mesh-web's kernel tokens (`--page`, `--ink`, `--accent`, ...: its
windows, notifications, log panel and confirm dialog) and mesh-web-charts' `--chart-*` from the kit's.
A site sets `--kit-*` alone and all three match. Import order: `charts.css`, then `kit.css`, then the
site's own stylesheet, which sets only its brand tokens and its own page layouts. If two sites need a
rule, it belongs in the kit.

Two layers:

- **`kit-base`** (a CSS cascade layer) styles the page's plain elements: the body's font and colours,
  headings, links, and every plain `button`, `input`, `select` and `textarea`. A site therefore
  doesn't style those itself. Being a layer, any rule a site writes outside a layer wins over it,
  whatever its specificity.
- The **`kit-*` classes** style the kit's own pieces and touch nothing of the site's.

`npm run test:browser -- test/gallery.browser.test.ts` photographs every piece, light and dark, at
a desktop and a phone width, into `test/__gallery__/`. Look at it before changing the look.

## Components: what a whole UI needs

Material Design 3's component list is the checklist: which pieces a complete interface has, and
what each must do (sizes, states, keyboard). The look is the kit's own.

| Material 3 | Here | State |
|---|---|---|
| Buttons, icon buttons | `kit-button` (`data-tone`: primary, danger), plain `button` | restyled; icon buttons to add |
| Button groups, segmented buttons | `segmented<V>()` | done (0.4) |
| Loading and progress indicators | `loaded`, `spinner`, `progress` | done (0.4) |
| Navigation bar / drawer / rail, app bar | `AppBar` (drawer on phones), `bottomBar` | done (0.4); a rail not planned |
| Side sheet | `SideSheet` | done (0.4) |
| Toolbars | `toolbar`, `pageHeader` | restyled |
| Badges, chips | `badge`, `chips<V>()`, `chip` | done (0.4) |
| Cards | `card`, `panel`, `box`, `planCard` | restyled |
| Checkbox, radio, switch | plain inputs (accent-colored), `Switch` | done (0.4) |
| Dialogs | `Modal`, `ConfirmButton` | restyled |
| Divider | `divider()` | done (0.4) |
| Lists | `list`, `listRow` | restyled |
| Menus | `Menu` | restyled |
| Search, text fields | `filterBar`, `commandForm` | restyled |
| Snackbar | `SnackQueue`, `Snackbars` | done (0.4) |
| Tabs | `tabs` | restyled |
| Tooltips | `tooltip` | done (0.4) |
| Date and time pickers, sliders, carousel, FABs, split buttons | | not planned yet |

## Developing

```
npm test                  typecheck, then every browser test (the kit's and the console's)
npm run example:console   the reference console on :5191, on this repository's source
npm run build             dist/ (what a site installs)
```
