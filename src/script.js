import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'
import { Scene } from 'three'
import desertGroundVertexShader from './shaders/desertGround/vertex.glsl'
import desertGroundFragmentShader from './shaders/desertGround/fragment.glsl'
import invisisphereVertexShader from './shaders/invisisphere/vertex.glsl'
import invisisphereFragmentShader from './shaders/invisisphere/fragment.glsl'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
// /**
//  * Base
//  */
// // Debug
const gui = new dat.GUI()


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const light = new THREE.AmbientLight( 0xFFFFFF );
scene.add(light)
// Terrain Parameters
const terrainFog = 10;
// River parameters
const riverOffset = 4.0
const riverWidth = 4.0
var quantityPoints = 30000

//Terrain (two meshes)
const desertGroundGeometry = new THREE.PlaneGeometry(50,50,256,256)
const desertGroundMaterial = new THREE.ShaderMaterial({
    vertexShader: desertGroundVertexShader,
    fragmentShader: desertGroundFragmentShader,
    uniforms:
    {
        uTime: {value: 0.0},
        uBigWavesSpeed: { value: 0.5 },
        uBigWavesElevation: { value: 0.12 },
        uBigWavesFrequency: { value: new THREE.Vector2(2,2)},
        uDepthColor: { value: new THREE.Color('#000000')},
        uSurfaceColor: { value: new THREE.Color('#111111')},
        uColorOffset: {value: 0.2},
        uColorMultiplier: {value: 0.25},
        uSmallWavesElevation: { value: 0.05 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallIterations: { value: 4 },
        uFogRadius: {value: terrainFog},
        uFogDropoff: {value: 10.0},
        uRiverOffset: {value: riverOffset},
        uRiverWidth: {value: riverWidth}
    },
    side: THREE.DoubleSide,
    transparent: true,
    // wireframe: true

})
const desertOverlayMaterial = new THREE.ShaderMaterial({
    vertexShader: desertGroundVertexShader,
    fragmentShader: desertGroundFragmentShader,
    uniforms:
    {
        uTime: {value: 0.0},
        uBigWavesSpeed: { value: 0.5 },
        uBigWavesElevation: { value: 0.12 },
        uBigWavesFrequency: { value: new THREE.Vector2(2,2)},
        uDepthColor: { value: new THREE.Color('#000000')},
        uSurfaceColor: { value: new THREE.Color('grey')},
        uColorOffset: {value: 0.2},
        uColorMultiplier: {value: 0.25},
        uSmallWavesElevation: { value: 0.05 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallIterations: { value: 4 },
        uFogRadius: {value: terrainFog},
        uFogDropoff: {value: 10.0},
        uRiverOffset: {value: riverOffset},
        uRiverWidth: {value: riverWidth}
    },
    transparent: true,
    wireframe: true,
})
const desertGround = new THREE.Mesh(desertGroundGeometry,desertGroundMaterial)
desertGround.rotation.x += Math.PI * 1.5
const desertOverlay = new THREE.Mesh(desertGroundGeometry,desertOverlayMaterial)
desertOverlay.rotation.x += Math.PI * 1.5
desertOverlay.position.y += 0.1
scene.add (desertOverlay)
scene.add(desertGround)

// River
const particlesGeometry = new THREE.BufferGeometry()
const position = new Float32Array(quantityPoints*3)
position.forEach((e,i) => {position[i] = Math.random()})
const mass = new Float32Array(quantityPoints)
mass.forEach((e,i) => {mass[i] = Math.random()})
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(position ,3))
particlesGeometry.setAttribute('mass', new THREE.BufferAttribute(mass ,1))
const invisisphereMaterial = new THREE.ShaderMaterial({
    vertexShader: invisisphereVertexShader,
    fragmentShader: invisisphereFragmentShader,
    uniforms: {
        uTime: {value: 0.0},
        uInhale: {value: 0.0},
        uInhaleMax: {value: 4.0},
        uExhale: {value: 0.0},
        uExhaleMax: {value: 8.0},
        uHold: {value: 0.0},
        uHoldMax: {value: 4.0},
        uLvl: {value: 1.0}
    },
    depthWrite: false,
    transparent: true,
    alphaTest: 0.5,
})
const river = new THREE.Points(particlesGeometry, invisisphereMaterial)
river.rotation.y += Math.PI/2
river.position.y -=1;
river.position.x += riverOffset - riverWidth/2;
river.position.z += terrainFog;
river.scale.x += terrainFog*2;
river.scale.z += riverWidth;
scene.add(river)


const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.8)
scene.add(hemisphereLight)
var maxSize = .1;
var segments = 8;
var spheres = []
function brand(){
    return 2 * (Math.random() - 0.5)
}
//growth parameters
var stages = [
    {
        name: 'trunk',
        sizeDistribution:[0.9,1.3],
        minHeight: 0,
        maxHeight: 11,
        minRadius: 0,
        maxRadius: .8,
        count: 10
    },
    {
        name: 'stageA',
        sizeDistribution:[0.4,0.8],
        minHeight: 10,
        maxHeight: 15,
        minRadius: 0,
        maxRadius: 8,
        count: 400,
    },
    {
        name: 'stageB',
        sizeDistribution:[0.3,0.7],
        minHeight: 12,
        maxHeight: 20,
        minRadius: 0,
        maxRadius: 9,
        count: 600,
    },
    {
        name: 'stageC',
        sizeDistribution:[0.1,0.4],
        minHeight: 13,
        maxHeight: 20,
        minRadius: 0,
        maxRadius: 10,
        count: 1500
    }
]


function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
const initialSphereGeometry = new THREE.SphereGeometry(maxSize,segments,segments)
const woodMaterial = new THREE.MeshToonMaterial({color: 0xBF784E})
const initialSphere = new THREE.Mesh(initialSphereGeometry,woodMaterial)
spheres.push(initialSphere)

scene.add(initialSphere)
var funMaterials = []
for(var i =0; i < 1000; i++){
    funMaterials.push(new THREE.MeshToonMaterial({color: Math.random() * 0xFFFFFF}))
}

function addASphere( sizeDistribution, minHeight, maxHeight,minRadius, maxRadius){
    var y = map_range(Math.random(),0,1,minHeight,maxHeight)
    let nInitPos = new THREE.Vector3(brand()*maxRadius,y,brand()*maxRadius)
    let nScale = map_range(Math.random(),0,1,sizeDistribution[0],sizeDistribution[1])
    
    //get nearest sphere
    let nearestSphere = spheres[0]
    for(var i = 0; i < spheres.length; i++){
        if( nInitPos.distanceTo(spheres[i].position)< nInitPos.distanceTo(nearestSphere.position) ){
            nearestSphere = spheres[i]
        }
    }
    // let nPos = nInitPos.sub(nearestSphere.position).normalize().multiplyScalar(nScale + nearestSphere.scale.x)
    let nPos = nInitPos.sub(nearestSphere.position).normalize().multiplyScalar(maxSize *nScale + maxSize * nearestSphere.scale.x)
    let funMaterial = funMaterials[Math.floor(Math.random() * funMaterials.length)]
    let nSphere = new THREE.Mesh(initialSphereGeometry,funMaterial)
    // let nSphere = new THREE.Mesh(initialSphereGeometry,woodMaterial)
    nSphere.scale.set(nScale,nScale,nScale)
    let temp = new THREE.Vector3().copy(nearestSphere.position)
    temp.add(nPos)
    nSphere.position.add(temp)
    spheres.push(nSphere)
    // nSphere.lookAt(nearestSphere)
    scene.add(nSphere)
}
var growing = true
var trees = 0
var sphereCounter = 0;
var stage = 0;
while(growing){
    if(growing){
        if(stage < stages.length) {
            for( var i = 0; i < 30; i++){
                addASphere(stages[stage].sizeDistribution,stages[stage].minHeight
                    ,stages[stage].maxHeight,stages[stage].minRadius,stages[stage].maxRadius)
                sphereCounter++
            }
            if(sphereCounter > stages[stage].count){
                sphereCounter = 0
                stage++
            }
        } else {
            growing = false;
        }
        
    } else{
        for(var i = 0; i <= 30; i++){
            scene.remove(spheres.pop())
        }
    
        if(spheres.length < 10){
            growing = true
            spheres = []
            spheres.push(initialSphere)
            sphereCounter = 0
            stage = 0
            trees++
        }
    }
}





/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = -5
camera.position.y = 3.0
// camera.position.x = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.xr.enabled = true;
document.body.appendChild( VRButton.createButton( renderer ) );


/**
 * Animate
 */
const clock = new THREE.Clock()
let delta = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    // Update controls
    controls.update()

    delta += clock.getDelta();
    river.material.uniforms.uTime.value = elapsedTime;
    river.material.uniforms.uInhale.value += delta;

    var holding = river.material.uniforms.uHold.value  > 0.01 && river.material.uniforms.uHold.value < river.material.uniforms.uHoldMax.value;
    var doneHolding = river.material.uniforms.uHold.value > river.material.uniforms.uHoldMax.value;
    var inhaling = !holding && river.material.uniforms.uInhale.value < river.material.uniforms.uInhaleMax.value;
    var doneInhaling = river.material.uniforms.uInhale.value > river.material.uniforms.uInhaleMax.value;
    if(inhaling){
        river.material.uniforms.uInhale.value += delta
    }
    if(doneInhaling){
        river.material.uniforms.uExhale.value += delta
    }
    if( holding){
        river.material.uniforms.uInhale.value -= delta * 3
        river.material.uniforms.uExhale.value -= delta * 3
        river.material.uniforms.uHold.value -= delta *3
    }
    if (doneHolding){
        river.material.uniforms.uInhale.value = 0;
        river.material.uniforms.uExhale.value = 0;
        river.material.uniforms.uHold.value = 0;
    }


    // if (river.material.uniforms.uInhale.value  > river.material.uniforms.uInhaleMax.value && river.material.uniforms.uHold.value  < 0.01 ){
    //     river.material.uniforms.uExhale.value += delta
    // } else if (river.material.uniforms.uHold.value  > 0.01 && river.material.uniforms.uExhale.value > 0.01) {
    //     river.material.uniforms.uExhale.value  -= delta * 3

    // } else if (river.material.uniforms.uHold.value  > 0.01 && river.material.uniforms.uInhale.value > 0.01) {
    //     river.material.uniforms.Inhale.value  -= delta * 3
    // }

    // if (river.material.uniforms.uExhale.value > river.material.uniforms.uExhaleMax.value){
    //     river.material.uniforms.uHold += delta
    // }
    // river.material.uniforms.uExhale.value += elapsedTime;

    // river.material.uniforms.uTime.value = elapsedTime;

    // Render
    // renderer.render(scene, camera)

    // Call tick again on the next frame
    // window.requestAnimationFrame(tick)
}

tick()



renderer.setAnimationLoop( function () {
    tick()
	renderer.render( scene, camera );

} );


