import Alpine from "alpinejs";
import "./style.css";
import { Api } from "../api/Api";
import { Dropzone } from "./components/dropzone/Dropzone";
import { Checkbox } from "./components/checkbox/Checkbox";
import { Button } from "./components/button/Button";
import { InfoBox } from "./components/infoBox/InfoBox";

export class Gui {
  private readonly api: Api;
  private currentData: string | null = null;

  constructor(api: Api) {
    this.api = api;

    this.api.onDataLoaded.connect((data: string) => (this.currentData = data));
    this.api.onDataCleared.connect(() => (this.currentData = null));
    this.api.onRerunClicked.connect(() => {
      if (this.currentData) {
        this.api.onDataLoaded.emit(this.currentData);
      }
    });

    new Dropzone(this.api);
    new Checkbox(this.api, { label: "use WASM compute", checked: false });
    new Button(this.api, { label: "Rerun compute" });
    new InfoBox(this.api);

    Alpine.start();
  }
}
