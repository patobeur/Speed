let playerModalDiv = undefined;
let lastTime = 0;
let nbPlayer = 1;

const groundY = 0;
const gravity = { x: 0, y: 0, z: -0.01 };

// function setPlayer(value = 1) {
// 	playerCount = value;
// 	console.log("players:" + playerCount);
// 	hideModal();
// }
playerInt.init();
let P1 = false;
let P2 = false;
P1 = playerInt.player_0 ?? false;
P2 = playerInt.player_1 ?? false;

function animator(delta = 1 / 60) {
	requestAnimationFrame(animator);

	playerInt.update(threeInt.cameraInt.camera);

	threeInt.cameraInt.update();
	threeInt.renderer.render(threeInt.scene, threeInt.cameraInt.camera);
	// ShapeSpawner.tick(randomMeshes);
}
function start() {
	playerInt.players.forEach((p) => {
		threeInt.scene.add(p.group);
	});
	Inputs.init();
}
window.onload = function init() {
	// playerModalDiv = document.getElementById("playermodesmodal");
	// let playerModalplayer1Div = document.getElementById("player1");
	// let playerModalplayer2Div = document.getElementById("player2");
	// playerModalplayer1Div.addEventListener("click", setPlayer(1));
	// playerModalplayer2Div.addEventListener("click", setPlayer(2));

	threeInt.init();
	start();

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

	animate();
};
