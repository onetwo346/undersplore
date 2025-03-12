// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Underwater ambiance (fog and blue tint)
scene.background = new THREE.Color(0x1e90ff); // Deep blue
scene.fog = new THREE.Fog(0x1e90ff, 0, 50);

// Player position and movement
const player = {
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    speed: 0.1,
};

// Camera setup
camera.position.set(0, 5, 10);
camera.lookAt(player.position);

// Basic ocean floor (plane)
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x4682b4, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2;
floor.position.y = -5;
scene.add(floor);

// Simple underwater object (a cube for now)
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(5, -4, 5);
scene.add(cube);

// Keyboard controls
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // WASD Movement
    if (keys['w']) player.velocity.z -= player.speed;
    if (keys['s']) player.velocity.z += player.speed;
    if (keys['a']) player.velocity.x -= player.speed;
    if (keys['d']) player.velocity.x += player.speed;

    // Arrow key camera adjustment
    if (keys['ArrowUp']) camera.rotation.x -= 0.02;
    if (keys['ArrowDown']) camera.rotation.x += 0.02;
    if (keys['ArrowLeft']) camera.rotation.y += 0.02;
    if (keys['ArrowRight']) camera.rotation.y -= 0.02;

    // Apply velocity to position
    player.position.add(player.velocity);
    player.velocity.multiplyScalar(0.9); // Friction

    // Update camera to follow player
    camera.position.set(
        player.position.x,
        player.position.y + 5,
        player.position.z + 10
    );
    camera.lookAt(player.position);

    renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
