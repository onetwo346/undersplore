// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Underwater ambiance
scene.background = new THREE.Color(0x0077be); // Ocean blue
scene.fog = new THREE.FogExp2(0x0077be, 0.015);

// Lighting (volumetric sun rays effect)
const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
sunLight.position.set(0, 50, 20);
scene.add(sunLight);

// Water surface
const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
const water = new THREE.Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load('https://threejs.org/examples/textures/waternormals.jpg', (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    alpha: 0.8,
    sunDirection: sunLight.position.clone().normalize(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 2.0,
    fog: true
});
water.rotation.x = -Math.PI / 2;
water.position.y = 0;
scene.add(water);

// Ocean floor (terrain-like with noise)
const floorGeometry = new THREE.PlaneGeometry(1000, 1000, 128, 128);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x4682b4, shininess: 10 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
const vertices = floorGeometry.attributes.position.array;
for (let i = 2; i < vertices.length; i += 3) {
    vertices[i] = Math.sin(i * 0.1) * 2 - 20; // Simple noise for terrain
}
floorGeometry.attributes.position.needsUpdate = true;
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Fish player (simplified as a cone with tail animation)
const fishGeometry = new THREE.ConeGeometry(0.5, 2, 16);
const fishMaterial = new THREE.MeshPhongMaterial({ color: 0xff4500, shininess: 50 });
const fish = new THREE.Mesh(fishGeometry, fishMaterial);
fish.rotation.x = Math.PI / 2;
fish.position.set(0, -5, 0);
scene.add(fish);

// Player controls
const player = {
    position: fish.position,
    velocity: new THREE.Vector3(),
    speed: 0.3,
    rotation: new THREE.Euler()
};

// Coral reefs (randomly placed cones)
const coralGroup = new THREE.Group();
for (let i = 0; i < 30; i++) {
    const coralGeometry = new THREE.ConeGeometry(Math.random() * 1 + 0.5, Math.random() * 3 + 2, 8);
    const coralMaterial = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
    const coral = new THREE.Mesh(coralGeometry, coralMaterial);
    coral.position.set(
        Math.random() * 200 - 100,
        -20 + Math.random() * 2,
        Math.random() * 200 - 100
    );
    coral.rotation.x = -Math.PI / 2;
    coralGroup.add(coral);
}
scene.add(coralGroup);

// Swaying kelp (lines with animation)
const kelpGroup = new THREE.Group();
for (let i = 0; i < 50; i++) {
    const kelpGeometry = new THREE.CylinderGeometry(0.05, 0.05, Math.random() * 5 + 3, 8);
    const kelpMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 });
    const kelp = new THREE.Mesh(kelpGeometry, kelpMaterial);
    kelp.position.set(
        Math.random() * 200 - 100,
        -20 + kelp.geometry.parameters.height / 2,
        Math.random() * 200 - 100
    );
    kelpGroup.add(kelp);
}
scene.add(kelpGroup);

// Glowing deep-sea wonder (a pulsing sphere)
const wonderGeometry = new THREE.SphereGeometry(1, 32, 32);
const wonderMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.8 });
const wonder = new THREE.Mesh(wonderGeometry, wonderMaterial);
wonder.position.set(20, -18, 20);
scene.add(wonder);

// Camera setup (third-person view)
camera.position.set(0, -2, 5);
camera.lookAt(fish.position);

// Keyboard controls
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Animation loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.05;

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

    // Apply velocity and friction
    player.position.add(player.velocity);
    player.velocity.multiplyScalar(0.92);

    // Fish animation (tail sway)
    fish.rotation.z = Math.sin(time * 2) * 0.2;

    // Update camera (follow fish)
    camera.position.set(
        player.position.x,
        player.position.y + 3,
        player.position.z + 10
    );
    camera.lookAt(player.position);

    // Animate water
    water.material.uniforms['time'].value += 0.01;

    // Animate kelp (swaying effect)
    kelpGroup.children.forEach(kelp => {
        kelp.rotation.z = Math.sin(time + kelp.position.x * 0.1) * 0.1;
    });

    // Pulse the glowing wonder
    wonder.scale.setScalar(1 + Math.sin(time) * 0.1);

    renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
