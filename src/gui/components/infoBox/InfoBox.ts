import Alpine from "alpinejs";
import infoBoxTemplate from "./infobox.html?raw";
import "./infobox.css";
import type { Api } from "../../../api/Api";

const selector = "#infobox";

export interface InfoBoxOptions {
  text?: string;
  visible?: boolean;
}

export class InfoBox {
  private readonly api: Api;
  private options: InfoBoxOptions;

  constructor(api: Api, options: InfoBoxOptions = {}) {
    this.api = api;
    this.options = {
      text: options.text ?? "",
      visible: options.visible ?? true,
    };
    document.querySelector(selector)!.innerHTML = infoBoxTemplate;
    this.registerComponent();
  }

  private registerComponent(): void {
    const options = this.options;
    const api = this.api;

    Alpine.data("infoBox", () => ({
      text: options.text,
      isVisible: options.visible,

      init() {
        api.onInfoMessage.connect((message: string) => {
          this.setText(message);
        });
      },

      setText(value: string) {
        this.text = value;
      },

      show() {
        this.isVisible = true;
      },

      hide() {
        this.isVisible = false;
      },

      toggle() {
        this.isVisible = !this.isVisible;
      },
    }));
  }
}
