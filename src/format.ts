/** Small, pure formatting every admin page needs. No nodes, no state. */

const UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 365 * 24 * 3600],
    ['month', 30 * 24 * 3600],
    ['day', 24 * 3600],
    ['hour', 3600],
    ['minute', 60],
];

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
const narrow = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto', style: 'narrow' });

export interface AgoOptions {
    /** Count seconds under a minute ("12 seconds ago") instead of "just now": for things that change every few seconds. */
    readonly seconds?: boolean;
    /** "12s ago", "3m ago": the browser's short form, for a column of times. */
    readonly short?: boolean;
}

/**
 * "3 days ago", "in 2 months", "just now", "never". `now` is a parameter so a test can fix it, and
 * so a page can pass a ticking one (`clock`) to keep the words current between updates.
 */
export function ago(iso: string | undefined, now: number = Date.now(), options: AgoOptions = {}): string {
    if (iso === undefined) return 'never';

    const time = Date.parse(iso);
    if (Number.isNaN(time)) return 'never';

    const format = options.short === true ? narrow : relative;
    const seconds = Math.round((time - now) / 1000);
    for (const [unit, size] of UNITS) {
        if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
    }

    return options.seconds === true && seconds !== 0 ? format.format(seconds, 'second') : 'just now';
}

/** "1 zone", "3 zones". */
export function plural(count: number, one: string, many = `${one}s`): string {
    return `${count} ${count === 1 ? one : many}`;
}

/** "0 B", "1.5 KB", "3.2 GB". */
export function bytes(count: number | undefined): string {
    if (count === undefined || count <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(Math.floor(Math.log(count) / Math.log(1024)), units.length - 1);
    return `${parseFloat((count / 1024 ** i).toFixed(1))} ${units[i]}`;
}
