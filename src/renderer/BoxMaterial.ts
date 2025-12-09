import {
  ShaderMaterial,
  Color,
  type ColorRepresentation,
  Texture,
} from "three";
import vertexShader from "./shaders/box.vert.glsl?raw";
import fragmentShader from "./shaders/box.frag.glsl?raw";

export interface BoxShaderMaterialOptions {
  color?: ColorRepresentation;
  texture?: Texture;
  textureScale?: number;
}

export class BoxMaterial extends ShaderMaterial {
  constructor(options: BoxShaderMaterialOptions = {}) {
    const { color = 0xffffff, texture, textureScale } = options;

    const triplanarSharpness = 8.0;

    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(color) },
        uTexture: { value: texture ?? null },
        uTextureScale: { value: textureScale ?? 0.005 },
        uTriplanarSharpness: { value: triplanarSharpness },
        uHasTexture: { value: texture !== undefined },
      },
    });
  }

  get time(): number {
    return this.uniforms.uTime.value;
  }

  set time(value: number) {
    this.uniforms.uTime.value = value;
  }

  get color(): Color {
    return this.uniforms.uColor.value;
  }

  set color(value: ColorRepresentation) {
    this.uniforms.uColor.value.set(value);
  }
}
