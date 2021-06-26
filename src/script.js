import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'
import { Scene } from 'three'

// /**
//  * Base
//  */
// // Debug
// const gui = new dat.GUI()

var capturer = new CCapture( { 
    format: 'webm',
    name: 'lightning'
} );
var captureFlag = true


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
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




const lines = []

var createLine = function(){
    const points = [];
    for (let j = -100; j < 100; j+= Math.random() * 3) {
        points.push(j,Math.random(), 0);
    }

    const line = new MeshLine();
    line.setPoints(points);

    const material = new MeshLineMaterial({color: 'red',sizeAttenuation: 1, lineWidth: 0.1});
    return new THREE.Mesh(line, material);
}

for (var i = 0; i < 36; i++){
    lines.push(createLine())
    lines[i].rotation.z += ( (2 * Math.PI)/36) * (i+1)
    lines[i].rotation.y += (Math.random() * 2 - 1)/2
}



lines.forEach( (e,i) =>{
    scene.add(e)
})

var centerSphereGeometry = new THREE.SphereGeometry(4,32,32)
var centerSphereMaterial = new THREE.MeshBasicMaterial({color:'black'})
var center = new THREE.Mesh(centerSphereGeometry,centerSphereMaterial)
scene.add(center)


// scene.add(createLine())
// particles.rotation.x += 0.01
/**
 * Sizes
 */
 const sizes = {
    width: 1080,   //twitter portrait 720, insta portrait width 
    height: 1080
}
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 20
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

    camera.position.z = 20
    camera.position.x = 5 * Math.sin(elapsedTime)
    camera.position.y = 2 * Math.sin(elapsedTime)

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