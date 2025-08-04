const threeInt = {
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
	},
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
};
