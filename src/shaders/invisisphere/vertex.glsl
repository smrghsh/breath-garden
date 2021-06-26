
attribute float mass;

uniform float uTime;
varying float vMass;
uniform sampler2D uImage;

varying vec2 vCircleSpace;
varying float vDepth;
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
    vec2(12.9898,78.233)))*
    43758.5453123);
}

float speed = 0.2;

void main() {
    // position.x += uTime;
    vMass = mass;
    vec3 modifiedPosition = position;
    modifiedPosition.x = (modifiedPosition.x - uTime * mass * speed) - (floor(modifiedPosition.x - uTime * mass * speed));
        // modifiedPosition.x = (modifiedPosition.x - uTime * mass * speed);
    // modifiedPosition.x += uTime;
    vec4 modelPosition = modelMatrix * vec4(modifiedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_PointSize = 15.0 * (1.0 - mass);
    gl_Position = projectedPosition;
    //used for sun version
    vCircleSpace = position.xy;
    // vCircleSpace = modifiedPosition.xy;
    vDepth = position.z;
}