/**
 * Copy text component: displays a value with a copy button, remembering the copied state.
 */
import { type Node } from '@flybyme/mesh-web';
export interface CopyTextProps {
    readonly value: string | (() => string);
    readonly label?: string;
}
declare const CopyText_base: (abstract new (init: import("@flybyme/mesh-web").ComponentInit<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<CopyTextProps>;
}>) => import("@flybyme/mesh-web").ComponentBase<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<CopyTextProps>;
}>) & {
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<CopyTextProps>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<CopyTextProps>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<CopyTextProps>;
    }>): T;
};
export declare class CopyText extends CopyText_base {
    #private;
    readonly copied: import("@flybyme/mesh-web").Signal<boolean>;
    readonly copy: import("@flybyme/mesh-web").Action;
    dispose(): void;
    render(): Node;
}
export declare const copyText: typeof CopyText;
export {};
//# sourceMappingURL=copy-text.d.ts.map