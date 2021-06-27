varying float vMass;
varying vec2 vCircleSpace;
varying float vDepth;
uniform float uTime;
float uColorChange; //between 0 and 1

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}


float circle(in vec2 _st, in float _radius){
    vec2 dist = _st-vec2(0.5);
	return 1.-smoothstep(_radius-(_radius*0.01),
                         _radius+(_radius*0.01),
                         dot(dist,dist)*4.0);
}

float slashA(in vec2 _st, in float _y, in float _bump){
    return step(_st.y,map(_st.x,0.0,1.0,_y,_y+_bump) );
}


// book of shaders random from fbm chapter
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
    vec2(12.9898,78.233)))*
    43758.5453123);
}


// Quilez's 2D simplex noise https://www.shadertoy.com/view/Msf3WH
// originally had issue with tiling, but Mike Bostock's sketch and the book of shaders chapter on noise helped me figure it out
// https://observablehq.com/@mbostock/domain-warping
vec2 hash( vec2 p ) // replace this by something better
{
    p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}
float noise( in vec2 p )
{
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;

    vec2  i = floor( p + (p.x+p.y)*K1 );
    vec2  a = p - i + (i.x+i.y)*K2;
    float m = step(a.y,a.x);
    vec2  o = vec2(m,1.0-m);
    vec2  b = a - o + K2;
    vec2  c = a - 1.0 + 2.0*K2;
    vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
    vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return dot( n, vec3(70.0) );
}
    #define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}


void main(){
 // vec2 st = gl_FragCoord.xy/u_resolution.xy;
    // vec2 st = vUv.xy/5.0;
    vec2 st = vCircleSpace/9.0;
    // st.xy += vDepth;
    // st.x *= u_resolution.x/u_resolution.y;
    vec3 color = vec3(0.0);
    // determines size
    vec2 p = st*3.;

    float circleRadius = 0.40;
    float circleWidth = 0.01;
    float rbDiff = 0.40;
    float circleBrightnessBump = 0.05;


    // // river flow strength
    p.x += uTime * 0.001;
    // p.x -= uTime * 0.5 * (0.9  * circle(vUv,circleRadius-circleWidth));

    // undercurrent relative velocity
    float t1 = uTime * -0.05;
    // river relative velocity
    float t2 = uTime * 0.001;
    // pollution relative velocity
    float t3 = uTime * 0.1;
    vec2 q = p + t1;
    float s = fbm(p + t3);
    float r = fbm(p + t2 + s);
    // so this is where is ressembles the canonical quilez technique
    color += fbm(q + r);
    // bump up brightness a smidgen
    color += 0.25;
    color.r +=  s + 0.08;
    // note that r here isn't red, it's river as modulated by undercurrent
    color.b += r + 0.2;
    // color.r = clamp(color.r,0.1,0.9);
    color.b = clamp(color.b,0.1,0.5);
    // pollution as opposite of undercurrent color (couldnt use q without more operations)
    color.g += s/1.5;
    // color.g = clamp(color.g,color.b,0.8);
    color.r += 1.0;
    color.g += 0.2 * slashA(st, 0.8,0.2);
    // color.b += slashA(st, 0.12,0.2) - slashA(st, 0.07,0.2);
    // color.g -= 0.2 * ( slashA(st, 0.12,0.2) - slashA(st, 0.07,0.2));
        color += circle(vCircleSpace, 0.8) - circle(vCircleSpace, 0.77) ;
    color *= circle(vCircleSpace, 0.8) * step(st.y,0.75);
    // gl_FragColor = vec4(color,vMass *  2.1 * vDepth + .05 );


    uColorChange = sin(uTime*0.5);
    vec3 color2 = vec3(0.3);
    color2 += fbm(q + r);
    // bump up brightness a smidgen
    color2 += 0.25;
    color2.r +=  s + 0.18;
    // note that r here isn't red, it's river as modulated by undercurrent
    color2.b += r + 0.5;
    // pollution as opposite of undercurrent color (couldnt use q without more operations)
    color2.g += s/2.5;
    gl_FragColor = vec4(mix(color,color2,uColorChange),vMass *  2.1 + .05 );
}