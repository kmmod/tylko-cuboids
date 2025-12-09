uniform float uTime;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
    mat4 modelInstanceMatrix = modelMatrix * instanceMatrix;
    vec4 worldPosition = modelInstanceMatrix * vec4(position, 1.0);

    // Proper normal matrix: inverse transpose of upper 3x3
    mat3 normalMat = mat3(modelInstanceMatrix);
    normalMat = inverse(normalMat);
    normalMat = transpose(normalMat);

    vNormal = normalize(normalMat * normal);

    vWorldPosition = worldPosition.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
