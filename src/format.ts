/** Small, pure formatting every admin page needs. No nodes, no state. */

const UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 365 * 24 * 3600],
    ['month', 30 * 24 * 3600],
    ['day', 24 * 3600],
    ['hour', 3600],
    ['minute', 60],
];

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

/** "3 days ago", "in 2 months", "just now", "never". `now` is a parameter so a test can fix it. */
export function ago(iso: string | undefined, now: number = Date.now()): string {
    if (iso === undefined) return 'never';
    const seconds = Math.round((Date.parse(iso) - now) / 1000);
    for (const [unit, size] of UNITS) {
        if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
    }
    return 'just now';
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
