import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls'

//custom imports
import { sendError } from './errorHandler.js'
import { sendStatus } from './handleStatus.js'

sendError('loaded', 'main.js') // send msg that main.js is loaded

class ClearingLogger {
  constructor(elem) {
    this.elem = elem
    this.lines = []
  }
  log(...args) {
    this.lines.push([...args].join(' '))
  }
  render() {
    this.elem.textContent = this.lines.join('\n')
    this.lines = []
  }
}

function main() {
  const canvas = document.querySelector('#c')
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })

  const fov = 75
  const aspect = 2 // the canvas default
  const near = 0.1
  const far = 50
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.z = 20

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('cyan')

  const geometry = new THREE.SphereGeometry()
  const material = new THREE.MeshBasicMaterial({ color: 'red' })

  const things = []

  function rand(min, max) {
    if (max === undefined) {
      max = min
      min = 0
    }

    return Math.random() * (max - min) + min
  }

  function createThing() {
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    things.push({
      mesh,
      timer: 2,
      velocity: new THREE.Vector3(rand(-5, 5), rand(-5, 5), rand(-5, 5)),
    })
  }

  canvas.addEventListener('click', createThing)

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const needResize = canvas.width !== width || canvas.height !== height
    if (needResize) {
      renderer.setSize(width, height, false)
    }

    return needResize
  }

  const logger = new ClearingLogger(document.querySelector('#debug pre'))

  let then = 0
  function render(now) {
    now *= 0.001 // convert to seconds
    const deltaTime = now - then
    then = now

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
    }

    logger.log('fps:', (1 / deltaTime).toFixed(1))
    logger.log('num things:', things.length)
    for (let i = 0; i < things.length; ) {
      const thing = things[i]
      const mesh = thing.mesh
      const pos = mesh.position
      logger.log(
        'timer:',
        thing.timer.toFixed(3),
        'pos:',
        pos.x.toFixed(3),
        pos.y.toFixed(3),
        pos.z.toFixed(3)
      )
      thing.timer -= deltaTime
      if (thing.timer <= 0) {
        // remove this thing. Note we don't advance `i`
        things.splice(i, 1)
        scene.remove(mesh)
      } else {
        mesh.position.addScaledVector(thing.velocity, deltaTime)
        ++i
      }
    }

    renderer.render(scene, camera)
    logger.render()

    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
}

main()
