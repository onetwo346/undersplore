// Basic Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add Underwater Lighting
const light = new THREE.DirectionalLight(0x00bfff, 1);
light.position.set(0, 10, -10).normalize();
scene.add(light);

// Add Fog to Simulate Underwater Environment
scene.fog = new THREE.Fog(0x001e30, 5, 50);

// Create Ocean Floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x003333 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
scene.add(floor);

// Add Player (A Simple Sphere for Now)
const playerGeometry = new THREE.SphereGeometry(1, 32, 32);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 2; // Start above the ocean floor
scene.add(player);

// Camera Follow Player
camera.position.set(0, player.position.y + 5, player.position.z + 10);
camera.lookAt(player.position);

// Movement Variables
let moveForward = false,
    moveBackward = false,
    moveLeft = false,
    moveRight = false;

// Event Listeners for Keyboard Controls (WASD)
document.addEventListener('keydown', (event) => {
    if (event.key === 'w') moveForward = true;
    if (event.key === 's') moveBackward = true;
    if (event.key === 'a') moveLeft = true;
    if (event.key === 'd') moveRight = true;
});
document.addEventListener('keyup', (event) => {
    if (event.key === 'w') moveForward = false;
    if (event.key === 's') moveBackward = false;
    if (event.key === 'a') moveLeft = false;
    if (event.key === 'd') moveRight = false;
});

// Mobile Joysticks Using Nipple.js
let joystickMovementManager = nipplejs.create({
    zone: document.getElementById('joystick-container'),
    mode: 'static',
    position: { left: '50px', bottom: '50px' },
    color: 'white'
});

let joystickCameraManager = nipplejs.create({
    zone: document.getElementById('joystick-camera'),
    mode: 'static',
    position: { right: '50px', bottom: '50px' },
    color: 'white'
});

let joystickMovementData = { x: 0, y: 0 };
let joystickCameraData = { x: 0 };

joystickMovementManager.on('move', (evt, data) => {
    joystickMovementData.x = data.vector.x; // Horizontal movement
    joystickMovementData.y = data.vector.y; // Vertical movement
});

joystickMovementManager.on('end', () => {
    joystickMovementData.x = joystickMovementData.y = 0; // Reset movement
});

joystickCameraManager.on('move', (evt, data) => {
    joystickCameraData.x = data.vector.x; // Horizontal camera rotation
});

joystickCameraManager.on('end', () => {
    joystickCameraData.x = 0; // Reset camera rotation
});

// Game Loop
function animate() {
    requestAnimationFrame(animate);

    // Player Movement Logic
    let speed = 0.1;

    if (moveForward || joystickMovementData.y > 0) player.position.z -= speed * Math.abs(joystickMovementData.y || 1);
    if (moveBackward || joystickMovementData.y < 0) player.position.z += speed * Math.abs(joystickMovementData.y || -1);
    
    if (moveLeft || joystickMovementData.x < 0) player.position.x -= speed * Math.abs(joystickMovementData.x || -1);
    if (moveRight || joystickMovementData.x > 0) player.position.x += speed * Math.abs(joystickMovementData.x || -1);

    // Camera Follow Logic
    camera.position.lerp(
        new THREE.Vector3(player.position.x, player.position.y + 5, player.position.z + 10),
        0.1
    );
    
    camera.lookAt(player.position);

    // Render Scene
    renderer.render(scene, camera);
}

animate();
