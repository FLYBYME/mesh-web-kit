/**
 * Every piece on one page, photographed: light and dark, at a desktop and a phone width. The
 * pictures land in test/__gallery__/ (not committed) so a change to the kit's look is seen before it
 * ships, not guessed at from the CSS.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { page } from '@vitest/browser/context';
import { command, element, signal, text, type Node } from '@flybyme/mesh-web';
import { z } from 'zod';
import {
    badge, card, commandForm, ConfirmButton, CopyText, dataTable, emptyState, filterBar, list, listRow,
    Menu, pageHeader, panel, section, stat, stats, tabs, toolbar,
} from '../src/index.js';
import { frame, show, unmount, type Page } from './harness.js';

afterEach(() => {
    document.documentElement.style.colorScheme = '';
    unmount();
});

interface Row { readonly name: string; readonly kind: string; readonly size: number }
const Table = dataTable<Row>();
type Scope = 'all' | 'mine';
const Bar = filterBar<Scope>();

const create = command({
    title: 'Create zone',
    input: z.object({
        name: z.string({ required_error: 'Give it a name.' }).min(3, 'At least 3 characters.'),
        kind: z.enum(['primary', 'secondary']),
        signed: z.boolean().default(false),
    }),
    run: async () => ({ ok: true }),
});
const CreateForm = commandForm(create, {
    name: { label: 'Domain', hint: 'For example example.com', placeholder: 'example.com' },
    kind: { label: 'Kind', options: ['primary', 'secondary'] },
    signed: { label: 'Sign with DNSSEC', type: 'checkbox' },
});

const rows: Row[] = [
    { name: 'example.com', kind: 'primary', size: 42 },
    { name: 'shop.example.com', kind: 'secondary', size: 7 },
    { name: 'mail.example.org', kind: 'primary', size: 128 },
];

const button = (label: string, tone?: 'primary' | 'danger'): Node => element('Button', {
    props: { class: 'kit-button', ...(tone !== undefined ? { 'data-tone': tone } : {}) },
    children: [text(label)],
});

function everything(host: Page): Node {
    return element('Stack', {
        props: { class: 'gallery', style: 'padding: 24px; display: flex; flex-direction: column; gap: 24px;' },
        children: [
            pageHeader('Zones', [button('Import'), button('New zone', 'primary')]),
            tabs([
                { label: 'Overview', href: '/', active: true },
                { label: 'Records', href: '/records' },
                { label: 'Settings', href: '/settings' },
            ], { label: 'Zone' }),
            stats([stat('Zones', () => 12), stat('Records', () => 348), stat('Queries today', () => '1.2 M'), stat('Signed', () => '9 of 12')]),
            toolbar(
                [host.mount(Bar, { search: signal(''), filter: signal<Scope>('all'), label: 'zones', options: [{ value: 'all', label: 'All' }, { value: 'mine', label: 'Mine' }] })],
                [button('Export'), button('Delete all', 'danger')],
            ),
            host.mount(Table, {
                label: 'Zones', rows: () => rows, key: (r) => r.name,
                columns: [
                    { header: 'Name', cell: (r) => text(() => r().name), compare: (a, b) => a.name.localeCompare(b.name) },
                    { header: 'Kind', cell: (r) => badge(r().kind, r().kind === 'primary' ? 'good' : undefined) },
                    { header: 'Records', cell: (r) => text(() => String(r().size)), align: 'end' },
                ],
            }),
            panel('Recent changes', list(() => rows, (r) => r.name, (r) => listRow({
                title: text(() => r().name),
                badges: [badge('signed', 'good'), badge('expiring', 'warn'), badge('failing', 'bad'), badge('plain')],
                meta: text('changed 3 minutes ago'),
                actions: [host.mount(ConfirmButton, { label: 'Delete', question: 'Delete it?', run: async () => undefined })],
            }), { label: 'Recent changes' }), [button('See all')]),
            element('Row', {
                props: { style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 16px;' },
                children: [
                    card('Domains', text('Zones, records and DNSSEC, on our own nameservers.'), { href: '/domains' }),
                    card('Mail', text('Mailboxes on your domain, with webmail and IMAP.'), { href: '/mail' }),
                    card('Apps', text('Push to deploy, previews and rollbacks.'), { href: '/apps' }),
                ],
            }),
            section('New zone', host.mount(CreateForm, {})),
            section('Plain controls', element('Stack', {
                props: { style: 'display: flex; flex-direction: column; gap: 12px; max-width: 28rem;' },
                children: [
                    element('Input', { props: { type: 'text', placeholder: 'A plain input', 'aria-label': 'Plain input' } }),
                    element('Select', { props: { 'aria-label': 'Plain select' }, children: [element('Option', { children: [text('A plain select')] })] }),
                    element('Row', { props: { style: 'display: flex; gap: 8px;' }, children: [element('Button', { children: [text('A plain button')] }), host.mount(Menu, { label: 'More', items: [{ label: 'Rename', run: () => undefined }, { label: 'Delete', run: () => undefined, tone: 'danger' }] })] }),
                    host.mount(CopyText, { value: 'ns1.example.net' }),
                ],
            })),
            emptyState('No zones yet', 'Add a domain you own to host its DNS here.', button('Add a domain', 'primary')),
        ],
    });
}

async function photograph(name: string, width: number, scheme: 'light' | 'dark'): Promise<void> {
    // Tall enough that the whole page is on screen: a picture of an element is cut at the viewport.
    await page.viewport(width, width < 600 ? 4600 : 2400);
    document.documentElement.style.colorScheme = scheme;
    const root = show((host) => everything(host));
    await frame();
    await frame();

    const path = await page.elementLocator(root).screenshot({ path: `__gallery__/${name}-${scheme}.png` });
    expect(path).toContain(name);
}

describe('the gallery', () => {
    it('desktop, light', async () => photograph('desktop', 1280, 'light'));
    it('desktop, dark', async () => photograph('desktop', 1280, 'dark'));
    it('phone, light', async () => photograph('phone', 390, 'light'));
    it('phone, dark', async () => photograph('phone', 390, 'dark'));
});
