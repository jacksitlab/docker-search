export interface IDictionary<T> {
  add(key: string, value: T): void;
  remove(key: string): void;
  containsKey(key: string): boolean;
  keys(): string[];
  values(): T[];
  keySet(): { key: string; value: T; }[];
  clear(): void;
  isEmpty(): boolean;
}
class Dictionary<T> implements IDictionary<T> {

  _keys: string[] = [];
  _values: T[] = [];

  constructor(init?: { key: string; value: T; }[]) {
    if (init) {
      for (var x = 0; x < init.length; x++) {
        this._keys.push(init[x].key);
        this._values.push(init[x].value);
      }
    }
  }
  public add(key: string, value: T) {
    this._keys.push(key);
    this._values.push(value);
  }

  public remove(key: string) {
    var index = this._keys.indexOf(key, 0);
    this._keys.splice(index, 1);
    this._values.splice(index, 1);
  }

  public keys(): string[] {
    return this._keys;
  }

  public values(): T[] {
    return this._values;
  }

  public isEmpty(): boolean {
    return this._keys.length <= 0;
  }

  public keySet(): { key: string; value: T; }[] {
    const a: { key: string; value: T; }[] = [];
    for (let i = 0; i < this._keys.length; i++) {
      a.push({ key: this._keys[i], value: this._values[i] });
    }
    return a;
  }
  public containsKey(key: string) {
    if (this._keys.indexOf(key) < 0) {
      return false;
    }
    return true;
  }

  public get(key: string): T | undefined {
    return this._keys.indexOf(key) >= 0 ? this._values[this._keys.indexOf(key)] : undefined;
  }

  public clear() {
    this._keys.splice(0, this._keys.length);
    this._values.splice(0, this._values.length);

  }
}

export default Dictionary;