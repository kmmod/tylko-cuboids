
// Box Fragment Shader with Triplanar Mapping
uniform float uTime;
uniform vec3 uColor;
uniform sampler2D uTexture;
uniform float uTextureScale;
uniform float uTriplanarSharpness;
uniform bool uHasTexture;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

vec4 triplanarMapping(sampler2D tex, vec3 position, vec3 normal, float scale, float sharpness) {
    vec3 blendWeights = abs(normal);

    // Threshold to eliminate minor axis contributions on flat surfaces
    float threshold = 0.15;
    blendWeights = max(blendWeights - threshold, 0.0);

    // Higher power for sharper transitions
    blendWeights = pow(blendWeights, vec3(sharpness + 2.0));

    // Safe normalize
    float sum = blendWeights.x + blendWeights.y + blendWeights.z;
    blendWeights /= max(sum, 0.0001);

    vec4 xProjection = texture2D(tex, position.yz * scale);
    vec4 yProjection = texture2D(tex, position.xz * scale);
    vec4 zProjection = texture2D(tex, position.xy * scale);

    return xProjection * blendWeights.x +
        yProjection * blendWeights.y +
        zProjection * blendWeights.z;
}

void main() {
    vec3 normal = normalize(vNormal);

    // Base color - use texture if available, otherwise just uColor
    vec3 baseColor;

    if (uHasTexture) {
        vec4 texColor = triplanarMapping(
                uTexture,
                vWorldPosition,
                normal,
                uTextureScale,
                uTriplanarSharpness
            );
        baseColor = texColor.rgb * uColor;
    } else {
        baseColor = uColor;
    }

    // Basic lighting
    vec3 lightDir = normalize(vec3(2.0, 1.0, 1.0));
    float diff = max(dot(normal, lightDir), 0.0);

    // Ambient + diffuse
    vec3 ambient = 0.5 * baseColor;
    vec3 diffuse = diff * baseColor;

    vec3 finalColor = ambient + diffuse;

    gl_FragColor = vec4(finalColor, 1.0);
}
