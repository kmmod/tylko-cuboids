uniform float uTime;
uniform vec3 uColor;
uniform sampler2D uTexture;
uniform float uTextureScale;
uniform float uTriplanarSharpness;
uniform bool uHasTexture;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
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

float getEdgeFactor(vec3 localPos, float widthPixels) {
    vec3 boxHalfSize = vec3(0.5);
    vec3 distToEdge = boxHalfSize - abs(localPos);

    // Screen-space width using fwidth
    vec3 fw = fwidth(localPos) * widthPixels;

    // Smooth falloff with screen-space aware width
    vec3 edgeSmooth = smoothstep(vec3(0.0), fw, distToEdge);

    float factor = min(
            edgeSmooth.x + edgeSmooth.y,
            min(edgeSmooth.y + edgeSmooth.z, edgeSmooth.x + edgeSmooth.z)
        );

    return clamp(factor, 0.0, 1.0);
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

    // Apply edges
    float edgeFactor = getEdgeFactor(vLocalPosition, 1.2);
    finalColor = mix(vec3(0.0), finalColor, edgeFactor);

    gl_FragColor = vec4(finalColor, 1.0);
}
