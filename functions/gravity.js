function checkGravityOnPlayer(currentPlayer) {
	const nextZ =
		currentPlayer.group.position.z + currentPlayer.datas.velocity.z;
	let landed = false;

	for (let p of threeInt.platformMeshes) {
		const pTop = p.z + p.depth / 2;
		const pBottom = p.z - p.depth / 2;
		const pLeft = p.x - p.width / 2;
		const pRight = p.x + p.width / 2;
		const pFront = p.y + p.height / 2;
		const pBack = p.y - p.height / 2;

		const playerBottom = nextZ - currentPlayer.datas.playerSizes.d / 2;
		const playerTop = nextZ + currentPlayer.datas.playerSizes.d / 2;
		const playerLeft =
			currentPlayer.group.position.x - currentPlayer.datas.playerSizes.w / 2;
		const playerRight =
			currentPlayer.group.position.x + currentPlayer.datas.playerSizes.w / 2;
		const playerFront =
			currentPlayer.group.position.y + currentPlayer.datas.playerSizes.h / 2;
		const playerBack =
			currentPlayer.group.position.y - currentPlayer.datas.playerSizes.h / 2;

		const isOverlappingXY =
			playerRight > pLeft &&
			playerLeft < pRight &&
			playerFront > pBack &&
			playerBack < pFront;

		const isLanding =
			currentPlayer.datas.velocity.z <= 0 &&
			playerBottom <= pTop &&
			playerTop > pTop &&
			isOverlappingXY;

		if (isLanding) {
			currentPlayer.group.position.z =
				pTop + currentPlayer.datas.playerSizes.d / 2;
			currentPlayer.datas.velocity.z = 0;
			currentPlayer.datas.isJumping = false;
			currentPlayer.datas.isFalling = false;
			landed = true;
			break;
		}
	}

	if (!landed) {
		currentPlayer.datas.velocity.z += gravity.z;
		currentPlayer.group.position.z += currentPlayer.datas.velocity.z;
		currentPlayer.datas.isFalling = true;
	}
}
