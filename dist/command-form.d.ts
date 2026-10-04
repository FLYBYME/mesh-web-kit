/**
 * A form for a command: fields in, `command.submit(values)` out, each error beside its field.
 *
 * **The rules live on the command, once.** The form knows labels and control types. Whether an
 * email is an email, a TTL at least 60, a name matches the server's pattern, is the command's input
 * schema, which the command checks before anything is sent. When it refuses, `CommandSchemaError`
 * carries each issue's path, and the message goes beside that field. So a rule is written once, and
 * every form, key binding and API caller of that command gets it — the form never has its own
 * copy of a regex to drift from the server's.
 *
 * Generic over the command's input, so it is a factory. A command is an instance field, so the form
 * class is made where an instance is at hand — a field of the page:
 *
 * ```ts
 * readonly CreateZoneForm = commandForm(this.inject.zones.create, {
 *     name: { label: 'Domain', placeholder: 'example.com' },
 *     defaultTtl: { label: 'Default TTL (seconds)', type: 'number' },
 * });
 * // …
 * this.mount(this.CreateZoneForm, { onDone: (zone) => router.navigate(router.href(ZoneView, { zoneId: zone.id })) })
 * ```
 */
import { type Command, type Node } from '@flybyme/mesh-web';
export interface Field {
    readonly label: string;
    /** `textarea`: several lines of free text (a message, a description). */
    readonly type?: 'text' | 'email' | 'password' | 'number' | 'checkbox' | 'textarea';
    /**
     * Renders a select with these choices instead of an input: each a value, or a value with the
     * words a person reads (`{ value: 'stripe', label: 'Card' }`).
     */
    readonly options?: readonly (string | {
        readonly value: string;
        readonly label: string;
    })[];
    readonly placeholder?: string;
    readonly autocomplete?: string;
    /** Help text under the field, always shown. */
    readonly hint?: string;
}
/** A field per input key the person fills in. Keys the caller fixes (`fixed`) are left out. */
export type Fields<I> = {
    readonly [K in keyof I & string]?: Field;
};
type Value = string | boolean;
export interface CommandFormProps<I, O> {
    /** Values the person does not choose — the zone a record is added to. */
    readonly fixed?: Partial<I>;
    readonly initial?: Partial<Record<keyof I & string, Value>>;
    readonly submitLabel?: string;
    readonly onDone?: (result: O) => void;
    /** Shown beside submit; omit for none. */
    readonly onCancel?: () => void;
}
export declare function commandForm<I extends object, O>(command: Command<I, O>, fields: Fields<I>): {
    new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<CommandFormProps<I, O>>;
    }>): {
        readonly id: string;
        readonly values: import("@flybyme/mesh-web").Signal<Readonly<Record<string, Value>>>;
        readonly problems: import("@flybyme/mesh-web").Signal<Readonly<Record<string, string>>>;
        readonly problem: import("@flybyme/mesh-web").Signal<string | undefined>;
        render(): Node;
        "__#private@#field"(name: string): Node;
        "__#private@#problemLine"(id: string, name: string, field: Field): Node;
        "__#private@#submit"(): Promise<void>;
        "__#private@#report"(error: unknown): void;
        readonly cx: import("@flybyme/mesh-web").Capabilities<readonly [], unknown>;
        readonly inject: import("@flybyme/mesh-web").Injected<import("@flybyme/mesh-web").None>;
        readonly props: CommandFormProps<I, O>;
        on(fn: (value?: import("@flybyme/mesh-web").IntentValue) => void): import("@flybyme/mesh-web").Action;
        mount<C extends import("@flybyme/mesh-web").ComponentClass>(component: C & import("@flybyme/mesh-web").CheckNeeds<C, readonly []>, ...args: import("@flybyme/mesh-web").MountArgs<C>): Node;
    };
    readonly kind: "component";
    readonly spec: {
        readonly props: import("@flybyme/mesh-web").PropsDecl<CommandFormProps<I, O>>;
    };
    create<T>(this: new (init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<CommandFormProps<I, O>>;
    }>) => T, init: import("@flybyme/mesh-web").ComponentInit<{
        readonly props: import("@flybyme/mesh-web").PropsDecl<CommandFormProps<I, O>>;
    }>): T;
};
export {};
//# sourceMappingURL=command-form.d.ts.map