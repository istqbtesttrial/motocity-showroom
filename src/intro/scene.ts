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
  renderer.setPixelRatio(clamp(window.devicePixelRatio, 1, options.mobile || options.lowPower ? 1.3 : 1.9))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = options.mobile ? 0.97 : 1.02
  renderer.setClearColor(0x010202, 0)

  const scene = new THREE.Scene()
  const fog = new THREE.FogExp2(0x030705, options.mobile ? 0.064 : 0.05)
  scene.fog = fog

  const camera = new THREE.PerspectiveCamera(options.mobile ? 33 : 29, width / height, 0.1, 80)
  camera.position.set(options.mobile ? 0 : 0.45, options.mobile ? 0.3 : 0.5, options.mobile ? 11.6 : 12.2)

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(options.mobile ? 10 : 13, options.mobile ? 56 : 88),
    new THREE.MeshPhysicalMaterial({
      color: 0x06100b,
      roughness: 0.1,
      metalness: 0.14,
      reflectivity: 0.34,
      clearcoat: 0.42,
      clearcoatRoughness: 0.34,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.3
  scene.add(floor)

  const floorReflection = new THREE.Mesh(
    new THREE.CircleGeometry(options.mobile ? 2.4 : 3.6, 64),
    new THREE.MeshBasicMaterial({ color: 0xe6cb73, transparent: true, opacity: 0.004 }),
  )
  floorReflection.rotation.x = -Math.PI / 2
  floorReflection.position.set(options.mobile ? 0 : -1.6, -1.295, 0.2)
  scene.add(floorReflection)

  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10),
    new THREE.MeshBasicMaterial({ color: 0x020403, transparent: true, opacity: 1 }),
  )
  backdrop.position.set(0, 1.2, -6.2)
  scene.add(backdrop)

  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(options.mobile ? 5.2 : 7.2, options.mobile ? 4.2 : 5.4),
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xe7cd74) },
        uOpacity: { value: 0.03 },
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
  halo.position.set(options.mobile ? 0 : -1.6, 0.8, -4.2)
  scene.add(halo)

  const scooterGroup = new THREE.Group()
  scooterGroup.position.set(options.mobile ? 0 : 2.3, options.mobile ? -0.16 : -0.12, -0.85)
  scooterGroup.rotation.y = options.mobile ? -0.08 : -0.22
  scene.add(scooterGroup)

  const silhouetteMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x050706,
    roughness: 0.42,
    metalness: 0.04,
    clearcoat: 0.12,
    clearcoatRoughness: 0.9,
  })
  const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0xe4d8b4, transparent: true, opacity: 0 })

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.72, 2.15, 8, 24), silhouetteMaterial)
  body.rotation.z = Math.PI / 2
  body.scale.set(1.34, 0.48, 0.42)
  body.position.set(-0.1, 0.02, 0)
  scooterGroup.add(body)

  const frontShield = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), silhouetteMaterial)
  frontShield.scale.set(0.68, 1.3, 0.34)
  frontShield.position.set(1.72, 0.42, 0)
  scooterGroup.add(frontShield)

  const rearBody = new THREE.Mesh(new THREE.SphereGeometry(0.66, 24, 24), silhouetteMaterial)
  rearBody.scale.set(1.1, 0.68, 0.34)
  rearBody.position.set(-1.74, 0.1, 0)
  scooterGroup.add(rearBody)

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.16, 0.24), silhouetteMaterial)
  seat.position.set(-0.46, 0.6, 0)
  seat.rotation.z = -0.08
  scooterGroup.add(seat)

  const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.86, 6, 12), silhouetteMaterial)
  neck.position.set(0.86, 0.74, 0)
  neck.rotation.z = -0.24
  scooterGroup.add(neck)

  const handlebar = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.016, 10, 42, Math.PI), silhouetteMaterial)
  handlebar.rotation.z = Math.PI
  handlebar.position.set(1.12, 1.08, 0)
  scooterGroup.add(handlebar)

  const leftMirror = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), silhouetteMaterial)
  leftMirror.scale.set(1.2, 0.85, 0.4)
  leftMirror.position.set(0.7, 1.3, 0.22)
  scooterGroup.add(leftMirror)
  const rightMirror = leftMirror.clone()
  rightMirror.position.z = -0.22
  scooterGroup.add(rightMirror)

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.14), silhouetteMaterial)
  windshield.position.set(1.34, 1.02, 0)
  windshield.rotation.z = 0.16
  scooterGroup.add(windshield)

  const floorboard = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.08, 0.12), silhouetteMaterial)
  floorboard.position.set(0.06, -0.4, 0)
  floorboard.rotation.z = -0.03
  scooterGroup.add(floorboard)

  const frontWheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.05, 14, 40),
    new THREE.MeshStandardMaterial({ color: 0x050606, metalness: 0.04, roughness: 0.78 }),
  )
  frontWheel.rotation.y = Math.PI / 2
  frontWheel.position.set(1.42, -0.97, 0)
  scooterGroup.add(frontWheel)
  const rearWheel = frontWheel.clone()
  rearWheel.position.set(-1.48, -0.97, 0)
  scooterGroup.add(rearWheel)

  const upperEdge = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.012, 8, 120, Math.PI * 0.54),
    edgeMaterial,
  )
  upperEdge.rotation.set(Math.PI * 0.1, Math.PI, -0.1)
  upperEdge.position.set(0.18, 0.56, 0.12)
  scooterGroup.add(upperEdge)

  const lowerEdge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 1.9, 12),
    edgeMaterial,
  )
  lowerEdge.rotation.z = Math.PI / 2 - 0.03
  lowerEdge.position.set(0.08, -0.34, 0.08)
  scooterGroup.add(lowerEdge)

  const scooterShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.7, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 }),
  )
  scooterShadow.rotation.x = -Math.PI / 2
  scooterShadow.position.set(options.mobile ? 0 : 2.2, -1.29, -0.06)
  scene.add(scooterShadow)

  const ambient = new THREE.AmbientLight(0xffffff, 0.02)
  scene.add(ambient)

  const hemi = new THREE.HemisphereLight(0xeee3c3, 0x051009, options.mobile ? 0.18 : 0.24)
  hemi.position.set(0, 4, 0)
  scene.add(hemi)

  const keyLight = new THREE.SpotLight(0xf1e2b8, options.mobile ? 4.2 : 5.4, 24, 0.32, 0.8, 1.1)
  keyLight.position.set(-3.1, 4.2, 5.2)
  keyLight.target.position.set(options.mobile ? 0 : -1.3, 0.4, -0.6)
  scene.add(keyLight)
  scene.add(keyLight.target)

  const scooterLight = new THREE.SpotLight(0xdce5e6, options.mobile ? 4.6 : 5.8, 18, 0.34, 0.82, 1.1)
  scooterLight.position.set(options.mobile ? 1.4 : 4.8, 2.2, 3.2)
  scooterLight.target = scooterGroup
  scene.add(scooterLight)
  scene.add(scooterLight.target)

  const sweep = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, options.mobile ? 2.8 : 3.8),
    new THREE.MeshBasicMaterial({ color: 0xf3e2a6, transparent: true, opacity: 0.02, blending: THREE.AdditiveBlending }),
  )
  sweep.position.set(options.mobile ? -0.8 : -2.8, 0.22, 0.95)
  sweep.rotation.z = 0.12
  scene.add(sweep)

  const vignette = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 9),
    new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0.24 } },
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
    renderer.setPixelRatio(clamp(window.devicePixelRatio, 1, options.mobile || options.lowPower ? 1.3 : 1.9))
    renderer.setSize(nextWidth, nextHeight)
  }

  const updateProgress = (value: number) => {
    progress = clamp(value, 0, 1)
  }

  const render = () => {
    if (disposed) return

    const blackOpening = clamp(progress / 0.16, 0, 1)
    const roomReveal = clamp((progress - 0.16) / 0.22, 0, 1)
    const scooterReveal = clamp((progress - 0.38) / 0.22, 0, 1)
    const logoReveal = clamp((progress - 0.6) / 0.18, 0, 1)
    const holdReveal = clamp((progress - 0.78) / 0.22, 0, 1)

    if (options.mobile) {
      camera.position.x = Math.sin(progress * Math.PI) * 0.03
      camera.position.y = THREE.MathUtils.lerp(0.28, 0.46, holdReveal)
      camera.position.z = THREE.MathUtils.lerp(11.6, 8.8, progress)
      camera.lookAt(0, THREE.MathUtils.lerp(0.38, 0.18, holdReveal), -0.5)
    } else {
      camera.position.x = THREE.MathUtils.lerp(0.45, 0.1, holdReveal) + Math.sin(progress * Math.PI) * 0.05
      camera.position.y = THREE.MathUtils.lerp(0.5, 0.72, holdReveal)
      camera.position.z = THREE.MathUtils.lerp(12.2, 8.9, progress)
      camera.lookAt(-1.1, THREE.MathUtils.lerp(0.42, 0.2, holdReveal), -0.55)
    }

    fog.density = THREE.MathUtils.lerp(options.mobile ? 0.072 : 0.056, options.mobile ? 0.054 : 0.044, holdReveal)

    ambient.intensity = THREE.MathUtils.lerp(0, 0.03, roomReveal)
    hemi.intensity = THREE.MathUtils.lerp(0.03, options.mobile ? 0.18 : 0.24, roomReveal)
    keyLight.intensity = THREE.MathUtils.lerp(0, options.mobile ? 4.2 : 5.5, logoReveal)
    scooterLight.intensity = THREE.MathUtils.lerp(0, options.mobile ? 4.7 : 6, scooterReveal)

    halo.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.01, 0.11, logoReveal)
    floorReflection.material.opacity = THREE.MathUtils.lerp(0, 0.04, holdReveal)
    scooterShadow.material.opacity = THREE.MathUtils.lerp(0.05, 0.18, scooterReveal)
    scooterShadow.scale.setScalar(THREE.MathUtils.lerp(0.84, 1.02, scooterReveal))

    scooterGroup.position.y = THREE.MathUtils.lerp(0.08, options.mobile ? -0.1 : -0.12, scooterReveal)
    scooterGroup.rotation.y = THREE.MathUtils.lerp(options.mobile ? -0.16 : -0.3, options.mobile ? -0.05 : -0.18, holdReveal)
    scooterGroup.scale.setScalar(THREE.MathUtils.lerp(0.94, 1.02, scooterReveal))

    edgeMaterial.opacity = THREE.MathUtils.lerp(0, options.mobile ? 0.18 : 0.24, scooterReveal)
    sweep.material.opacity = THREE.MathUtils.lerp(0, 0.07, Math.sin(logoReveal * Math.PI))
    sweep.position.x = THREE.MathUtils.lerp(options.mobile ? -0.8 : -2.8, options.mobile ? 0.8 : -0.5, logoReveal)

    backdrop.material.opacity = THREE.MathUtils.lerp(1, 0.95, blackOpening)
    vignette.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.26, 0.18, holdReveal)

    renderer.render(scene, camera)
  }

  const dispose = () => {
    disposed = true
    renderer.dispose()
    floor.geometry.dispose()
    ;(floor.material as THREE.Material).dispose()
    floorReflection.geometry.dispose()
    ;(floorReflection.material as THREE.Material).dispose()
    backdrop.geometry.dispose()
    ;(backdrop.material as THREE.Material).dispose()
    halo.geometry.dispose()
    halo.material.dispose()
    silhouetteMaterial.dispose()
    edgeMaterial.dispose()
    body.geometry.dispose()
    frontShield.geometry.dispose()
    rearBody.geometry.dispose()
    seat.geometry.dispose()
    neck.geometry.dispose()
    handlebar.geometry.dispose()
    leftMirror.geometry.dispose()
    windshield.geometry.dispose()
    floorboard.geometry.dispose()
    ;(frontWheel.geometry as THREE.BufferGeometry).dispose()
    ;(frontWheel.material as THREE.Material).dispose()
    upperEdge.geometry.dispose()
    lowerEdge.geometry.dispose()
    scooterShadow.geometry.dispose()
    ;(scooterShadow.material as THREE.Material).dispose()
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
