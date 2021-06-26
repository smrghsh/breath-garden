import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'
import { Scene } from 'three'
import desertGroundVertexShader from './shaders/desertGround/vertex.glsl'
import desertGroundFragmentShader from './shaders/desertGround/fragment.glsl'
// /**
//  * Base
//  */
// // Debug
const gui = new dat.GUI()

var capturer = new CCapture( { 
    format: 'webm',
    name: 'lightning'
} );
var captureFlag = false


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
{
    const near = 1;
    const far = 2;
    const color = 'lightblue';
    scene.fog = new THREE.Fog(color, near, far);
    scene.background = new THREE.Color(color);
  }
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

scene.add(new THREE.AxesHelper())
const desertGroundGeometry = new THREE.PlaneGeometry(50,50,1024,1024)


/*
Creates floor
*/

const debugObject = {
    depthColor: '#000000',
    surfaceColor: '#CEB371'
}
gui.addColor(debugObject, 'depthColor').name('depthColor').onChange(()=>{
    desertGroundMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
})
gui.addColor(debugObject, 'surfaceColor').name('surfaceColor').onChange(()=>{
    desertGroundMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
})


const desertGroundMaterial = new THREE.ShaderMaterial({
    vertexShader: desertGroundVertexShader,
    fragmentShader: desertGroundFragmentShader,
    uniforms:
    {
        uTime: {value: 0.0},
        uBigWavesSpeed: { value: 0.5 },
        uBigWavesElevation: { value: 0.12 },
        uBigWavesFrequency: { value: new THREE.Vector2(2,2)},
        uDepthColor: { value: new THREE.Color(debugObject.depthColor)},
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor)},
        uColorOffset: {value: 0.2},
        uColorMultiplier: {value: 0.25},
        uSmallWavesElevation: { value: 0.05 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallIterations: { value: 4 },
        uFogRadius: {value: 10.0},
        uFogDropoff: {value: 10.0}
    },
    transparent: true

})

const desertGround = new THREE.Mesh(desertGroundGeometry,desertGroundMaterial)
desertGround.rotation.x += Math.PI * 1.5


scene.add(desertGround)


gui.add(desertGroundMaterial.uniforms.uFogDropoff, 'value').min(0).max(100).step(1).name('uFogDropoff')


// scene.add(createLine())
// particles.rotation.x += 0.01
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
camera.position.z = 0.2
camera.position.y = 5.0
camera.position.z = 3
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

/**
 * Animate
 */
const clock = new THREE.Clock()


if (captureFlag){
    capturer.start();
}
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    // Update controls
    controls.update()



    if (elapsedTime > 2 * Math.PI && captureFlag){
        capturer.stop()
        capturer.save()
        captureFlag = false;

    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
    if(captureFlag){capturer.capture( canvas )}
}

tick()