import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import bp3dMap from '../../data/bp3dMap.json'

/**
 * Minimal BodyParts3D OBJ viewer for Learn anatomy.
 * Meshes: public/anatomy/bp3d/FJ####.obj (CC BY 4.0 — DBCLS).
 */
export default function BodyParts3DMesh({ catalogId, highlightIds = [] }) {
  const mountRef = useRef(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const entry = useMemo(() => {
    if (catalogId && bp3dMap.byCatalogId[catalogId]) {
      return { id: catalogId, ...bp3dMap.byCatalogId[catalogId] }
    }
    // Prefer first highlighted muscle that has meshes; else pectoralis if present
    for (const id of highlightIds) {
      if (bp3dMap.byCatalogId[id]) return { id, ...bp3dMap.byCatalogId[id] }
    }
    const fallback = '101_pectoralis_major'
    if (bp3dMap.byCatalogId[fallback]) {
      return { id: fallback, ...bp3dMap.byCatalogId[fallback] }
    }
    const first = Object.entries(bp3dMap.byCatalogId)[0]
    return first ? { id: first[0], ...first[1] } : null
  }, [catalogId, highlightIds])

  useEffect(() => {
    if (!mountRef.current || !entry?.objs?.length) {
      setStatus('empty')
      return undefined
    }

    let disposed = false
    let renderer
    let frame
    let controlsCleanup

    ;(async () => {
      try {
        setStatus('loading')
        setError(null)

        if (disposed || !mountRef.current) return

        const el = mountRef.current
        const w = el.clientWidth || 360
        const h = el.clientHeight || 480

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x0b1220)

        const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 2000)
        camera.position.set(0, 80, 320)

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.setSize(w, h)
        el.replaceChildren(renderer.domElement)

        scene.add(new THREE.AmbientLight(0xffffff, 0.55))
        const key = new THREE.DirectionalLight(0xffffff, 0.9)
        key.position.set(120, 180, 100)
        scene.add(key)
        const fill = new THREE.DirectionalLight(0x88aaff, 0.35)
        fill.position.set(-140, 40, -80)
        scene.add(fill)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.target.set(0, 40, 0)
        controlsCleanup = () => controls.dispose()

        const loader = new OBJLoader()
        const group = new THREE.Group()
        scene.add(group)

        const material = new THREE.MeshStandardMaterial({
          color: 0xd4574a,
          roughness: 0.55,
          metalness: 0.05,
          side: THREE.DoubleSide,
        })

        const baseUrl = import.meta.env.BASE_URL || './'
        const meshBase = (bp3dMap.meshBase || 'anatomy/bp3d/').replace(/^\//, '')
        const prefix = `${baseUrl}${meshBase}`.replace(/\/{2,}/g, '/').replace(':/', '://')
        const loaded = await Promise.all(
          entry.objs.map(
            (obj) =>
              new Promise((resolve, reject) => {
                loader.load(
                  `${prefix}${obj}`,
                  (object) => resolve(object),
                  undefined,
                  reject,
                )
              }),
          ),
        )

        if (disposed) return

        const box = new THREE.Box3()
        for (const object of loaded) {
          object.traverse((child) => {
            if (child.isMesh) {
              child.material = material
              child.castShadow = false
            }
          })
          group.add(object)
          box.expandByObject(object)
        }

        if (!box.isEmpty()) {
          const size = box.getSize(new THREE.Vector3())
          const center = box.getCenter(new THREE.Vector3())
          group.position.sub(center)
          const maxDim = Math.max(size.x, size.y, size.z) || 1
          const fit = 180 / maxDim
          group.scale.setScalar(fit)
          controls.target.set(0, 0, 0)
          camera.position.set(0, 40, 280)
          controls.update()
        }

        const onResize = () => {
          if (!mountRef.current || !renderer) return
          const nw = mountRef.current.clientWidth || 360
          const nh = mountRef.current.clientHeight || 480
          camera.aspect = nw / nh
          camera.updateProjectionMatrix()
          renderer.setSize(nw, nh)
        }
        window.addEventListener('resize', onResize)

        const tick = () => {
          if (disposed) return
          controls.update()
          renderer.render(scene, camera)
          frame = requestAnimationFrame(tick)
        }
        tick()
        setStatus('ready')

        controlsCleanup = () => {
          window.removeEventListener('resize', onResize)
          controls.dispose()
        }
      } catch (err) {
        if (!disposed) {
          setError(err?.message || String(err))
          setStatus('error')
        }
      }
    })()

    return () => {
      disposed = true
      if (frame) cancelAnimationFrame(frame)
      controlsCleanup?.()
      if (renderer) {
        renderer.dispose()
        renderer.forceContextLoss?.()
      }
      if (mountRef.current) mountRef.current.replaceChildren()
    }
  }, [entry])

  if (!entry) {
    return (
      <div className="flex items-center justify-center min-h-[480px] text-xs opacity-60 p-6 text-center">
        Kein BodyParts3D-Mesh für diesen Muskel gemappt.
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-[480px]">
      <div ref={mountRef} className="w-full h-[480px] rounded-xl overflow-hidden" />
      <div className="absolute left-3 bottom-3 right-3 flex flex-col gap-1 pointer-events-none">
        <div className="text-[11px] font-semibold text-fit-ink/90">
          {entry.label_de || entry.label_en}
          <span className="opacity-50 font-normal"> · {entry.fma_id}</span>
        </div>
        <div className="text-[10px] opacity-55 leading-snug">
          {bp3dMap.attribution}
        </div>
        {status === 'loading' && (
          <div className="text-[10px] text-fit-accent">Lade OBJ…</div>
        )}
        {status === 'error' && (
          <div className="text-[10px] text-red-400">
            Mesh fehlend oder kaputt ({error}). Fetch:{' '}
            <code className="opacity-80">scripts/fetch_bodyparts3d_meshes.sh …/public/anatomy/bp3d</code>
          </div>
        )}
      </div>
    </div>
  )
}
