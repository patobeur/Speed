const Inputs = {
	user: undefined,
	keys: {
		UP: "z",
		DOWN: "s",
		LEFT: "q",
		RIGHT: "d",
		JUMP: "Space",
		ROTATELEFT: "a",
		ROTATERIGHT: "e",
	},
	// Objets pour stocker l'état des touches
	touches: {},
	touchesCodes: {},
	handleKeyboardInput: function (localPlayer) {
		// Déplacer le cube vert en fonction des fleches ou touches Q, S, D, Z
		if (Inputs.touches.ArrowUp || Inputs.touches[Inputs.keys["UP"]]) {
			localPlayer.group.position.y += localPlayer.datas.moveSpeed.y;
			localPlayer.datas.isMoving = true;
		}
		if (Inputs.touches.ArrowDown || Inputs.touches[Inputs.keys["DOWN"]]) {
			localPlayer.group.position.y -= localPlayer.datas.moveSpeed.y;
			localPlayer.datas.isMoving = true;
		}
		if (Inputs.touches.ArrowLeft || Inputs.touches[Inputs.keys["LEFT"]]) {
			localPlayer.group.position.x -= localPlayer.datas.moveSpeed.x;
			localPlayer.datas.isMoving = true;
		}
		if (Inputs.touches.ArrowRight || Inputs.touches[Inputs.keys["RIGHT"]]) {
			localPlayer.group.position.x += localPlayer.datas.moveSpeed.x;
			localPlayer.datas.isMoving = true;
		}
		if (
			Inputs.touchesCodes[Inputs.keys["JUMP"]] &&
			!localPlayer.datas.isJumping
		) {
			localPlayer.datas.velocity.z = localPlayer.datas.jumpForce;
			localPlayer.datas.isJumping = true;
		}
		if (Inputs.touches[Inputs.keys["ROTATELEFT"]]) {
			rotateWorld("left");
			localPlayer.datas.isRotating = true;
		}
		if (Inputs.touches[Inputs.keys["ROTATERIGHT"]]) {
			rotateWorld("right");
			localPlayer.datas.isRotating = true;
		}
	},
	setUser: (localPlayer) => {
		this.user = localPlayer;
	},
};

function updatePlayerRotationFromKeyboard(localPlayer) {
	let dx = 0;
	let dy = 0;

	if (Inputs.touches[Inputs.keys["LEFT"]]) dx -= 1;
	if (Inputs.touches[Inputs.keys["RIGHT"]]) dx += 1;
	if (Inputs.touches[Inputs.keys["UP"]]) dy += 1;
	if (Inputs.touches[Inputs.keys["DOWN"]]) dy -= 1;

	// Si aucune direction, ne pas modifier la rotation
	if (dx === 0 && dy === 0) return;

	const angle = Math.atan2(dy, dx); // angle en radians
	localPlayer.group.rotation.z = -angle;
}
