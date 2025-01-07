import {
  AxesHelper,
  BufferGeometry,
  GridHelper,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Uint8BufferAttribute,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { shallowRef, watch } from 'vue';

export function useThreeRenderer({ debug = false } = {}) {
  const canvasRef = shallowRef<HTMLCanvasElement | null>(null);
  const pointsArray = shallowRef<ArrayLike<number> | null>(null);

  const renderer = shallowRef<WebGLRenderer>();
  const scene = shallowRef<Scene>();
  const camera = shallowRef<PerspectiveCamera>();
  const controls = shallowRef<OrbitControls>();

  const render = () => {
    if (!renderer.value || !scene.value || !camera.value) return
    renderer.value.render(scene.value, camera.value);
  }

  const animate = () => {
    requestAnimationFrame(animate);

    controls.value?.update();
    render();
  }

  const dispose = () => {
    scene.value?.traverse((object) => {
      if (object instanceof Points) {
        object.geometry.dispose();
        object.material.dispose();
        scene.value?.remove(object);
      }
    })

    renderer.value?.renderLists.dispose()
  }

  watch(canvasRef, (canvas, _, onCleanup) => {
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return

    const { width, height } = parent.getBoundingClientRect()

    const _scene = new Scene();
    const _camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
    const _controls = new OrbitControls(_camera, canvas);
    _controls.target.set(128, 128, 128);
    _controls.autoRotate = true;

    const _renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    _renderer.setSize(width, height);
    _renderer.setPixelRatio(window.devicePixelRatio);

    _camera.position.z = 512 * 0.5;
    _camera.position.y = 512 * 0.75;
    _camera.position.x = 512 * 0.75;
    _camera.lookAt(128, 128, 128);

    if (debug) {
      const axesHelper = new AxesHelper(260);
      axesHelper.setColors(0xFF0000, 0x00FF00, 0x0000FF);
      _scene.add(axesHelper);

      const size = 510;
      const divisions = 256;
      const gridHelper = new GridHelper(size, divisions);
      _scene.add(gridHelper);
    }

    renderer.value = _renderer;
    scene.value = _scene;
    camera.value = _camera;
    controls.value = _controls;

    animate();
    controls.value.addEventListener('change', render);
    onCleanup(() => {
      controls.value?.removeEventListener('change', render);
    })
  })

  watch(pointsArray, (points, _, onCleanup) => {
    if (!points) dispose();
    render()
    if (!renderer.value || !scene.value || !points || !points.length) return
    const dotGeometry = new BufferGeometry();
    dotGeometry.setAttribute('position', new Uint8BufferAttribute(points, 3));
    dotGeometry.setAttribute('color', new Uint8BufferAttribute(points, 3, true));
    dotGeometry.computeBoundingBox();

    const dotMaterial = new PointsMaterial({ size: 1, vertexColors: true });
    const dot = new Points(dotGeometry, dotMaterial);
    scene.value.add(dot);

    render()
    onCleanup(dispose)
  })

  return { canvasRef, pointsArray }
}
