import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Api } from "../api/Api";
import { MeshManager } from "./MeshManager";

const container = "#app";

export class Renderer {
  private readonly api: Api;
  private meshManager: MeshManager = new MeshManager();

  private scene: Scene = this.createScene();
  private camera: PerspectiveCamera = this.createCamera();
  private renderer: WebGLRenderer = this.createRenderer();
  private controls: OrbitControls = this.createControls();

  constructor(api: Api) {
    this.api = api;
    this.addEventListeners();
    this.render();

    this.api.onCuboidsComputed.connect((cuboidData) => {
      this.meshManager.addCuboids(this.scene, cuboidData);
      this.updateCameraToScene();
    });

    // Clear existing meshes when new data is loaded
    this.api.onDataLoaded.connect(() => {
      this.meshManager.dispose(this.scene);
    });

    this.api.onDataCleared.connect(() => {
      this.meshManager.dispose(this.scene);
    });
  }

  private createScene(): Scene {
    const scene = new Scene();
    scene.background = new Color(0x20232a);

    const ambientLight = new AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 5, 2);
    scene.add(directionalLight);

    return scene;
  }

  private createCamera(): PerspectiveCamera {
    const camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      25000,
    );
    camera.position.set(100, 100, 100);
    return camera;
  }

  private createRenderer(): WebGLRenderer {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const appContainer = document.querySelector(container);
    if (appContainer) {
      appContainer.appendChild(renderer.domElement);
    } else {
      console.error(`Container element '${container}' not found.`);
    }
    return renderer;
  }

  private createControls(): OrbitControls {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    return controls;
  }

  private addEventListeners(): void {
    window.addEventListener("resize", this.onWindowResize.bind(this), false);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private updateCameraToScene(): void {
    const box = new Box3().setFromObject(this.scene);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    const distance = maxDimension * 1.0;
    this.controls.target.copy(center);
    this.controls.update();

    this.camera.position.set(
      center.x + distance,
      center.y + distance,
      center.z + distance,
    );
    this.camera.lookAt(center);
    this.camera.updateProjectionMatrix();
  }

  private render = () => {
    requestAnimationFrame(this.render);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  // Not used currently, but kept for future reference
  // private dispose(): void {
  //   this.removeEventListeners();
  //   this.controls.dispose();
  //   this.renderer.dispose();
  // }
  //
  // Not used currently, but kept for future reference
  // private removeEventListeners(): void {
  //   window.removeEventListener("resize", this.onWindowResize.bind(this), false);
  // }
}
