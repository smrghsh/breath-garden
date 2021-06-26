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
// /**
//  * Base
//  */
// // Debug
const gui = new dat.GUI()


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


// Terrain Parameters
const terrainFog = 10;
// River parameters
const riverOffset = 4.0
const riverWidth = 4.0
var quantityPoints = 3000

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

/**
 * Animate
 */
const clock = new THREE.Clock()


const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    // Update controls
    controls.update()

    river.material.uniforms.uTime.value = elapsedTime;

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()