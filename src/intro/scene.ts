import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import scooterCleanSvgUrl from './assets/scooter-clean.svg?url'

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

function buildScooterSilhouette(svgText: string, options: IntroSceneOptions) {
  const loader = new SVGLoader()
  const data = loader.parse(svgText)
  const wrapper = new THREE.Group()
  const shadowGroup = new THREE.Group()
  const baseGroup = new THREE.Group()
  const highlightGroup = new THREE.Group()
  const wheelGlowGroup = new THREE.Group()
  wrapper.add(shadowGroup)
  wrapper.add(wheelGlowGroup)
  wrapper.add(baseGroup)
  wrapper.add(highlightGroup)

  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0xe8ddc2,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  })
  const baseMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1a201f,
    metalness: 0.18,
    roughness: 0.62,
    clearcoat: 0.18,
    clearcoatRoughness: 0.72,
    side: THREE.DoubleSide,
  })
  const highlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xaeb7b2,
    transparent: true,
    opacity: 0.17,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })
  const wheelGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xd6bb73,
    transparent: true,
    opacity: 0.05,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })

  data.paths.forEach((path) => {
    const shapes = SVGLoader.createShapes(path)
    shapes.forEach((shape) => {
      const geometry = new THREE.ShapeGeometry(shape)

      const shadow = new THREE.Mesh(geometry, shadowMaterial)
      shadow.position.set(0.1, -0.06, -0.03)
      shadowGroup.add(shadow)

      const base = new THREE.Mesh(geometry, baseMaterial)
      baseGroup.add(base)

      const highlight = new THREE.Mesh(geometry, highlightMaterial)
      highlight.scale.set(0.987, 0.987, 1)
      highlight.position.set(-0.18, 0.14, 0.02)
      highlightGroup.add(highlight)

      const wheelGlow = new THREE.Mesh(geometry, wheelGlowMaterial)
      wheelGlow.scale.set(0.978, 0.978, 1)
      wheelGlow.position.set(0.02, -0.02, -0.01)
      wheelGlowGroup.add(wheelGlow)
    })
  })

  const box = new THREE.Box3().setFromObject(baseGroup)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  ;[shadowGroup, baseGroup, highlightGroup, wheelGlowGroup].forEach((g) => {
    g.position.set(-center.x, -center.y, 0)
  })

  const targetWidth = options.mobile ? 5.1 : 5.9
  const fitScale = targetWidth / Math.max(size.x, 1)
  wrapper.scale.set(fitScale, -fitScale, 1)
  wrapper.position.set(0, options.mobile ? -0.64 : -0.62, 0)

  return {
    group: wrapper,
    dispose: () => {
      shadowMaterial.dispose()
      baseMaterial.dispose()
      highlightMaterial.dispose()
      wheelGlowMaterial.dispose()
      wrapper.traverse((child) => {
        if (child instanceof THREE.Mesh) {
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
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const fog = new THREE.FogExp2(0x050805, options.mobile ? 0.022 : 0.018)
  scene.fog = fog

  const camera = new THREE.PerspectiveCamera(options.mobile ? 34 : 30, width / height, 0.1, 80)
  camera.position.set(options.mobile ? 0 : 0.35, options.mobile ? 0.32 : 0.52, options.mobile ? 11 : 11.6)

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(options.mobile ? 10 : 13, options.mobile ? 56 : 88),
    new THREE.MeshPhysicalMaterial({
      color: 0x101711,
      roughness: 0.18,
      metalness: 0.1,
      reflectivity: 0.38,
      clearcoat: 0.48,
      clearcoatRoughness: 0.28,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.34
  scene.add(floor)

  const floorReflection = new THREE.Mesh(
    new THREE.CircleGeometry(options.mobile ? 2.8 : 4.2, 72),
    new THREE.MeshBasicMaterial({ color: 0xe3c46f, transparent: true, opacity: 0.035 }),
  )
  floorReflection.rotation.x = -Math.PI / 2
  floorReflection.position.set(options.mobile ? 0 : -1.45, -1.335, 0.2)
  scene.add(floorReflection)

  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10),
    new THREE.ShaderMaterial({
      uniforms: {
        uInner: { value: new THREE.Color(0x0f1f17) },
        uMid: { value: new THREE.Color(0x050805) },
        uOuter: { value: new THREE.Color(0x000000) },
      },
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
        uniform vec3 uInner;
        uniform vec3 uMid;
        uniform vec3 uOuter;
        void main() {
          vec2 p = vUv - 0.5;
          float d = length(vec2(p.x * 0.95, p.y * 1.15));
          vec3 color = mix(uInner, uMid, smoothstep(0.0, 0.58, d));
          color = mix(color, uOuter, smoothstep(0.52, 0.96, d));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    }),
  )
  backdrop.position.set(0, 1.2, -6.4)
  scene.add(backdrop)

  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(options.mobile ? 5.8 : 7.4, options.mobile ? 4.6 : 5.6),
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
  let scooterScene: ReturnType<typeof buildScooterSilhouette> | null = null

  fetch(scooterCleanSvgUrl)
    .then((response) => response.text())
    .then((svgText) => {
      if (disposed) return
      scooterScene = buildScooterSilhouette(svgText, options)
      scooterAnchor.add(scooterScene.group)
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

    halo.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.03, 0.18, logoReveal)
    floorReflection.material.opacity = THREE.MathUtils.lerp(0.008, 0.065, holdReveal)

    scooterAnchor.position.x = THREE.MathUtils.lerp(options.mobile ? 0.38 : 3.45, options.mobile ? 0.08 : 2.95, scooterReveal)
    scooterAnchor.position.y = THREE.MathUtils.lerp(options.mobile ? 0.18 : 0.22, options.mobile ? -0.08 : 0.04, scooterReveal)
    scooterAnchor.rotation.y = THREE.MathUtils.lerp(options.mobile ? -0.08 : -0.18, options.mobile ? -0.03 : -0.12, holdReveal)
    scooterAnchor.scale.setScalar(THREE.MathUtils.lerp(0.88, 1, scooterReveal))

    sweep.material.opacity = THREE.MathUtils.lerp(0, 0.07, Math.sin(logoReveal * Math.PI))
    sweep.position.x = THREE.MathUtils.lerp(options.mobile ? -0.6 : -2.4, options.mobile ? 0.7 : -0.4, logoReveal)

    
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
    scooterScene?.dispose()
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
