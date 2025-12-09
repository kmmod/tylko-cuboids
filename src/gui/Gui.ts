import Alpine from "alpinejs";
import "./style.css";
import { Api } from "../api/Api";
import { Dropzone } from "./components/Dropzone";

export class Gui {
  private readonly api: Api;

  constructor(api: Api) {
    this.api = api;

    new Dropzone(this.api);

    Alpine.start();
  }
}
