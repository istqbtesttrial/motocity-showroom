import * as THREE from 'three'

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

export function createIntroScene(container: HTMLElement, options: IntroSceneOptions): IntroSceneController {
  const width = Math.max(container.clientWidth, 1)
  const height = Math.max(container.clientHeight, 1)
  const renderer = new THREE.WebGLRenderer({ antialias: !options.lowPower, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(clamp(window.devicePixelRatio, 1, options.mobile || options.lowPower ? 1.5 : 2))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = options.mobile ? 1 : 1.05
  renderer.setClearColor(0x020305, 0)

  const scene = new THREE.Scene()
  const fog = new THREE.FogExp2(0x04070b, options.mobile ? 0.09 : 0.065)
  scene.fog = fog

  const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50)
  camera.position.set(0, 1.18, 6.6)

  const root = new THREE.Group()
  scene.add(root)

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(options.mobile ? 8 : 10, options.mobile ? 72 : 128),
    new THREE.MeshPhysicalMaterial({
      color: 0x05080c,
      roughness: 0.2,
      metalness: 0.36,
      reflectivity: 0.52,
      transparent: true,
      opacity: 0.98,
      clearcoat: 0.6,
      clearcoatRoughness: 0.48,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.05
  root.add(floor)

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(1.9, 2.15, 0.18, options.mobile ? 40 : 72),
    new THREE.MeshPhysicalMaterial({
      color: 0x121922,
      roughness: 0.24,
      metalness: 0.68,
      clearcoat: 0.48,
      clearcoatRoughness: 0.4,
    }),
  )
  platform.position.y = -0.96
  root.add(platform)

  const backdrop = new THREE.Mesh(
    new THREE.TorusGeometry(4.3, 0.07, 24, 120, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0x1f2b38, transparent: true, opacity: options.mobile ? 0.17 : 0.22 }),
  )
  backdrop.position.set(0, 0.18, -1.9)
  backdrop.rotation.z = Math.PI
  root.add(backdrop)

  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(3.15, 0.022, 16, 120, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xa6c3ea, transparent: true, opacity: options.mobile ? 0.18 : 0.24 }),
  )
  arch.position.set(0, 0.2, -1.25)
  arch.rotation.z = Math.PI
  root.add(arch)

  const hero = new THREE.Group()
  root.add(hero)

  const silhouetteShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.35, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 }),
  )
  silhouetteShadow.rotation.x = -Math.PI / 2
  silhouetteShadow.position.set(0, -1.01, 0.08)
  root.add(silhouetteShadow)

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x121821,
    metalness: 0.74,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.09,
    reflectivity: 0.88,
    sheen: 0.34,
    sheenColor: new THREE.Color(0x56667a),
    specularIntensity: 0.5,
    specularColor: new THREE.Color(0xc8d8ee),
  })

  const canopyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0a1017,
    metalness: 0.2,
    roughness: 0.05,
    transmission: 0.3,
    transparent: true,
    opacity: 0.74,
    thickness: 1,
    ior: 1.24,
  })

  const base = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 2.15, 8, 28), bodyMaterial)
  base.rotation.z = Math.PI / 2
  base.scale.set(1.42, 0.6, 0.72)
  base.position.set(0.1, -0.08, 0.08)
  hero.add(base)

  const frontFairing = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), bodyMaterial)
  frontFairing.scale.set(0.88, 1.08, 0.72)
  frontFairing.position.set(1.55, 0.14, 0.02)
  hero.add(frontFairing)

  const rearFairing = new THREE.Mesh(new THREE.SphereGeometry(0.66, 32, 32), bodyMaterial)
  rearFairing.scale.set(0.9, 0.82, 0.7)
  rearFairing.position.set(-1.68, -0.02, 0.02)
  hero.add(rearFairing)

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.22, 0.62), bodyMaterial)
  seat.position.set(-0.22, 0.42, 0.04)
  seat.rotation.z = -0.05
  seat.scale.set(1, 1, 0.92)
  hero.add(seat)

  const spine = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 1.35, 6, 16), bodyMaterial)
  spine.rotation.z = -0.18
  spine.position.set(0.24, 0.38, 0)
  spine.scale.set(0.9, 0.84, 0.6)
  hero.add(spine)

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.18, 0.48), canopyMaterial)
  canopy.position.set(0.45, 0.66, 0.04)
  canopy.rotation.z = 0.11
  hero.add(canopy)

  const lowerBlade = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.22), bodyMaterial)
  lowerBlade.position.set(0.06, -0.3, 0)
  lowerBlade.rotation.z = -0.04
  hero.add(lowerBlade)

  const frontAccent = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.028, 0.7, 18),
    new THREE.MeshBasicMaterial({ color: 0xd8e7ff, transparent: true, opacity: 0.52 }),
  )
  frontAccent.rotation.z = Math.PI / 2
  frontAccent.position.set(1.6, 0.1, 0.4)
  hero.add(frontAccent)

  const rearAccent = frontAccent.clone()
  rearAccent.position.set(-1.68, -0.06, 0.35)
  rearAccent.scale.set(0.7, 0.7, 0.7)
  hero.add(rearAccent)

  const wheelGeometry = new THREE.TorusGeometry(0.36, 0.08, 18, 48)
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x0d1116, metalness: 0.3, roughness: 0.5 })
  const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
  frontWheel.rotation.y = Math.PI / 2
  frontWheel.position.set(1.32, -0.74, 0)
  hero.add(frontWheel)

  const rearWheel = frontWheel.clone()
  rearWheel.position.set(-1.36, -0.74, 0)
  hero.add(rearWheel)

  hero.rotation.y = -0.48
  hero.position.y = -0.15

  const ambient = new THREE.AmbientLight(0x9fb7d1, 0.38)
  scene.add(ambient)

  const hemi = new THREE.HemisphereLight(0xdfe8f3, 0x05070a, options.mobile ? 0.5 : 0.62)
  hemi.position.set(0, 4, 0)
  scene.add(hemi)

  const keyLight = new THREE.SpotLight(0xdfe9ff, options.mobile ? 16 : 22, 18, 0.36, 0.65, 1.2)
  keyLight.position.set(-2.4, 4.8, 5.2)
  keyLight.target = hero
  scene.add(keyLight)
  scene.add(keyLight.target)

  const rimLight = new THREE.PointLight(0x8db4ff, options.mobile ? 1.7 : 2.4, 10, 2)
  rimLight.position.set(2.4, 1.8, -2.8)
  scene.add(rimLight)

  const haloLight = new THREE.PointLight(0xc2d8ff, options.mobile ? 2.5 : 3.3, 12, 2)
  haloLight.position.set(0, 1.4, -2.2)
  scene.add(haloLight)

  const fillLight = new THREE.DirectionalLight(0xe7eef8, options.mobile ? 0.4 : 0.55)
  fillLight.position.set(1.8, 2.6, 3.2)
  scene.add(fillLight)

  const heroReflection = new THREE.Mesh(
    new THREE.CircleGeometry(1.85, 64),
    new THREE.MeshBasicMaterial({ color: 0x9bbcf3, transparent: true, opacity: options.mobile ? 0.05 : 0.07 }),
  )
  heroReflection.rotation.x = -Math.PI / 2
  heroReflection.position.set(0, -1.035, 0.12)
  root.add(heroReflection)

  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(0x6088c9) },
      uOpacity: { value: 0.18 },
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
        float alpha = smoothstep(0.65, 0.08, d) * uOpacity;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  })

  const glowPlane = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 4.4), glowMaterial)
  glowPlane.position.set(0, 0.8, -3)
  scene.add(glowPlane)

  const vignettePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 8),
    new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 0.26 },
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
        uniform float uOpacity;
        void main() {
          vec2 centered = vUv - 0.5;
          float shade = smoothstep(0.18, 0.82, length(centered));
          gl_FragColor = vec4(0.0, 0.0, 0.0, shade * uOpacity);
        }
      `,
    }),
  )
  vignettePlane.position.set(0, 0, 1.8)
  scene.add(vignettePlane)

  const sweepLightA = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, options.mobile ? 3.3 : 4),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending }),
  )
  sweepLightA.position.set(-1.8, 0.3, 1.2)
  sweepLightA.rotation.z = 0.1
  scene.add(sweepLightA)

  const sweepLightB = sweepLightA.clone()
  sweepLightB.position.set(2.1, 0.18, 0.9)
  sweepLightB.rotation.z = -0.08
  scene.add(sweepLightB)

  container.appendChild(renderer.domElement)

  let progress = 0
  let disposed = false

  const resize = () => {
    if (disposed) return
    const nextWidth = Math.max(container.clientWidth, 1)
    const nextHeight = Math.max(container.clientHeight, 1)
    camera.aspect = nextWidth / nextHeight
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(clamp(window.devicePixelRatio, 1, options.mobile || options.lowPower ? 1.5 : 2))
    renderer.setSize(nextWidth, nextHeight)
  }

  const updateProgress = (value: number) => {
    progress = clamp(value, 0, 1)
  }

  const render = () => {
    if (disposed) return

    const eased = 1 - Math.pow(1 - progress, 3)
    const drift = Math.sin(progress * Math.PI) * 0.08

    camera.position.x = THREE.MathUtils.lerp(0.42, 0, eased) + drift * 0.35
    camera.position.y = THREE.MathUtils.lerp(1.32, 1.08, eased)
    camera.position.z = THREE.MathUtils.lerp(7.2, 5.2, eased)
    camera.lookAt(0, THREE.MathUtils.lerp(0.1, 0.15, eased), 0)

    fog.density = THREE.MathUtils.lerp(options.mobile ? 0.12 : 0.09, options.mobile ? 0.075 : 0.058, eased)

    ambient.intensity = THREE.MathUtils.lerp(0.12, 0.4, eased)
    hemi.intensity = THREE.MathUtils.lerp(0.22, options.mobile ? 0.58 : 0.7, eased)
    keyLight.intensity = THREE.MathUtils.lerp(0, options.mobile ? 16 : 22, eased)
    rimLight.intensity = THREE.MathUtils.lerp(0.2, options.mobile ? 1.8 : 2.5, eased)
    haloLight.intensity = THREE.MathUtils.lerp(0.3, options.mobile ? 2.7 : 3.5, eased)
    fillLight.intensity = THREE.MathUtils.lerp(0.12, options.mobile ? 0.44 : 0.62, eased)

    backdrop.material.opacity = THREE.MathUtils.lerp(0.02, options.mobile ? 0.16 : 0.22, eased)
    arch.material.opacity = THREE.MathUtils.lerp(0.04, options.mobile ? 0.16 : 0.24, eased)
    glowMaterial.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.02, options.mobile ? 0.12 : 0.18, eased)
    sweepLightA.material.opacity = THREE.MathUtils.lerp(0, 0.08, Math.sin(eased * Math.PI))
    sweepLightB.material.opacity = THREE.MathUtils.lerp(0, 0.06, Math.sin((eased * Math.PI) + 0.4))
    sweepLightA.position.x = THREE.MathUtils.lerp(-2.2, -0.2, eased)
    sweepLightB.position.x = THREE.MathUtils.lerp(2.4, 0.7, eased)

    hero.position.y = THREE.MathUtils.lerp(0.25, -0.12, eased)
    hero.rotation.y = THREE.MathUtils.lerp(-0.8, -0.18, eased)
    hero.rotation.z = THREE.MathUtils.lerp(0.03, -0.01, eased)
    hero.rotation.x = THREE.MathUtils.lerp(0.04, 0, eased)
    hero.scale.setScalar(THREE.MathUtils.lerp(0.86, 1, eased))
    heroReflection.material.opacity = THREE.MathUtils.lerp(0, options.mobile ? 0.04 : 0.065, eased)
    silhouetteShadow.material.opacity = THREE.MathUtils.lerp(0.1, 0.24, eased)
    silhouetteShadow.scale.setScalar(THREE.MathUtils.lerp(0.82, 1.08, eased))
    vignettePlane.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.34, 0.18, eased)

    renderer.render(scene, camera)
  }

  const dispose = () => {
    disposed = true
    renderer.dispose()
    floor.geometry.dispose()
    ;(floor.material as THREE.Material).dispose()
    platform.geometry.dispose()
    ;(platform.material as THREE.Material).dispose()
    backdrop.geometry.dispose()
    ;(backdrop.material as THREE.Material).dispose()
    arch.geometry.dispose()
    ;(arch.material as THREE.Material).dispose()
    base.geometry.dispose()
    bodyMaterial.dispose()
    canopy.geometry.dispose()
    canopyMaterial.dispose()
    frontFairing.geometry.dispose()
    rearFairing.geometry.dispose()
    seat.geometry.dispose()
    spine.geometry.dispose()
    lowerBlade.geometry.dispose()
    silhouetteShadow.geometry.dispose()
    ;(silhouetteShadow.material as THREE.Material).dispose()
    frontAccent.geometry.dispose()
    ;(frontAccent.material as THREE.Material).dispose()
    wheelGeometry.dispose()
    wheelMaterial.dispose()
    heroReflection.geometry.dispose()
    ;(heroReflection.material as THREE.Material).dispose()
    glowPlane.geometry.dispose()
    glowMaterial.dispose()
    vignettePlane.geometry.dispose()
    vignettePlane.material.dispose()
    sweepLightA.geometry.dispose()
    ;(sweepLightA.material as THREE.Material).dispose()
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
