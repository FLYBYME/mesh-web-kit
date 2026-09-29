/**
 * Previous / next, as real links. The URL is the state — page 3 is `?page=3` — so it survives a
 * reload, a shared link and the back button. A component only because `Link` is mounted; it keeps
 * no state of its own.
 */
import { type Node } from '@flybyme/mesh-web';
declare const Pager_base: (abstract new (init: import("@flybyme/mesh-web").ComponentInit<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<{
        readonly page: () => number;
        readonly pages: () => number;
        readonly href: (page: number) => string;
    }>;
}>) => import("@flybyme/mesh-web").ComponentBase<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<{
        readonly page: () => number;
        readonly pages: () => number;
        readonly href: (page: number) => string;
    }>;
}>) & {
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<{
            readonly page: () => number;
            readonly pages: () => number;
            readonly href: (page: number) => string;
        }>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<{
            readonly page: () => number;
            readonly pages: () => number;
            readonly href: (page: number) => string;
        }>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<{
            readonly page: () => number;
            readonly pages: () => number;
            readonly href: (page: number) => string;
        }>;
    }>): T;
};
export declare class Pager extends Pager_base {
    render(): Node;
}
export {};
//# sourceMappingURL=pager.d.ts.map