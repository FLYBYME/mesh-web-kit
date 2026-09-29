/**
 * One page whose content each test supplies: a real App, mounted as a real site, so a piece is
 * rendered by the real renderer, gets a real `this.mount` / `this.on`, and is pressed through CDP.
 */

import { App, mountSite, Router, View, type MountedApp, type Node } from '@flybyme/mesh-web';
// Styled, as a site shows them: an audit of unstyled pieces cannot see a colour-contrast failure
// (it missed one until this line existed).
import '../src/kit.css';

type Body = (host: Page) => Node;
let body: Body = () => [];

export class Page extends View({ inject: { router: Router } }) {
    render(): Node {
        return body(this);
    }
}

class KitTest extends App({ routes: { '/': Page } }) {}

let site: MountedApp | undefined;
let root: HTMLElement | undefined;

/** Mount a page showing `render(host)`. The previous one, if any, is disposed first. */
export function show(render: Body): HTMLElement {
    unmount();
    body = render;
    history.replaceState(null, '', '/');
    root = document.createElement('div');
    document.body.appendChild(root);
    site = mountSite(KitTest, { root });
    return root;
}

export function unmount(): void {
    site?.dispose();
    site = undefined;
    root?.remove();
    root = undefined;
}

export const frame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));

export function byText<E extends Element = HTMLElement>(scope: ParentNode, selector: string, text: string): E {
    const found = [...scope.querySelectorAll<E>(selector)].find((el) => el.textContent === text);
    if (found === undefined) throw new Error(`no ${selector} with text "${text}"`);
    return found;
}
