/**
 * The 0.4 pieces, pressed in a real browser and audited: the app bar and its phone drawer, the
 * bottom bar, snackbars, spinner and progress, chips, switch, segmented buttons, tooltip, the side
 * sheet, the scrolling table, and the public-page blocks.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from '@vitest/browser/context';
import { element, Link, signal, text } from '@flybyme/mesh-web';
import {
    AppBar, authCard, band, bottomBar, chip, chips, ctaBand, dataTable, divider, featureGrid, footer, hero,
    picture, planCard, planGrid, progress, segmented, SideSheet, SnackQueue, Snackbars, spinner, Switch,
    tooltip, wordmark,
} from '../src/index.js';
import { audit } from './a11y.js';
import { byText, frame, show, unmount, type Page } from './harness.js';

const until = (fn: () => void): Promise<void> => vi.waitFor(fn, { timeout: 2000, interval: 10 });

afterEach(async () => {
    unmount();
    await page.viewport(1280, 900);
});

function bar(host: Page) {
    return host.mount(AppBar, {
        brand: host.mount(Link, { href: '/', children: [wordmark('Acme')] }),
        links: [
            host.mount(Link, { href: '/features', children: [text('Features')] }),
            host.mount(Link, { href: '/pricing', children: [text('Pricing')] }),
            host.mount(Link, { href: '/?page=docs', children: [text('Docs')] }),
        ],
        actions: [element('Link', { props: { href: '/sign-in', class: 'kit-button' }, children: [text('Sign in')] })],
    });
}

describe('AppBar', () => {
    it('shows every link in one row on a wide screen, with no menu button', async () => {
        await page.viewport(1280, 900);
        const root = show((host) => bar(host));
        await frame();

        const menu = root.querySelector<HTMLElement>('.kit-app-bar-menu');
        expect(menu === null ? 'none' : getComputedStyle(menu).display).toBe('none');
        const links = [...root.querySelectorAll<HTMLElement>('.kit-app-bar-links a')];
        expect(links.map((a) => a.textContent)).toEqual(['Features', 'Pricing', 'Docs']);
        const tops = new Set(links.map((a) => Math.round(a.getBoundingClientRect().top)));
        expect(tops.size).toBe(1);
    });

    it('folds into a menu on a phone: one line, a drawer that opens, and closes on a link', async () => {
        await page.viewport(390, 800);
        const root = show((host) => bar(host));
        await frame();

        const navBar = root.querySelector<HTMLElement>('.kit-app-bar');
        expect(navBar?.getBoundingClientRect().height).toBeLessThan(64);
        const drawer = root.querySelector<HTMLElement>('.kit-app-bar-drawer');
        expect(drawer === null ? '' : getComputedStyle(drawer).display).toBe('none');

        const menu = root.querySelector<HTMLElement>('.kit-app-bar-menu');
        expect(menu?.getAttribute('aria-expanded')).toBe('false');
        if (menu === null) throw new Error('no menu button');
        await userEvent.click(menu);
        await until(() => expect(menu.getAttribute('aria-expanded')).toBe('true'));
        expect(drawer === null ? '' : getComputedStyle(drawer).display).toBe('flex');
        expect(await audit(root)).toEqual([]);

        // The test site has one route, so the link stays on it and changes the query: still a new URL.
        await userEvent.click(byText(root, 'a', 'Docs'));
        await until(() => expect(location.search).toBe('?page=docs'));
        await until(() => expect(menu.getAttribute('aria-expanded')).toBe('false'));
        expect(menu.isConnected).toBe(true);
    });

    it('closes on Escape', async () => {
        await page.viewport(390, 800);
        const root = show((host) => bar(host));
        await frame();
        const menu = root.querySelector<HTMLElement>('.kit-app-bar-menu');
        if (menu === null) throw new Error('no menu button');
        await userEvent.click(menu);
        await until(() => expect(menu.getAttribute('aria-expanded')).toBe('true'));
        await userEvent.keyboard('{Escape}');
        await until(() => expect(menu.getAttribute('aria-expanded')).toBe('false'));
    });

    it('a bottom bar is there on a phone only', async () => {
        await page.viewport(390, 800);
        const root = show((host) => bottomBar([
            host.mount(Link, { href: '/', children: [text('Home')] }),
            host.mount(Link, { href: '/apps', children: [text('Apps')] }),
        ]));
        await frame();
        const nav = root.querySelector<HTMLElement>('.kit-bottom-bar');
        expect(nav === null ? '' : getComputedStyle(nav).display).toBe('flex');
        await page.viewport(1280, 900);
        await frame();
        expect(nav === null ? '' : getComputedStyle(nav).display).toBe('none');
    });
});

describe('feedback', () => {
    it('a snackbar shows, keeps three at most, and is dismissed', async () => {
        const queue = new SnackQueue();
        const root = show((host) => host.mount(Snackbars, { queue }));
        await frame();

        queue.show('One');
        queue.show('Two');
        queue.show('Three');
        queue.show('Could not save', 'bad');
        await until(() => expect([...root.querySelectorAll('.kit-snackbar-text')].map((e) => e.textContent)).toEqual(['Two', 'Three', 'Could not save']));
        expect(root.querySelector('.kit-snackbars')?.getAttribute('aria-live')).toBe('polite');

        const close = root.querySelector<HTMLElement>('.kit-snackbar[data-tone="bad"] .kit-snackbar-close');
        if (close === null) throw new Error('no close button');
        // Fixed to the bottom of the screen, which in the test frame is below what Playwright can reach.
        close.click();
        await until(() => expect(root.querySelectorAll('.kit-snackbar')).toHaveLength(2));
        expect(await audit(root)).toEqual([]);
    });

    it('a snackbar leaves by itself', async () => {
        vi.useFakeTimers();
        try {
            const queue = new SnackQueue();
            queue.show('Saved');
            expect(queue.items()).toHaveLength(1);
            vi.advanceTimersByTime(4100);
            expect(queue.items()).toHaveLength(0);
        } finally {
            vi.useRealTimers();
        }
    });

    it('progress reports its value, and sweeps while unknown', async () => {
        const value = signal<number | undefined>(0.25);
        const root = show(() => [progress(value, 'Uploading'), spinner('Loading zones')]);
        await frame();
        const bar = root.querySelector<HTMLElement>('[role="progressbar"]');
        expect(bar?.getAttribute('aria-valuenow')).toBe('25');
        value.set(undefined);
        await until(() => expect(bar?.getAttribute('data-indeterminate')).toBe('true'));
        expect(root.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe('Loading zones');
        expect(await audit(root)).toEqual([]);
    });
});

type Kind = 'a' | 'mx' | 'txt';
const KindChips = chips<Kind>();
type Range = '1h' | '24h' | '7d';
const RangeButtons = segmented<Range>();

describe('controls', () => {
    it('chips, a switch and segmented buttons write the page signals', async () => {
        const kinds = signal<readonly Kind[]>([]);
        const on = signal(false);
        const range = signal<Range>('1h');
        const root = show((host) => [
            host.mount(KindChips, { value: kinds, label: 'Record kinds', options: [{ value: 'a', label: 'A' }, { value: 'mx', label: 'MX' }, { value: 'txt', label: 'TXT' }] }),
            host.mount(Switch, { checked: on, label: 'Sign with DNSSEC' }),
            host.mount(RangeButtons, { value: range, label: 'Range', options: [{ value: '1h', label: '1 h' }, { value: '24h', label: '24 h' }, { value: '7d', label: '7 d' }] }),
            divider(),
            tooltip(element('Button', { props: { class: 'kit-button' }, children: [text('TTL')] }), 'How long resolvers keep the answer.'),
            chip('static'),
        ]);
        await frame();

        await userEvent.click(byText(root, 'button', 'MX'));
        await userEvent.click(byText(root, 'button', 'TXT'));
        await until(() => expect(kinds()).toEqual(['mx', 'txt']));
        await userEvent.click(byText(root, 'button', 'MX'));
        await until(() => expect(kinds()).toEqual(['txt']));
        expect(byText(root, 'button', 'TXT').getAttribute('aria-pressed')).toBe('true');

        const sw = root.querySelector<HTMLElement>('[role="switch"]');
        if (sw === null) throw new Error('no switch');
        await userEvent.click(sw);
        await until(() => expect(on()).toBe(true));
        expect(sw.getAttribute('aria-checked')).toBe('true');

        await userEvent.click(byText(root, 'button', '24 h'));
        await until(() => expect(range()).toBe('24h'));
        expect(byText(root, 'button', '1 h').getAttribute('aria-pressed')).toBe('false');

        expect(await audit(root)).toEqual([]);
    });
});

describe('SideSheet', () => {
    it('opens from the page signal and closes on its button', async () => {
        const open = signal(false);
        const root = show((host) => host.mount(SideSheet, { title: 'Record www', open, body: text('A 192.0.2.1') }));
        await frame();
        expect(root.querySelector('dialog[open]')).toBeNull();
        open.set(true);
        await until(() => expect(root.querySelector('dialog[open]')).not.toBeNull());
        expect(await audit(root)).toEqual([]);
        const close = root.querySelector<HTMLElement>('dialog[open] .kit-modal-close');
        if (close === null) throw new Error('no close');
        await userEvent.click(close);
        await until(() => expect(open()).toBe(false));
    });
});

interface Wide { readonly a: string; readonly b: string; readonly c: string; readonly d: string }
const WideTable = dataTable<Wide>();

describe('the table on a phone', () => {
    it('scrolls inside its own box; the page does not widen', async () => {
        await page.viewport(390, 800);
        const long = 'a-rather-long-value-that-does-not-wrap';
        const root = show((host) => host.mount(WideTable, {
            label: 'Wide', rows: () => [{ a: long, b: long, c: long, d: long }], key: (r) => r.a,
            columns: [
                { header: 'a', cell: (r) => text(() => r().a) },
                { header: 'b', cell: (r) => text(() => r().b) },
                { header: 'c', cell: (r) => text(() => r().c) },
                { header: 'd', cell: (r) => text(() => r().d) },
            ],
        }));
        await frame();
        const scroller = root.querySelector<HTMLElement>('.kit-table-scroll');
        if (scroller === null) throw new Error('no scroller');
        expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
        expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
        expect(await audit(root)).toEqual([]);
    });
});

describe('blocks', () => {
    it('a whole public page is clean under axe, light and dark', async () => {
        for (const scheme of ['light', 'dark']) {
            document.documentElement.style.colorScheme = scheme;
            const root = show((host) => [
                hero({
                    eyebrow: 'Hosting', title: 'Ship it here', lead: 'Apps, DNS and mail on servers we run.', note: 'No card needed.',
                    actions: [element('Link', { props: { href: '/up', class: 'kit-button', 'data-tone': 'primary' }, children: [text('Start')] })],
                    art: picture('data:image/gif;base64,R0lGODlhAQABAAAAACw=', 'The console', { framed: true }),
                }),
                band(featureGrid([
                    { title: 'DNS', body: 'Our own nameservers.', mark: 'NS' },
                    { title: 'Mail', body: 'Mailboxes on your domain.', mark: '@' },
                    { title: 'Apps', body: 'Push to deploy.', mark: '>' },
                ]), { title: 'Everything', eyebrow: 'What you get', lead: 'In one place.' }),
                band(text('Three cities.'), { tone: 'dark', title: 'Our own servers', lead: 'Not a reseller.' }),
                band(planGrid([
                    planCard({ name: 'Small', price: '$5', period: 'a month', features: ['1 app'], action: element('Link', { props: { href: '/up', class: 'kit-button' }, children: [text('Choose Small')] }) }),
                    planCard({ name: 'Team', price: '$20', period: 'a month', features: ['10 apps'], featured: true, ribbon: 'Most chosen' }),
                ]), { tone: 'tint', title: 'Plans' }),
                ctaBand('Start today', 'It takes a minute.', [element('Link', { props: { href: '/up', class: 'kit-button', 'data-tone': 'primary' }, children: [text('Get started')] })]),
                authCard('Sign in', 'Welcome back.', element('Input', { props: { type: 'email', 'aria-label': 'Email' } }), text('No account? Sign up.')),
                footer(text('Acme hosts things.'), [{ heading: 'Product', links: [host.mount(Link, { href: '/p', children: [text('Pricing')] })] }], text('© Acme')),
            ]);
            await frame();
            expect(await audit(root)).toEqual([]);
        }
        document.documentElement.style.colorScheme = '';
    });
});
