/**
 * Modal dialog component and command modal factory.
 *
 * Built on mesh-web's `dialog` primitive: accessible title, focus trap, Escape key handling,
 * and backdrop dismissal. Full-screen on mobile viewports.
 */
import { type Command, type Node, type Signal } from '@flybyme/mesh-web';
import { type CommandFormProps, type Fields } from './command-form.js';
export interface ModalProps {
    readonly title: string | (() => string);
    readonly body: Node;
    readonly actions?: readonly Node[];
    /** A trigger button or node, a label string, or a function that receives the open callback. */
    readonly trigger?: Node | string | ((open: () => void) => Node);
    /** Controlled open signal: if supplied, the modal reflects and updates this signal. */
    readonly open?: Signal<boolean>;
    readonly onClose?: () => void;
}
declare const Modal_base: (abstract new (init: import("@flybyme/mesh-web").ComponentInit<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<ModalProps>;
}>) => import("@flybyme/mesh-web").ComponentBase<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<ModalProps>;
}>) & {
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<ModalProps>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<ModalProps>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<ModalProps>;
    }>): T;
};
export declare class Modal extends Modal_base {
    #private;
    readonly openAction: import("@flybyme/mesh-web").Action;
    readonly closeAction: import("@flybyme/mesh-web").Action;
    render(): Node;
}
export interface CommandModalProps<I, O> extends CommandFormProps<I, O> {
    readonly title?: string | (() => string);
    readonly trigger?: Node | string | ((open: () => void) => Node);
    readonly open?: Signal<boolean>;
}
export declare function commandModal<I extends object, O>(command: Command<I, O>, fields: Fields<I>): {
    new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<CommandModalProps<I, O>>;
    }>): {
        readonly "__#private@#open": Signal<boolean>;
        readonly "__#private@#close": () => void;
        readonly "__#private@#onDone": (result: O) => void;
        readonly "__#private@#onCancel": () => void;
        render(): Node;
        readonly cx: import("@flybyme/mesh-web").Capabilities<readonly [], unknown>;
        readonly inject: import("@flybyme/mesh-web").Injected<import("@flybyme/mesh-web").None>;
        readonly props: CommandModalProps<I, O>;
        on(fn: (value?: import("@flybyme/mesh-web").IntentValue) => void): import("@flybyme/mesh-web").Action;
        mount<C extends import("@flybyme/mesh-web").ComponentClass>(component: C & import("@flybyme/mesh-web").CheckNeeds<C, readonly []>, ...args: import("@flybyme/mesh-web").MountArgs<C>): Node;
    };
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<CommandModalProps<I, O>>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<CommandModalProps<I, O>>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<CommandModalProps<I, O>>;
    }>): T;
};
export {};
//# sourceMappingURL=modal.d.ts.map