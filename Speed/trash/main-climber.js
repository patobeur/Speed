let inputs = {
	UP: "z",
	DOWN: "s",
	LEFT: "q",
	RIGHT: "d",
	JUMP: "Space",
	ROTATELEFT: "a",
	ROTATERIGHT: "e",
};
const platforms = [
	{
		x: 0,
		y: 0,
		z: 0,
		width: 50,
		height: 0.5,
		depth: 20,
		name: "floor_0",
	},
	{
		x: 6,
		y: 2,
		z: 0,
		width: 5,
		height: 1,
		depth: 1,
		name: "plateforme_1",
	},
	{
		x: 2,
		y: 5,
		z: 0,
		width: 5,
		height: 1,
		depth: 1,
		name: "plateforme_2",
	},
	{
		x: 4,
		y: 8,
		z: 0,
		width: 5,
		height: 1,
		depth: 1,
		name: "plateforme_3",
	},
];
let currentAltitude = 3;
let startAt = 4;
for (let index = 0; index < 100; index++) {
	let maxRangeAltitude = 3;
	currentAltitude += Math.random() * maxRangeAltitude + 1;
	// console.log(currentAltitude, index);
	let randX = Math.random() * 20 - 10;
	let randDepth = Math.random() * 10 - 2;
	const element = {
		x: randX,
		y: currentAltitude,
		z: 0,
		width: 5,
		height: 1,
		depth: randDepth,
		name: "plateforme_" + startAt,
	};
	platforms.push(element);
	startAt += 1;
}
const walls = [
	{ x: 20, y: 2.5, width: 1, height: 5 },
	{ x: -20, y: 2.5, width: 1, height: 5 },
];
const platformMeshes = [];

let isMoving = false;
let isRotating = false;
let isFalling = false;
let isJumping = false;

const jumpForce = 0.25;
const groundY = 0; // Position du sol (ajuste si besoin.Penser à ajouter la moitié de la taille du joueur pour etre raccord. il faut ajouter une gestion de collision  (simple AABB collision) pour les plateformes.)
let velocityY = 0;

const gravityV3 = { x: 0, y: -0.01, z: 0 };
const playerMoveSpeeds = { x: 0.1, y: 0.2, z: 0.1 };
const cameraDefaultPos = { x: 0, y: 3, z: 10 };

const scene = new THREE.Scene();
const world = new THREE.Group();

scene.add(world);

const camera = new THREE.PerspectiveCamera(
	70,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.x = 0;
camera.position.y = 3;
camera.position.z = 10;
const ambient = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambient);
const spotLight = new THREE.SpotLight(0xffffff, 1);
let spotLightDefaultPos = { x: 0, y: 0, z: 15 };
spotLight.position.set(
	spotLightDefaultPos.x,
	spotLightDefaultPos.y,
	spotLightDefaultPos.z
);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.1;
spotLight.decay = 2;
spotLight.distance = 200;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 512;
spotLight.shadow.mapSize.height = 512;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 200;
spotLight.shadow.focus = 1;
const slHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLight, slHelper, spotLight.target);

const playerSizes = { w: 1, h: 1, d: 1 };
const bg2 = new THREE.BoxGeometry(playerSizes.w, playerSizes.h, playerSizes.d);
const bm2 = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const playerMesh = new THREE.Mesh(bg2, bm2);
playerMesh.castShadow = true;
playerMesh.position.x = playerSizes.w / 2;
playerMesh.position.y = 3;
playerMesh.position.z = 0.5;
scene.add(playerMesh);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const wallGeometry = new THREE.BoxGeometry(1000, 1000, 1);
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xfafafa });
const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
wallMesh.receiveShadow = true;
wallMesh.position.z = -1;
scene.add(wallMesh);

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
	world.rotation.y = currentRotation;
}

window.onload = function init() {
	let positionDiv = document.getElementById("position");

	addPlateform();
	function animate() {
		requestAnimationFrame(animate);
		checkMooves();
		checkGravityOnPlayer();
		cameraFollow();
		LightFollow();
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.render(scene, camera);
	}

	// Objet pour stocker l'état des touches
	const keys = {};
	const keyCodes = {};

	function checkGravityOnPlayer() {
		let nextY = playerMesh.position.y + velocityY;
		let landed = false;

		for (let p of platformMeshes) {
			const pTop = p.y + p.height / 2;
			const pBottom = p.y - p.height / 2;
			const pLeft = p.x - p.width / 2;
			const pRight = p.x + p.width / 2;
			const pFront = p.z + p.depth / 2;
			const pBack = p.z - p.depth / 2;

			const playerBottom = nextY - playerSizes.h / 2;
			const playerTop = nextY + playerSizes.h / 2;
			const playerLeft = playerMesh.position.x - playerSizes.w / 2;
			const playerRight = playerMesh.position.x + playerSizes.w / 2;
			const playerFront = playerMesh.position.z + playerSizes.d / 2;
			const playerBack = playerMesh.position.z - playerSizes.d / 2;

			// Collision : si le joueur entre en contact par le haut
			const isOverlappingXZ =
				playerRight > pLeft &&
				playerLeft < pRight &&
				playerFront > pBack &&
				playerBack < pFront;

			const isLanding =
				velocityY <= 0 &&
				playerBottom <= pTop &&
				playerTop > pTop &&
				isOverlappingXZ;

			if (isLanding) {
				playerMesh.position.y = pTop + playerSizes.h / 2;
				velocityY = 0;
				isJumping = false;
				isFalling = false;
				landed = true;
				break;
			}
		}

		if (!landed) {
			velocityY += gravityV3.y;
			playerMesh.position.y += velocityY;
			isFalling = true;
		}
	}

	// function checkGravityOnPlayer() {
	// 	let nextY = playerMesh.position.y + velocityY;
	// 	let landed = false;

	// 	for (let p of platformMeshes) {
	// 		let pTop = p.y + p.height;
	// 		let pLeft = p.x - p.width / 2;
	// 		let pRight = p.x + p.width / 2;

	// 		let playerBottom = nextY - playerSizes.h / 2;
	// 		let playerLeft = playerMesh.position.x - playerSizes.w / 2;
	// 		let playerRight = playerMesh.position.x + playerSizes.w / 2;

	// 		let wasAbove = playerMesh.position.y - playerSizes.h / 2 >= pTop;
	// 		let isNowTouching =
	// 			playerBottom <= pTop &&
	// 			playerBottom >= p.y &&
	// 			playerRight > pLeft &&
	// 			playerLeft < pRight;

	// 		if (wasAbove && isNowTouching && velocityY <= 0) {
	// 			playerMesh.position.y = pTop + playerSizes.h / 2;
	// 			velocityY = 0;
	// 			isJumping = false;
	// 			isFalling = false;
	// 			landed = true;
	// 			break;
	// 		}
	// 	}

	// 	if (!landed) {
	// 		velocityY += gravityV3.y;
	// 		playerMesh.position.y += velocityY;
	// 		isFalling = true;
	// 	}
	// }

	function cameraFollow() {
		let x = playerMesh.position.clone().x;
		let y = playerMesh.position.clone().y;
		let z = playerMesh.position.clone().z;

		camera.position.x = x + cameraDefaultPos.x;
		camera.position.y = y + cameraDefaultPos.y;
		camera.position.z = y + cameraDefaultPos.z;
	}
	function LightFollow() {
		let x = playerMesh.position.clone().x;
		let y = playerMesh.position.clone().y;
		let z = playerMesh.position.clone().z;

		spotLight.target.position.x = x + cameraDefaultPos.x;
		spotLight.target.position.y = y + cameraDefaultPos.y;

		spotLight.position.x = x + spotLightDefaultPos.x;
		spotLight.position.y = y + spotLightDefaultPos.y;
		spotLight.position.z = z + spotLightDefaultPos.z;
	}
	function checkMooves() {
		// Déplacer le cube vert en fonction des fleches ou touches Q, S, D, Z
		if (keys.ArrowUp || keys[inputs["UP"]]) {
			//playerMesh.position.y += playerMoveSpeeds.y;
			isMoving = true;
		}
		if (keys.ArrowDown || keys[inputs["DOWN"]]) {
			if (playerMesh.position.y - playerMoveSpeeds.y > playerSizes.h / 2) {
				playerMesh.position.y -= playerMoveSpeeds.y;
				isMoving = true;
			}
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
			velocityY = jumpForce;
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

		let target = playerMesh.position.clone();
		let texte =
			target.x.toFixed(2) +
			"," +
			target.y.toFixed(2) +
			"," +
			target.z.toFixed(2);
		positionDiv.textContent = texte;
		isMoving = false;
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

	animate();

	window.addEventListener("resize", onWindowResize);

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	function addPlateform() {
		platforms.forEach((p) => {
			const geom = new THREE.BoxGeometry(p.width, p.height, p.depth);
			const mat = new THREE.MeshPhongMaterial({ color: 0x10ff20 });
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
};
