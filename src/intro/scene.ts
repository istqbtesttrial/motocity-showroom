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
  renderer.setPixelRatio(clamp(window.devicePixelRatio, 1, options.mobile || options.lowPower ? 1.35 : 2))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = options.mobile ? 0.96 : 1
  renderer.setClearColor(0x020303, 0)

  const scene = new THREE.Scene()
  const fog = new THREE.FogExp2(0x040907, options.mobile ? 0.075 : 0.058)
  scene.fog = fog

  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 60)
  camera.position.set(0.22, 0.52, 9.4)

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(options.mobile ? 10 : 12, options.mobile ? 64 : 96),
    new THREE.MeshPhysicalMaterial({
      color: 0x06100b,
      roughness: 0.12,
      metalness: 0.16,
      reflectivity: 0.34,
      clearcoat: 0.36,
      clearcoatRoughness: 0.4,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.18
  scene.add(floor)

  const floorGlow = new THREE.Mesh(
    new THREE.CircleGeometry(2.8, 64),
    new THREE.MeshBasicMaterial({ color: 0xe6cd76, transparent: true, opacity: 0.01 }),
  )
  floorGlow.rotation.x = -Math.PI / 2
  floorGlow.position.set(0, -1.175, -0.2)
  scene.add(floorGlow)

  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 9),
    new THREE.MeshBasicMaterial({ color: 0x030504, transparent: true, opacity: 1 }),
  )
  background.position.set(0, 1.1, -5)
  scene.add(background)

  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 4.8),
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xe6cd76) },
        uOpacity: { value: 0.08 },
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
          float alpha = smoothstep(0.7, 0.1, d) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    }),
  )
  halo.position.set(0, 0.52, -3.7)
  scene.add(halo)

  const silhouetteMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x060807,
    roughness: 0.34,
    metalness: 0.08,
    clearcoat: 0.2,
    clearcoatRoughness: 0.8,
  })

  const scooter = new THREE.Group()
  scooter.position.set(0, -0.18, -0.5)
  scooter.rotation.y = -0.14
  scene.add(scooter)

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.76, 2.4, 8, 24), silhouetteMaterial)
  body.rotation.z = Math.PI / 2
  body.scale.set(1.46, 0.46, 0.46)
  scooter.add(body)

  const front = new THREE.Mesh(new THREE.SphereGeometry(0.76, 24, 24), silhouetteMaterial)
  front.scale.set(0.72, 1.22, 0.42)
  front.position.set(1.8, 0.34, 0)
  scooter.add(front)

  const rear = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), silhouetteMaterial)
  rear.scale.set(1.02, 0.72, 0.42)
  rear.position.set(-1.78, 0.1, 0)
  scooter.add(rear)

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.18, 0.36), silhouetteMaterial)
  seat.position.set(-0.4, 0.54, 0)
  seat.rotation.z = -0.08
  scooter.add(seat)

  const floorboard = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.08, 0.18), silhouetteMaterial)
  floorboard.position.set(0.08, -0.4, 0)
  scooter.add(floorboard)

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.24), silhouetteMaterial)
  windshield.position.set(1.18, 1, 0)
  windshield.rotation.z = 0.16
  scooter.add(windshield)

  const handlebar = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.018, 12, 48, Math.PI), silhouetteMaterial)
  handlebar.rotation.z = Math.PI
  handlebar.position.set(1.05, 1.06, 0)
  scooter.add(handlebar)

  const frontWheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.06, 16, 42),
    new THREE.MeshStandardMaterial({ color: 0x050606, metalness: 0.08, roughness: 0.72 }),
  )
  frontWheel.rotation.y = Math.PI / 2
  frontWheel.position.set(1.45, -0.9, 0)
  scooter.add(frontWheel)
  const rearWheel = frontWheel.clone()
  rearWheel.position.set(-1.5, -0.9, 0)
  scooter.add(rearWheel)

  const silhouetteShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.6, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 }),
  )
  silhouetteShadow.rotation.x = -Math.PI / 2
  silhouetteShadow.position.set(0, -1.17, -0.08)
  scene.add(silhouetteShadow)

  const ambient = new THREE.AmbientLight(0xffffff, 0.05)
  scene.add(ambient)

  const hemi = new THREE.HemisphereLight(0xefe7cb, 0x06100a, options.mobile ? 0.28 : 0.34)
  hemi.position.set(0, 4, 0)
  scene.add(hemi)

  const keyLight = new THREE.SpotLight(0xf0ddb0, options.mobile ? 4.2 : 5.2, 18, 0.34, 0.8, 1.2)
  keyLight.position.set(-2.1, 3.8, 5)
  keyLight.target = scooter
  scene.add(keyLight)
  scene.add(keyLight.target)

  const rimLight = new THREE.SpotLight(0xe2c66c, options.mobile ? 2.8 : 3.4, 16, 0.42, 0.85, 1.2)
  rimLight.position.set(2.6, 1.8, -2.5)
  rimLight.target = scooter
  scene.add(rimLight)
  scene.add(rimLight.target)

  const sweep = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, options.mobile ? 2.8 : 3.6),
    new THREE.MeshBasicMaterial({ color: 0xf1dc98, transparent: true, opacity: 0.04, blending: THREE.AdditiveBlending }),
  )
  sweep.position.set(-1.8, 0.2, 0.9)
  sweep.rotation.z = 0.12
  scene.add(sweep)

  const vignette = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 9),
    new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0.22 } },
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
          float shade = smoothstep(0.18, 0.84, length(c));
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

  const resize = () => {
    if (disposed) return
    const nextWidth = Math.max(container.clientWidth, 1)
    const nextHeight = Math.max(container.clientHeight, 1)
    camera.aspect = nextWidth / nextHeight
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(clamp(window.devicePixelRatio, 1, options.mobile || options.lowPower ? 1.35 : 2))
    renderer.setSize(nextWidth, nextHeight)
  }

  const updateProgress = (value: number) => {
    progress = clamp(value, 0, 1)
  }

  const render = () => {
    if (disposed) return

    const spaceReveal = clamp((progress - 0.12) / 0.2, 0, 1)
    const silhouetteReveal = clamp((progress - 0.36) / 0.34, 0, 1)
    const lightSweepReveal = clamp((progress - 0.56) / 0.22, 0, 1)
    const finalReveal = clamp((progress - 0.74) / 0.22, 0, 1)

    camera.position.x = THREE.MathUtils.lerp(0.22, 0.02, finalReveal) + Math.sin(progress * Math.PI) * 0.04
    camera.position.y = THREE.MathUtils.lerp(0.52, 0.66, finalReveal)
    camera.position.z = THREE.MathUtils.lerp(9.4, 7.2, progress)
    camera.lookAt(0, THREE.MathUtils.lerp(0.4, 0.24, finalReveal), -0.4)

    fog.density = THREE.MathUtils.lerp(options.mobile ? 0.085 : 0.065, options.mobile ? 0.064 : 0.05, finalReveal)

    ambient.intensity = THREE.MathUtils.lerp(0.01, 0.05, spaceReveal)
    hemi.intensity = THREE.MathUtils.lerp(0.08, options.mobile ? 0.28 : 0.36, spaceReveal)
    keyLight.intensity = THREE.MathUtils.lerp(0, options.mobile ? 4.3 : 5.5, silhouetteReveal)
    rimLight.intensity = THREE.MathUtils.lerp(0, options.mobile ? 2.8 : 3.4, lightSweepReveal)

    halo.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.02, 0.12, lightSweepReveal)
    floorGlow.material.opacity = THREE.MathUtils.lerp(0, 0.05, finalReveal)
    silhouetteShadow.material.opacity = THREE.MathUtils.lerp(0.08, 0.22, silhouetteReveal)
    silhouetteShadow.scale.setScalar(THREE.MathUtils.lerp(0.82, 1.04, silhouetteReveal))

    scooter.position.y = THREE.MathUtils.lerp(0.08, -0.18, silhouetteReveal)
    scooter.rotation.y = THREE.MathUtils.lerp(-0.24, -0.08, finalReveal)
    scooter.scale.setScalar(THREE.MathUtils.lerp(0.92, 1, silhouetteReveal))

    sweep.material.opacity = THREE.MathUtils.lerp(0, 0.08, Math.sin(lightSweepReveal * Math.PI))
    sweep.position.x = THREE.MathUtils.lerp(-1.7, 1.4, lightSweepReveal)

    vignette.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.26, 0.18, finalReveal)

    renderer.render(scene, camera)
  }

  const dispose = () => {
    disposed = true
    renderer.dispose()
    floor.geometry.dispose()
    ;(floor.material as THREE.Material).dispose()
    floorGlow.geometry.dispose()
    ;(floorGlow.material as THREE.Material).dispose()
    background.geometry.dispose()
    ;(background.material as THREE.Material).dispose()
    halo.geometry.dispose()
    halo.material.dispose()
    silhouetteMaterial.dispose()
    body.geometry.dispose()
    front.geometry.dispose()
    rear.geometry.dispose()
    seat.geometry.dispose()
    floorboard.geometry.dispose()
    windshield.geometry.dispose()
    handlebar.geometry.dispose()
    ;(frontWheel.geometry as THREE.BufferGeometry).dispose()
    ;(frontWheel.material as THREE.Material).dispose()
    silhouetteShadow.geometry.dispose()
    ;(silhouetteShadow.material as THREE.Material).dispose()
    sweep.geometry.dispose()
    ;(sweep.material as THREE.Material).dispose()
    vignette.geometry.dispose()
    vignette.material.dispose()
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
