let gamepads = undefined;
let inputs = {
	UP: "z",
	DOWN: "s",
	LEFT: "q",
	RIGHT: "d",
	JUMP: "Space",
	ROTATELEFT: "a",
	ROTATERIGHT: "e",
};
const platformMeshes = [];
const platforms = [
	{
		x: 0,
		y: 0,
		z: -0.5,
		width: 25,
		height: 25,
		depth: 1,
		name: "floor_0",
		color: 0x00ff00,
	},
];

const walls = [
	{ x: 20, y: 2.5, width: 1, height: 5 },
	{ x: -20, y: 2.5, width: 1, height: 5 },
];
const lightInt = {
	spotLight: undefined,
	slHelper: undefined,
	defaultPos: { x: 0, y: 0, z: 15 },
	create: function () {
		lightInt.spotLight = new THREE.SpotLight(0xffffff, 1);
		lightInt.spotLight.position.set(
			lightInt.defaultPos.x,
			lightInt.defaultPos.y,
			lightInt.defaultPos.z
		);
		lightInt.spotLight.angle = Math.PI / 4;
		lightInt.spotLight.penumbra = 0.1;
		lightInt.spotLight.decay = 2;
		lightInt.spotLight.distance = 200;
		lightInt.spotLight.castShadow = true;
		lightInt.spotLight.shadow.mapSize.width = 512;
		lightInt.spotLight.shadow.mapSize.height = 512;
		lightInt.spotLight.shadow.camera.near = 1;
		lightInt.spotLight.shadow.camera.far = 200;
		lightInt.spotLight.shadow.focus = 1;
		lightInt.slHelper = new THREE.SpotLightHelper(lightInt.spotLight);
	},
	follow: function (mesh) {
		let x = mesh.position.clone().x;
		let y = mesh.position.clone().y;
		let z = mesh.position.clone().z;
		lightInt.spotLight.target.position.x = x + lightInt.defaultPos.x;
		lightInt.spotLight.target.position.y = y + lightInt.defaultPos.y;
		lightInt.spotLight.position.x = x + lightInt.defaultPos.x;
		lightInt.spotLight.position.y = y + lightInt.defaultPos.y;
		lightInt.spotLight.position.z = z + lightInt.defaultPos.z;
	},
};
const cameraInt = {
	camera: undefined,
	defaultPos: { x: 0, y: 0, z: 15 },
	create: function () {
		cameraInt.camera = new THREE.PerspectiveCamera(
			70,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		cameraInt.camera.position.x = cameraInt.defaultPos.x;
		cameraInt.camera.position.y = cameraInt.defaultPos.y;
		cameraInt.camera.position.z = cameraInt.defaultPos.z;
	},
	follow: function (mesh) {
		let x = mesh.position.clone().x;
		let y = mesh.position.clone().y;
		cameraInt.camera.position.x = x + cameraInt.defaultPos.x;
		cameraInt.camera.position.y = y + cameraInt.defaultPos.y;
	},
	update: function () {
		cameraInt.camera.aspect = window.innerWidth / window.innerHeight;
		cameraInt.camera.updateProjectionMatrix();
	},
};
cameraInt.create();
lightInt.create();
let positionDiv = undefined;
let isMoving = false;
let isRotating = false;
let isFalling = false;
let isJumping = false;

const jumpForce = 0.25;
const groundY = 0; // Position du sol (ajuste si besoin.Penser à ajouter la moitié de la taille du joueur pour etre raccord. il faut ajouter une gestion de collision  (simple AABB collision) pour les plateformes.)
let velocity = { x: 0.1, y: 0, z: 0 };

const gravity = { x: 0, y: 0, z: -0.01 };
const playerMoveSpeeds = { x: 0.1, y: 0.2, z: 0.1 };

const scene = new THREE.Scene();
const world = new THREE.Group();
const player = new THREE.Group();

scene.add(world);

const ambient = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambient);

scene.add(lightInt.spotLight, lightInt.slHelper, lightInt.spotLight.target);

const playerSizes = { w: 1, h: 1, d: 1 };
const playerGeometry = new THREE.BoxGeometry(
	playerSizes.w,
	playerSizes.h,
	playerSizes.d
);
const playerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
playerMesh.castShadow = true;

playerMesh.position.z = 5;
player.add(playerMesh);
scene.add(player);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Objet pour stocker l'état des touches
const keys = {};
const keyCodes = {};

function checkGravityOnPlayer() {
	const nextZ = playerMesh.position.z + velocity.z;
	let landed = false;

	for (let p of platformMeshes) {
		const pTop = p.z + p.depth / 2;
		const pBottom = p.z - p.depth / 2;
		const pLeft = p.x - p.width / 2;
		const pRight = p.x + p.width / 2;
		const pFront = p.y + p.height / 2;
		const pBack = p.y - p.height / 2;

		const playerBottom = nextZ - playerSizes.d / 2;
		const playerTop = nextZ + playerSizes.d / 2;
		const playerLeft = playerMesh.position.x - playerSizes.w / 2;
		const playerRight = playerMesh.position.x + playerSizes.w / 2;
		const playerFront = playerMesh.position.y + playerSizes.h / 2;
		const playerBack = playerMesh.position.y - playerSizes.h / 2;

		const isOverlappingXY =
			playerRight > pLeft &&
			playerLeft < pRight &&
			playerFront > pBack &&
			playerBack < pFront;

		const isLanding =
			velocity.z <= 0 &&
			playerBottom <= pTop &&
			playerTop > pTop &&
			isOverlappingXY;

		if (isLanding) {
			playerMesh.position.z = pTop + playerSizes.d / 2;
			velocity.z = 0;
			isJumping = false;
			isFalling = false;
			landed = true;
			break;
		}
	}

	if (!landed) {
		velocity.z += gravity.z;
		playerMesh.position.z += velocity.z;
		isFalling = true;
	}
}

let currentRotation = 0;
function rotateWorld(direction) {
	console.log("rotateWorld");
	const angle = Math.PI / 2; // 90 degrés
	if (direction === "left") {
		currentRotation += angle;
	} else if (direction === "right") {
		currentRotation -= angle;
	}
	// Animation douce possible ici
	world.rotation.z = currentRotation;
}

function displayDatas() {
	let target = playerMesh.position.clone();
	let texte =
		target.x.toFixed(2) +
		"," +
		target.y.toFixed(2) +
		"," +
		target.z.toFixed(2);
	positionDiv.textContent = texte;
}
function checkMooves() {
	// Déplacer le cube vert en fonction des fleches ou touches Q, S, D, Z
	if (keys.ArrowUp || keys[inputs["UP"]]) {
		playerMesh.position.y += playerMoveSpeeds.y;
		isMoving = true;
	}
	if (keys.ArrowDown || keys[inputs["DOWN"]]) {
		playerMesh.position.y -= playerMoveSpeeds.y;
		isMoving = true;
	}
	if (keys.ArrowLeft || keys[inputs["LEFT"]]) {
		playerMesh.position.x -= playerMoveSpeeds.x;
		isMoving = true;
	}
	if (keys.ArrowRight || keys[inputs["RIGHT"]]) {
		playerMesh.position.x += playerMoveSpeeds.x;
		isMoving = true;
	}
	if (keyCodes[inputs["JUMP"]] && !isJumping) {
		velocity.z = jumpForce;
		isJumping = true;
	}
	if (keys[inputs["ROTATELEFT"]]) {
		rotateWorld("left");
		isRotating = true;
	}
	if (keys[inputs["ROTATERIGHT"]]) {
		rotateWorld("right");
		isRotating = true;
	}
}
function addRandomPlateform2platformMeshes() {
	let currentAltitude = 3;
	let startAt = 0;
	for (let index = 0; index < 100; index++) {
		let maxRangeAltitude = 3;
		currentAltitude += Math.random() * maxRangeAltitude + 1;
		// console.log(currentAltitude, index);
		let randX = Math.random() * 5 - 2;
		let randY = Math.random() * 5 - 2;
		let randDepth = Math.random() * 10 - 2;
		const element = {
			x: randX,
			y: randY,
			z: 1,
			width: 2,
			height: 2,
			depth: 3,
			name: "plateforme_" + startAt,
			color: 0xffffff,
		};
		platforms.push(element);
		startAt += 1;
	}
}
function addPlateform() {
	platforms.forEach((p) => {
		const geom = new THREE.BoxGeometry(p.width, p.height, p.depth);
		const mat = new THREE.MeshPhongMaterial({ color: p.color });
		const mesh = new THREE.Mesh(geom, mat);
		mesh.receiveShadow = true;
		mesh.name = p.name || "plateforme";
		mesh.position.set(p.x, p.y, p.z);
		world.add(mesh);
		platformMeshes.push({
			mesh,
			x: p.x,
			y: p.y,
			z: p.z,
			width: p.width,
			height: p.height,
			depth: p.depth,
		});
	});
	// platformMeshes.forEach((p) =>
	// 	console.log("Plateforme:", p.mesh.name, "position:", p.mesh.position)
	// );
}
// addRandomPlateform2platformMeshes();
function handleGamepadInput() {
	if (!gamepads) return;

	const gp = gamepads[0]; // première manette
	if (!gp) return;

	const threshold = 0.2; // zone morte
	const axisX = gp.axes[0]; // gauche/droite (stick gauche)
	const axisY = gp.axes[1]; // haut/bas (stick gauche)

	if (axisX < -threshold) {
		playerMesh.position.x -= playerMoveSpeeds.x;
		isMoving = true;
	}
	if (axisX > threshold) {
		playerMesh.position.x += playerMoveSpeeds.x;
		isMoving = true;
	}
	if (axisY < -threshold) {
		playerMesh.position.y += playerMoveSpeeds.y;
		isMoving = true;
	}
	if (axisY > threshold) {
		playerMesh.position.y -= playerMoveSpeeds.y;
		isMoving = true;
	}

	// Bouton A (standard XBox : index 0) → sauter
	if (gp.buttons[0].pressed && !isJumping) {
		velocity.z = jumpForce;
		isJumping = true;
		console.log("A");
	}
	// Bouton B (standard XBox : index 1)
	if (gp.buttons[1].pressed) {
		console.log("B");
	}
	// Bouton X (standard XBox : index 2)
	if (gp.buttons[2].pressed) {
		console.log("X");
	}
	// Bouton Y (standard XBox : index 3)
	if (gp.buttons[3].pressed) {
		console.log("Y");
	}
	if (Math.abs(axisX) > threshold || Math.abs(axisY) > threshold) {
		let angle = Math.atan2(axisY, axisX);
		playerMesh.rotation.z = -angle;
	}
}

window.onload = function init() {
	positionDiv = document.getElementById("position");

	addPlateform();

	function animate() {
		requestAnimationFrame(animate);
		checkMooves();
		handleGamepadInput();

		checkGravityOnPlayer();
		if (isMoving || isFalling || isJumping) {
			lightInt.follow(playerMesh);
			cameraInt.follow(playerMesh);
			displayDatas();
			isMoving = false;
		}
		cameraInt.update();
		renderer.render(scene, cameraInt.camera);
	}

	function handleKeydown(event) {
		keys[event.key] = true;
		keyCodes[event.code] = true;
	}
	function handleKeyup(event) {
		keyCodes[event.code] = false;
		keys[event.key] = false;
	}

	window.addEventListener("keydown", handleKeydown);
	window.addEventListener("keyup", handleKeyup);

	window.addEventListener("resize", onWindowResize);

	function onWindowResize() {
		cameraInt.camera.aspect = window.innerWidth / window.innerHeight;
		cameraInt.camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	window.addEventListener("gamepadconnected", (e) => {
		console.log("Manette connectée :", e.gamepad);
		gamepads = navigator.getGamepads();
	});
	window.addEventListener("gamepaddisconnected", (e) => {
		console.log("Manette déconnectée :", e.gamepad);
		gamepads = navigator.getGamepads();
	});
	animate();
};
