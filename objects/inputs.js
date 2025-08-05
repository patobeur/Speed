const Inputs = {
	isGamepad: false,
	mouse: new THREE.Vector2(),
	users: { keyboard: undefined, gamepad: undefined },
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

	handleKeyboardInput: function (p) {
		p.oldPos = p.group.position.clone();
		const factor = p.malusFactor !== undefined ? p.malusFactor : 1;
		// Déplacer le cube vert en fonction des fleches ou touches Q, S, D, Z
		if (Inputs.touches.ArrowUp || Inputs.touches[Inputs.keys["UP"]]) {
			p.group.position.y += p.datas.moveSpeed.y * factor;
			p.datas.isMoving = true;
		}
		if (Inputs.touches.ArrowDown || Inputs.touches[Inputs.keys["DOWN"]]) {
			p.group.position.y -= p.datas.moveSpeed.y * factor;
			p.datas.isMoving = true;
		}
		if (Inputs.touches.ArrowLeft || Inputs.touches[Inputs.keys["LEFT"]]) {
			p.group.position.x -= p.datas.moveSpeed.x * factor;
			p.datas.isMoving = true;
		}
		if (Inputs.touches.ArrowRight || Inputs.touches[Inputs.keys["RIGHT"]]) {
			p.group.position.x += p.datas.moveSpeed.x * factor;
			p.datas.isMoving = true;
		}
		if (Inputs.touchesCodes[Inputs.keys["JUMP"]] && !p.datas.isJumping) {
			p.datas.velocity.z = p.datas.jumpForce;
			p.datas.isJumping = true;
		}
		// if (Inputs.touches[Inputs.keys["ROTATELEFT"]]) {
		// 	rotateWorld("left");
		// 	p.datas.isRotating = true;
		// }
		// if (Inputs.touches[Inputs.keys["ROTATERIGHT"]]) {
		// 	rotateWorld("right");
		// 	p.datas.isRotating = true;
		// }
	},
	handleGamepadInput: function (p) {
		if (!gamepads) return;
		const gp = gamepads[0]; // première manette
		if (!gp) return;

		const threshold = 0.1; // zone morte
		const axisX = gp.axes[0]; // gauche/droite (stick gauche)
		const axisY = gp.axes[1]; // haut/bas (stick gauche)

		if (gp.buttons[6].pressed && axisX < -threshold) {
			p.group.position.x -= p.datas.playerMoveSpeeds.x;
			p.datas.isMoving = true;
		}
		if (gp.buttons[6].pressed && axisX > threshold) {
			p.group.position.x += p.datas.playerMoveSpeeds.x;
			p.datas.isMoving = true;
		}
		if (gp.buttons[6].pressed && axisY < -threshold) {
			p.group.position.y += p.datas.playerMoveSpeeds.y;
			p.datas.isMoving = true;
		}
		if (gp.buttons[6].pressed && axisY > threshold) {
			p.group.position.y -= p.datas.playerMoveSpeeds.y;
			p.datas.isMoving = true;
		}

		// Bouton A (standard XBox : index 0) → sauter
		if (gp.buttons[0].pressed && !p.datas.isJumping) {
			p.datas.velocity.z = p.datas.jumpForce;
			p.datas.isJumping = true;
			if (consoleOn) console.log("A");
		}
		// Bouton B (standard XBox : index 1)
		if (gp.buttons[1].pressed) {
			if (consoleOn) console.log("B");
		}
		// Bouton X (standard XBox : index 2)
		if (gp.buttons[2].pressed) {
			if (consoleOn) console.log("X");
		}
		// Bouton Y (standard XBox : index 3)
		if (gp.buttons[3].pressed) {
			if (consoleOn) console.log("Y");
		}
		if (gp.buttons[4].pressed) {
			if (consoleOn) console.log("LB");
		}
		if (gp.buttons[5].pressed) {
			if (consoleOn) console.log("RB");
		}
		if (gp.buttons[6].pressed) {
			if (consoleOn) console.log("LT");
		}
		if (gp.buttons[7].pressed) {
			if (consoleOn) console.log("RT");
		}
		if (gp.buttons[8].pressed) {
			if (consoleOn) console.log("BACK");
		}
		if (gp.buttons[9].pressed) {
			if (consoleOn) console.log("START");
		}
		if (gp.buttons[10].pressed) {
			if (consoleOn) console.log("10");
		}
		if (Math.abs(axisX) > threshold || Math.abs(axisY) > threshold) {
			let angle = Math.atan2(axisY, axisX);
			p.group.rotation.z = -angle;
		}
	},
	handleKeydown: function (event) {
		Inputs.touches[event.key] = true;
		Inputs.touchesCodes[event.code] = true;
	},
	handleKeyup: function (event) {
		Inputs.touches[event.key] = false;
		Inputs.touchesCodes[event.code] = false;
	},

	init: function () {
		window.addEventListener("gamepadconnected", (e) => {
			if (consoleOn) console.log("Manette connectée :", e.gamepad);
			Inputs.isGamepad = navigator.getGamepads();
			openModal();
		});
		window.addEventListener("gamepaddisconnected", (e) => {
			if (consoleOn) console.log("Manette déconnectée :", e.gamepad);
			Inputs.isGamepad = false;
		});
		window.addEventListener("mousemove", (event) => {
			Inputs.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			Inputs.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		});

		window.addEventListener("keydown", Inputs.handleKeydown);
		window.addEventListener("keyup", Inputs.handleKeyup);
	},
};
