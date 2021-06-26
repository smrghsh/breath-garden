uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying float vFog;
void main(){

    float mixStrength = vElevation * uColorMultiplier + uColorOffset;
    vec3 color = mix(uDepthColor,uSurfaceColor,mixStrength);
    
    gl_FragColor = vec4(color,vFog);
    // gl_FragColor = vec4(color,1.0);
}