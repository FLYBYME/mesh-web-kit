/**
 * Menu component: a button that opens a short list of actions.
 *
 * Closes on Escape and outside click. Arrow keys navigate between items.
 */
import { type Node } from '@flybyme/mesh-web';
export interface MenuItem {
    readonly label: string;
    readonly run: () => void | Promise<void>;
    readonly tone?: 'danger' | 'neutral';
    readonly disabled?: boolean;
}
export interface MenuProps {
    readonly label: string;
    readonly items: readonly MenuItem[];
    readonly tone?: 'primary' | 'neutral' | 'danger';
}
declare const Menu_base: (abstract new (init: import("@flybyme/mesh-web").ComponentInit<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<MenuProps>;
}>) => import("@flybyme/mesh-web").ComponentBase<{
    readonly props: import("@flybyme/mesh-web").PropsDecl<MenuProps>;
}>) & {
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<MenuProps>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<MenuProps>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<MenuProps>;
    }>): T;
};
export declare class Menu extends Menu_base {
    #private;
    readonly open: import("@flybyme/mesh-web").Signal<boolean>;
    readonly activeIndex: import("@flybyme/mesh-web").Signal<number>;
    readonly toggleAction: import("@flybyme/mesh-web").Action;
    readonly closeAction: import("@flybyme/mesh-web").Action;
    readonly down: import("@flybyme/mesh-web").Command<void, void>;
    readonly up: import("@flybyme/mesh-web").Command<void, void>;
    readonly esc: import("@flybyme/mesh-web").Command<void, void>;
    dispose(): void;
    render(): Node;
}
export {};
//# sourceMappingURL=menu.d.ts.map