/** Small, pure formatting every admin page needs. No nodes, no state. */
/** "3 days ago", "in 2 months", "just now", "never". `now` is a parameter so a test can fix it. */
export declare function ago(iso: string | undefined, now?: number): string;
/** "1 zone", "3 zones". */
export declare function plural(count: number, one: string, many?: string): string;
/** "0 B", "1.5 KB", "3.2 GB". */
export declare function bytes(count: number | undefined): string;
//# sourceMappingURL=format.d.ts.map