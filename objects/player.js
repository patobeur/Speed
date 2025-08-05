const archetype = {
	byname: {
		warrior: {
			playerSizes: { w: 1, h: 1, d: 1 },
			isMoving: false,
			isFalling: false,
			isJumping: false,
			isRotating: false,
			jumpForce: 0.25,
			velocity: { x: 0, y: 0, z: 0 },
			moveSpeed: { x: 0.1, y: 0.1, z: 0.1 },
			defaultPos: { x: 0, y: 0, z: 0 },
			color: 0x2500ff,
			archetype: "warrior",
			name: "Alice",
		},
		healer: {
			playerSizes: { w: 0.6, h: 0.6, d: 0.2 },
			isMoving: false,
			isFalling: false,
			isJumping: false,
			isRotating: false,
			jumpForce: 0.25,
			velocity: { x: 0, y: 0, z: 0 },
			moveSpeed: { x: 0.1, y: 0.1, z: 0.1 },
			defaultPos: { x: 0, y: 0, z: 3 },
			color: 0x0000ff,
			archetype: "healer",
			name: "Bob",
		},
	},
	init: function () {},
};
const playerInt = {
	posDiv: document.createElement("div"),
	players: [],
	player_default: {
		immat: 0,
		group: new THREE.Group(),
		div: document.createElement("div"),
		mesh: undefined,
		name: undefined,
		datas: archetype.byname.warrior,
		oldPos: undefined,
	},
	newPlayer: function () {
		let p = playerInt.player_default;
		let immat = playerInt.players.length;
		p.index = immat;
		p.immat = "player_" + immat;
		p.name = "P" + (immat + 1);

		playerInt.setPlayerMesh(p);
		playerInt.players.push(p);

		playerInt.createDiv(p);
		console.log("creating: " + p.datas.name + " " + p.datas.archetype);
	},
	init: function () {
		playerInt.addPosDiv();
		playerInt.newPlayer();

		// if (nbPlayer && nbPlayer == 2) playerInt.createOne(playerInt.player_1);
	},
	setPlayerMesh: function (p) {
		p.mesh = new THREE.Mesh(
			new THREE.BoxGeometry(
				p.datas.playerSizes.w,
				p.datas.playerSizes.h,
				p.datas.playerSizes.d
			),
			new THREE.MeshPhongMaterial({ color: p.datas.color })
		);
		p.mesh.castShadow = true;
		p.mesh.receiveShadow = true;
		p.group.add(p.mesh);
		p.mesh.position.z = p.datas.defaultPos.z;
	},
	createDiv: function (p) {
		p.div.id = "position";
		p.div.classList.add("card");
		p.div.textContent = "0,0,0";
		playerInt.posDiv.prepend(p.div);
	},
	addPosDiv: function () {
		// playerInt.posDiv.classList.add("pos");
		playerInt.posDiv.classList.add("positions");
		document.body.appendChild(playerInt.posDiv);
	},
	displayPlayerCoords: function (p) {
		let target = p.group.position.clone();
		let texte =
			target.x.toFixed(2) +
			"," +
			target.y.toFixed(2) +
			"," +
			target.z.toFixed(2);
		p.div.textContent = texte;
	},
	updatePlayerMalusIfMovingBackwards(p) {
		const velocity = new THREE.Vector3().subVectors(
			p.group.position,
			p.oldPos
		);
		const dot = velocity.dot(p.mouseDirection);
		if (dot < 0) {
			p.malusV3 = velocity.clone();
		} else {
			p.malusV3 = new THREE.Vector3(0, 0, 0);
		}
		p.oldPos.copy(p.group.position);
	},
	updatePlayerRotationFromMouse: function (p, camera) {
		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(Inputs.mouse, camera);

		const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
		const intersection = new THREE.Vector3();
		raycaster.ray.intersectPlane(planeZ, intersection);

		const dx = intersection.x - p.group.position.x;
		const dy = intersection.y - p.group.position.y;

		const targetAngle = Math.atan2(dy, dx);
		let currentAngle = p.group.rotation.z;

		let deltaAngle = targetAngle - currentAngle;
		deltaAngle = Math.atan2(Math.sin(deltaAngle), Math.cos(deltaAngle));

		const smoothFactor = 0.1;
		currentAngle += deltaAngle * smoothFactor;
		p.group.rotation.z = currentAngle;

		// Retourne un vecteur direction normalisé vers la souris
		p.mouseDirection = new THREE.Vector3(dx, dy, 0).normalize();
	},

	checkGravityOnPlayer: function (p) {
		const nextZ = p.group.position.z + p.datas.velocity.z;
		let landed = false;

		for (let platmesh of threeInt.platformMeshes) {
			const pTop = platmesh.z + platmesh.depth / 2;
			// const pBottom = platmesh.z - platmesh.depth / 2;
			const pLeft = platmesh.x - platmesh.width / 2;
			const pRight = platmesh.x + platmesh.width / 2;
			const pFront = platmesh.y + platmesh.height / 2;
			const pBack = platmesh.y - platmesh.height / 2;

			const playerBottom = nextZ - p.datas.playerSizes.d / 2;
			const playerTop = nextZ + p.datas.playerSizes.d / 2;
			const playerLeft = p.group.position.x - p.datas.playerSizes.w / 2;
			const playerRight = p.group.position.x + p.datas.playerSizes.w / 2;
			const playerFront = p.group.position.y + p.datas.playerSizes.h / 2;
			const playerBack = p.group.position.y - p.datas.playerSizes.h / 2;

			const isOverlappingXY =
				playerRight > pLeft &&
				playerLeft < pRight &&
				playerFront > pBack &&
				playerBack < pFront;

			const isLanding =
				p.datas.velocity.z <= 0 &&
				playerBottom <= pTop &&
				playerTop > pTop &&
				isOverlappingXY;

			if (isLanding) {
				p.group.position.z = pTop + p.datas.playerSizes.d / 2;
				p.datas.velocity.z = 0;
				p.datas.isJumping = false;
				p.datas.isFalling = false;
				landed = true;
				break;
			}
		}

		if (!landed) {
			p.datas.velocity.z += gravity.z;
			p.group.position.z += p.datas.velocity.z;
			p.datas.isFalling = true;
		}
	},
	handleWarrior: function (p) {
		playerInt.checkGravityOnPlayer(p);
	},
	update: function (camera) {
		playerInt.players.forEach((p) => {
			let index = p.index;
			let archetype = p.datas.archetype;
			switch (index) {
				case 0:
					// if (gamepads && P2) handleGamepadInput(P2);
					playerInt.updatePlayerRotationFromMouse(p, camera);
					playerInt.updatePlayerMalusIfMovingBackwards(p);
					Inputs.handleKeyboardInput(p);
					if (p.datas.isMoving || p.datas.isFalling || p.datas.isJumping) {
						threeInt.lightInt.follow(p);
						threeInt.cameraInt.follow(p);
						p.datas.isMoving = false;
						playerInt.displayPlayerCoords(p);
						console.log(
							"P" +
								p.index +
								": " +
								p.datas.name +
								" (" +
								archetype +
								" lv0) ismooving, "
						);
						console.log(p.oldPos);
						console.log(p.group.position);
					}
				case 1:
					break;

				default:
					break;
			}
			switch (archetype) {
				case "warrior":
					playerInt.handleWarrior(p);
					break;

				default:
					break;
			}
		});
	},
};
