/**
 * Every kit piece, audited by axe-core in the states a person meets it in: loaded and empty, a
 * sorted table, a filter bar, a form showing its errors, an open confirm dialog.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import { command, element, resource, signal, text } from '@flybyme/mesh-web';
import { z } from 'zod';
import {
    badge, commandForm, ConfirmButton, dataTable, emptyState, filterBar, list, listRow, loaded, pageHeader, Pager,
    panel, stat, stats,
} from '../src/index.js';
import { audit } from './a11y.js';
import { byText, frame, show, unmount } from './harness.js';

afterEach(() => unmount());

interface Row { readonly name: string; readonly size: number }
const Table = dataTable<Row>();
type Scope = 'all' | 'mine';
const Bar = filterBar<Scope>();

const create = command({
    title: 'Create thing',
    input: z.object({
        name: z.string({ required_error: 'A name.' }).min(3, 'At least 3 characters.'),
        kind: z.enum(['a', 'b']),
        public: z.boolean().default(false),
    }),
    run: async () => ({ ok: true }),
});
const CreateForm = commandForm(create, {
    name: { label: 'Name', hint: 'Shown to everyone.' },
    kind: { label: 'Kind', options: ['a', 'b'] },
    public: { label: 'Public', type: 'checkbox' },
});

describe('the kit, audited', () => {
    it('catches a real problem — so a clean audit below means something', async () => {
        const root = show(() => [
            element('Input', { props: { type: 'text' } }),
            element('Button', { children: [] }),
        ]);
        await frame();
        const found = await audit(root);
        expect(found.some((v) => v.startsWith('label '))).toBe(true);
        expect(found.some((v) => v.startsWith('button-name '))).toBe(true);
    });

    it('has no violations across every piece, loaded', async () => {
        const root = show((host) => [
            pageHeader('Things', [element('Button', { props: { class: 'kit-button' }, children: [text('New')] })]),
            stats([stat('Things', () => 3), stat('Size', () => '1.5 MB')]),
            host.mount(Bar, { search: signal(''), filter: signal<Scope>('all'), label: 'things', options: [{ value: 'all', label: 'All' }, { value: 'mine', label: 'Mine' }] }),
            panel('Recent', list(() => [{ id: 'a', name: 'alpha' }], (i) => i.id, (i) => listRow({
                title: text(() => i().name), badges: [badge('new', 'good'), badge('slow', 'warn'), badge('down', 'bad'), badge('plain')], meta: text('today'),
                actions: [host.mount(ConfirmButton, { label: 'Delete', question: 'Delete alpha?', run: async () => undefined })],
            }), { label: 'Recent things' })),
            host.mount(Table, {
                label: 'Things', rows: () => [{ name: 'b', size: 2 }, { name: 'a', size: 1 }], key: (r) => r.name,
                columns: [
                    { header: 'Name', cell: (r) => text(() => r().name), compare: (x, y) => x.name.localeCompare(y.name) },
                    { header: 'Size', cell: (r) => text(() => String(r().size)), align: 'end' },
                ],
            }),
            host.mount(Pager, { page: () => 2, pages: () => 3, href: (n) => `/?page=${n}` }),
            loaded(resource(() => Promise.resolve('x')), () => text('loaded')),
            emptyState('Nothing here', 'Add one.'),
        ]);
        await frame();
        await userEvent.click(byText(root, 'button', 'Name'));
        await frame();
        expect(await audit(root)).toEqual([]);
    });

    it('has no violations in a dark colour scheme either — the kit follows the page\'s', async () => {
        // A dark page, as a site makes one: the scheme, and the page painted from it. (The kit never
        // paints the page itself.)
        document.documentElement.style.colorScheme = 'dark';
        document.body.style.background = 'Canvas';
        document.body.style.color = 'CanvasText';
        try {
            const root = show((host) => [
                pageHeader('Things'),
                stats([stat('Things', () => 3)]),
                panel('Recent', list(() => [{ id: 'a' }], (i) => i.id, () => listRow({
                    title: text('alpha'), badges: [badge('neutral'), badge('good', 'good'), badge('warn', 'warn'), badge('bad', 'bad')],
                    meta: text('today'),
                }))),
                host.mount(CreateForm, {}),
            ]);
            await frame();
            await userEvent.click(byText(root, 'button', 'Create thing'));
            await vi.waitFor(() => expect(root.querySelector('[data-problem-for="name"]')?.textContent).toBe('A name.'));
            expect(await audit(root)).toEqual([]);
        } finally {
            document.documentElement.style.colorScheme = '';
            document.body.style.background = '';
            document.body.style.color = '';
        }
    });

    it('has no violations in a form showing its errors', async () => {
        const root = show((host) => host.mount(CreateForm, {}));
        await frame();
        await userEvent.click(byText(root, 'button', 'Create thing'));
        await vi.waitFor(() => expect(root.querySelector('[data-problem-for="name"]')?.textContent).toBe('A name.'));
        expect(await audit(root)).toEqual([]);
    });

    it('has no violations with a confirm dialog open, or a failure showing', async () => {
        const root = show((host) => host.mount(ConfirmButton, { label: 'Delete', question: 'Delete it?', run: () => Promise.reject(new Error('in use')) }));
        await frame();
        await userEvent.click(byText(root, 'button', 'Delete'));
        await frame();
        expect(await audit(root)).toEqual([]);
        await userEvent.click([...root.querySelectorAll<HTMLButtonElement>('dialog button')].find((b) => b.textContent === 'Delete')!);
        await vi.waitFor(() => expect(root.querySelector('dialog [role="alert"]')).not.toBeNull());
        expect(await audit(root)).toEqual([]);
    });

    it('has no violations while loading, or when loading failed', async () => {
        const root = show(() => [
            loaded(resource(() => new Promise<string>(() => undefined)), () => text('never'), { label: 'Loading things…' }),
            loaded(resource(() => Promise.reject(new Error('the api is down'))), () => text('never')),
        ]);
        await vi.waitFor(() => expect(root.querySelector('[role="alert"]')).not.toBeNull());
        expect(await audit(root)).toEqual([]);
    });
});
