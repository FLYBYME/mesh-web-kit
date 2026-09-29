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
import { CommandSchemaError, Component, each, element, props, signal, text, when, } from '@flybyme/mesh-web';
/** Ids unique per mounted form, so two forms for one command on a page never share a label. */
let formCount = 0;
export function commandForm(command, fields) {
    const names = Object.keys(fields);
    return class CommandForm extends Component({ props: props() }) {
        id = `kit-form-${++formCount}`;
        values = signal({ ...this.props.initial });
        problems = signal({});
        problem = signal(undefined);
        render() {
            return element('Form', {
                props: { class: 'kit-form', 'aria-label': command.title, novalidate: true },
                intents: { commit: { action: this.on(() => void this.#submit()), preventDefault: true } },
                children: [
                    ...names.map((name) => this.#field(name)),
                    when(() => this.problem() !== undefined, () => element('Text', {
                        props: { role: 'alert', class: 'kit-error' },
                        children: [text(() => this.problem() ?? '')],
                    })),
                    element('Row', {
                        props: { class: 'kit-actions' },
                        children: [
                            element('Button', {
                                props: { type: 'submit', class: 'kit-button', 'data-tone': 'primary', disabled: () => command.running() },
                                children: [text(() => (command.running() ? 'Working…' : this.props.submitLabel ?? command.title))],
                            }),
                            ...(this.props.onCancel === undefined ? [] : [element('Button', {
                                    props: { class: 'kit-button' },
                                    intents: { activate: { action: this.on(() => this.props.onCancel?.()) } },
                                    children: [text('Cancel')],
                                })]),
                        ],
                    }),
                ],
            });
        }
        #field(name) {
            const field = fieldOf(fields, name);
            const id = `${this.id}-${name}`;
            const set = (v) => this.values.set({ ...this.values(), [name]: v });
            const change = this.on((v) => set(typeof v === 'boolean' ? v : typeof v === 'string' ? v : String(v ?? '')));
            const described = {
                'aria-invalid': () => this.problems()[name] !== undefined,
                'aria-describedby': `${id}-problem`,
            };
            if (field.type === 'checkbox') {
                return element('Stack', {
                    props: { class: 'kit-field', 'data-field': name },
                    children: [
                        element('Label', {
                            props: { class: 'kit-check' },
                            children: [
                                element('Input', {
                                    props: { id, name, type: 'checkbox', checked: () => this.values()[name] === true, ...described },
                                    intents: { change: { action: change } },
                                }),
                                text(field.label),
                            ],
                        }),
                        this.#problemLine(id, name, field),
                    ],
                });
            }
            const value = () => {
                const v = this.values()[name];
                return typeof v === 'string' ? v : '';
            };
            const control = field.options === undefined
                ? element('Input', {
                    props: {
                        id, name, type: field.type ?? 'text', value,
                        ...(field.placeholder === undefined ? {} : { placeholder: field.placeholder }),
                        ...(field.autocomplete === undefined ? {} : { autocomplete: field.autocomplete }),
                        ...described,
                    },
                    intents: { change: { action: change } },
                })
                : element('Select', {
                    props: { id, name, value, ...described },
                    intents: { change: { action: change } },
                    children: [each(field.options, (o) => o, (o) => element('Option', { props: { value: o() }, children: [text(o)] }))],
                });
            return element('Stack', {
                props: { class: 'kit-field', 'data-field': name },
                children: [
                    element('Label', { props: { for: id }, children: [text(field.label)] }),
                    control,
                    this.#problemLine(id, name, field),
                ],
            });
        }
        #problemLine(id, name, field) {
            return element('Text', {
                props: { id: `${id}-problem`, class: 'kit-field-problem', 'data-problem-for': name },
                children: [text(() => this.problems()[name] ?? field.hint ?? '')],
            });
        }
        async #submit() {
            this.problems.set({});
            this.problem.set(undefined);
            try {
                // Strings from the DOM are not an `I` until the command's schema says so: `submit`.
                const result = await command.submit({ ...this.values(), ...this.props.fixed });
                this.values.set({ ...this.props.initial });
                this.props.onDone?.(result);
            }
            catch (error) {
                this.#report(error);
            }
        }
        #report(error) {
            if (error instanceof CommandSchemaError && error.side === 'input' && error.issues.length > 0) {
                const byField = {};
                const elsewhere = [];
                for (const issue of error.issues) {
                    const [first] = issue.path;
                    if (typeof first === 'string' && names.includes(first))
                        byField[first] ??= issue.message;
                    else
                        elsewhere.push(issue.message);
                }
                this.problems.set(byField);
                if (elsewhere.length > 0)
                    this.problem.set(elsewhere.join(' '));
                return;
            }
            this.problem.set(error instanceof Error ? error.message : String(error));
        }
    };
}
function fieldOf(fields, name) {
    const entry = Object.entries(fields).find(([key]) => key === name)?.[1];
    if (!isField(entry))
        throw new Error(`No field "${name}".`);
    return entry;
}
function isField(value) {
    return typeof value === 'object' && value !== null && 'label' in value;
}
//# sourceMappingURL=command-form.js.map