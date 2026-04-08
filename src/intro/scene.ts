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
  renderer.toneMappingExposure = options.mobile ? 1.08 : 1.1
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const fog = new THREE.FogExp2(0xded7cd, options.mobile ? 0.02 : 0.016)
  scene.fog = fog

  const camera = new THREE.PerspectiveCamera(options.mobile ? 34 : 30, width / height, 0.1, 80)
  camera.position.set(options.mobile ? 0 : 0.35, options.mobile ? 0.32 : 0.52, options.mobile ? 11 : 11.6)

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(options.mobile ? 11 : 15, options.mobile ? 64 : 96),
    new THREE.MeshPhysicalMaterial({
      color: 0xd8d0c5,
      roughness: 0.18,
      metalness: 0.08,
      reflectivity: 0.36,
      clearcoat: 0.52,
      clearcoatRoughness: 0.28,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.38
  scene.add(floor)

  const floorReflection = new THREE.Mesh(
    new THREE.CircleGeometry(options.mobile ? 3.2 : 4.8, 72),
    new THREE.MeshBasicMaterial({ color: 0x6f675d, transparent: true, opacity: 0.04 }),
  )
  floorReflection.rotation.x = -Math.PI / 2
  floorReflection.position.set(options.mobile ? 0 : -1.35, -1.375, 0.45)
  scene.add(floorReflection)

  const floorTrack = new THREE.Mesh(
    new THREE.RingGeometry(options.mobile ? 2.8 : 3.8, options.mobile ? 4.6 : 6.4, 96),
    new THREE.MeshBasicMaterial({ color: 0xbcae8d, transparent: true, opacity: 0.16, side: THREE.DoubleSide }),
  )
  floorTrack.rotation.x = -Math.PI / 2
  floorTrack.position.set(0, -1.374, -0.1)
  scene.add(floorTrack)

  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10),
    new THREE.ShaderMaterial({
      uniforms: {
        uInner: { value: new THREE.Color(0xf1ece4) },
        uMid: { value: new THREE.Color(0xdbd3c8) },
        uOuter: { value: new THREE.Color(0xc8c0b5) },
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
        uColor: { value: new THREE.Color(0xe7cf7b) },
        uOpacity: { value: 0.05 },
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
  scooterAnchor.position.set(options.mobile ? 0.18 : 3.35, options.mobile ? -0.04 : -0.02, -0.72)
  scooterAnchor.rotation.y = options.mobile ? -0.02 : -0.08
  scene.add(scooterAnchor)

  const ambient = new THREE.AmbientLight(0xffffff, 0.28)
  scene.add(ambient)

  const hemi = new THREE.HemisphereLight(0xffffff, 0xb7afa4, options.mobile ? 0.62 : 0.74)
  hemi.position.set(0, 4, 0)
  scene.add(hemi)

  const keyLight = new THREE.SpotLight(0xfff8ea, options.mobile ? 7.2 : 8.8, 26, 0.28, 0.82, 1.05)
  keyLight.position.set(-3.4, 4.2, 5.4)
  keyLight.target.position.set(options.mobile ? 0 : -1.15, 0.42, -0.4)
  scene.add(keyLight)
  scene.add(keyLight.target)

  const rimLight = new THREE.DirectionalLight(0xffffff, options.mobile ? 0.9 : 1.16)
  rimLight.position.set(4.8, 2.4, 2.8)
  scene.add(rimLight)

  const scooterLight = new THREE.SpotLight(0xffffff, options.mobile ? 7.2 : 8.6, 24, 0.32, 0.82, 1.1)
  scooterLight.position.set(options.mobile ? 1.7 : 5.6, 2.5, 3.8)
  scooterLight.target = scooterAnchor
  scene.add(scooterLight)
  scene.add(scooterLight.target)

  const sweep = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, options.mobile ? 3.2 : 4.2),
    new THREE.MeshBasicMaterial({ color: 0xf3e2a6, transparent: true, opacity: 0.02, blending: THREE.AdditiveBlending }),
  )
  sweep.position.set(options.mobile ? -0.5 : -2.2, 0.24, 1)
  sweep.rotation.z = 0.1
  scene.add(sweep)

  const scooterRim = new THREE.Mesh(
    new THREE.PlaneGeometry(options.mobile ? 4.5 : 5.8, options.mobile ? 3.2 : 3.8),
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xf4eddc) },
        uOpacity: { value: 0.0 },
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
          float edge = smoothstep(0.0, 0.18, vUv.x) * (1.0 - smoothstep(0.72, 1.0, vUv.x));
          float vertical = smoothstep(0.08, 0.42, vUv.y) * (1.0 - smoothstep(0.78, 1.0, vUv.y));
          float alpha = edge * vertical * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    }),
  )
  scooterRim.position.set(options.mobile ? 0.15 : 0.35, 0.12, 0.12)
  scooterAnchor.add(scooterRim)

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

    const roomReveal = clamp(progress / 0.32, 0, 1)
    const pushReveal = clamp((progress - 0.16) / 0.42, 0, 1)
    const settleReveal = clamp((progress - 0.58) / 0.22, 0, 1)
    const holdReveal = clamp((progress - 0.78) / 0.22, 0, 1)

    if (options.mobile) {
      camera.position.x = Math.sin(progress * Math.PI) * 0.012
      camera.position.y = THREE.MathUtils.lerp(0.38, 0.48, holdReveal)
      camera.position.z = THREE.MathUtils.lerp(12.6, 8.7, pushReveal)
      camera.lookAt(0.05, THREE.MathUtils.lerp(0.28, 0.18, holdReveal), -0.4)
    } else {
      camera.position.x = THREE.MathUtils.lerp(0.32, 0.08, settleReveal)
      camera.position.y = THREE.MathUtils.lerp(0.68, 0.82, holdReveal)
      camera.position.z = THREE.MathUtils.lerp(13.2, 9.1, pushReveal)
      camera.lookAt(-0.2, THREE.MathUtils.lerp(0.3, 0.16, holdReveal), -0.42)
    }

    fog.density = THREE.MathUtils.lerp(options.mobile ? 0.024 : 0.02, options.mobile ? 0.012 : 0.01, holdReveal)

    ambient.intensity = THREE.MathUtils.lerp(0.02, 0.1, roomReveal)
    hemi.intensity = THREE.MathUtils.lerp(0.08, options.mobile ? 0.36 : 0.48, roomReveal)
    keyLight.intensity = THREE.MathUtils.lerp(0.4, options.mobile ? 5.8 : 7.2, settleReveal)
    rimLight.intensity = THREE.MathUtils.lerp(0.04, options.mobile ? 0.82 : 1.02, settleReveal)
    scooterLight.intensity = THREE.MathUtils.lerp(0.5, options.mobile ? 5.4 : 7.4, settleReveal)

    halo.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.02, 0.16, settleReveal)
    floorReflection.material.opacity = THREE.MathUtils.lerp(0.003, 0.04, holdReveal)
    scooterRim.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.0, 0.18, settleReveal)

    scooterAnchor.position.x = THREE.MathUtils.lerp(options.mobile ? 0.95 : 5.1, options.mobile ? 0.22 : 3.55, settleReveal)
    scooterAnchor.position.y = THREE.MathUtils.lerp(options.mobile ? 0.34 : 0.28, options.mobile ? -0.02 : -0.02, settleReveal)
    scooterAnchor.rotation.y = THREE.MathUtils.lerp(options.mobile ? -0.16 : -0.24, options.mobile ? -0.03 : -0.09, settleReveal)
    scooterAnchor.scale.setScalar(THREE.MathUtils.lerp(0.72, 1.0, pushReveal))

    sweep.material.opacity = THREE.MathUtils.lerp(0, 0.05, Math.sin(settleReveal * Math.PI))
    sweep.position.x = THREE.MathUtils.lerp(options.mobile ? -0.8 : -2.8, options.mobile ? 0.5 : -0.3, settleReveal)

    vignette.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.24, 0.12, holdReveal)

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
