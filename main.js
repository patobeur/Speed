const consoleOn = false;
const groundY = 0;
const gravity = { x: 0, y: 0, z: -0.01 };
let lastTime = 0;

function animator(delta = 1 / 60) {
	requestAnimationFrame(animator);

	playerInt.update(threeInt.cameraInt.camera);

	threeInt.cameraInt.update();
	threeInt.renderer.render(threeInt.scene, threeInt.cameraInt.camera);
	// ShapeSpawner.tick(randomMeshes);
}
function animate(t) {
	const delta = (t - lastTime) / 1000; // en secondes
	lastTime = t;
	animator(delta);
}
function start() {
	threeInt.init();
	playerInt.init();
	playerInt.players.forEach((p) => {
		threeInt.scene.add(p.group);
	});
	Inputs.init();
	animate();
}
window.onload = function init() {
	start();
};
