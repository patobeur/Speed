let gamepads = false;
let playerCount = 0;
let positionDiv = undefined;
let playerModalDiv = undefined;
let lastTime = 0;

let nbPlayer = 1;

const groundY = 0;
const gravity = { x: 0, y: 0, z: -0.01 };

const playerInt = {
	player_0: {
		group: new THREE.Group(),
		mesh: undefined,
		datas: archetype.byname.warrior,
	},
	player_1: {
		group: new THREE.Group(),
		mesh: undefined,
		datas: archetype.byname.healer,
	},

	init: function () {
		// archetype.init();
		playerInt.createOne(playerInt.player_0);
		if (nbPlayer && nbPlayer == 2) playerInt.createOne(playerInt.player_1);
	},
	createOne: function (player) {
		player.mesh = new THREE.Mesh(
			new THREE.BoxGeometry(
				player.datas.playerSizes.w,
				player.datas.playerSizes.h,
				player.datas.playerSizes.d
			),
			new THREE.MeshPhongMaterial({ color: player.datas.color })
		);
		player.mesh.castShadow = true;
		player.mesh.receiveShadow = true;
		player.group.add(player.mesh);
		player.mesh.position.z = player.datas.defaultPos.z;
		console.log("name:" + player.datas.name);
		console.log("archetype:" + player.datas.archetype);
	},
	update: function () {},
};
playerInt.init();

let P1 = playerInt.player_0 ?? false;
let P2 = playerInt.player_1 ?? false;

threeInt.init();

const meshes = ShapeSpawner.spawn(threeInt.world, 100, {
	xRange: [-50, 50],
	yRange: [-50, 50],
	z: 0.5,
	// types: ['box','sphere'], // <- pour restreindre
	randomSpin: true, // facultatif: rotation continue
});
threeInt.scene.add(P1.group);

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

function displayDatas(currentPlayer) {
	let target = currentPlayer.group.position.clone();
	let texte =
		target.x.toFixed(2) +
		"," +
		target.y.toFixed(2) +
		"," +
		target.z.toFixed(2);
	positionDiv.textContent = texte;
}

function setPlayer(value = 1) {
	playerCount = value;
	console.log("players:" + playerCount);
	hideModal();
}
function animator(delta = 1 / 60) {
	requestAnimationFrame(animator);

	Inputs.handleKeyboardInput(P1);
	updatePlayerRotationFromKeyboard(P1);

	if (gamepads && P2) handleGamepadInput(P2);

	checkGravityOnPlayer(playerInt.player_0);

	if (P1.datas.isMoving || P1.datas.isFalling || P1.datas.isJumping) {
		threeInt.lightInt.follow(P1);
		threeInt.cameraInt.follow(P1);
		displayDatas(P1);
		P1.datas.isMoving = false;
		console.log(P1.datas.name + " ismooving or else");
	}
	threeInt.cameraInt.update();
	threeInt.renderer.render(threeInt.scene, threeInt.cameraInt.camera);
	ShapeSpawner.tick(meshes);
}
window.onload = function init() {
	positionDiv = document.getElementById("position");

	playerModalDiv = document.getElementById("playermodesmodal");
	let playerModalplayer1Div = document.getElementById("player1");
	let playerModalplayer2Div = document.getElementById("player2");
	playerModalplayer1Div.addEventListener("click", setPlayer(1));
	playerModalplayer2Div.addEventListener("click", setPlayer(2));

	addPlateform();

	function animate(t) {
		const delta = (t - lastTime) / 1000; // en secondes
		lastTime = t;
		animator(delta);
	}

	function handleKeydown(event) {
		Inputs.touches[event.key] = true;
		Inputs.touchesCodes[event.code] = true;
	}
	function handleKeyup(event) {
		Inputs.touches[event.key] = false;
		Inputs.touchesCodes[event.code] = false;
	}

	window.addEventListener("keydown", handleKeydown);
	window.addEventListener("keyup", handleKeyup);

	window.addEventListener("resize", onWindowResize);
	function onWindowResize() {
		threeInt.cameraInt.camera.aspect = window.innerWidth / window.innerHeight;
		threeInt.cameraInt.camera.updateProjectionMatrix();
		threeInt.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	window.addEventListener("gamepadconnected", (e) => {
		console.log("Manette connectée :", e.gamepad);
		gamepads = navigator.getGamepads();
		openModal();
	});
	window.addEventListener("gamepaddisconnected", (e) => {
		console.log("Manette déconnectée :", e.gamepad);
		gamepads = false;
	});
	animate();
};
