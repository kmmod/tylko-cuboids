import Alpine from "alpinejs";
import buttonTemplate from "./button.html?raw";
import "./button.css";
import type { Api } from "../../../api/Api";

const selector = "#rerun";

export interface ButtonOptions {
  label?: string;
  disabled?: boolean;
}

export class Button {
  private readonly api: Api;
  private options: ButtonOptions;

  constructor(api: Api, options: ButtonOptions = {}) {
    this.api = api;
    this.options = {
      label: options.label ?? "Button",
      disabled: options.disabled ?? false,
    };
    document.querySelector(selector)!.innerHTML = buttonTemplate;
    this.registerComponent();
  }

  private registerComponent(): void {
    const api = this.api;
    const options = this.options;

    Alpine.data("button", () => ({
      isDisabled: options.disabled,
      label: options.label,

      handleClick() {
        if (this.isDisabled) return;
        api.onRerunClicked.emit();
      },

      setDisabled(value: boolean) {
        this.isDisabled = value;
      },

      setLabel(value: string) {
        this.label = value;
      },
    }));
  }
}
