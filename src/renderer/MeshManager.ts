import {
  BoxGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Scene,
  Vector3,
} from "three";
import { BoxIndex, type Box } from "../cuboids/types";

const matrix = new Matrix4();
const position = new Vector3();
const rotation = new Quaternion();
const scale = new Vector3();

export class MeshManager {
  private meshes: Map<number, InstancedMesh> = new Map();

  constructor() {}

  public create(scene: Scene, boxes: Box[]): void {
    const { GROUP_ID, X, Y, Z, WIDTH, DEPTH, HEIGHT } = BoxIndex;
    this.generateMeshes(boxes);

    const groupInstanceIndex = new Map<number, number>();

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      const groupId = box[GROUP_ID];

      // Get current index for this group (default 0)
      const instanceIndex = groupInstanceIndex.get(groupId) ?? 0;

      position.set(box[X], box[Y], box[Z]);
      scale.set(box[WIDTH], box[HEIGHT], box[DEPTH]);

      matrix.compose(position, rotation, scale);
      this.meshes.get(groupId)?.setMatrixAt(instanceIndex, matrix);

      groupInstanceIndex.set(groupId, instanceIndex + 1);
    }

    this.meshes.forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
    });
  }

  public dispose(scene: Scene): void {
    this.meshes.forEach((mesh) => {
      scene.remove(mesh);
      mesh.dispose();
    });
    this.meshes.clear();
  }

  private generateMeshes(boxes: Box[]): void {
    // Count boxes per group
    const groupCounts = new Map<number, number>();
    for (const box of boxes) {
      const groupId = box[BoxIndex.GROUP_ID];
      groupCounts.set(groupId, (groupCounts.get(groupId) ?? 0) + 1);
    }

    // Create instanced mesh for each group
    const geometry = new BoxGeometry(1, 1, 1);
    for (const [groupId, count] of groupCounts) {
      const material = new MeshStandardMaterial({
        color: Math.random() * 0xffffff,
      });
      this.meshes.set(groupId, new InstancedMesh(geometry, material, count));
    }
  }
}
