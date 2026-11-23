/**
 * MEHRANGARH 3D CITADEL & BLUE CITY TOUR
 * Three.js WebGL Interactive Tour Engine
 */

(function () {
    let scene, camera, renderer, controls;
    let canvas, container;
    let fortGroup, cityGroup, beaconGroup, dustParticles;
    let dirLight, ambientLight, hemisphereLight;
    let raycaster, mouse;
    let isTransitioningCamera = false;
    let animationFrameId;

    // Hotspots data
    const HOTSPOTS = {
        overview: {
            name: "Citadel Overview (Bhakurcheeria Hill)",
            tag: "Royal Bastion",
            camPos: { x: 95, y: 75, z: 125 },
            target: { x: 0, y: 25, z: 0 },
            title: "Mehrangarh Fort • The Citadel of the Sun",
            desc: "Founded in 1459 by Rao Jodha atop the isolated volcanic ridge of Bhakurcheeria, soaring 410 feet above the desert plains of Marwar.",
            facts: ["Elevation: 410 ft above plains", "Fort Area: 1,200 acres complex", "Builders: Rao Jodha to Takhat Singh"],
            audioTime: 12
        },
        ramparts: {
            name: "Southern Ramparts & Kilkila Cannon",
            tag: "Artillery Battery",
            camPos: { x: 38, y: 44, z: 52 },
            target: { x: 20, y: 35, z: 22 },
            title: "Kilkila Cannon & Grand Artillery Battery",
            desc: "The formidable bronze Kilkila cannon was captured from Mughal armies during Maharaja Ajit Singh's reign. Pointing over Jodhpur, its thundering report once rattled targets 4 miles distant.",
            facts: ["Weapon: Bronze Field Cannon", "View: 360° Over Blue City", "Range: Approx 4 Miles"],
            audioTime: 18
        },
        phoolmahal: {
            name: "Phool Mahal & Sheesh Mahal Palaces",
            tag: "Royal Residences",
            camPos: { x: -35, y: 55, z: 40 },
            target: { x: -8, y: 38, z: 2 },
            title: "Phool Mahal (Flower Palace) & Sheesh Mahal",
            desc: "Created by Maharaja Abhay Singh with 24-carat gold leaf looted from Ahmedabad. Adjoining is Sheesh Mahal, studded with mirror mosaics and paintings of the Raslila.",
            facts: ["Craft: 24K Gold Filigree Ceiling", "Purpose: Private Court & Classical Dance", "Glass: Convex Belgian Mirrors"],
            audioTime: 24
        },
        lohapol: {
            name: "Loha Pol (The Iron Gate)",
            tag: "Defensive Gateway",
            camPos: { x: 45, y: 28, z: 75 },
            target: { x: 28, y: 18, z: 42 },
            title: "Loha Pol & The 31 Sati Handprints",
            desc: "The heavily spiked final gate leading into the residential zenana. The stone jambs bear the carved, vermillion-tinted palm imprints of 31 royal queens who immolated themselves in 1843.",
            facts: ["Defense: Curved hairpin ramp & elephant spikes", "Memorial: 31 Sati Handprints", "Built: 15th-16th Century"],
            audioTime: 15
        },
        bluecity: {
            name: "The Blue City of Jodhpur (Navchokiya)",
            tag: "Urban Horizon",
            camPos: { x: 120, y: 30, z: -80 },
            target: { x: 50, y: 5, z: -20 },
            title: "The Indigo Sea of Navchokiya",
            desc: "Looking down from the sheer cliff walls reveals thousands of Brahmin houses painted in vivid indigo blue. The blue copper-sulfate wash repels termites, deflects desert heat, and creates Jodhpur's world-famous vista.",
            facts: ["Color: Indigo & Copper Sulfate wash", "Function: Heat insulation & insect repellant", "Heritage: 500-year-old living alleys"],
            audioTime: 30
        }
    };

    // Current State
    let currentWaypoint = "overview";
    let currentAtmosphere = "sunset"; // sunset | day | night

    // Initialize
    function init() {
        canvas = document.getElementById("citadel3dCanvas");
        container = document.getElementById("threejs-canvas-wrapper");
        if (!canvas || !container) return;

        // Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x16131c, 0.0035);

        // Camera
        camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.5, 1000);
        camera.position.set(95, 75, 125);

        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            powerPreference: "high-performance",
            alpha: false
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;

        // Controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't clip under ground
        controls.minDistance = 25;
        controls.maxDistance = 260;
        controls.target.set(0, 25, 0);

        // Raycasting for 3D clickable beacons
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        // Build Environment
        setupLighting();
        buildBhakurcheeriaCliff();
        buildCitadelFortress();
        buildBlueCityBelow();
        createHotspotBeacons();
        createDustAtmosphere();
        setAtmosphere("sunset");

        // Event Listeners
        window.addEventListener("resize", onWindowResize);
        canvas.addEventListener("click", onCanvasClick);
        setupHUDControls();

        // Render loop
        animate();
    }

    // Set Lighting
    function setupLighting() {
        ambientLight = new THREE.AmbientLight(0xffecd6, 0.6);
        scene.add(ambientLight);

        hemisphereLight = new THREE.HemisphereLight(0xffbe85, 0x111c33, 0.7);
        scene.add(hemisphereLight);

        dirLight = new THREE.DirectionalLight(0xffaa5e, 1.8);
        dirLight.position.set(120, 100, 80);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 10;
        dirLight.shadow.camera.far = 350;
        const d = 90;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.bias = -0.0005;
        scene.add(dirLight);
    }

    // Build Rocky Plateau (Bhakurcheeria Hill)
    function buildBhakurcheeriaCliff() {
        const hillGroup = new THREE.Group();
        
        // Rocky Mountain Material
        const rockMat = new THREE.MeshStandardMaterial({
            color: 0x99582a,
            roughness: 0.95,
            metalness: 0.05,
            flatShading: true
        });

        // Layered stepped cliff
        const cliffBase = new THREE.CylinderGeometry(52, 70, 32, 14, 2);
        // Perturb vertices for rugged natural volcanic basalt look
        const pos = cliffBase.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const vx = pos.getX(i);
            const vy = pos.getY(i);
            const vz = pos.getZ(i);
            const noise = (Math.sin(vx * 0.2) + Math.cos(vz * 0.2)) * 3;
            pos.setX(i, vx + (Math.random() - 0.5) * 4);
            pos.setZ(i, vz + (Math.random() - 0.5) * 4);
            pos.setY(i, vy + noise * 0.5);
        }
        cliffBase.computeVertexNormals();

        const cliffMesh = new THREE.Mesh(cliffBase, rockMat);
        cliffMesh.position.y = 16;
        cliffMesh.receiveShadow = true;
        cliffMesh.castShadow = true;
        hillGroup.add(cliffMesh);

        // Ground desert plains
        const desertGeo = new THREE.PlaneGeometry(600, 600, 20, 20);
        const desertMat = new THREE.MeshStandardMaterial({
            color: 0xc49a6c,
            roughness: 0.9,
            metalness: 0.0
        });
        const desertMesh = new THREE.Mesh(desertGeo, desertMat);
        desertMesh.rotation.x = -Math.PI / 2;
        desertMesh.position.y = 0;
        desertMesh.receiveShadow = true;
        hillGroup.add(desertMesh);

        scene.add(hillGroup);
    }

    // Build Mehrangarh Sandstone Citadel Complex
    function buildCitadelFortress() {
        fortGroup = new THREE.Group();

        // Sandstone materials
        const sandstoneMat = new THREE.MeshStandardMaterial({
            color: 0xd4a373,
            roughness: 0.75,
            metalness: 0.05
        });

        const darkSandstoneMat = new THREE.MeshStandardMaterial({
            color: 0xb57c48,
            roughness: 0.85,
            metalness: 0.05
        });

        const goldTrimMat = new THREE.MeshStandardMaterial({
            color: 0xffd166,
            roughness: 0.35,
            metalness: 0.65
        });

        // 1. Massive Curtain Walls & Bastions (Curved defensive battlements)
        const wallRadius = 45;
        const bastionCount = 8;
        for (let i = 0; i < bastionCount; i++) {
            const angle = (i / bastionCount) * Math.PI * 1.5 - 0.4;
            const bx = Math.cos(angle) * wallRadius;
            const bz = Math.sin(angle) * wallRadius;

            // Semi-circular projecting bastion
            const bastionGeo = new THREE.CylinderGeometry(7, 8.5, 26, 12);
            const bastionMesh = new THREE.Mesh(bastionGeo, darkSandstoneMat);
            bastionMesh.position.set(bx, 38, bz);
            bastionMesh.castShadow = true;
            bastionMesh.receiveShadow = true;
            fortGroup.add(bastionMesh);

            // Bastion crenelated top
            const topGeo = new THREE.CylinderGeometry(7.8, 7, 3, 12);
            const topMesh = new THREE.Mesh(topGeo, sandstoneMat);
            topMesh.position.set(bx, 51.5, bz);
            topMesh.castShadow = true;
            fortGroup.add(topMesh);
        }

        // Connecting Curtain Wall segments
        const wallGeo = new THREE.BoxGeometry(70, 22, 10);
        const wall1 = new THREE.Mesh(wallGeo, sandstoneMat);
        wall1.position.set(10, 39, 36);
        wall1.rotation.y = -0.3;
        wall1.castShadow = true;
        wall1.receiveShadow = true;
        fortGroup.add(wall1);

        const wall2 = new THREE.Mesh(wallGeo, sandstoneMat);
        wall2.position.set(-25, 39, 15);
        wall2.rotation.y = 0.8;
        wall2.castShadow = true;
        wall2.receiveShadow = true;
        fortGroup.add(wall2);

        // 2. Central Multi-Storeyed Palatial Complex (Phool Mahal / Moti Mahal / Zenana)
        // Main Palace Keep
        const palaceBlock1 = new THREE.Mesh(
            new THREE.BoxGeometry(34, 30, 24),
            sandstoneMat
        );
        palaceBlock1.position.set(-6, 44, 2);
        palaceBlock1.castShadow = true;
        palaceBlock1.receiveShadow = true;
        fortGroup.add(palaceBlock1);

        // Higher Tier (Takhat Vilas / Jhanki Mahal)
        const palaceBlock2 = new THREE.Mesh(
            new THREE.BoxGeometry(22, 18, 18),
            sandstoneMat
        );
        palaceBlock2.position.set(-8, 62, 0);
        palaceBlock2.castShadow = true;
        palaceBlock2.receiveShadow = true;
        fortGroup.add(palaceBlock2);

        // Jharokha (Overhanging carved balconies) on palace facade
        for (let j = 0; j < 5; j++) {
            const jharokha = new THREE.Mesh(
                new THREE.BoxGeometry(3, 4.5, 2.5),
                darkSandstoneMat
            );
            jharokha.position.set(-20 + j * 7, 46 + (j % 2) * 6, 15);
            jharokha.castShadow = true;
            fortGroup.add(jharokha);
        }

        // 3. Iconic Rajput Chhatris (Domed pavilions with carved pillars)
        function createChhatri(x, y, z, scale = 1) {
            const chhatriGroup = new THREE.Group();
            // 4 Pillars
            const pillarGeo = new THREE.CylinderGeometry(0.3 * scale, 0.3 * scale, 3.5 * scale, 8);
            const pOffsets = [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]];
            pOffsets.forEach(pt => {
                const pillar = new THREE.Mesh(pillarGeo, sandstoneMat);
                pillar.position.set(pt[0] * scale, 1.75 * scale, pt[1] * scale);
                pillar.castShadow = true;
                chhatriGroup.add(pillar);
            });
            // Fluted Rajput Dome
            const domeGeo = new THREE.SphereGeometry(2.2 * scale, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
            const dome = new THREE.Mesh(domeGeo, sandstoneMat);
            dome.position.y = 3.5 * scale;
            dome.castShadow = true;
            chhatriGroup.add(dome);
            // Kalash finial
            const finial = new THREE.Mesh(new THREE.ConeGeometry(0.4 * scale, 1.2 * scale, 8), goldTrimMat);
            finial.position.y = 5.7 * scale;
            chhatriGroup.add(finial);

            chhatriGroup.position.set(x, y, z);
            return chhatriGroup;
        }

        fortGroup.add(createChhatri(-18, 71, -8, 1.3));
        fortGroup.add(createChhatri(2, 71, -8, 1.3));
        fortGroup.add(createChhatri(-18, 71, 8, 1.3));
        fortGroup.add(createChhatri(2, 71, 8, 1.3));
        fortGroup.add(createChhatri(22, 53, 30, 1.1));

        // 4. Kilkila Cannon on the Southern Rampart
        const cannonGroup = new THREE.Group();
        // Bronze Cannon Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.7, 1.2, 8, 14);
        const bronzeMat = new THREE.MeshStandardMaterial({
            color: 0x475569,
            roughness: 0.3,
            metalness: 0.85
        });
        const barrel = new THREE.Mesh(barrelGeo, bronzeMat);
        barrel.rotation.z = Math.PI / 2.3;
        barrel.rotation.y = 0.4;
        barrel.position.y = 1.6;
        barrel.castShadow = true;
        cannonGroup.add(barrel);

        // Carriage Wheels
        const wheelGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 14);
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9 });
        const wheelL = new THREE.Mesh(wheelGeo, woodMat);
        wheelL.rotation.x = Math.PI / 2;
        wheelL.position.set(-1.2, 1.5, 0);
        wheelL.castShadow = true;
        cannonGroup.add(wheelL);

        const wheelR = wheelL.clone();
        wheelR.position.set(1.2, 1.5, 0);
        cannonGroup.add(wheelR);

        cannonGroup.position.set(22, 53, 24);
        fortGroup.add(cannonGroup);

        // 5. Royal Rathore Banner (Flagpole with Jodhpur Red-Yellow flag)
        const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 16, 8);
        const pole = new THREE.Mesh(poleGeo, goldTrimMat);
        pole.position.set(-8, 78, 0);
        pole.castShadow = true;
        fortGroup.add(pole);

        const flagGeo = new THREE.PlaneGeometry(6, 3.5);
        const flagMat = new THREE.MeshBasicMaterial({
            color: 0xffb703,
            side: THREE.DoubleSide
        });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(-5, 83, 0);
        flag.rotation.y = 0.2;
        fortGroup.add(flag);

        scene.add(fortGroup);
    }

    // Build The Famous "Blue City" of Jodhpur below the plateau
    function buildBlueCityBelow() {
        cityGroup = new THREE.Group();

        // Indigo / Sky / Cobalt blue variations of Jodhpur houses
        const blueColors = [0x0284c7, 0x0369a1, 0x38bdf8, 0x0ea5e9, 0x025682, 0x1d4ed8, 0xe0e7ff];
        const materials = blueColors.map(col => new THREE.MeshStandardMaterial({
            color: col,
            roughness: 0.8,
            metalness: 0.05
        }));

        // Scatter 200+ cubic houses around the perimeter of the hill
        for (let i = 0; i < 220; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 75 + Math.random() * 120;
            const hx = Math.cos(angle) * dist;
            const hz = Math.sin(angle) * dist;

            const w = 4 + Math.random() * 5;
            const h = 3 + Math.random() * 7;
            const d = 4 + Math.random() * 5;

            const houseGeo = new THREE.BoxGeometry(w, h, d);
            const mat = materials[Math.floor(Math.random() * materials.length)];
            const house = new THREE.Mesh(houseGeo, mat);
            house.position.set(hx, h / 2, hz);
            house.rotation.y = Math.random() * Math.PI;
            house.receiveShadow = true;
            house.castShadow = true;
            cityGroup.add(house);
        }

        scene.add(cityGroup);
    }

    // Create Clickable 3D Hotspot Beacons
    function createHotspotBeacons() {
        beaconGroup = new THREE.Group();

        const beaconData = [
            { key: "overview", pos: [0, 68, 0] },
            { key: "ramparts", pos: [22, 57, 24] },
            { key: "phoolmahal", pos: [-10, 62, 5] },
            { key: "lohapol", pos: [28, 38, 42] },
            { key: "bluecity", pos: [70, 15, -45] }
        ];

        beaconData.forEach(item => {
            const beacon = new THREE.Group();
            beacon.userData = { key: item.key };

            // Outer Pulsing Ring
            const ringGeo = new THREE.RingGeometry(1.2, 1.8, 24);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0xffd166,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            beacon.add(ring);

            // Core Glowing Sphere
            const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
            const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            sphere.position.y = 1.2;
            beacon.add(sphere);

            // Light from beacon
            const pLight = new THREE.PointLight(0xffd166, 1.5, 12);
            pLight.position.y = 1.5;
            beacon.add(pLight);

            beacon.position.set(item.pos[0], item.pos[1], item.pos[2]);
            beaconGroup.add(beacon);
        });

        scene.add(beaconGroup);
    }

    // Floating Desert Dust / Atmospheric motes
    function createDustAtmosphere() {
        const particleCount = 200;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 220;
            positions[i + 1] = Math.random() * 80;
            positions[i + 2] = (Math.random() - 0.5) * 220;
        }

        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: 0xffd166,
            size: 1.2,
            transparent: true,
            opacity: 0.45
        });

        dustParticles = new THREE.Points(geo, mat);
        scene.add(dustParticles);
    }

    // Set Lighting Atmosphere (Sunset, Day, Night)
    function setAtmosphere(mode) {
        currentAtmosphere = mode;
        const duration = 1;

        if (mode === "sunset") {
            gsap.to(renderer, { duration, toneMappingExposure: 1.15 });
            gsap.to(dirLight.color, { duration, r: 1.0, g: 0.65, b: 0.35 });
            gsap.to(dirLight, { duration, intensity: 2.0 });
            gsap.to(ambientLight.color, { duration, r: 0.95, g: 0.8, b: 0.65 });
            gsap.to(scene.fog.color, { duration, r: 0.12, g: 0.08, b: 0.15 });
            scene.background = new THREE.Color(0x201309);
            document.body.className = "theme-dusk";
        } else if (mode === "day") {
            gsap.to(renderer, { duration, toneMappingExposure: 1.0 });
            gsap.to(dirLight.color, { duration, r: 1.0, g: 0.95, b: 0.9 });
            gsap.to(dirLight, { duration, intensity: 2.2 });
            gsap.to(ambientLight.color, { duration, r: 0.85, g: 0.9, b: 1.0 });
            gsap.to(scene.fog.color, { duration, r: 0.35, g: 0.45, b: 0.6 });
            scene.background = new THREE.Color(0x38bdf8);
            document.body.className = "theme-day";
        } else if (mode === "night") {
            gsap.to(renderer, { duration, toneMappingExposure: 0.9 });
            gsap.to(dirLight.color, { duration, r: 0.25, g: 0.35, b: 0.7 });
            gsap.to(dirLight, { duration, intensity: 0.6 });
            gsap.to(ambientLight.color, { duration, r: 0.1, g: 0.15, b: 0.3 });
            gsap.to(scene.fog.color, { duration, r: 0.02, g: 0.03, b: 0.07 });
            scene.background = new THREE.Color(0x050811);
            document.body.className = "theme-night";
        }
    }

    // Smooth Camera Transition to Hotspot
    function flyToWaypoint(key) {
        const spot = HOTSPOTS[key];
        if (!spot || isTransitioningCamera) return;

        currentWaypoint = key;
        isTransitioningCamera = true;

        // Update HUD waypoint active button
        document.querySelectorAll(".vp-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.cam === key);
        });

        // Update location badge
        const badge = document.getElementById("currentHotspotName");
        if (badge) badge.textContent = spot.name;

        // Show HUD info card
        showHotspotCard(spot);

        // Animate camera position and target with GSAP
        gsap.to(camera.position, {
            x: spot.camPos.x,
            y: spot.camPos.y,
            z: spot.camPos.z,
            duration: 1.8,
            ease: "power2.inOut"
        });

        gsap.to(controls.target, {
            x: spot.target.x,
            y: spot.target.y,
            z: spot.target.z,
            duration: 1.8,
            ease: "power2.inOut",
            onComplete: () => {
                isTransitioningCamera = false;
            }
        });
    }

    // Populate HUD Info Card
    function showHotspotCard(spot) {
        const card = document.getElementById("hudInfoCard");
        if (!card) return;

        document.getElementById("hudCardTag").textContent = spot.tag;
        document.getElementById("hudCardTitle").textContent = spot.title;
        document.getElementById("hudCardDesc").textContent = spot.desc;

        const factsBox = document.getElementById("hudCardFacts");
        if (factsBox && spot.facts) {
            factsBox.innerHTML = spot.facts.map(f => `<span><i class="fas fa-landmark"></i> ${f}</span>`).join("");
        }

        card.style.display = "block";
    }

    // Canvas click raycaster
    function onCanvasClick(event) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(beaconGroup.children, true);

        if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj && !obj.userData.key && obj.parent) {
                obj = obj.parent;
            }
            if (obj && obj.userData.key) {
                flyToWaypoint(obj.userData.key);
            }
        }
    }

    // HUD Button Controls
    function setupHUDControls() {
        // Viewpoints buttons
        document.querySelectorAll(".vp-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const key = btn.dataset.cam;
                flyToWaypoint(key);
            });
        });

        // Atmosphere controls
        document.querySelectorAll(".atmos-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".atmos-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                setAtmosphere(btn.dataset.time);
            });
        });

        // Card close
        const closeBtn = document.getElementById("hudCardClose");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                document.getElementById("hudInfoCard").style.display = "none";
            });
        }

        // Global lighting button on header
        const lightingToggleBtn = document.getElementById("lightingToggleBtn");
        if (lightingToggleBtn) {
            lightingToggleBtn.addEventListener("click", () => {
                const modes = ["sunset", "day", "night"];
                const next = modes[(modes.indexOf(currentAtmosphere) + 1) % modes.length];
                setAtmosphere(next);
                const label = document.getElementById("lightingLabel");
                if (label) label.textContent = next.charAt(0).toUpperCase() + next.slice(1);
            });
        }
    }

    // Resize Handler
    function onWindowResize() {
        if (!container || !camera || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    // Render loop
    function animate() {
        animationFrameId = requestAnimationFrame(animate);

        controls.update();

        // Animate beacon rings pulsing
        if (beaconGroup) {
            const time = performance.now() * 0.003;
            beaconGroup.children.forEach((beacon, idx) => {
                const ring = beacon.children[0];
                if (ring) {
                    ring.scale.setScalar(1 + Math.sin(time + idx) * 0.2);
                    ring.rotation.z += 0.01;
                }
            });
        }

        // Gentle dust drift
        if (dustParticles) {
            dustParticles.rotation.y += 0.0006;
        }

        // Slow auto rotation when idle
        if (!isTransitioningCamera && !controls.state == -1) {
            scene.rotation.y += 0.0004;
        }

        renderer.render(scene, camera);
    }

    // Expose public API for tour navigation from outside
    window.Mehrangarh3D = {
        init,
        flyToWaypoint,
        setAtmosphere
    };

    // Auto init on DOMContentLoaded or immediate
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
