/**
 * A side sheet: a panel that slides in from the right edge over the page, for the details of one
 * thing (a record, a log line, a deploy) without leaving the list. On a phone it takes the whole
 * screen. Built on mesh-web's `dialog`, so focus is trapped and Escape closes it, as in `Modal`.
 *
 * The page owns whether it is open: it passes a signal and sets it.
 */
import { type Node, type Signal } from '@flybyme/mesh-web';
export interface SideSheetProps {
    readonly title: string | (() => string);
    readonly body: Node;
    readonly open: Signal<boolean>;
    readonly actions?: readonly Node[];
}
declare const SideSheet_base: (abstract new (init: import("@flybyme/mesh-web").ComponentInit<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<SideSheetProps>;
}>) => import("@flybyme/mesh-web").ComponentBase<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<SideSheetProps>;
}>) & {
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<SideSheetProps>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<SideSheetProps>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<SideSheetProps>;
    }>): T;
};
export declare class SideSheet extends SideSheet_base {
    readonly closeAction: import("@flybyme/mesh-web").Action;
    render(): Node;
}
export {};
//# sourceMappingURL=sheet.d.ts.map