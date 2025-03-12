// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Underwater ambiance
scene.background = new THREE.Color(0x004d66); // Deep teal
scene.fog = new THREE.FogExp2(0x004d66, 0.02);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight.position.set(0, 50, 0);
scene.add(sunLight);

// Water surface
const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
const water = new THREE.Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load('https://threejs.org/examples/textures/waternormals.jpg', (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    alpha: 0.9,
    sunDirection: sunLight.position.clone().normalize(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
});
water.rotation.x = -Math.PI / 2;
water.position.y = 0;
scene.add(water);

// Ocean floor with noise for realism
const floorGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x2f4f4f, shininess: 0 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -20;
scene.add(floor);

// Human swimmer (simplified as a capsule with basic animation)
const swimmerGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
const swimmerMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });
const swimmer = new THREE.Mesh(swimmerGeometry, swimmerMaterial);
swimmer.position.set(0, -5, 0);
scene.add(swimmer);

// Player controls
const player = {
    position: swimmer.position,
    velocity: new THREE.Vector3(),
    speed: 0.2,
    rotation: new THREE.Euler()
};

// Camera setup (third-person view)
camera.position.set(0, 5, 10);
camera.lookAt(swimmer.position);

// Bioluminescent flora (procedural glowing spheres)
const floraGroup = new THREE.Group();
for (let i = 0; i < 20; i++) {
    const floraGeometry = new THREE.SphereGeometry(Math.random() * 0.5 + 0.2, 16, 16);
    const floraMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, emissive: 0x00ffff });
    const flora = new THREE.Mesh(floraGeometry, floraMaterial);
    flora.position.set(
        Math.random() * 100 - 50,
        -20 + Math.random() * 5,
        Math.random() * 100 - 50
    );
    floraGroup.add(flora);
}
scene.add(floraGroup);

// Bubbles (particle system)
const bubbleGeometry = new THREE.BufferGeometry();
const bubbleCount = 100;
const positions = new Float32Array(bubbleCount * 3);
for (let i = 0; i < bubbleCount * 3; i += 3) {
    positions[i] = Math.random() * 20 - 10;
    positions[i + 1] = -20;
    positions[i + 2] = Math.random() * 20 - 10;
}
bubbleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const bubbleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true });
const bubbles = new THREE.Points(bubbleGeometry, bubbleMaterial);
scene.add(bubbles);

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
    player.velocity.multiplyScalar(0.95);

    // Swimming animation (simple oscillation)
    swimmer.rotation.z = Math.sin(time) * 0.2;
    swimmer.rotation.x = Math.cos(time) * 0.1;

    // Update camera (follow swimmer)
    camera.position.set(
        player.position.x,
        player.position.y + 5,
        player.position.z + 10
    );
    camera.lookAt(player.position);

    // Animate water
    water.material.uniforms['time'].value += 0.01;

    // Animate bubbles
    const bubblePositions = bubbles.geometry.attributes.position.array;
    for (let i = 1; i < bubblePositions.length; i += 3) {
        bubblePositions[i] += 0.05;
        if (bubblePositions[i] > 0) bubblePositions[i] = -20; // Reset to bottom
    }
    bubbles.geometry.attributes.position.needsUpdate = true;

    // Flora glow reaction
    floraGroup.children.forEach(flora => {
        const distance = flora.position.distanceTo(player.position);
        flora.material.emissiveIntensity = Math.max(0.2, 5 / distance);
    });

    renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
