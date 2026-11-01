import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Grass } from './Grass';

const scene = new THREE.Scene();
scene.background = new THREE.Color('rgb(135, 206, 235)');

const camera = new THREE.PerspectiveCamera(45.0, window.innerWidth / window.innerHeight, 0.1, 10000.0);
camera.position.z = 4;
camera.position.y = 1;

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.debug.checkShaderErrors = true;

const controls = new OrbitControls(camera, renderer.domElement);
const timer = new THREE.Timer();

function generateHeight(width: number, height: number) {

	let seed = Math.PI / 4;
	window.Math.random = function () {

		const x = Math.sin(seed++) * 10000;
		return x - Math.floor(x);

	};

	const size = width * height, data = new Uint8Array(size);
	const perlin = new ImprovedNoise(), z = Math.random() * 100;

	let quality = 1;

	for (let j = 0; j < 4; j++) {

		for (let i = 0; i < size; i++) {

			const x = i % width, y = ~ ~(i / width);
			data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);

		}

		quality *= 5;

	}

	return data;

}


const factor = 0.0
const width = 256 * factor;
const height = 256 * factor;

const data = generateHeight(width, height)

const geometry = new THREE.PlaneGeometry(7500 * factor, 7500 * factor, width - 1, height - 1);
geometry.rotateX(- Math.PI / 2);
const terrainMat = new THREE.MeshStandardMaterial({ color: 0xff0000, flatShading: true });

const vertices = geometry.attributes.position.array;
for (let i = 0, j = 0; i < vertices.length; i++, j += 3) {

	vertices[j + 1] = data[i] * 10;

}

const terrainMesh = new THREE.Mesh(geometry, terrainMat);
scene.add(terrainMesh);


const size = 10;
const divisions = 10;
const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

const geom = new THREE.BoxGeometry(10, 1, 10);
const m = new THREE.MeshBasicMaterial();
const mesh = new THREE.Mesh(geom, m);

const grass = new Grass(mesh);
grass.generateGrass(scene);



function animate() {
	requestAnimationFrame(animate);

	timer.update();
	controls.update(timer.getDelta());
	grass.update(timer.getElapsed());
	renderer.render(scene, camera);
}

animate();