type Callback<T extends any[]> = (...args: T) => void;

export class Signal<T extends any[] = []> {
  private callbacks = new Set<Callback<T>>();

  connect(callback: Callback<T>): void {
    this.callbacks.add(callback);
  }

  disconnect(callback: Callback<T>): void {
    this.callbacks.delete(callback);
  }

  emit(...args: T): void {
    for (const callback of this.callbacks) {
      callback(...args);
    }
  }

  once(callback: Callback<T>): void {
    const wrapper: Callback<T> = (...args) => {
      this.disconnect(wrapper);
      callback(...args);
    };
    this.connect(wrapper);
  }

  disconnectAll(): void {
    this.callbacks.clear();
  }

  get connectionCount(): number {
    return this.callbacks.size;
  }
}
