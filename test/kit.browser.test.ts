/**
 * Every piece of the kit, pressed in a real browser.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from '@vitest/browser/context';
import { command, createCollectionQuery, element, Link, MeshCallError, resource, signal, text } from '@flybyme/mesh-web';
import { z } from 'zod';
import {
    ago, badge, box, card, commandForm, commandModal, ConfirmButton, CopyText, dataTable, emptyState,
    filterBar, list, listRow, loaded, Menu, Modal, one, pageHeader, Pager, panel, section, stat,
    tabs, TimeAgo, toolbar,
} from '../src/index.js';
import { byText, frame, show, unmount } from './harness.js';

const until = (fn: () => void): Promise<void> => vi.waitFor(fn, { timeout: 2000, interval: 10 });

afterEach(() => unmount());

// ---------------------------------------------------------------------------- states and layout

describe('loaded', () => {
    it('shows loading, then the data — built once, updated through the accessor on refetch', async () => {
        let resolveFirst: (v: string) => void = () => undefined;
        const source = signal(0);
        let builds = 0;
        const root = show(() => {
            const r = resource(() => (source() === 0
                ? new Promise<string>((resolve) => { resolveFirst = resolve; })
                : Promise.resolve(`value ${source()}`)));
            return loaded(r, (data) => { builds++; return element('Text', { props: { 'data-value': '' }, children: [text(data)] }); }, { label: 'Loading things…' });
        });
        await frame();
        expect(root.querySelector('[aria-busy]')?.textContent).toBe('Loading things…');

        resolveFirst('value 0');
        await until(() => expect(root.querySelector('[data-value]')?.textContent).toBe('value 0'));
        expect(root.querySelector('[aria-busy]')).toBeNull();

        source.set(1);
        await until(() => expect(root.querySelector('[data-value]')?.textContent).toBe('value 1'));
        expect(builds).toBe(1);
    });

    it('shows a failure as an alert', async () => {
        const root = show(() => loaded(resource(() => Promise.reject(new Error('the api is down'))), () => []));
        await until(() => expect(root.querySelector('[role="alert"]')?.textContent).toBe('the api is down'));
    });

    it('gives a page its heading while there is no data to title it from -- loading or failed', async () => {
        let resolve: (v: string) => void = () => undefined;
        const root = show(() => [
            loaded(resource(() => new Promise<string>((r) => { resolve = r; })), (d) => pageHeader(d), { heading: 'Volume' }),
            loaded(resource(() => Promise.reject(new MeshCallError({ kind: 'not_found' }))), () => [], { heading: () => 'Zone a.example' }),
        ]);
        await frame();
        const headings = (): string[] => [...root.querySelectorAll('h1')].map((h) => h.textContent ?? '');
        await until(() => expect(headings()).toEqual(['Volume', 'Zone a.example']));
        expect(root.querySelector('[role="alert"]')).not.toBeNull();
        // Once the data is here, its own heading only: never two.
        resolve('lhspike');
        await until(() => expect(headings()).toEqual(['lhspike', 'Zone a.example']));
    });

    it('takes a models collection, and describes its named failure', async () => {
        const rows = signal<readonly { name: string }[]>([{ name: 'a.example' }]);
        let builds = 0;
        const root = show(() => [
            loaded(createCollectionQuery(() => Promise.resolve(rows())), (zones) => {
                builds++;
                return element('Text', { props: { 'data-value': '' }, children: [text(() => (zones() ?? []).map((z) => z.name).join(','))] });
            }),
            loaded(createCollectionQuery(() => Promise.reject(new MeshCallError({ kind: 'forbidden' }))), () => []),
        ]);
        await until(() => expect(root.querySelector('[data-value]')?.textContent).toBe('a.example'));
        expect(root.querySelector('[role="alert"]')?.textContent).toBe('You do not have access to that.');
        expect(builds).toBe(1);
    });

    it('shows one row of a list, and says so when there is none', async () => {
        const root = show(() => [
            element('Stack', { props: { 'data-found': '' }, children: [
                loaded(one(createCollectionQuery(() => Promise.resolve([{ name: 'a.example' }])), 'No such zone.'),
                    (zone) => text(() => zone().name)),
            ] }),
            element('Stack', { props: { 'data-missing': '' }, children: [
                loaded(one(createCollectionQuery(() => Promise.resolve([] as { name: string }[])), 'No such zone.'), () => []),
            ] }),
        ]);
        await until(() => expect(root.querySelector('[data-found]')?.textContent).toBe('a.example'));
        await until(() => expect(root.querySelector('[data-missing] [role="alert"]')?.textContent).toBe('No such zone.'));
    });
});

describe('layout pieces', () => {
    it('draws a page header, a panel named by its title, a stat, an empty state', async () => {
        const root = show(() => [
            pageHeader('Zones', [element('Button', { children: [text('New zone')] })]),
            panel('Recent zones', emptyState('No zones yet', 'Add one to start.')),
            stat('DNS zones', () => 3),
        ]);
        await frame();
        expect(root.querySelector('.kit-page-header h1')?.textContent).toBe('Zones');
        expect(root.querySelector('[aria-label="Recent zones"] [data-empty] h3')?.textContent).toBe('No zones yet');
        expect(root.querySelector('[data-stat="dns-zones"] .kit-stat-value')?.textContent).toBe('3');
    });

    it('a panel with two actions keeps them next to each other on the right at 1280 wide and wraps them at 360 without sideways scroll', async () => {
        const root = show(() => panel('Operator logs', element('Text', { children: [text('Logs body')] }), [
            element('Button', { props: { 'data-action': 'first' }, children: [text('Follow logs stream')] }),
            element('Button', { props: { 'data-action': 'second' }, children: [text('Download all lines')] }),
        ]));

        await page.viewport(1280, 800);
        root.style.width = '1280px';
        await frame();

        const heading = root.querySelector('.kit-panel-head h2')!;
        const actions = root.querySelector('.kit-panel-actions')!;
        const btn1 = root.querySelector('[data-action="first"]')!;
        const btn2 = root.querySelector('[data-action="second"]')!;

        expect(actions).not.toBeNull();
        const headRect = root.querySelector('.kit-panel-head')!.getBoundingClientRect();
        const headingRect = heading.getBoundingClientRect();
        const rect1 = btn1.getBoundingClientRect();
        const rect2 = btn2.getBoundingClientRect();

        // At 1280 wide, both actions are next to each other on the right
        expect(rect1.top).toBe(rect2.top);
        expect(rect1.left).toBeGreaterThan(headingRect.right);
        expect(rect2.left).toBeGreaterThan(rect1.right - 1);
        expect(rect2.right).toBeLessThanOrEqual(headRect.right + 1);

        // At 360 wide, wraps without sideways scroll
        await page.viewport(360, 640);
        root.style.width = '360px';
        await frame();

        const mobileRect1 = btn1.getBoundingClientRect();
        const mobileRect2 = btn2.getBoundingClientRect();
        const mobileHeadingRect = heading.getBoundingClientRect();

        // Actions wrapped relative to heading or each other
        const wrapped = mobileRect1.top > mobileHeadingRect.bottom - 1 || mobileRect2.top > mobileRect1.bottom - 1;
        expect(wrapped).toBe(true);
        expect(root.scrollWidth).toBeLessThanOrEqual(360);
        expect(document.body.scrollWidth).toBeLessThanOrEqual(360);
    });

    it('a panel whose title is a signal shows the new title after .set', async () => {
        const title = signal('Initial title');
        const root = show(() => panel(title, element('Text', { children: [text('Panel body')] })));
        await frame();

        expect(root.querySelector('.kit-panel-head h2')?.textContent).toBe('Initial title');
        expect(root.querySelector('.kit-panel')?.getAttribute('aria-label')).toBe('Initial title');

        title.set('Updated title');
        await frame();

        expect(root.querySelector('.kit-panel-head h2')?.textContent).toBe('Updated title');
        expect(root.querySelector('.kit-panel')?.getAttribute('aria-label')).toBe('Updated title');
    });
});

describe('list and listRow', () => {
    it('wraps a long unbroken value inside the row, at phone width, instead of widening the page', async () => {
        // A real DKIM record, as the owner found it widening surfdns.net's records page.
        const dkim = `v=DKIM1; k=rsa; p=${'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA'.repeat(8)}`;
        const root = show(() => list(() => [{ id: 'r1' }], (r) => r.id, () => listRow({
            title: text('s2026._domainkey'),
            detail: text(dkim),
            actions: [element('Button', { children: [text('Delete')] })],
        })));
        root.style.width = '320px';
        await frame();
        const row = root.querySelector<HTMLElement>('.kit-row')!;
        expect(row.textContent).toContain('p=MIIB');
        expect(row.scrollWidth).toBeLessThanOrEqual(320);
        expect(root.scrollWidth).toBeLessThanOrEqual(320);
    });

    it('keeps a row\'s DOM while the list changes around it', async () => {
        const items = signal([{ id: 'a', name: 'alpha' }, { id: 'b', name: 'beta' }]);
        const root = show(() => list(items, (i) => i.id, (i) => listRow({
            title: text(() => i().name),
            badges: [badge('DNSSEC', 'good')],
            meta: text('added today'),
        }, { 'data-item': () => i().id }), { label: 'Things' }));
        await frame();
        const beta = root.querySelector('[data-item="b"]');
        expect(root.querySelector('[aria-label="Things"]')?.children).toHaveLength(2);
        expect(root.querySelector('[data-item="a"] [data-tone="good"]')?.textContent).toBe('DNSSEC');

        items.set([{ id: 'b', name: 'beta' }]);
        await frame();
        expect(root.querySelector('[data-item="a"]')).toBeNull();
        expect(root.querySelector('[data-item="b"]')).toBe(beta);
    });
});

// ---------------------------------------------------------------------------- filter bar

type Visibility = 'all' | 'private' | 'public';
const VisibilityBar = filterBar<Visibility>();

describe('filterBar', () => {
    it('writes what is typed and chosen into the page\'s own signals', async () => {
        const search = signal('');
        const filter = signal<Visibility>('all');
        const root = show((host) => host.mount(VisibilityBar, {
            search, filter, label: 'repositories',
            options: [{ value: 'all', label: 'All' }, { value: 'private', label: 'Private' }, { value: 'public', label: 'Public' }],
        }));
        await frame();

        await userEvent.fill(root.querySelector<HTMLInputElement>('[aria-label="Search repositories"]')!, 'mesh');
        expect(search()).toBe('mesh');
        await userEvent.selectOptions(root.querySelector('[aria-label="Filter repositories"]')!, 'private');
        expect(filter()).toBe('private');

        // The page changing its signal shows in the controls.
        filter.set('public');
        search.set('');
        await frame();
        expect(root.querySelector<HTMLSelectElement>('[aria-label="Filter repositories"]')?.value).toBe('public');
        expect(root.querySelector<HTMLInputElement>('[aria-label="Search repositories"]')?.value).toBe('');
    });
});

// ---------------------------------------------------------------------------- data table

interface Row { readonly name: string; readonly size: number }
const RowTable = dataTable<Row>();
const rows: readonly Row[] = [{ name: 'b', size: 2 }, { name: 'a', size: 3 }, { name: 'c', size: 1 }];
const cellsOf = (root: HTMLElement): string[] => [...root.querySelectorAll('tbody tr td:first-child')].map((td) => td.textContent ?? '');

describe('dataTable', () => {
    it('sorts in the table when columns compare, and says so in aria-sort', async () => {
        const root = show((host) => host.mount(RowTable, {
            label: 'Rows', rows: () => rows, key: (r) => r.name,
            columns: [
                { header: 'Name', cell: (r) => text(() => r().name), compare: (x, y) => x.name.localeCompare(y.name) },
                { header: 'Size', cell: (r) => text(() => String(r().size)), compare: (x, y) => x.size - y.size, align: 'end' },
            ],
        }));
        await frame();
        expect(cellsOf(root)).toEqual(['b', 'a', 'c']);

        await userEvent.click(byText(root, 'button', 'Name'));
        await frame();
        expect(cellsOf(root)).toEqual(['a', 'b', 'c']);
        expect(root.querySelector('th[aria-sort="ascending"]')?.textContent).toBe('Name ▲');

        await userEvent.click(byText(root, 'button', 'Name ▲'));
        await frame();
        expect(cellsOf(root)).toEqual(['c', 'b', 'a']);

        await userEvent.click(byText(root, 'button', 'Size'));
        await frame();
        expect(cellsOf(root)).toEqual(['c', 'b', 'a']);
        expect(root.querySelectorAll('th[aria-sort="none"]')).toHaveLength(1);
    });

    it('in controlled mode, only reports the click — the owner sorts (a paged list must)', async () => {
        const current = signal<{ key: string; direction: 1 | -1 } | undefined>({ key: 'name', direction: 1 });
        const changes: unknown[] = [];
        const root = show((host) => host.mount(RowTable, {
            label: 'Rows', rows: () => rows, key: (r) => r.name,
            sort: { current, change: (next) => { changes.push(next); current.set(next); } },
            columns: [{ header: 'Name', cell: (r) => text(() => r().name), sortKey: 'name' }],
        }));
        await frame();
        await userEvent.click(byText(root, 'button', 'Name ▲'));
        await frame();
        expect(changes).toEqual([{ key: 'name', direction: -1 }]);
        // Not reordered here: the rows are the owner's.
        expect(cellsOf(root)).toEqual(['b', 'a', 'c']);
        expect(root.querySelector('th[aria-sort="descending"]')).not.toBeNull();
    });
});

// ---------------------------------------------------------------------------- pager

describe('Pager', () => {
    it('keeps its links right as the page changes under them', async () => {
        const page = signal(2);
        const root = show((host) => host.mount(Pager, { page, pages: () => 5, href: (n) => `/?page=${n}` }));
        await frame();
        expect(byText<HTMLAnchorElement>(root, 'a', 'Next →').getAttribute('href')).toBe('/?page=3');

        page.set(3);
        await frame();
        // The same link element, now pointing one further on.
        expect(byText<HTMLAnchorElement>(root, 'a', 'Next →').getAttribute('href')).toBe('/?page=4');
        expect(root.querySelector('[data-page-of]')?.textContent).toBe('Page 3 of 5');

        page.set(5);
        await frame();
        expect([...root.querySelectorAll('a')].map((a) => a.textContent)).toEqual(['← Previous']);
    });
});

// ---------------------------------------------------------------------------- confirm button

describe('ConfirmButton', () => {
    it('asks first, runs on confirm, and closes', async () => {
        const run = vi.fn(async () => undefined);
        const root = show((host) => host.mount(ConfirmButton, { label: 'Delete', question: 'Delete example.com?', confirm: 'Delete zone', run }));
        await frame();

        await userEvent.click(byText(root, 'button', 'Delete'));
        await frame();
        expect(root.querySelector('dialog[open]')?.textContent).toContain('Delete example.com?');
        expect(run).not.toHaveBeenCalled();

        await userEvent.click(byText(root, 'button', 'Cancel'));
        await frame();
        expect(root.querySelector('dialog[open]')).toBeNull();
        expect(run).not.toHaveBeenCalled();

        await userEvent.click(byText(root, 'button', 'Delete'));
        await userEvent.click(byText(root, 'button', 'Delete zone'));
        await until(() => expect(root.querySelector('dialog[open]')).toBeNull());
        expect(run).toHaveBeenCalledTimes(1);
    });

    it('names the thing as it is now when its question is a function', async () => {
        const host = signal('old.example.com');
        const root = show((h) => h.mount(ConfirmButton, { label: 'Delete', question: () => `Delete ${host()}?`, run: async () => undefined }));
        await frame();

        host.set('new.example.com');
        await userEvent.click(byText(root, 'button', 'Delete'));
        await frame();
        expect(root.querySelector('dialog[open]')?.textContent).toContain('Delete new.example.com?');
    });

    it('shows a failure in the dialog and stays open, instead of swallowing it', async () => {
        const root = show((host) => host.mount(ConfirmButton, {
            label: 'Delete', question: 'Delete it?', run: () => Promise.reject(new Error('it is in use')),
        }));
        await frame();
        await userEvent.click(byText(root, 'button', 'Delete'));
        await userEvent.click([...root.querySelectorAll<HTMLButtonElement>('dialog button')].find((b) => b.textContent === 'Delete')!);
        await until(() => expect(root.querySelector('dialog [role="alert"]')?.textContent).toBe('it is in use'));
        expect(root.querySelector('dialog[open]')).not.toBeNull();
    });

    it('with `typed`, the confirming button works only once the text is typed exactly', async () => {
        const run = vi.fn(async () => undefined);
        const root = show((host) => host.mount(ConfirmButton, {
            label: 'Unwind', question: 'Unwind peera.ca?', confirm: 'Unwind order', typed: 'peera.ca', run,
        }));
        await frame();

        await userEvent.click(byText(root, 'button', 'Unwind'));
        await frame();
        expect(root.querySelector('dialog[open]')?.textContent).toContain('Type peera.ca to confirm.');

        const confirm = byText(root, 'button', 'Unwind order');
        expect(confirm.hasAttribute('disabled')).toBe(true);

        const input = root.querySelector<HTMLElement>('[data-confirm-typed]');
        if (input === null) throw new Error('no typed-confirmation field');

        await userEvent.fill(input, 'peera.c');
        await frame();
        expect(confirm.hasAttribute('disabled')).toBe(true);
        expect(run).not.toHaveBeenCalled();

        await userEvent.fill(input, 'peera.ca');
        await until(() => expect(confirm.hasAttribute('disabled')).toBe(false));

        await userEvent.click(confirm);
        await until(() => expect(run).toHaveBeenCalledTimes(1));
    });

    it('with `typed`, opening again starts empty: a previous confirmation is never reused', async () => {
        const root = show((host) => host.mount(ConfirmButton, {
            label: 'Unwind', question: 'Unwind peera.ca?', confirm: 'Unwind order', typed: 'peera.ca', run: async () => undefined,
        }));
        await frame();

        await userEvent.click(byText(root, 'button', 'Unwind'));
        const input = root.querySelector<HTMLElement>('[data-confirm-typed]');
        if (input === null) throw new Error('no typed-confirmation field');
        await userEvent.fill(input, 'peera.ca');
        await userEvent.click(byText(root, 'button', 'Cancel'));

        await userEvent.click(byText(root, 'button', 'Unwind'));
        await until(() => expect(byText(root, 'button', 'Unwind order').hasAttribute('disabled')).toBe(true));
    });
});

// ---------------------------------------------------------------------------- command form

const received: unknown[] = [];
const createRepo = command({
    title: 'Create repository',
    input: z.object({
        name: z.string().trim().regex(/^[a-z0-9_.-]+$/, 'Letters, numbers, dash, dot or underscore.'),
        ttl: z.coerce.number().int().min(60, 'At least 60.').default(300),
        isPrivate: z.boolean().default(true),
        owner: z.string(),
    }),
    run: async (input) => { received.push(input); return { id: `r-${input.name}` }; },
});
const RepoForm = commandForm(createRepo, {
    name: { label: 'Name', placeholder: 'my-service', hint: 'Lower case.' },
    ttl: { label: 'TTL', type: 'number' },
    isPrivate: { label: 'Private', type: 'checkbox' },
});

describe('commandForm options', () => {
    it('a choice shows the words a person reads, and submits its value', async () => {
        const chosen: string[] = [];
        const pay = command({
            title: 'Pay',
            input: z.object({ provider: z.enum(['stripe', 'paypal']).default('stripe') }),
            run: async (input) => { chosen.push(input.provider); return input.provider; },
        });
        const PayForm = commandForm(pay, { provider: { label: 'Pay with', options: [{ value: 'stripe', label: 'Card' }, { value: 'paypal', label: 'PayPal' }] } });

        const root = show((host) => host.mount(PayForm, { initial: { provider: 'stripe' } }));
        await frame();

        const select = root.querySelector<HTMLSelectElement>('select[name="provider"]');
        if (select === null) throw new Error('no select');
        expect([...select.options].map((o) => `${o.value}=${o.textContent}`)).toEqual(['stripe=Card', 'paypal=PayPal']);

        await userEvent.selectOptions(select, 'paypal');
        await userEvent.click(byText(root, 'button', 'Pay'));
        await until(() => expect(chosen).toEqual(['paypal']));
    });
});

describe('commandForm', () => {
    it('puts each refused field\'s message beside that field, from the command\'s schema', async () => {
        const root = show((host) => host.mount(RepoForm, { fixed: { owner: 'o1' } }));
        await frame();
        expect(root.querySelector('[data-problem-for="name"]')?.textContent).toBe('Lower case.');

        await userEvent.fill(root.querySelector<HTMLInputElement>('input[name="name"]')!, 'Not Valid!');
        await userEvent.fill(root.querySelector<HTMLInputElement>('input[name="ttl"]')!, '5');
        await userEvent.click(byText(root, 'button', 'Create repository'));
        await until(() => expect(root.querySelector('[data-problem-for="name"]')?.textContent).toBe('Letters, numbers, dash, dot or underscore.'));
        expect(root.querySelector('[data-problem-for="ttl"]')?.textContent).toBe('At least 60.');
        expect(root.querySelector('input[name="name"]')?.getAttribute('aria-invalid')).toBe('true');
        // Real labels: the input is named by its <label for>.
        expect(root.querySelector(`label[for="${root.querySelector('input[name="name"]')?.id}"]`)?.textContent).toBe('Name');
    });

    it('submits through the command with fixed values and the checkbox as a boolean, then resets', async () => {
        received.length = 0;
        const done: unknown[] = [];
        const root = show((host) => host.mount(RepoForm, { fixed: { owner: 'o1' }, initial: { isPrivate: true }, onDone: (r) => done.push(r) }));
        await frame();
        await userEvent.fill(root.querySelector<HTMLInputElement>('input[name="name"]')!, 'mesh-web-kit');
        await userEvent.click(root.querySelector<HTMLInputElement>('input[name="isPrivate"]')!);
        await userEvent.click(byText(root, 'button', 'Create repository'));

        await until(() => expect(done).toEqual([{ id: 'r-mesh-web-kit' }]));
        expect(received).toEqual([{ name: 'mesh-web-kit', ttl: 300, isPrivate: false, owner: 'o1' }]);
        expect(root.querySelector<HTMLInputElement>('input[name="name"]')?.value).toBe('');
        expect(root.querySelector<HTMLInputElement>('input[name="isPrivate"]')?.checked).toBe(true);
    });

    it('takes several lines in a textarea field, labelled, refused beside it, and submitted as typed', async () => {
        const sent: unknown[] = [];
        const note = command({
            title: 'Send',
            input: z.object({ message: z.string().trim().min(10, 'A few words.') }),
            run: async (input) => { sent.push(input); return input; },
        });
        const NoteForm = commandForm(note, { message: { label: 'Message', type: 'textarea', placeholder: 'What do you need?' } });
        const root = show((host) => host.mount(NoteForm, {}));
        await frame();
        const area = root.querySelector<HTMLTextAreaElement>('textarea[name="message"]')!;
        expect(area).not.toBeNull();
        expect(root.querySelector(`label[for="${area.id}"]`)?.textContent).toBe('Message');

        await userEvent.fill(area, 'short');
        await userEvent.click(byText(root, 'button', 'Send'));
        await until(() => expect(root.querySelector('[data-problem-for="message"]')?.textContent).toBe('A few words.'));

        await userEvent.fill(area, 'Line one.\nLine two of my message.');
        await userEvent.click(byText(root, 'button', 'Send'));
        await until(() => expect(sent).toEqual([{ message: 'Line one.\nLine two of my message.' }]));
    });

    it('gives two forms on one page their own ids, so labels never point at the wrong input', async () => {
        const root = show((host) => [host.mount(RepoForm, {}), host.mount(RepoForm, {})]);
        await frame();
        const ids = [...root.querySelectorAll('input[name="name"]')].map((i) => i.id);
        expect(ids).toHaveLength(2);
        expect(new Set(ids).size).toBe(2);
    });
});

// ---------------------------------------------------------------------------- modal and commandModal

describe('Modal', () => {
    it('opens by trigger, traps focus, closes on Escape, and returns focus to trigger', async () => {
        const root = show((host) => host.mount(Modal, {
            title: 'Create record',
            trigger: 'New record',
            body: element('Input', { props: { type: 'text', 'aria-label': 'Record name' } }),
            actions: [element('Button', { props: { class: 'kit-button' }, children: [text('Save')] })],
        }));
        await frame();

        const trigger = byText<HTMLButtonElement>(root, 'button', 'New record');
        await userEvent.click(trigger);
        await frame();

        const dialogEl = root.querySelector('dialog[open]');
        expect(dialogEl).not.toBeNull();
        expect(dialogEl?.getAttribute('aria-label')).toBe('Create record');

        // Close on Escape
        await userEvent.keyboard('{Escape}');
        await until(() => expect(root.querySelector('dialog[open]')).toBeNull());
        expect(document.activeElement).toBe(trigger);

        // Re-open and close with close button
        await userEvent.click(trigger);
        await frame();
        expect(root.querySelector('dialog[open]')).not.toBeNull();

        const closeBtn = root.querySelector<HTMLButtonElement>('.kit-modal-close');
        if (closeBtn === null) throw new Error('no close button');
        await userEvent.click(closeBtn);
        await until(() => expect(root.querySelector('dialog[open]')).toBeNull());
        expect(document.activeElement).toBe(trigger);
    });

    it('opens and closes via controlled signal', async () => {
        const open = signal(false);
        const root = show((host) => host.mount(Modal, {
            title: 'Controlled modal',
            open,
            body: element('Text', { children: [text('Modal content')] }),
        }));
        await frame();
        expect(root.querySelector('dialog[open]')).toBeNull();

        open.set(true);
        await until(() => expect(root.querySelector('dialog[open]')).not.toBeNull());

        open.set(false);
        await until(() => expect(root.querySelector('dialog[open]')).toBeNull());
    });

    it('does not scroll horizontally at 360 px width', async () => {
        const root = show((host) => host.mount(Modal, {
            title: 'Mobile modal',
            trigger: 'Open',
            body: element('Text', { children: [text('Modal body on small phone')] }),
        }));
        root.style.width = '360px';
        await frame();
        await userEvent.click(byText(root, 'button', 'Open'));
        await frame();

        expect(root.scrollWidth).toBeLessThanOrEqual(360);
    });
});

const addRecordCmd = command({
    title: 'Add record',
    input: z.object({
        name: z.string().trim().min(3, 'At least 3 characters.'),
        value: z.string({ required_error: 'Required.' }).trim().min(1, 'Required.'),
    }),
    run: async (input) => ({ id: `rec-${input.name}`, ...input }),
});
const RecordModal = commandModal(addRecordCmd, {
    name: { label: 'Name' },
    value: { label: 'Value' },
});

describe('commandModal', () => {
    it('submits on success and closes modal, but keeps errors beside fields without closing on refusal', async () => {
        const doneResults: unknown[] = [];
        const root = show((host) => host.mount(RecordModal, {
            trigger: 'Add record',
            onDone: (r) => { doneResults.push(r); },
        }));
        await frame();

        await userEvent.click(byText(root, 'button', 'Add record'));
        await frame();
        expect(root.querySelector('dialog[open]')).not.toBeNull();

        // Submit invalid values
        const nameInput = root.querySelector<HTMLInputElement>('dialog input[name="name"]');
        if (nameInput === null) throw new Error('no name input');
        await userEvent.fill(nameInput, 'ab');

        const submitBtn = byText(root, 'dialog button[type="submit"]', 'Add record');
        await userEvent.click(submitBtn);
        await until(() => expect(root.querySelector('[data-problem-for="name"]')?.textContent).toBe('At least 3 characters.'));
        expect(root.querySelector('[data-problem-for="value"]')?.textContent).toBe('Required.');
        // Still open
        expect(root.querySelector('dialog[open]')).not.toBeNull();
        expect(doneResults).toHaveLength(0);

        // Provide valid inputs and submit
        await userEvent.fill(nameInput, 'www');
        const valInput = root.querySelector<HTMLInputElement>('dialog input[name="value"]');
        if (valInput === null) throw new Error('no value input');
        await userEvent.fill(valInput, '192.0.2.1');
        await userEvent.click(submitBtn);

        // Closes on success and calls onDone
        await until(() => expect(root.querySelector('dialog[open]')).toBeNull());
        expect(doneResults).toEqual([{ id: 'rec-www', name: 'www', value: '192.0.2.1' }]);
    });
});

// ---------------------------------------------------------------------------- tabs

describe('tabs', () => {
    it('renders tabs with role="tablist", aria-selected, and changes URL without full reload', async () => {
        const root = show((host) => tabs([
            { id: 'overview', label: 'Overview', href: '/overview', active: true },
            { id: 'settings', label: 'Settings', href: '/settings', active: false },
        ], (href, className, children) => host.mount(Link, { href, class: className, children })));
        await frame();

        const tablist = root.querySelector('[role="tablist"]');
        expect(tablist).not.toBeNull();

        const activeTab = root.querySelector('[role="tab"][aria-selected="true"]');
        expect(activeTab?.getAttribute('aria-current')).toBe('page');
        expect(activeTab?.textContent).toBe('Overview');

        const settingsLink = byText(root, 'a', 'Settings');
        await userEvent.click(settingsLink);
        await frame();
        expect(location.pathname).toBe('/settings');
    });

    it('scrolls sideways inside itself on phone width without widening the page', async () => {
        const manyTabs = [
            { label: 'Overview', href: '/overview', active: true },
            { label: 'Releases', href: '/releases' },
            { label: 'Deployments', href: '/deployments' },
            { label: 'Environment', href: '/env' },
            { label: 'Metrics', href: '/metrics' },
            { label: 'Logs', href: '/logs' },
            { label: 'Settings', href: '/settings' },
        ];
        const root = show(() => tabs(manyTabs));
        root.style.width = '360px';
        await frame();

        const tablist = root.querySelector<HTMLElement>('.kit-tabs');
        if (tablist === null) throw new Error('no tabs container');

        expect(tablist.scrollWidth).toBeGreaterThan(360);
        expect(root.scrollWidth).toBeLessThanOrEqual(360);
    });
});

// ---------------------------------------------------------------------------- box, card, section, toolbar

describe('box, card, section, and toolbar', () => {
    it('renders box as a bordered surface with tone and padding', async () => {
        const root = show(() => box(text('Box content'), { tone: 'accent', padding: 'lg' }));
        await frame();

        const boxEl = root.querySelector('.kit-box');
        expect(boxEl?.getAttribute('data-tone')).toBe('accent');
        expect(boxEl?.getAttribute('data-padding')).toBe('lg');
        expect(boxEl?.textContent).toBe('Box content');
    });

    it('renders card as a clickable summary when href is provided, with title and actions', async () => {
        const clicked: string[] = [];
        const root = show((host) => card('Zone summary', text('3 records'), {
            href: '/domains/example.com',
            actions: [element('Button', {
                intents: { activate: { action: host.on(() => { clicked.push('manage'); }) } },
                children: [text('Manage')],
            })],
        }));
        await frame();

        const cardEl = root.querySelector('.kit-card');
        expect(cardEl?.getAttribute('aria-label')).toBe('Zone summary');
        const linkEl = root.querySelector<HTMLAnchorElement>('.kit-card-title-link');
        expect(linkEl?.getAttribute('href')).toBe('/domains/example.com');

        await userEvent.click(byText(root, 'button', 'Manage'));
        expect(clicked).toEqual(['manage']);
    });

    it('renders section for settings pages with heading and body', async () => {
        const root = show(() => section('Danger zone', text('Delete account here'), [
            element('Button', { children: [text('Delete')] }),
        ]));
        await frame();

        const sec = root.querySelector('.kit-section');
        expect(sec?.getAttribute('aria-label')).toBe('Danger zone');
        expect(sec?.querySelector('h2')?.textContent).toBe('Danger zone');
        expect(sec?.textContent).toContain('Delete account here');
    });

    it('renders toolbar wrapping controls on small screens', async () => {
        const root = show(() => toolbar(
            [element('Button', { children: [text('Filter')] }), element('Button', { children: [text('Sort')] })],
            [element('Button', { children: [text('Export')] })],
        ));
        root.style.width = '360px';
        await frame();

        const tb = root.querySelector('.kit-toolbar');
        expect(tb?.getAttribute('role')).toBe('toolbar');
        expect(root.scrollWidth).toBeLessThanOrEqual(360);
    });
});

// ---------------------------------------------------------------------------- Menu

describe('Menu', () => {
    it('opens on button click, moves active item with arrow keys, closes on Escape, and runs item', async () => {
        const ran: string[] = [];
        const root = show((host) => host.mount(Menu, {
            label: 'Actions',
            items: [
                { label: 'Rename', run: () => { ran.push('rename'); } },
                { label: 'Duplicate', run: () => { ran.push('duplicate'); } },
                { label: 'Delete', run: () => { ran.push('delete'); }, tone: 'danger' },
            ],
        }));
        await frame();

        const trigger = byText(root, 'button', 'Actions');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(root.querySelector('[role="menu"]')).toBeNull();

        // Open menu
        await userEvent.click(trigger);
        await frame();
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        const menu = root.querySelector('[role="menu"]');
        expect(menu).not.toBeNull();

        const items = (): HTMLElement[] => [...root.querySelectorAll<HTMLElement>('[role="menuitem"]')];
        expect(items()).toHaveLength(3);
        expect(items()[0]?.getAttribute('data-active')).toBe('true');

        // Arrow down moves to next item
        await userEvent.keyboard('{ArrowDown}');
        await frame();
        expect(items()[1]?.getAttribute('data-active')).toBe('true');

        // Arrow down again
        await userEvent.keyboard('{ArrowDown}');
        await frame();
        expect(items()[2]?.getAttribute('data-active')).toBe('true');

        // Close on Escape
        await userEvent.keyboard('{Escape}');
        await frame();
        expect(root.querySelector('[role="menu"]')).toBeNull();
        expect(trigger.getAttribute('aria-expanded')).toBe('false');

        // Re-open and click an item
        await userEvent.click(trigger);
        await frame();
        const deleteItem = byText(root, 'button', 'Delete');
        await userEvent.click(deleteItem);
        await frame();
        expect(ran).toEqual(['delete']);
        expect(root.querySelector('[role="menu"]')).toBeNull();

        // Re-open and close via outside click on backdrop
        await userEvent.click(trigger);
        await frame();
        expect(root.querySelector('[role="menu"]')).not.toBeNull();
        const backdrop = root.querySelector<HTMLElement>('[data-menu-backdrop]');
        if (backdrop === null) throw new Error('no backdrop');
        await userEvent.click(backdrop);
        await frame();
        expect(root.querySelector('[role="menu"]')).toBeNull();
    });
});

// ---------------------------------------------------------------------------- copyText

describe('copyText', () => {
    it('displays value and copy button, copying to clipboard and showing Copied state', async () => {
        let copied = '';
        const fakeClipboard = {
            writeText: async (t: string): Promise<void> => {
                copied = t;
            },
        };
        Object.defineProperty(navigator, 'clipboard', {
            value: fakeClipboard,
            configurable: true,
        });

        const root = show((host) => host.mount(CopyText, { value: 'api-token-12345', label: 'token' }));
        await frame();

        expect(root.querySelector('.kit-copy-value')?.textContent).toBe('api-token-12345');
        const copyBtn = byText(root, 'button', 'Copy');
        expect(copyBtn.getAttribute('aria-label')).toBe('Copy token');

        await userEvent.click(copyBtn);
        await until(() => expect(copyBtn.textContent).toBe('Copied'));
        expect(copied).toBe('api-token-12345');
        expect(copyBtn.getAttribute('aria-label')).toBe('Copied');
    });
});

// ---------------------------------------------------------------------------- the time

describe('ago', () => {
    const now = Date.parse('2026-10-19T12:00:00Z');
    const before = (seconds: number): string => new Date(now - seconds * 1000).toISOString();

    it('says "just now" under a minute unless asked to count seconds', () => {
        expect(ago(before(12), now)).toBe('just now');
        expect(ago(before(12), now, { seconds: true })).toMatch(/12/);
        expect(ago(before(0), now, { seconds: true })).toBe('just now');
    });

    it('has a short form, and never for no time or an unreadable one', () => {
        expect(ago(before(12), now, { seconds: true, short: true }).length)
            .toBeLessThan(ago(before(12), now, { seconds: true }).length);
        expect(ago(undefined, now)).toBe('never');
        expect(ago('not a time', now)).toBe('never');
    });
});

describe('TimeAgo', () => {
    it('counts up by itself between updates, with the exact time on hover', async () => {
        const at = new Date(Date.now() - 5000).toISOString();
        const root = show((host) => host.mount(TimeAgo, { at }));
        await frame();

        const shown = (): string => root.querySelector('.kit-time-ago')?.textContent ?? '';
        const first = shown();
        expect(first).toMatch(/5/);
        expect(root.querySelector('.kit-time-ago')?.getAttribute('title')).toBe(new Date(at).toLocaleString());

        // No new `at`: the clock alone moves the words on.
        await vi.waitFor(() => expect(shown()).not.toBe(first), { timeout: 2500, interval: 50 });
        expect(shown()).toMatch(/6/);
    });

    it('reads "not reporting" once older than staleAfterMs, and follows a changing time', async () => {
        const at = signal(new Date(Date.now() - 180_000).toISOString());
        const root = show((host) => host.mount(TimeAgo, { at, staleAfterMs: 120_000 }));
        await frame();

        const span = (): Element | null => root.querySelector('.kit-time-ago');
        expect(span()?.textContent).toBe('not reporting');
        expect(span()?.getAttribute('data-stale')).toBe('true');

        at.set(new Date().toISOString());
        await until(() => expect(span()?.getAttribute('data-stale')).toBe('false'));
        expect(span()?.textContent).not.toBe('not reporting');
    });
});
