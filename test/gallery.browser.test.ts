/**
 * Every piece on one page, photographed: light and dark, at a desktop and a phone width. The
 * pictures land in test/__gallery__/ (not committed) so a change to the kit's look is seen before it
 * ships, not guessed at from the CSS.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { page } from '@vitest/browser/context';
import { command, element, Link, signal, text, type Node } from '@flybyme/mesh-web';
import { z } from 'zod';
import {
    AppBar, authCard, badge, band, card, chip, chips, commandForm, ConfirmButton, CopyText, ctaBand, dataTable,
    emptyState, featureGrid, filterBar, footer, hero, list, listRow, Menu, pageHeader, panel, planCard, planGrid,
    progress, section, segmented, SnackQueue, Snackbars, spinner, stat, stats, Switch, tabs, toolbar, wordmark,
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
            section('Choices and progress', element('Stack', {
                props: { style: 'display: flex; flex-direction: column; gap: 16px;' },
                children: [
                    host.mount(KindChips, { value: signal<readonly Kind[]>(['mx']), label: 'Kinds', options: [{ value: 'a', label: 'A' }, { value: 'mx', label: 'MX' }, { value: 'txt', label: 'TXT' }] }),
                    element('Row', { props: { style: 'display: flex; gap: 24px; align-items: center; flex-wrap: wrap;' }, children: [
                        host.mount(Switch, { checked: signal(true), label: 'DNSSEC' }),
                        host.mount(Switch, { checked: signal(false), label: 'Proxy' }),
                        host.mount(RangeButtons, { value: signal<Range>('24h'), label: 'Range', options: [{ value: '1h', label: '1 h' }, { value: '24h', label: '24 h' }, { value: '7d', label: '7 d' }] }),
                        spinner(),
                        chip('static tag'),
                    ] }),
                    progress(() => 0.62, 'Upload'),
                    progress(() => undefined, 'Working'),
                ],
            })),
        ],
    });
}

type Kind = 'a' | 'mx' | 'txt';
const KindChips = chips<Kind>();
type Range = '1h' | '24h' | '7d';
const RangeButtons = segmented<Range>();

const cta = (label: string, primary = false): Node => element('Link', {
    props: { href: '/', class: 'kit-button', ...(primary ? { 'data-tone': 'primary' } : {}) },
    children: [text(label)],
});

/** A public site's home page, made of the blocks only. */
function publicPage(host: Page): Node {
    const queue = new SnackQueue();
    queue.show('Saved');

    return element('Stack', {
        children: [
            host.mount(AppBar, {
                brand: host.mount(Link, { href: '/', children: [wordmark('SurfDNS')] }),
                links: ['Features', 'Pricing', 'Docs', 'About'].map((l) => host.mount(Link, { href: `/?p=${l}`, children: [text(l)] })),
                actions: [cta('Sign in'), cta('Get started', true)],
            }),
            hero({
                eyebrow: 'Hosting on our own servers', title: 'Apps, DNS and mail. One platform.',
                lead: 'Push your code and it is live with its own address and certificate. Your domains and mailboxes sit beside it.',
                actions: [cta('Start free', true), cta('See pricing')], note: 'No card needed to start.',
            }),
            band(featureGrid([
                { mark: 'NS', title: 'DNS', body: 'Zones and records on our own nameservers, with DNSSEC.' },
                { mark: '@', title: 'Mail', body: 'Mailboxes on your domain with webmail and IMAP.' },
                { mark: '>_', title: 'Push to deploy', body: 'A git push builds and ships your app.' },
            ]), { eyebrow: 'What you get', title: 'Everything a site needs', lead: 'One account, one bill.' }),
            band(text('Montreal, Toronto, Vancouver.'), { tone: 'dark', eyebrow: 'Our servers', title: 'Not a reseller', lead: 'We run the machines.' }),
            band(planGrid([
                planCard({ name: 'Starter', price: '$5', period: 'a month', summary: 'One site.', features: ['1 app', '1 domain', '2 mailboxes'], action: cta('Choose Starter') }),
                planCard({ name: 'Team', price: '$20', period: 'a month', summary: 'A small business.', features: ['10 apps', '10 domains', '25 mailboxes'], featured: true, ribbon: 'Most chosen', action: cta('Choose Team', true) }),
                planCard({ name: 'Agency', price: '$60', period: 'a month', summary: 'Many clients.', features: ['50 apps', 'Unlimited domains'], action: cta('Choose Agency') }),
            ]), { tone: 'tint', title: 'Plans' }),
            ctaBand('Start in a minute', 'Sign up, push your code, point your domain.', [cta('Get started', true), cta('Talk to us')]),
            footer(
                element('Stack', { children: [wordmark('SurfDNS'), text('Hosting, DNS and mail on our own servers.')] }),
                [
                    { heading: 'Product', links: ['Features', 'Pricing'].map((l) => host.mount(Link, { href: `/?p=${l}`, children: [text(l)] })) },
                    { heading: 'Company', links: ['About', 'Contact'].map((l) => host.mount(Link, { href: `/?p=${l}`, children: [text(l)] })) },
                ],
                text('© 2026 SurfDNS'),
            ),
            authCard('Sign in', 'Welcome back.', element('Stack', { props: { class: 'kit-form' }, children: [
                element('Input', { props: { type: 'email', placeholder: 'you@example.com', 'aria-label': 'Email' } }),
                button('Sign in', 'primary'),
            ] }), text('No account? Sign up.')),
            host.mount(Snackbars, { queue }),
        ],
    });
}

async function photograph(name: string, width: number, scheme: 'light' | 'dark', what: (host: Page) => Node = everything): Promise<void> {
    // Tall enough that the whole page is on screen: a picture of an element is cut at the viewport.
    await page.viewport(width, width < 600 ? 6400 : 3400);
    document.documentElement.style.colorScheme = scheme;
    const root = show((host) => what(host));
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
    it('public page, desktop, light', async () => photograph('public-desktop', 1280, 'light', publicPage));
    it('public page, desktop, dark', async () => photograph('public-desktop', 1280, 'dark', publicPage));
    it('public page, phone, light', async () => photograph('public-phone', 390, 'light', publicPage));
});
