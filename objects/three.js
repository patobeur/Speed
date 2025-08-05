const threeInt = {
	scene: new THREE.Scene(),
	world: new THREE.Group(),
	platformMeshes: [],
	platforms: [
		{
			x: 0,
			y: 0,
			z: -0.5,
			width: 125,
			height: 125,
			depth: 1,
			name: "floor_0",
			color: 0x00ff00,
		},
		{
			x: 25,
			y: 0,
			z: -0.5,
			width: 25,
			height: 25,
			depth: 1,
			name: "floor_1",
			color: 0x00ff00,
		},
	],
	// walls: [
	// 	{ x: 20, y: 2.5, width: 1, height: 5 },
	// 	{ x: -20, y: 2.5, width: 1, height: 5 },
	// ],
	lightInt: {
		spotLight: undefined,
		slHelper: undefined,
		defaultPos: { x: 0, y: 0, z: 15 },
		create: function () {
			threeInt.lightInt.spotLight = new THREE.SpotLight(0xffffff, 0.5);
			threeInt.lightInt.spotLight.position.set(
				threeInt.lightInt.defaultPos.x,
				threeInt.lightInt.defaultPos.y,
				threeInt.lightInt.defaultPos.z
			);
			threeInt.lightInt.spotLight.angle = Math.PI / 4;
			threeInt.lightInt.spotLight.penumbra = 0.1;
			threeInt.lightInt.spotLight.decay = 2;
			threeInt.lightInt.spotLight.distance = 200;
			threeInt.lightInt.spotLight.castShadow = true;
			threeInt.lightInt.spotLight.shadow.mapSize.width = 512;
			threeInt.lightInt.spotLight.shadow.mapSize.height = 512;
			threeInt.lightInt.spotLight.shadow.camera.near = 1;
			threeInt.lightInt.spotLight.shadow.camera.far = 200;
			threeInt.lightInt.spotLight.shadow.focus = 1;
			threeInt.lightInt.slHelper = new THREE.SpotLightHelper(
				threeInt.lightInt.spotLight
			);
		},
		follow: function (localPlayer) {
			let mesh = localPlayer.group;
			let spot = threeInt.lightInt.spotLight;
			let x = mesh.position.clone().x;
			let y = mesh.position.clone().y;
			let z = mesh.position.clone().z;
			spot.target.position.x = x + threeInt.lightInt.defaultPos.x;
			spot.target.position.y = y + threeInt.lightInt.defaultPos.y;

			spot.position.x = x + threeInt.lightInt.defaultPos.x;
			spot.position.y = y + threeInt.lightInt.defaultPos.y;
			// spot.position.z = z + threeInt.lightInt.defaultPos.z;
		},
	},
	cameraInt: {
		camera: undefined,
		defaultPos: { x: 0, y: 0, z: 15 },
		create: function () {
			threeInt.cameraInt.camera = new THREE.PerspectiveCamera(
				70,
				window.innerWidth / window.innerHeight,
				0.1,
				1000
			);
			threeInt.cameraInt.camera.position.x = threeInt.cameraInt.defaultPos.x;
			threeInt.cameraInt.camera.position.y = threeInt.cameraInt.defaultPos.y;
			threeInt.cameraInt.camera.position.z = threeInt.cameraInt.defaultPos.z;
		},
		follow: function (localPlayer) {
			let mesh = localPlayer.group;
			let x = mesh.position.clone().x;
			let y = mesh.position.clone().y;
			threeInt.cameraInt.camera.position.x =
				x + threeInt.cameraInt.defaultPos.x;
			threeInt.cameraInt.camera.position.y =
				y + threeInt.cameraInt.defaultPos.y;
		},
		update: function () {
			threeInt.cameraInt.camera.aspect =
				window.innerWidth / window.innerHeight;
			threeInt.cameraInt.camera.updateProjectionMatrix();
		},
	},
	renderer: new THREE.WebGLRenderer({ antialias: true }),
	init: function () {
		threeInt.cameraInt.create();
		threeInt.lightInt.create();

		const ambient = new THREE.AmbientLight(0xffffff, 0.1);
		threeInt.scene.add(ambient);
		threeInt.scene.add(
			threeInt.lightInt.spotLight,
			threeInt.lightInt.slHelper,
			threeInt.lightInt.spotLight.target
		);

		threeInt.renderer.setSize(window.innerWidth, window.innerHeight);
		threeInt.renderer.outputEncoding = THREE.sRGBEncoding;
		threeInt.renderer.shadowMap.enabled = true;
		threeInt.renderer.setPixelRatio(window.devicePixelRatio);
		document.body.appendChild(threeInt.renderer.domElement);

		threeInt.scene.add(threeInt.world);

		threeInt.addPlateform();
		window.addEventListener("resize", threeInt.onWindowResize);
	},
	addPlateform: function () {
		threeInt.platforms.forEach((p) => {
			const geom = new THREE.BoxGeometry(p.width, p.height, p.depth);
			const mat = new THREE.MeshPhongMaterial({ color: p.color });
			const mesh = new THREE.Mesh(geom, mat);
			mesh.receiveShadow = true;
			mesh.name = p.name || "plateforme";
			mesh.position.set(p.x, p.y, p.z);
			threeInt.world.add(mesh);
			threeInt.platformMeshes.push({
				mesh,
				x: p.x,
				y: p.y,
				z: p.z,
				width: p.width,
				height: p.height,
				depth: p.depth,
			});
		});
	},
	onWindowResize: function () {
		threeInt.cameraInt.camera.aspect = window.innerWidth / window.innerHeight;
		threeInt.cameraInt.camera.updateProjectionMatrix();
		threeInt.renderer.setSize(window.innerWidth, window.innerHeight);
	},
	addRandomPlateform2platformMeshes: function () {
		let currentAltitude = 3;
		let startAt = 0;
		for (let index = 0; index < 100; index++) {
			let maxRangeAltitude = 3;
			currentAltitude += Math.random() * maxRangeAltitude + 1;

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
	},
};
const ShapeSpawner = {
	// Types de formes supportées
	shapeTypes: ["box", "sphere", "cone", "cylinder", "torus", "icosahedron"],

	// Génère une géométrie d'environ 1 unité de taille
	_geometry(type) {
		switch (type) {
			case "box":
				return new THREE.BoxGeometry(1, 1, 1); // 1x1x1
			case "sphere":
				return new THREE.SphereGeometry(0.5, 24, 16); // diam. ~1
			case "cone":
				return new THREE.ConeGeometry(0.5, 1, 24); // h=1, base ~1
			case "cylinder":
				return new THREE.CylinderGeometry(0.5, 0.5, 1, 24); // h=1, diam. ~1
			case "torus":
				return new THREE.TorusGeometry(0.4, 0.1, 12, 24); // diam. ext. ~1
			case "icosahedron":
				return new THREE.IcosahedronGeometry(0.5); // diam. ~1
			default:
				return new THREE.BoxGeometry(1, 1, 1);
		}
	},

	_rand(min, max) {
		return Math.random() * (max - min) + min;
	},

	// Crée un mesh avec forme au hasard
	_createRandomMesh(options = {}) {
		const { material, types } = options;
		const pick = (types && types.length ? types : this.shapeTypes)[
			Math.floor(
				Math.random() *
					(types && types.length ? types.length : this.shapeTypes.length)
			)
		];

		const geom = this._geometry(pick);
		const mat =
			material ||
			new THREE.MeshStandardMaterial({
				color: new THREE.Color(Math.random(), Math.random(), Math.random()),
				metalness: 0.2,
				roughness: 0.8,
			});

		const mesh = new THREE.Mesh(geom, mat);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		return mesh;
	},

	/**
	 * Génère et ajoute N formes à la scène (ou à un groupe).
	 * @param {THREE.Scene|THREE.Group} target  scène ou groupe de destination
	 * @param {number} count                    nombre d’objets
	 * @param {object} options                  options facultatives
	 *  - xRange: [min,max] (défaut [-50,50])
	 *  - yRange: [min,max] (défaut [-50,50])
	 *  - z: valeur z fixe (défaut 0.5)
	 *  - material: THREE.Material personnalisé
	 *  - types: sous-ensemble de shapes (ex: ['box','sphere'])
	 *  - randomRotation: bool (défaut true)
	 *  - randomSpin: bool (défaut false) -> ajoute une vitesse angulaire stockée dans userData.spin
	 */
	spawn(target, count = 50, options = {}) {
		const {
			xRange = [-50, 50],
			yRange = [-50, 50],
			z = 0.5,
			randomRotation = false,
			randomSpin = false,
		} = options;

		const meshes = [];
		for (let i = 0; i < count; i++) {
			const mesh = this._createRandomMesh(options);
			mesh.position.set(
				this._rand(xRange[0], xRange[1]),
				this._rand(yRange[0], yRange[1]),
				z
			);

			if (randomRotation) {
				mesh.rotation.set(
					this._rand(0, Math.PI * 2),
					this._rand(0, Math.PI * 2),
					this._rand(0, Math.PI * 2)
				);
			}

			if (randomSpin) {
				mesh.userData.spin = new THREE.Vector3(
					this._rand(-0.02, 0.02),
					this._rand(-0.02, 0.02),
					this._rand(-0.02, 0.02)
				);
			}

			mesh.castShadow = true;
			mesh.receiveShadow = true;
			// mesh.position.z = 8;
			target.add(mesh);
			meshes.push(mesh);
		}

		return meshes;
	},

	// Utilitaire d’animation si randomSpin = true
	tick(meshes, delta = 1 / 60) {
		for (const m of meshes) {
			if (m.userData.spin) {
				m.rotation.x += m.userData.spin.x * delta * 60;
				m.rotation.y += m.userData.spin.y * delta * 60;
				m.rotation.z += m.userData.spin.z * delta * 60;
			}
		}
	},
};

const randomMeshes = ShapeSpawner.spawn(threeInt.world, 100, {
	xRange: [-50, 50],
	yRange: [-50, 50],
	z: 0.5,
	// types: ['box','sphere'], // <- pour restreindre
	randomSpin: true, // facultatif: rotation continue
});
