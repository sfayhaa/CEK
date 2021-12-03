import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
let canvas = document.querySelector('canvas.webgl');

let scene, camera, renderer, sphereCamera;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight,45,30000);
  camera.position.set(50,50,80);

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  document.body.appendChild(renderer.domElement);

  //control
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', renderer);
  controls.target.set(0, 20, 0);
  controls.maxDistance = 150;
  //controls.enableZoom = false;

  //ground
  const loaderPlane = new THREE.TextureLoader();
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 50, 50),
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: loaderPlane.load('./assets/rumput.jfif')
      })
  );
  plane.rotation.x = -Math.PI*0.5;
  plane.position.set(0, 0, 0);
  plane.receiveShadow = true;
  scene.add(plane);

  //object gltf
  const loaderModel = new GLTFLoader();
  loaderModel.load('./assets/scene.gltf', (gltf) => {
    gltf.scene.traverse(c => {
      c.castShadow = true;
    });
    scene.add(gltf.scene);
  });

  //object
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10, 10),
    new THREE.MeshPhongMaterial({
      color: 0x000000
    })
  );
  cube.position.set(30,5,0);
  cube.castShadow = true;
  scene.add(cube);

  //light
  const pointLight = new THREE.PointLight(0xffffff);
  pointLight.position.set(-100, 200, 100);
  scene.add(pointLight);

  const ambientLight = new THREE.AmbientLight(0x000000);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight();
  directionalLight.position.set(-600, 500, 500);
  directionalLight.castShadow = true;
  directionalLight.intensity = 2;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 250;
  directionalLight.shadow.camera.far = 1000;

  const intensity = 50;

  directionalLight.shadow.camera.left = -intensity;
  directionalLight.shadow.camera.right = intensity;
  directionalLight.shadow.camera.top = intensity;
  directionalLight.shadow.camera.bottom = -intensity;
  scene.add(directionalLight);

  //Fog
  const color = 0xffffff;
  const near = 90;
  const far = 160;
  scene.fog = new THREE.Fog(color, near, far);

  //skybox
  const urls = [
    './assets/trance_ft.jpg', './assets/trance_bk.jpg',
    './assets/trance_up.jpg', './assets/trance_dn.jpg',
    './assets/trance_rt.jpg', './assets/trance_lf.jpg'
  ];
  const loader = new THREE.CubeTextureLoader();
  scene.background = loader.load(urls);

  //realistic reflection
  sphereCamera = new THREE.CubeCamera(1,1000,500);
  sphereCamera.position.set(0,300,0);
  scene.add(sphereCamera);

  const sphereMaterial = new THREE.MeshBasicMaterial({
    envMap: sphereCamera.renderTarget
  });
  const sphereGeo = new THREE.SphereGeometry(10,50,50);
  const sphere = new THREE.Mesh(sphereGeo,sphereMaterial);
  sphere.position.set(0,50,0);
  scene.add(sphere);

  render();
}

function render() {
  renderer.render(scene,camera);
  sphereCamera.updateCubeMap(renderer,scene);
  requestAnimationFrame(render);
}

init();