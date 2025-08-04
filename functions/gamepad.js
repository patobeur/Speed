function handleGamepadInput(currentPlayer) {
	if (!gamepads) return;
	const gp = gamepads[0]; // première manette
	if (!gp) return;

	const threshold = 0.1; // zone morte
	const axisX = gp.axes[0]; // gauche/droite (stick gauche)
	const axisY = gp.axes[1]; // haut/bas (stick gauche)

	if (gp.buttons[6].pressed && axisX < -threshold) {
		currentPlayer.group.position.x -= currentPlayer.datas.playerMoveSpeeds.x;
		currentPlayer.datas.isMoving = true;
	}
	if (gp.buttons[6].pressed && axisX > threshold) {
		currentPlayer.group.position.x += currentPlayer.datas.playerMoveSpeeds.x;
		currentPlayer.datas.isMoving = true;
	}
	if (gp.buttons[6].pressed && axisY < -threshold) {
		currentPlayer.group.position.y += currentPlayer.datas.playerMoveSpeeds.y;
		currentPlayer.datas.isMoving = true;
	}
	if (gp.buttons[6].pressed && axisY > threshold) {
		currentPlayer.group.position.y -= currentPlayer.datas.playerMoveSpeeds.y;
		currentPlayer.datas.isMoving = true;
	}

	// Bouton A (standard XBox : index 0) → sauter
	if (gp.buttons[0].pressed && !currentPlayer.datas.isJumping) {
		currentPlayer.datas.velocity.z = currentPlayer.datas.jumpForce;
		currentPlayer.datas.isJumping = true;
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
	if (gp.buttons[4].pressed) {
		console.log("LB");
	}
	if (gp.buttons[5].pressed) {
		console.log("RB");
	}
	if (gp.buttons[6].pressed) {
		console.log("LT");
	}
	if (gp.buttons[7].pressed) {
		console.log("RT");
	}
	if (gp.buttons[8].pressed) {
		console.log("BACK");
	}
	if (gp.buttons[9].pressed) {
		console.log("START");
	}
	if (gp.buttons[10].pressed) {
		console.log("10");
	}
	if (Math.abs(axisX) > threshold || Math.abs(axisY) > threshold) {
		let angle = Math.atan2(axisY, axisX);
		currentPlayer.group.rotation.z = -angle;
	}
}
