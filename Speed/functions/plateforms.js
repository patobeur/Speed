function addRandomPlateform2platformMeshes() {
	let currentAltitude = 3;
	let startAt = 0;
	for (let index = 0; index < 100; index++) {
		let maxRangeAltitude = 3;
		currentAltitude += Math.random() * maxRangeAltitude + 1;
		// console.log(currentAltitude, index);
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
}
function addPlateform() {
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
	// platformMeshes.forEach((p) =>
	// 	console.log("Plateforme:", p.mesh.name, "position:", p.mesh.position)
	// );
}
