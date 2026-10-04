/**
 * Every piece of the kit, pressed in a real browser.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import { command, createCollectionQuery, element, MeshCallError, resource, signal, text } from '@flybyme/mesh-web';
import { z } from 'zod';
import {
    badge, commandForm, ConfirmButton, dataTable, emptyState, filterBar, list, listRow, loaded, one,
    pageHeader, Pager, panel, stat,
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
