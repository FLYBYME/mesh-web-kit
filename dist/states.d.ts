/**
 * The three states of anything fetched — loading, failed, here — and what "nothing here" looks
 * like. Drawn the same way everywhere, so a site never invents its own spinner or error line.
 *
 * Functions, not components: none of this remembers anything.
 */
import { type Node, type Resource } from '@flybyme/mesh-web';
export interface LoadedOptions {
    /** What is loading, for the busy text: "Loading zones…". */
    readonly label?: string;
}
/**
 * `ready` gets the data as an accessor and is built **once**: a refetch updates what is on screen
 * through the accessor instead of tearing it down, so a table keeps its sort and a panel its scroll
 * while it refreshes.
 */
export declare function loaded<T>(resource: Resource<T>, ready: (data: () => T) => Node, options?: LoadedOptions): Node;
/** Functions for text that follows state — an empty search result names the current search. */
export declare function emptyState(title: string | (() => string), detail?: string | (() => string), action?: Node): Node;
//# sourceMappingURL=states.d.ts.map