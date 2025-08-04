// Besoin: three >= r150 (import * as THREE from 'three')
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
			randomRotation = true,
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
