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
  renderer.setPixelRatio(clamp(window.devicePixelRatio, 1, options.mobile || options.lowPower ? 1.4 : 2))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = options.mobile ? 0.98 : 1.02
  renderer.setClearColor(0x030405, 0)

  const scene = new THREE.Scene()
  const fog = new THREE.FogExp2(0x07100c, options.mobile ? 0.08 : 0.062)
  scene.fog = fog

  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 60)
  camera.position.set(0, 0.6, 8.6)

  const root = new THREE.Group()
  scene.add(root)

  const floorMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x07100c,
    roughness: 0.16,
    metalness: 0.24,
    reflectivity: 0.46,
    clearcoat: 0.46,
    clearcoatRoughness: 0.36,
  })

  const floor = new THREE.Mesh(new THREE.CircleGeometry(options.mobile ? 10 : 12, options.mobile ? 64 : 96), floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.15
  root.add(floor)

  const floorReflection = new THREE.Mesh(
    new THREE.CircleGeometry(2.9, 64),
    new THREE.MeshBasicMaterial({ color: 0xe4c86b, transparent: true, opacity: 0.02 }),
  )
  floorReflection.rotation.x = -Math.PI / 2
  floorReflection.position.set(0, -1.145, 0.15)
  root.add(floorReflection)

  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 10),
    new THREE.MeshBasicMaterial({ color: 0x050907, transparent: true, opacity: 0.94 }),
  )
  backdrop.position.set(0, 1.1, -4.6)
  scene.add(backdrop)

  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(6.2, 4.2),
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xe4c86b) },
        uOpacity: { value: 0.12 },
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
          float alpha = smoothstep(0.68, 0.08, d) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    }),
  )
  halo.position.set(0, 0.8, -3.6)
  scene.add(halo)

  const leftDoorMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x234232,
    roughness: 0.42,
    metalness: 0.46,
    clearcoat: 0.28,
    clearcoatRoughness: 0.5,
  })
  const rightDoorMaterial = leftDoorMaterial.clone()

  const doorGeometry = new THREE.BoxGeometry(2.45, 5.6, 0.12)
  const leftDoorPivot = new THREE.Group()
  leftDoorPivot.position.set(-0.08, 0.95, 0.9)
  root.add(leftDoorPivot)
  const leftDoor = new THREE.Mesh(doorGeometry, leftDoorMaterial)
  leftDoor.position.set(-1.225, 0, 0)
  leftDoorPivot.add(leftDoor)

  const rightDoorPivot = new THREE.Group()
  rightDoorPivot.position.set(0.08, 0.95, 0.9)
  root.add(rightDoorPivot)
  const rightDoor = new THREE.Mesh(doorGeometry, rightDoorMaterial)
  rightDoor.position.set(1.225, 0, 0)
  rightDoorPivot.add(rightDoor)

  const goldLineMaterial = new THREE.MeshBasicMaterial({ color: 0xe7cc72, transparent: true, opacity: 0.52 })
  const leftLine = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 5.2), goldLineMaterial)
  leftLine.position.set(-0.08, 0, 0.07)
  leftDoorPivot.add(leftLine)
  const rightLine = leftLine.clone()
  rightLine.position.set(0.08, 0, 0.07)
  rightDoorPivot.add(rightLine)

  const emblemRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.24, 0.04, 18, 120),
    new THREE.MeshBasicMaterial({ color: 0xe8cf63, transparent: true, opacity: 0.9 }),
  )
  emblemRing.position.set(0, 1.38, 1.02)
  root.add(emblemRing)

  const emblemDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.16, 64),
    new THREE.MeshBasicMaterial({ color: 0x2f513f, transparent: true, opacity: 0.94 }),
  )
  emblemDisc.position.set(0, 1.38, 1.01)
  root.add(emblemDisc)

  const scooter = new THREE.Group()
  scooter.position.set(0, -0.18, -0.36)
  scooter.rotation.y = -0.22
  root.add(scooter)

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x171c1a,
    metalness: 0.36,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    reflectivity: 0.74,
  })
  const trimMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe5ca70,
    metalness: 0.92,
    roughness: 0.2,
    clearcoat: 0.9,
    clearcoatRoughness: 0.16,
  })
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0c1412,
    metalness: 0.08,
    roughness: 0.05,
    transmission: 0.28,
    transparent: true,
    opacity: 0.76,
    thickness: 1,
    ior: 1.22,
  })

  const chassis = new THREE.Mesh(new THREE.CapsuleGeometry(0.78, 2.45, 8, 28), bodyMaterial)
  chassis.rotation.z = Math.PI / 2
  chassis.scale.set(1.52, 0.56, 0.8)
  chassis.position.set(0, -0.06, 0)
  scooter.add(chassis)

  const frontShield = new THREE.Mesh(new THREE.SphereGeometry(0.82, 32, 32), bodyMaterial)
  frontShield.scale.set(0.8, 1.24, 0.58)
  frontShield.position.set(1.82, 0.34, 0)
  scooter.add(frontShield)

  const rearBody = new THREE.Mesh(new THREE.SphereGeometry(0.74, 32, 32), bodyMaterial)
  rearBody.scale.set(1.08, 0.78, 0.62)
  rearBody.position.set(-1.78, 0.06, 0)
  scooter.add(rearBody)

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.22, 0.6), bodyMaterial)
  seat.position.set(-0.44, 0.56, 0)
  seat.rotation.z = -0.08
  scooter.add(seat)

  const floorboard = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.12, 0.26), bodyMaterial)
  floorboard.position.set(0.05, -0.42, 0)
  floorboard.rotation.z = -0.03
  scooter.add(floorboard)

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.16, 0.42), glassMaterial)
  windshield.position.set(1.22, 0.98, 0)
  windshield.rotation.z = 0.18
  scooter.add(windshield)

  const headlight = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.42, 20), trimMaterial)
  headlight.rotation.z = Math.PI / 2
  headlight.position.set(1.98, 0.4, 0.3)
  scooter.add(headlight)

  const handlebars = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.03, 12, 48, Math.PI), trimMaterial)
  handlebars.rotation.z = Math.PI
  handlebars.position.set(1.1, 0.98, 0)
  scooter.add(handlebars)

  const mirrorStemGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.42, 10)
  const mirrorGeo = new THREE.SphereGeometry(0.11, 18, 18)
  const leftMirrorStem = new THREE.Mesh(mirrorStemGeo, trimMaterial)
  leftMirrorStem.position.set(0.78, 1.16, 0.38)
  leftMirrorStem.rotation.z = -0.34
  scooter.add(leftMirrorStem)
  const leftMirror = new THREE.Mesh(mirrorGeo, trimMaterial)
  leftMirror.scale.set(1.3, 0.9, 0.35)
  leftMirror.position.set(0.62, 1.3, 0.38)
  scooter.add(leftMirror)
  const rightMirrorStem = leftMirrorStem.clone()
  rightMirrorStem.position.z = -0.38
  rightMirrorStem.rotation.z = 0.34
  scooter.add(rightMirrorStem)
  const rightMirror = leftMirror.clone()
  rightMirror.position.set(0.62, 1.3, -0.38)
  scooter.add(rightMirror)

  const frontWheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.09, 18, 48),
    new THREE.MeshStandardMaterial({ color: 0x0e1210, metalness: 0.24, roughness: 0.54 }),
  )
  frontWheel.rotation.y = Math.PI / 2
  frontWheel.position.set(1.5, -0.88, 0)
  scooter.add(frontWheel)
  const rearWheel = frontWheel.clone()
  rearWheel.position.set(-1.44, -0.88, 0)
  scooter.add(rearWheel)

  const frontFender = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.72, 4, 12), bodyMaterial)
  frontFender.rotation.z = Math.PI / 2
  frontFender.position.set(1.5, -0.5, 0)
  frontFender.scale.set(0.84, 0.26, 0.6)
  scooter.add(frontFender)

  const scooterShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.65, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.24 }),
  )
  scooterShadow.rotation.x = -Math.PI / 2
  scooterShadow.position.set(0, -1.12, 0.08)
  root.add(scooterShadow)

  const ambient = new THREE.AmbientLight(0xe4dbbf, 0.18)
  scene.add(ambient)

  const hemi = new THREE.HemisphereLight(0xf6f1de, 0x09100c, options.mobile ? 0.48 : 0.58)
  hemi.position.set(0, 4, 0)
  scene.add(hemi)

  const keyLight = new THREE.SpotLight(0xf2e6bb, options.mobile ? 11 : 14, 18, 0.42, 0.7, 1.2)
  keyLight.position.set(-1.8, 4.6, 4.6)
  keyLight.target = scooter
  scene.add(keyLight)
  scene.add(keyLight.target)

  const rimLight = new THREE.PointLight(0xe9d48c, options.mobile ? 1.1 : 1.4, 8, 2)
  rimLight.position.set(2.5, 1.8, -2.8)
  scene.add(rimLight)

  const backLight = new THREE.PointLight(0x91b3a2, options.mobile ? 0.7 : 0.92, 9, 2)
  backLight.position.set(0, 1.5, -3.2)
  scene.add(backLight)

  const doorWashA = new THREE.Mesh(
    new THREE.PlaneGeometry(0.24, 4.8),
    new THREE.MeshBasicMaterial({ color: 0xf1d776, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending }),
  )
  doorWashA.position.set(-0.5, 0.98, 1.08)
  scene.add(doorWashA)
  const doorWashB = doorWashA.clone()
  doorWashB.position.set(0.5, 0.98, 1.08)
  scene.add(doorWashB)

  const vignette = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 9),
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
          float shade = smoothstep(0.16, 0.84, length(c));
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
    renderer.setPixelRatio(clamp(window.devicePixelRatio, 1, options.mobile || options.lowPower ? 1.4 : 2))
    renderer.setSize(nextWidth, nextHeight)
  }

  const updateProgress = (value: number) => {
    progress = clamp(value, 0, 1)
  }

  const render = () => {
    if (disposed) return

    const eased = 1 - Math.pow(1 - progress, 3)
    const openProgress = clamp((progress - 0.18) / 0.54, 0, 1)
    const revealProgress = clamp((progress - 0.34) / 0.56, 0, 1)
    const logoFade = 1 - clamp((progress - 0.2) / 0.24, 0, 1)

    camera.position.x = THREE.MathUtils.lerp(0, 0.08, revealProgress)
    camera.position.y = THREE.MathUtils.lerp(0.68, 0.9, revealProgress)
    camera.position.z = THREE.MathUtils.lerp(8.6, 5.7, eased)
    camera.lookAt(0, THREE.MathUtils.lerp(0.7, 0.18, revealProgress), 0)

    fog.density = THREE.MathUtils.lerp(options.mobile ? 0.1 : 0.08, options.mobile ? 0.068 : 0.055, revealProgress)

    leftDoorPivot.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 0.62, openProgress)
    rightDoorPivot.rotation.y = THREE.MathUtils.lerp(0, -Math.PI * 0.62, openProgress)
    leftDoorPivot.position.x = THREE.MathUtils.lerp(-0.08, -0.56, openProgress)
    rightDoorPivot.position.x = THREE.MathUtils.lerp(0.08, 0.56, openProgress)

    emblemDisc.material.opacity = THREE.MathUtils.lerp(0.96, 0, logoFade)
    emblemRing.material.opacity = THREE.MathUtils.lerp(0.92, 0, logoFade)

    ambient.intensity = THREE.MathUtils.lerp(0.08, 0.24, revealProgress)
    hemi.intensity = THREE.MathUtils.lerp(0.2, options.mobile ? 0.56 : 0.66, revealProgress)
    keyLight.intensity = THREE.MathUtils.lerp(2.4, options.mobile ? 11 : 14, revealProgress)
    rimLight.intensity = THREE.MathUtils.lerp(0.3, options.mobile ? 1.1 : 1.5, revealProgress)
    backLight.intensity = THREE.MathUtils.lerp(0.1, options.mobile ? 0.8 : 1.02, revealProgress)

    doorWashA.material.opacity = THREE.MathUtils.lerp(0.03, 0.12, openProgress)
    doorWashB.material.opacity = THREE.MathUtils.lerp(0.03, 0.12, openProgress)
    doorWashA.position.x = THREE.MathUtils.lerp(-0.2, -1.3, openProgress)
    doorWashB.position.x = THREE.MathUtils.lerp(0.2, 1.3, openProgress)

    halo.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.04, 0.16, revealProgress)
    floorReflection.material.opacity = THREE.MathUtils.lerp(0, 0.08, revealProgress)
    scooterShadow.material.opacity = THREE.MathUtils.lerp(0.08, 0.26, revealProgress)
    scooterShadow.scale.setScalar(THREE.MathUtils.lerp(0.8, 1.08, revealProgress))

    scooter.position.y = THREE.MathUtils.lerp(0.15, -0.18, revealProgress)
    scooter.rotation.y = THREE.MathUtils.lerp(-0.36, -0.14, revealProgress)
    scooter.scale.setScalar(THREE.MathUtils.lerp(0.9, 1.02, revealProgress))

    vignette.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.28, 0.18, revealProgress)

    renderer.render(scene, camera)
  }

  const dispose = () => {
    disposed = true
    renderer.dispose()
    floor.geometry.dispose()
    floorMaterial.dispose()
    floorReflection.geometry.dispose()
    ;(floorReflection.material as THREE.Material).dispose()
    backdrop.geometry.dispose()
    ;(backdrop.material as THREE.Material).dispose()
    halo.geometry.dispose()
    halo.material.dispose()
    doorGeometry.dispose()
    leftDoorMaterial.dispose()
    rightDoorMaterial.dispose()
    leftLine.geometry.dispose()
    goldLineMaterial.dispose()
    emblemRing.geometry.dispose()
    ;(emblemRing.material as THREE.Material).dispose()
    emblemDisc.geometry.dispose()
    ;(emblemDisc.material as THREE.Material).dispose()
    bodyMaterial.dispose()
    trimMaterial.dispose()
    glassMaterial.dispose()
    chassis.geometry.dispose()
    frontShield.geometry.dispose()
    rearBody.geometry.dispose()
    seat.geometry.dispose()
    floorboard.geometry.dispose()
    windshield.geometry.dispose()
    headlight.geometry.dispose()
    handlebars.geometry.dispose()
    mirrorStemGeo.dispose()
    mirrorGeo.dispose()
    ;(frontWheel.geometry as THREE.BufferGeometry).dispose()
    ;(frontWheel.material as THREE.Material).dispose()
    frontFender.geometry.dispose()
    scooterShadow.geometry.dispose()
    ;(scooterShadow.material as THREE.Material).dispose()
    doorWashA.geometry.dispose()
    ;(doorWashA.material as THREE.Material).dispose()
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
