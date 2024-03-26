import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {Box3, Object3D, PerspectiveCamera, Vector2, Vector3} from "three";

export function randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*// camera:PerspectiveCamera, controls:OrbitControls, selection:Object3D[], fitOffset = 1
export function fitCameraToSelection (camera:PerspectiveCamera, controls:OrbitControls, object:Object3D, offset = 1.25 ) {

	offset = offset || 1.25;

	const boundingBox = new Box3();

	// get bounding box of object - this will be used to setup controls and camera
	boundingBox.setFromObject(object);


	const center = new Vector3();
	const size = new Vector3();
	boundingBox.getCenter(center);

	boundingBox.getSize(size);

	// get the max side of the bounding box (fits to width OR height as needed )
	const maxDim = Math.max(size.x, size.y, size.z);
	const fov = camera.fov * (Math.PI / 180);
	let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));

	cameraZ *= offset; // zoom out a little so that objects don't fill the screen

	camera.position.z = cameraZ;

	const minZ = boundingBox.min.z;
	const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

	camera.far = cameraToFarEdge * 3;
	camera.updateProjectionMatrix();

	if (controls) {

		// set camera to rotate around center of loaded object
		controls.target = center;

		// prevent camera from zooming out far enough to create far plane cutoff
		controls.maxDistance = cameraToFarEdge * 2;

		controls.saveState();

	} else {

		camera.lookAt(center)

	}
}*/
export function checkWebP(filename:string) {
    return (window as any).Main.WEBP_SUPPORTED ? filename.replace('.png', '.webp').replace('images/', 'images_webp/') : filename;
}
export function fitCameraToSelection(camera: PerspectiveCamera, selection: Object3D[], fitOffset = 1, controls?: OrbitControls) {

    const box = new Box3();

    for (const object of selection) box.expandByObject(object);

    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

    const target = controls ? controls.target : new Vector3(0, 0, 0);
    const direction = target.clone()
        .sub(camera.position)
        .normalize()
        .multiplyScalar(distance);


    camera.near = distance / 10;
    camera.far = distance * 10;
    camera.updateProjectionMatrix();

    camera.position.copy(target).sub(direction);
    if (controls) {
        controls.maxDistance = distance * 10;
        controls.target.copy(center);
        controls.update();
    }

}

export function getRandomIntsFromRange(count: number, range: number) {
    let i = 0;
    let stack = [];
    let randomImages: number[] = [];

    // Generate stack
    for (i; i < range; i++) {
        stack.push(i + 1);
    }

    // Add random from stack
    i = 0;
    let tempTotal = range - 1;
    let randomInt;
    for (i; i < count; i++) {
        randomInt = randomInteger(0, tempTotal);
        randomImages.push(stack[randomInt]);

        stack.splice(randomInt, 1);

        tempTotal--;
    }

    return randomImages;
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export function degreesToRadians(degrees: number) {
    return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number) {
    return (radians * 180) / Math.PI;
}

/** This method will calculate how big a circle is needed to make the square fit in it */
export function squareToCircle(width: number) {
    let radius: number;

    let a = width;
    let b = width;
    let c = Math.pow(a, 2) + Math.pow(b, 2);

    radius = Math.sqrt(c);

    return radius;
}

/** This method will calculate the largest square that can fit in the circle */
export function circleToSquare(radius: number) {
    let width: number;

    let c = radius;
    let ab = Math.pow(c, 2);
    let a = ab * 0.5;

    width = Math.sqrt(a);

    return width;
}
