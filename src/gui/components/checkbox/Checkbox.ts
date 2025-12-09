import Alpine from "alpinejs";
import checkboxTemplate from "./checkbox.html?raw";
import "./checkbox.css";
import type { Api } from "../../../api/Api";

const selector = "#checkbox";

export interface CheckboxOptions {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
}

export class Checkbox {
  private readonly api: Api;
  private options: CheckboxOptions;

  constructor(api: Api, options: CheckboxOptions = {}) {
    this.api = api;
    this.options = {
      label: options.label ?? "Use wasm",
      checked: options.checked ?? false,
      disabled: options.disabled ?? false,
    };
    document.querySelector(selector)!.innerHTML = checkboxTemplate;
    this.registerComponent();
  }

  private registerComponent(): void {
    const api = this.api;
    const options = this.options;

    Alpine.data("checkbox", () => ({
      isChecked: options.checked,
      isDisabled: options.disabled,
      label: options.label,
      error: "",

      toggle() {
        if (this.isDisabled) return;

        this.isChecked = !this.isChecked;
        this.error = "";

        api.onUseWasmSet.emit(this.isChecked);
      },

      setChecked(value: boolean) {
        this.isChecked = value;
      },

      setDisabled(value: boolean) {
        this.isDisabled = value;
      },

      setLabel(value: string) {
        this.label = value;
      },

      setError(message: string) {
        this.error = message;
      },

      clearError() {
        this.error = "";
      },
    }));
  }
}
