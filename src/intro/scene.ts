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
  renderer.toneMappingExposure = options.mobile ? 0.98 : 1.03
  renderer.setClearColor(0x010202, 0)

  const scene = new THREE.Scene()
  const fog = new THREE.FogExp2(0x030705, options.mobile ? 0.074 : 0.056)
  scene.fog = fog

  const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 80)
  camera.position.set(0.34, 0.62, 10.8)

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(options.mobile ? 11 : 13, options.mobile ? 64 : 96),
    new THREE.MeshPhysicalMaterial({
      color: 0x05100a,
      roughness: 0.1,
      metalness: 0.18,
      reflectivity: 0.38,
      clearcoat: 0.42,
      clearcoatRoughness: 0.34,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.24
  scene.add(floor)

  const floorMirror = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 72),
    new THREE.MeshBasicMaterial({ color: 0xe8cf63, transparent: true, opacity: 0.006 }),
  )
  floorMirror.rotation.x = -Math.PI / 2
  floorMirror.position.set(0, -1.235, -0.15)
  scene.add(floorMirror)

  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 10),
    new THREE.MeshBasicMaterial({ color: 0x020403, transparent: true, opacity: 1 }),
  )
  background.position.set(0, 1.15, -5.8)
  scene.add(background)

  const backHalo = new THREE.Mesh(
    new THREE.PlaneGeometry(7.6, 5.2),
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xe7cc72) },
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
  backHalo.position.set(0, 0.74, -4.1)
  scene.add(backHalo)

  const silhouetteMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x050706,
    roughness: 0.42,
    metalness: 0.06,
    clearcoat: 0.16,
    clearcoatRoughness: 0.82,
  })

  const silhouetteEdgeMaterial = new THREE.MeshBasicMaterial({ color: 0xe6cf7a, transparent: true, opacity: 0.0 })

  const scooter = new THREE.Group()
  scooter.position.set(0, -0.16, -0.72)
  scooter.rotation.y = -0.18
  scene.add(scooter)

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.8, 2.7, 8, 28), silhouetteMaterial)
  body.rotation.z = Math.PI / 2
  body.scale.set(1.5, 0.42, 0.38)
  scooter.add(body)

  const frontShield = new THREE.Mesh(new THREE.SphereGeometry(0.84, 24, 24), silhouetteMaterial)
  frontShield.scale.set(0.68, 1.38, 0.34)
  frontShield.position.set(2.02, 0.4, 0)
  scooter.add(frontShield)

  const rearBody = new THREE.Mesh(new THREE.SphereGeometry(0.76, 24, 24), silhouetteMaterial)
  rearBody.scale.set(1.18, 0.66, 0.34)
  rearBody.position.set(-1.96, 0.08, 0)
  scooter.add(rearBody)

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.16, 0.28), silhouetteMaterial)
  seat.position.set(-0.46, 0.62, 0)
  seat.rotation.z = -0.08
  scooter.add(seat)

  const floorboard = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.07, 0.12), silhouetteMaterial)
  floorboard.position.set(0.12, -0.42, 0)
  floorboard.rotation.z = -0.03
  scooter.add(floorboard)

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.16), silhouetteMaterial)
  windshield.position.set(1.28, 1.12, 0)
  windshield.rotation.z = 0.17
  scooter.add(windshield)

  const handlebar = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.014, 10, 42, Math.PI), silhouetteMaterial)
  handlebar.rotation.z = Math.PI
  handlebar.position.set(1.1, 1.12, 0)
  scooter.add(handlebar)

  const frontWheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.44, 0.05, 14, 40),
    new THREE.MeshStandardMaterial({ color: 0x040505, metalness: 0.06, roughness: 0.78 }),
  )
  frontWheel.rotation.y = Math.PI / 2
  frontWheel.position.set(1.64, -0.96, 0)
  scooter.add(frontWheel)
  const rearWheel = frontWheel.clone()
  rearWheel.position.set(-1.66, -0.96, 0)
  scooter.add(rearWheel)

  const edgeCurve = new THREE.Mesh(
    new THREE.TorusGeometry(2.3, 0.012, 8, 120, Math.PI * 0.58),
    silhouetteEdgeMaterial,
  )
  edgeCurve.rotation.set(Math.PI * 0.08, Math.PI, -0.12)
  edgeCurve.position.set(0.28, 0.54, 0.18)
  scooter.add(edgeCurve)

  const lowerEdge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 2.2, 12),
    silhouetteEdgeMaterial,
  )
  lowerEdge.rotation.z = Math.PI / 2 - 0.04
  lowerEdge.position.set(0.14, -0.34, 0.14)
  scooter.add(lowerEdge)

  const silhouetteShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.8, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }),
  )
  silhouetteShadow.rotation.x = -Math.PI / 2
  silhouetteShadow.position.set(0, -1.23, -0.16)
  scene.add(silhouetteShadow)

  const ambient = new THREE.AmbientLight(0xffffff, 0.02)
  scene.add(ambient)

  const hemi = new THREE.HemisphereLight(0xece2c2, 0x051009, options.mobile ? 0.22 : 0.28)
  hemi.position.set(0, 4, 0)
  scene.add(hemi)

  const keyLight = new THREE.SpotLight(0xf0dfb4, options.mobile ? 4.8 : 6.2, 22, 0.32, 0.78, 1.1)
  keyLight.position.set(-2.6, 4.1, 5.4)
  keyLight.target = scooter
  scene.add(keyLight)
  scene.add(keyLight.target)

  const rimLight = new THREE.SpotLight(0xe8cb74, options.mobile ? 3.2 : 4.1, 18, 0.28, 0.82, 1.1)
  rimLight.position.set(3, 1.9, -2.4)
  rimLight.target = scooter
  scene.add(rimLight)
  scene.add(rimLight.target)

  const sweep = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, options.mobile ? 3.2 : 4.1),
    new THREE.MeshBasicMaterial({ color: 0xf1dd99, transparent: true, opacity: 0.03, blending: THREE.AdditiveBlending }),
  )
  sweep.position.set(-2.2, 0.16, 0.84)
  sweep.rotation.z = 0.1
  scene.add(sweep)

  const vignette = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 9),
    new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0.26 } },
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

    const blackOpen = clamp(progress / 0.18, 0, 1)
    const environmentReveal = clamp((progress - 0.16) / 0.22, 0, 1)
    const silhouetteReveal = clamp((progress - 0.34) / 0.28, 0, 1)
    const sculptingReveal = clamp((progress - 0.54) / 0.2, 0, 1)
    const finalReveal = clamp((progress - 0.72) / 0.2, 0, 1)

    camera.position.x = THREE.MathUtils.lerp(0.34, 0.06, finalReveal) + Math.sin(progress * Math.PI) * 0.06
    camera.position.y = THREE.MathUtils.lerp(0.62, 0.76, finalReveal)
    camera.position.z = THREE.MathUtils.lerp(10.8, 7.4, progress)
    camera.lookAt(0, THREE.MathUtils.lerp(0.52, 0.24, finalReveal), -0.7)

    fog.density = THREE.MathUtils.lerp(options.mobile ? 0.082 : 0.064, options.mobile ? 0.058 : 0.046, finalReveal)

    ambient.intensity = THREE.MathUtils.lerp(0, 0.03, environmentReveal)
    hemi.intensity = THREE.MathUtils.lerp(0.04, options.mobile ? 0.24 : 0.3, environmentReveal)
    keyLight.intensity = THREE.MathUtils.lerp(0, options.mobile ? 4.8 : 6.4, silhouetteReveal)
    rimLight.intensity = THREE.MathUtils.lerp(0, options.mobile ? 3.1 : 4.2, sculptingReveal)

    backHalo.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.01, 0.12, sculptingReveal)
    floorMirror.material.opacity = THREE.MathUtils.lerp(0, 0.045, finalReveal)
    silhouetteShadow.material.opacity = THREE.MathUtils.lerp(0.06, 0.22, silhouetteReveal)
    silhouetteShadow.scale.setScalar(THREE.MathUtils.lerp(0.8, 1.06, silhouetteReveal))

    scooter.position.y = THREE.MathUtils.lerp(0.1, -0.16, silhouetteReveal)
    scooter.rotation.y = THREE.MathUtils.lerp(-0.24, -0.08, finalReveal)
    scooter.scale.setScalar(THREE.MathUtils.lerp(0.93, 1.02, silhouetteReveal))

    silhouetteEdgeMaterial.opacity = THREE.MathUtils.lerp(0, 0.24, sculptingReveal)
    sweep.material.opacity = THREE.MathUtils.lerp(0, 0.08, Math.sin(sculptingReveal * Math.PI))
    sweep.position.x = THREE.MathUtils.lerp(-2.2, 1.6, sculptingReveal)

    background.material.opacity = THREE.MathUtils.lerp(1, 0.94, blackOpen)
    vignette.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.3, 0.18, finalReveal)

    renderer.render(scene, camera)
  }

  const dispose = () => {
    disposed = true
    renderer.dispose()
    floor.geometry.dispose()
    ;(floor.material as THREE.Material).dispose()
    floorMirror.geometry.dispose()
    ;(floorMirror.material as THREE.Material).dispose()
    background.geometry.dispose()
    ;(background.material as THREE.Material).dispose()
    backHalo.geometry.dispose()
    backHalo.material.dispose()
    silhouetteMaterial.dispose()
    silhouetteEdgeMaterial.dispose()
    body.geometry.dispose()
    frontShield.geometry.dispose()
    rearBody.geometry.dispose()
    seat.geometry.dispose()
    floorboard.geometry.dispose()
    windshield.geometry.dispose()
    handlebar.geometry.dispose()
    ;(frontWheel.geometry as THREE.BufferGeometry).dispose()
    ;(frontWheel.material as THREE.Material).dispose()
    edgeCurve.geometry.dispose()
    lowerEdge.geometry.dispose()
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
