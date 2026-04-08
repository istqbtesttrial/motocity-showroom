import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import scooterSvgUrl from './assets/scooter.svg?url'

export type IntroSceneController = {
  canvas: HTMLCanvasElement
  updateProgress: (value: number) => void
  resize: () => void
  render: () => void
  dispose: () => void
}

export type IntroSceneOptions = {
  mobile: boolean
  lowPower: boolean
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function buildSvgScooter(svgText: string, options: IntroSceneOptions) {
  const loader = new SVGLoader()
  const data = loader.parse(svgText)
  const wrapper = new THREE.Group()
  const group = new THREE.Group()
  wrapper.add(group)

  const fillMaterial = new THREE.MeshBasicMaterial({
    color: 0x1a1f20,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
    depthWrite: true,
  })
  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0xded8c8,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  })

  data.paths.forEach((path) => {
    const shapes = SVGLoader.createShapes(path)
    shapes.forEach((shape) => {
      shape.autoClose = true
      const points = shape.getPoints()
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      points.forEach((point) => {
        if (point.x < minX) minX = point.x
        if (point.y < minY) minY = point.y
        if (point.x > maxX) maxX = point.x
        if (point.y > maxY) maxY = point.y
      })

      const shapeWidth = maxX - minX
      const shapeHeight = maxY - minY
      const isHugeBackground = shapeWidth > 470 && shapeHeight > 470
      if (isHugeBackground) {
        return
      }

      const geometry = new THREE.ShapeGeometry(shape)

      const shadow = new THREE.Mesh(geometry, shadowMaterial)
      shadow.position.set(0.75, -0.4, -0.02)
      group.add(shadow)

      const mesh = new THREE.Mesh(geometry, fillMaterial)
      group.add(mesh)
    })
  })

  const box = new THREE.Box3().setFromObject(group)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  group.position.set(-center.x, -center.y, 0)

  const targetWidth = options.mobile ? 5.2 : 6.1
  const fitScale = targetWidth / Math.max(size.x, 1)
  wrapper.scale.set(fitScale, -fitScale, 1)
  wrapper.position.set(0, options.mobile ? -0.72 : -0.68, 0)

  return {
    group: wrapper,
    dispose: () => {
      fillMaterial.dispose()
      shadowMaterial.dispose()
      group.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose()
        }
      })
    },
  }
}

export function createIntroScene(container: HTMLElement, options: IntroSceneOptions): IntroSceneController {
  const width = Math.max(container.clientWidth, 1)
  const height = Math.max(container.clientHeight, 1)

  const renderer = new THREE.WebGLRenderer({ antialias: !options.lowPower, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(clamp(window.devicePixelRatio, 1, options.mobile || options.lowPower ? 1.3 : 1.9))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = options.mobile ? 1.08 : 1.1
  renderer.setClearColor(0x141717, 0)

  const scene = new THREE.Scene()
  const fog = new THREE.FogExp2(0x8c9492, options.mobile ? 0.018 : 0.015)
  scene.fog = fog

  const camera = new THREE.PerspectiveCamera(options.mobile ? 34 : 30, width / height, 0.1, 80)
  camera.position.set(options.mobile ? 0 : 0.35, options.mobile ? 0.32 : 0.52, options.mobile ? 11 : 11.6)

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(options.mobile ? 10 : 13, options.mobile ? 56 : 88),
    new THREE.MeshPhysicalMaterial({
      color: 0x5c6462,
      roughness: 0.14,
      metalness: 0.08,
      reflectivity: 0.44,
      clearcoat: 0.56,
      clearcoatRoughness: 0.24,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.34
  scene.add(floor)

  const floorReflection = new THREE.Mesh(
    new THREE.CircleGeometry(options.mobile ? 2.6 : 3.8, 72),
    new THREE.MeshBasicMaterial({ color: 0xf0d98b, transparent: true, opacity: 0.04 }),
  )
  floorReflection.rotation.x = -Math.PI / 2
  floorReflection.position.set(options.mobile ? 0 : -1.45, -1.335, 0.2)
  scene.add(floorReflection)

  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10),
    new THREE.MeshBasicMaterial({ color: 0xb8c0bd, transparent: true, opacity: 1 }),
  )
  backdrop.position.set(0, 1.2, -6.4)
  scene.add(backdrop)

  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(options.mobile ? 5 : 6.8, options.mobile ? 4 : 5),
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xf1dd99) },
        uOpacity: { value: 0.04 },
      },
      transparent: true,
      depthWrite: false,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
          float d = distance(vUv, vec2(0.5));
          float alpha = smoothstep(0.72, 0.08, d) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    }),
  )
  halo.position.set(options.mobile ? 0 : -1.45, 0.92, -4.3)
  scene.add(halo)

  const scooterAnchor = new THREE.Group()
  scooterAnchor.position.set(options.mobile ? 0.08 : 2.95, options.mobile ? -0.08 : 0.04, -0.85)
  scooterAnchor.rotation.y = options.mobile ? -0.03 : -0.12
  scene.add(scooterAnchor)

  const ambient = new THREE.AmbientLight(0xffffff, 0.1)
  scene.add(ambient)

  const hemi = new THREE.HemisphereLight(0xffffff, 0x7c8784, options.mobile ? 0.48 : 0.58)
  hemi.position.set(0, 4, 0)
  scene.add(hemi)

  const keyLight = new THREE.SpotLight(0xfff0c4, options.mobile ? 6 : 7.6, 24, 0.3, 0.82, 1.1)
  keyLight.position.set(-3.2, 4.1, 5.1)
  keyLight.target.position.set(options.mobile ? 0 : -1.35, 0.4, -0.6)
  scene.add(keyLight)
  scene.add(keyLight.target)

  const rimLight = new THREE.DirectionalLight(0xffffff, options.mobile ? 0.58 : 0.68)
  rimLight.position.set(-2, 2, 3)
  scene.add(rimLight)

  const scooterLight = new THREE.SpotLight(0xf3f7f4, options.mobile ? 5.8 : 6.8, 20, 0.34, 0.82, 1.1)
  scooterLight.position.set(options.mobile ? 1.4 : 4.9, 2.3, 3.4)
  scooterLight.target = scooterAnchor
  scene.add(scooterLight)
  scene.add(scooterLight.target)

  const sweep = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, options.mobile ? 2.8 : 3.8),
    new THREE.MeshBasicMaterial({ color: 0xf3e2a6, transparent: true, opacity: 0.02, blending: THREE.AdditiveBlending }),
  )
  sweep.position.set(options.mobile ? -0.6 : -2.4, 0.22, 1)
  sweep.rotation.z = 0.12
  scene.add(sweep)

  const vignette = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 9),
    new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0.18 } },
      transparent: true,
      depthWrite: false,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uOpacity;
        void main() {
          vec2 c = vUv - 0.5;
          float shade = smoothstep(0.16, 0.86, length(c));
          gl_FragColor = vec4(0.0, 0.0, 0.0, shade * uOpacity);
        }
      `,
    }),
  )
  vignette.position.set(0, 0, 1.8)
  scene.add(vignette)

  container.appendChild(renderer.domElement)

  let progress = 0
  let disposed = false
  let svgScene: ReturnType<typeof buildSvgScooter> | null = null

  fetch(scooterSvgUrl)
    .then((response) => response.text())
    .then((svgText) => {
      if (disposed) return
      svgScene = buildSvgScooter(svgText, options)
      scooterAnchor.add(svgScene.group)
    })
    .catch(() => undefined)

  const resize = () => {
    if (disposed) return
    const nextWidth = Math.max(container.clientWidth, 1)
    const nextHeight = Math.max(container.clientHeight, 1)
    camera.aspect = nextWidth / nextHeight
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(clamp(window.devicePixelRatio, 1, options.mobile || options.lowPower ? 1.3 : 1.9))
    renderer.setSize(nextWidth, nextHeight)
  }

  const updateProgress = (value: number) => {
    progress = clamp(value, 0, 1)
  }

  const render = () => {
    if (disposed) return

    const blackOpening = clamp(progress / 0.14, 0, 1)
    const roomReveal = clamp((progress - 0.14) / 0.2, 0, 1)
    const scooterReveal = clamp((progress - 0.34) / 0.24, 0, 1)
    const logoReveal = clamp((progress - 0.58) / 0.2, 0, 1)
    const holdReveal = clamp((progress - 0.78) / 0.22, 0, 1)

    if (options.mobile) {
      camera.position.x = Math.sin(progress * Math.PI) * 0.015
      camera.position.y = THREE.MathUtils.lerp(0.34, 0.5, holdReveal)
      camera.position.z = THREE.MathUtils.lerp(11, 8.4, progress)
      camera.lookAt(0, THREE.MathUtils.lerp(0.42, 0.2, holdReveal), -0.5)
    } else {
      camera.position.x = THREE.MathUtils.lerp(0.24, 0.06, holdReveal) + Math.sin(progress * Math.PI) * 0.02
      camera.position.y = THREE.MathUtils.lerp(0.52, 0.74, holdReveal)
      camera.position.z = THREE.MathUtils.lerp(11.6, 8.8, progress)
      camera.lookAt(-0.5, THREE.MathUtils.lerp(0.44, 0.22, holdReveal), -0.5)
    }

    fog.density = THREE.MathUtils.lerp(options.mobile ? 0.018 : 0.015, options.mobile ? 0.013 : 0.011, holdReveal)

    ambient.intensity = THREE.MathUtils.lerp(0.04, 0.12, roomReveal)
    hemi.intensity = THREE.MathUtils.lerp(0.18, options.mobile ? 0.46 : 0.58, roomReveal)
    keyLight.intensity = THREE.MathUtils.lerp(0.8, options.mobile ? 6.2 : 7.8, logoReveal)
    rimLight.intensity = THREE.MathUtils.lerp(0.1, options.mobile ? 0.64 : 0.74, scooterReveal)
    scooterLight.intensity = THREE.MathUtils.lerp(0.8, options.mobile ? 6 : 7, scooterReveal)

    halo.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.04, 0.16, logoReveal)
    floorReflection.material.opacity = THREE.MathUtils.lerp(0.01, 0.08, holdReveal)

    scooterAnchor.position.x = THREE.MathUtils.lerp(options.mobile ? 0.38 : 3.45, options.mobile ? 0.08 : 2.95, scooterReveal)
    scooterAnchor.position.y = THREE.MathUtils.lerp(options.mobile ? 0.18 : 0.22, options.mobile ? -0.08 : 0.04, scooterReveal)
    scooterAnchor.rotation.y = THREE.MathUtils.lerp(options.mobile ? -0.08 : -0.18, options.mobile ? -0.03 : -0.12, holdReveal)
    scooterAnchor.scale.setScalar(THREE.MathUtils.lerp(0.88, 1, scooterReveal))

    sweep.material.opacity = THREE.MathUtils.lerp(0, 0.07, Math.sin(logoReveal * Math.PI))
    sweep.position.x = THREE.MathUtils.lerp(options.mobile ? -0.6 : -2.4, options.mobile ? 0.7 : -0.4, logoReveal)

    backdrop.material.opacity = THREE.MathUtils.lerp(1, 0.92, blackOpening)
    vignette.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.2, 0.12, holdReveal)

    renderer.render(scene, camera)
  }

  const dispose = () => {
    disposed = true
    renderer.dispose()
    ;(floor.material as THREE.Material).dispose()
    floor.geometry.dispose()
    ;(floorReflection.material as THREE.Material).dispose()
    floorReflection.geometry.dispose()
    ;(backdrop.material as THREE.Material).dispose()
    backdrop.geometry.dispose()
    halo.material.dispose()
    halo.geometry.dispose()
    ;(sweep.material as THREE.Material).dispose()
    sweep.geometry.dispose()
    vignette.material.dispose()
    vignette.geometry.dispose()
    svgScene?.dispose()
    if (renderer.domElement.parentElement === container) {
      container.removeChild(renderer.domElement)
    }
  }

  return {
    canvas: renderer.domElement,
    updateProgress,
    resize,
    render,
    dispose,
  }
}
