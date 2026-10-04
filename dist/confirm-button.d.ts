/**
 * A button that asks first. Every destructive action on a site should be one of these: nothing is
 * deleted by a single stray click, and a failure is shown where the person is looking instead of
 * vanishing into a `catch {}`.
 *
 * A component because it remembers things: whether the question is open, whether the action is
 * running, and what went wrong.
 */
import { type Node } from '@flybyme/mesh-web';
export interface ConfirmButtonProps {
    /** On the button: "Delete". */
    readonly label: string;
    /** In the dialog: "Delete example.com and all its records?". */
    readonly question: string;
    /** On the confirming button: "Delete zone". Defaults to `label`. */
    readonly confirm?: string;
    readonly run: () => Promise<unknown>;
    /** `danger` (the default) for something that cannot be undone. */
    readonly tone?: 'danger' | 'neutral';
    /**
     * Text the person must type before the confirming button works (the domain an undo removes):
     * for what one stray click must never do. Absent: one confirming click is enough.
     */
    readonly typed?: string;
}
declare const ConfirmButton_base: (abstract new (init: import("@flybyme/mesh-web").ComponentInit<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<ConfirmButtonProps>;
}>) => import("@flybyme/mesh-web").ComponentBase<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<ConfirmButtonProps>;
}>) & {
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<ConfirmButtonProps>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<ConfirmButtonProps>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<ConfirmButtonProps>;
    }>): T;
};
export declare class ConfirmButton extends ConfirmButton_base {
    #private;
    readonly open: import("@flybyme/mesh-web").Signal<boolean>;
    readonly busy: import("@flybyme/mesh-web").Signal<boolean>;
    readonly problem: import("@flybyme/mesh-web").Signal<string | undefined>;
    /** What has been typed so far, when `typed` asks for it. */
    readonly entered: import("@flybyme/mesh-web").Signal<string>;
    readonly ask: import("@flybyme/mesh-web").Action;
    readonly type: import("@flybyme/mesh-web").Action;
    readonly cancel: import("@flybyme/mesh-web").Action;
    readonly go: import("@flybyme/mesh-web").Action;
    render(): Node;
}
export {};
//# sourceMappingURL=confirm-button.d.ts.map