// Minimal DOM test adapter; no browser or downloaded dependencies are required.
// It retains the rendered tree and dispatches native EventTarget events.
export class TestElement extends EventTarget {
  children: Array<TestElement | string> = [];
  parent: TestElement | null = null;
  className = '';
  id = '';
  value = '';
  type = '';
  maxLength = 0;
  checked = false;
  selected = false;
  disabled = false;
  placeholder = '';
  lang = '';
  htmlFor = '';
  style = { display: '' };
  attributes = new Map<string, string>();
  constructor(readonly tagName: string) { super(); }
  append(...children: Array<TestElement | string>) {
    for (const child of children) {
      if (child instanceof TestElement) { child.remove(); child.parent = this; }
      this.children.push(child);
    }
  }
  replaceChildren(...children: Array<TestElement | string>) {
    for (const child of this.children) if (child instanceof TestElement) child.parent = null;
    this.children = []; this.append(...children);
  }
  remove() {
    if (this.parent) this.parent.children = this.parent.children.filter((child) => child !== this);
    this.parent = null;
  }
  get textContent(): string { return this.children.map((child) => typeof child === 'string' ? child : child.textContent).join(''); }
  set textContent(text: string) { this.replaceChildren(text); }
  setAttribute(key: string, value: string) { this.attributes.set(key, value); }
  click() { if (!this.disabled) this.dispatchEvent(new Event('click')); }
  querySelectorAll(selector: string): TestElement[] {
    const match = /^(\w+)?(?:#([\w-]+))?(?:\[([\w-]+)="([^"]*)"\])?$/.exec(selector);
    if (!match) throw new Error(`Unsupported test selector: ${selector}`);
    const [, tag, id, attr, value] = match;
    const found: TestElement[] = [];
    for (const child of this.children) {
      if (!(child instanceof TestElement)) continue;
      const property = attr === 'maxlength' ? child.maxLength : attr ? child.attributes.get(attr) : undefined;
      if ((!tag || child.tagName === tag) && (!id || child.id === id) && (!attr || String(property) === value)) found.push(child);
      found.push(...child.querySelectorAll(selector));
    }
    return found;
  }
  querySelector(selector: string): TestElement | null { return this.querySelectorAll(selector)[0] ?? null; }
}

export function installTestDOM() {
  const originals = new Map<string, PropertyDescriptor | undefined>();
  const storage = new Map<string, string>();
  const win = new EventTarget();
  const values = {
    document: { createElement: (tag: string) => new TestElement(tag), body: new TestElement('body'), head: new TestElement('head') },
    window: win,
    localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) },
    navigator: { language: 'en-US' },
    location: { pathname: '/' },
    confirm: (text: string) => (win as unknown as Window).confirm(text),
    StorageEvent: class extends Event {
      key: string | null;
      constructor(type: string, init: StorageEventInit = {}) { super(type); this.key = init.key ?? null; }
    },
  };
  for (const [key, value] of Object.entries(values)) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  return () => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  };
}
