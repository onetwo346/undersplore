// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add Water
const waterGeometry = new THREE.PlaneGeometry(100, 100);
const waterMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
scene.add(water);

// Add Fish (Placeholder)
const fishGeometry = new THREE.BoxGeometry(1, 1, 1);
const fishMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
const fish = new THREE.Mesh(fishGeometry, fishMaterial);
fish.position.set(0, 0, -5);
scene.add(fish);

// Lighting
const light = new THREE.AmbientLight(0x404040);
scene.add(light);

// Camera Position
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Movement Variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// Keyboard Controls
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW': moveForward = true; break;
    case 'KeyS': moveBackward = true; break;
    case 'KeyA': moveLeft = true; break;
    case 'KeyD': moveRight = true; break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW': moveForward = false; break;
    case 'KeyS': moveBackward = false; break;
    case 'KeyA': moveLeft = false; break;
    case 'KeyD': moveRight = false; break;
  }
});

// Mobile Joysticks
if ('ontouchstart' in window) {
  const joystickLeft = nipplejs.create({ zone: document.getElementById('joystick-left'), mode: 'static', position: { left: '50%', top: '50%' } });
  const joystickRight = nipplejs.create({ zone: document.getElementById('joystick-right'), mode: 'static', position: { left: '50%', top: '50%' } });

  joystickLeft.on('move', (evt, data) => {
    moveForward = data.vector.y < -0.5;
    moveBackward = data.vector.y > 0.5;
    moveLeft = data.vector.x < -0.5;
    moveRight = data.vector.x > 0.5;
  });

  joystickRight.on('move', (evt, data) => {
    camera.rotation.y = -data.vector.x * 0.1;
    camera.rotation.x = -data.vector.y * 0.1;
  });

  document.querySelectorAll('.joystick').forEach(joystick => joystick.style.display = 'block');
}

// Animation Loop
const animate = () => {
  requestAnimationFrame(animate);

  // Movement Logic
  if (moveForward) fish.position.z -= 0.1;
  if (moveBackward) fish.position.z += 0.1;
  if (moveLeft) fish.position.x -= 0.1;
  if (moveRight) fish.position.x += 0.1;

  renderer.render(scene, camera);
};

animate();
