import { Renderer } from "./renderer/Renderer";
import { Api } from "./api/Api";
import { Gui } from "./gui/Gui";
import { Cuboids } from "./cuboids/Cuboids";

import a from "./A.csv?raw";
import c from "./C.csv?raw";

class App {
  private api = new Api();

  constructor() {
    new Gui(this.api);
    new Cuboids(this.api);
    new Renderer(this.api);

    this.api.onDataLoaded.emit(c);
  }
}

new App();
