window.onload = function init() {
	let positionDiv = document.getElementById("position");
	let moving = false;
	let falling = false;

	let isJumping = false;
	const jumpForce = 0.25;
	const groundY = 0; // Position du sol (ajuste si besoin.Penser à ajouter la moitié de la taille du joueur pour etre raccord)
	let velocityY = 0;

	const gravityV3 = { x: 0, y: -0.01, z: 0 };
	const playerMoveSpeeds = { x: 0.1, y: 0.2, z: 0.1 };
	const cameraDefaultPos = { x: 0, y: 3, z: 10 };
	let inputs = {
		UP: "z",
		DOWN: "s",
		LEFT: "q",
		RIGHT: "d",
		JUMP: "Space",
	};

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.x = 0;
	camera.position.y = 3;
	camera.position.z = 10;

	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;
	renderer.setPixelRatio(window.devicePixelRatio);
	document.body.appendChild(renderer.domElement);

	// const controls = new THREE.OrbitControls(camera, renderer.domElement);

	const ambient = new THREE.AmbientLight(0xffffff, 0.1);
	scene.add(ambient);
	const spotLight = new THREE.SpotLight(0xffffff, 1);
	spotLight.position.set(0, 0, 20);
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
	const bg2 = new THREE.BoxGeometry(
		playerSizes.w,
		playerSizes.h,
		playerSizes.d
	);
	const bm2 = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
	const playerMesh = new THREE.Mesh(bg2, bm2);
	playerMesh.castShadow = true;
	playerMesh.position.x = 0;
	playerMesh.position.y = 3;
	playerMesh.position.z = 2;
	scene.add(playerMesh);

	const wallGeometry = new THREE.BoxGeometry(9, 9, 0.5);
	const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xfafafa });
	const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
	wallMesh.receiveShadow = true;
	wallMesh.position.z = -2;
	scene.add(wallMesh);

	const groundGeometry2 = new THREE.BoxGeometry(1000, 0.5, 9);
	const groundMaterial2 = new THREE.MeshPhongMaterial({ color: 0xfafafa });

	const floor_0 = new THREE.Mesh(groundGeometry2, groundMaterial2);
	floor_0.receiveShadow = true;
	floor_0.position.y = -0.25;
	scene.add(floor_0);

	function animate() {
		requestAnimationFrame(animate);
		checkMooves();
		checkGravityOnPlayer();
		cameraFollow();
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.render(scene, camera);
	}

	// Objet pour stocker l'état des touches
	const keys = {};
	const keyCodes = {};

	function checkGravityOnPlayer() {
		if (
			playerMesh.position.y > groundY + playerSizes.h / 2 ||
			velocityY > 0
		) {
			velocityY += gravityV3.y;
			playerMesh.position.y += velocityY;
			falling = true;
		} else {
			playerMesh.position.y = groundY + playerSizes.h / 2;
			velocityY = 0;
			isJumping = false;
			falling = false;
		}
	}

	function cameraFollow() {
		let x = playerMesh.position.clone().x;
		let y = playerMesh.position.clone().y;

		camera.position.x = x + cameraDefaultPos.x;
		camera.position.y = y + cameraDefaultPos.y;
		camera.position.z = y + cameraDefaultPos.z;
	}
	function LightFollow() {
		let x = playerMesh.position.clone().x;
		let y = playerMesh.position.clone().y;

		spotLight.position.x = x + spotLightDefaultPos.x;
		spotLight.position.y = y + cspotLightDefaultPos.y;
		spotLight.position.z = y + spotLightDefaultPos.z;
	}
	function checkMooves() {
		// Déplacer le cube vert en fonction des fleches ou touches Q, S, D, Z
		if (keys.ArrowUp || keys[inputs["UP"]]) {
			//playerMesh.position.y += playerMoveSpeeds.y;
			moving = true;
		}
		if (keys.ArrowDown || keys[inputs["DOWN"]]) {
			if (playerMesh.position.y - playerMoveSpeeds.y > playerSizes.h / 2) {
				playerMesh.position.y -= playerMoveSpeeds.y;
				moving = true;
			}
		}
		if (keys.ArrowLeft || keys[inputs["LEFT"]]) {
			playerMesh.position.x -= playerMoveSpeeds.x;
			moving = true;
		}
		if (keys.ArrowRight || keys[inputs["RIGHT"]]) {
			playerMesh.position.x += playerMoveSpeeds.x;
			moving = true;
		}
		if (keyCodes["Space"] && !isJumping) {
			velocityY = jumpForce;
			isJumping = true;
		}

		let target = playerMesh.position.clone();
		let texte =
			target.x.toFixed(2) +
			"," +
			target.y.toFixed(2) +
			"," +
			target.z.toFixed(2);
		positionDiv.textContent = texte;
		moving = false;
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
};
