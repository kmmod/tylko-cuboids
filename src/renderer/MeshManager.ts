import {
  BoxGeometry,
  InstancedMesh,
  Matrix4,
  Quaternion,
  RepeatWrapping,
  Scene,
  Texture,
  TextureLoader,
  Vector3,
} from "three";
import { BoxMaterial } from "./BoxMaterial";
import texture from "/wowcat.jpg";
import type { CuboidData } from "../cuboids/types";

const matrix = new Matrix4();
const position = new Vector3();
const rotation = new Quaternion();
const scale = new Vector3();

export class MeshManager {
  private meshes: Map<number, InstancedMesh> = new Map();
  private textureLoader: TextureLoader = new TextureLoader();
  private texture: Texture | undefined;
  private textureScale: number = 0.01;

  constructor() {
    this.texture = this.textureLoader.load(texture);
    this.texture.wrapS = this.texture.wrapT = RepeatWrapping;
  }

  public setTextureScale(scale: number): void {
    this.textureScale = scale;
  }

  public addCuboids(scene: Scene, data: CuboidData): void {
    const offset = 7;
    const { groups, cuboidsArray } = data;

    for (const [groupId, cuboidIds] of groups) {
      const geometry = new BoxGeometry(1, 1, 1);
      const material = new BoxMaterial({
        color: Math.random() * 0xffffff,
        texture: this.texture,
        textureScale: this.textureScale,
      });
      const mesh = new InstancedMesh(geometry, material, cuboidIds.length);

      for (let i = 0; i < cuboidIds.length; i++) {
        const cuboidIndex = cuboidIds[i] * offset;
        const x1 = cuboidsArray[cuboidIndex + 1];
        const y1 = cuboidsArray[cuboidIndex + 2];
        const z1 = cuboidsArray[cuboidIndex + 3];
        const x2 = cuboidsArray[cuboidIndex + 4];
        const y2 = cuboidsArray[cuboidIndex + 5];
        const z2 = cuboidsArray[cuboidIndex + 6];
        const width = x2 - x1;
        const height = y2 - y1;
        const depth = z2 - z1;
        const centerX = x1 + width / 2;
        const centerY = y1 + height / 2;
        const centerZ = z1 + depth / 2;

        position.set(centerX, centerY, centerZ);
        scale.set(width, height, depth);

        matrix.compose(position, rotation, scale);
        mesh.setMatrixAt(i, matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingBox();
      this.meshes.set(groupId, mesh);
      scene.add(mesh);
    }
  }

  public dispose(scene: Scene): void {
    this.meshes.forEach((mesh) => {
      scene.remove(mesh);
      mesh.dispose();
    });
    this.meshes.clear();
  }
}
