/** Small, pure formatting every admin page needs. No nodes, no state. */
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
export declare function ago(iso: string | undefined, now?: number, options?: AgoOptions): string;
/** "1 zone", "3 zones". */
export declare function plural(count: number, one: string, many?: string): string;
/** "0 B", "1.5 KB", "3.2 GB". */
export declare function bytes(count: number | undefined): string;
//# sourceMappingURL=format.d.ts.map