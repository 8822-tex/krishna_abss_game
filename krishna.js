"use strict";

/* =========================================================
   KRISHNA'S ABSS MAP
   krishna.js
   Three.js r180
   ========================================================= */

/* =========================================================
   BASIC DOM HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

const requiredIds = [
    "gameCanvas",
    "loadingScreen",
    "loadingProgress",
    "loadingText",
    "accountScreen",
    "nameInput",
    "passwordInput",
    "createAccountButton",
    "characterScreen",
    "boyButton",
    "girlButton",
    "photoInput",
    "photoPreview",
    "finishCharacterButton",
    "loginScreen",
    "loginPassword",
    "loginButton",
    "gameUI",
    "menuButton",
    "missionHUD",
    "missionText",
    "interactionMessage",
    "dialogueBox",
    "dialogueText",
    "navigationArrow",
    "minimap",
    "playerMarker",
    "lookArea",
    "joystick",
    "joystickKnob",
    "jumpButton",
    "runButton",
    "interactButton",
    "menuScreen",
    "resumeButton",
    "mapButton",
    "missionsButton",
    "settingsButton",
    "mapScreen",
    "closeMapButton",
    "missionsScreen",
    "missionList",
    "closeMissionsButton",
    "settingsScreen",
    "qualityLow",
    "qualityMedium",
    "qualityHigh",
    "closeSettingsButton"
];

for (const id of requiredIds) {
    if (!$(`${id}`)) {
        console.error(`ABSS MAP: Missing HTML element #${id}`);
    }
}


/* =========================================================
   THREE.JS CHECK
   ========================================================= */

if (typeof THREE === "undefined") {
    throw new Error(
        "Three.js failed to load. Check internet connection/CDN."
    );
}


/* =========================================================
   GAME VARIABLES
   ========================================================= */

let scene;
let camera;
let renderer;

let clock;
let player;
let playerBody;

let ambientLight;
let sunLight;

let gameStarted = false;
let gamePaused = false;

let selectedGender = "boy";
let playerName = "";

let currentMission = 0;
let dialogueTimer = null;

let quality = "high";

let worldTime = 8.0;

const keys = {};

const playerVelocity = new THREE.Vector3();

let isRunning = false;
let isJumping = false;
let canJump = true;

let moveX = 0;
let moveZ = 0;

let lookPointerId = null;
let lastLookX = 0;
let lastLookY = 0;

let yaw = 0;
let pitch = -0.15;

const playerHeight = 1.75;
const walkSpeed = 3.2;
const runSpeed = 6.0;
const jumpPower = 7.0;
const gravity = 20.0;

const cameraDistance = 5.0;
const cameraHeight = 2.2;


/* =========================================================
   WORLD ARRAYS
   ========================================================= */

const colliders = [];
const doors = [];
const interactiveObjects = [];
const trees = [];
const animals = [];
const npcs = [];

const missions = [
    {
        text: "Visit Main Gate",
        target: new THREE.Vector3(0, 0, -62)
    },
    {
        text: "Enter ABSS College",
        target: new THREE.Vector3(0, 0, -20)
    },
    {
        text: "Visit Reception",
        target: new THREE.Vector3(0, 0, -13)
    },
    {
        text: "Visit Teachers' Office",
        target: new THREE.Vector3(-6, 0, -13)
    },
    {
        text: "Explore the Campus",
        target: new THREE.Vector3(30, 0, 12)
    },
    {
        text: "Visit CSA Boys Hostel",
        target: new THREE.Vector3(-43, 0, 20)
    },
    {
        text: "Visit Girls Hostel",
        target: new THREE.Vector3(43, 0, 20)
    },
    {
        text: "Visit Sports Ground",
        target: new THREE.Vector3(0, 0, 48)
    },
    {
        text: "ABSS Campus Explorer Complete",
        target: new THREE.Vector3(0, 0, 0)
    }
];


/* =========================================================
   MATERIAL HELPERS
   ========================================================= */

function material(color, roughness = 0.8) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness: 0
    });
}

const MAT = {
    grass: material(0x4f7d3c),
    grassDark: material(0x355d2b),
    road: material(0x555555),
    roadLight: material(0x686868),

    redBrick: material(0x8f3428),
    redDark: material(0x65251e),
    white: material(0xe9e9e9),

    glass: new THREE.MeshPhysicalMaterial({
        color: 0x7bb9d6,
        roughness: 0.08,
        metalness: 0.15,
        transparent: true,
        opacity: 0.45
    }),

    roof: material(0xb9b9b9),

    wood: material(0x6f4227),
    desk: material(0x8a5937),

    black: material(0x111111),
    metal: material(0x777777, 0.35),

    flowerRed: material(0xd93434),
    flowerYellow: material(0xf0c52f),
    flowerWhite: material(0xffffff),

    water: new THREE.MeshPhysicalMaterial({
        color: 0x2c89c9,
        roughness: 0.15,
        metalness: 0.1,
        transparent: true,
        opacity: 0.75
    })
};


/* =========================================================
   GEOMETRY HELPERS
   ========================================================= */

function box(
    width,
    height,
    depth,
    mat,
    x = 0,
    y = height / 2,
    z = 0
) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        mat
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;
}


function cylinder(
    radius,
    height,
    mat,
    x = 0,
    y = height / 2,
    z = 0,
    radialSegments = 16
) {
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(
            radius,
            radius,
            height,
            radialSegments
        ),
        mat
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;
}


function sphere(
    radius,
    mat,
    x = 0,
    y = radius,
    z = 0
) {
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 16, 12),
        mat
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;
}


/* =========================================================
   COLLIDER
   ========================================================= */

function addCollider(
    x,
    z,
    width,
    depth,
    minY = 0,
    maxY = 10
) {
    colliders.push({
        minX: x - width / 2,
        maxX: x + width / 2,
        minZ: z - depth / 2,
        maxZ: z + depth / 2,
        minY,
        maxY
    });
}


/* =========================================================
   GROUND
   ========================================================= */

function createGround() {
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(180, 180),
        MAT.grass
    );

    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    scene.add(ground);

    /* Main road */
    box(9, 0.08, 180, MAT.road, 0, 0.04, 0);
    box(180, 0.08, 8, MAT.road, 0, 0.05, 0);

    /* Side roads */
    box(7, 0.08, 100, MAT.roadLight, -48, 0.05, 0);
    box(7, 0.08, 100, MAT.roadLight, 48, 0.05, 0);

    /* Road strips */
    for (let z = -80; z <= 80; z += 10) {
        box(0.25, 0.09, 4, MAT.white, 0, 0.095, z);
    }
}


/* =========================================================
   BUILDING
   ========================================================= */

function createBuilding(
    name,
    x,
    z,
    width,
    depth,
    floors = 4
) {
    const group = new THREE.Group();
    group.name = name;

    const floorHeight = 3.2;
    const totalHeight = floors * floorHeight;

    const main = new THREE.Mesh(
        new THREE.BoxGeometry(
            width,
            totalHeight,
            depth
        ),
        MAT.redBrick
    );

    main.position.y = totalHeight / 2;

    main.castShadow = true;
    main.receiveShadow = true;

    group.add(main);

    /* White horizontal bands */
    for (let f = 1; f < floors; f++) {
        const band = new THREE.Mesh(
            new THREE.BoxGeometry(
                width + 0.15,
                0.15,
                depth + 0.15
            ),
            MAT.white
        );

        band.position.y = f * floorHeight;

        group.add(band);
    }

    /* Roof */
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(
            width + 0.8,
            0.3,
            depth + 0.8
        ),
        MAT.roof
    );

    roof.position.y = totalHeight + 0.15;
    group.add(roof);

    /* Front windows */
    const windowRows = floors;

    for (let floor = 0; floor < windowRows; floor++) {

        const y = 1.4 + floor * floorHeight;

        for (let wx = -width / 2 + 2.2;
             wx <= width / 2 - 2.2;
             wx += 3.2) {

            const windowMesh = new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.5,
                    1.45,
                    0.08
                ),
                MAT.glass
            );

            windowMesh.position.set(
                wx,
                y,
                depth / 2 + 0.05
            );

            group.add(windowMesh);

            const frameTop = new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.65,
                    0.08,
                    0.12
                ),
                MAT.white
            );

            frameTop.position.set(
                wx,
                y + 0.76,
                depth / 2 + 0.08
            );

            group.add(frameTop);
        }
    }

    /* Entrance */
    const entrance = new THREE.Mesh(
        new THREE.BoxGeometry(
            4.0,
            2.8,
            0.15
        ),
        MAT.glass
    );

    entrance.position.set(
        0,
        1.4,
        depth / 2 + 0.12
    );

    group.add(entrance);

    /* Door frame */
    const leftFrame = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.15,
            2.9,
            0.25
        ),
        MAT.white
    );

    leftFrame.position.set(
        -2.1,
        1.45,
        depth / 2 + 0.12
    );

    group.add(leftFrame);

    const rightFrame = leftFrame.clone();
    rightFrame.position.x = 2.1;
    group.add(rightFrame);

    group.position.set(x, 0, z);

    scene.add(group);

    addCollider(
        x,
        z,
        width,
        depth
    );

    return group;
}


/* =========================================================
   COLLEGE COMPLEX
   ========================================================= */

function createCollege() {

    createBuilding(
        "Mahatma Gandhi Block",
        -18,
        -17,
        25,
        20,
        4
    );

    createBuilding(
        "Main ABSS College",
        12,
        -17,
        30,
        22,
        4
    );

    createBuilding(
        "Vishvesvaraya Block",
        -18,
        13,
        25,
        20,
        4
    );

    createBuilding(
        "Madan Mohan Malviya Block",
        15,
        15,
        28,
        21,
        4
    );
}


/* =========================================================
   HOSTELS
   ========================================================= */

function createHostel(name, x, z) {

    const hostel = createBuilding(
        name,
        x,
        z,
        28,
        20,
        4
    );

    /* Hostel balconies */
    for (let floor = 0; floor < 4; floor++) {

        const balconyY = 1.5 + floor * 3.2;

        const balcony = box(
            25,
            0.18,
            1.5,
            MAT.white,
            x,
            balconyY,
            z + 11
        );

        balcony.castShadow = true;
    }

    return hostel;
}


/* =========================================================
   MAIN GATE
   ========================================================= */

function createMainGate() {

    const pillarHeight = 7;

    box(
        4,
        pillarHeight,
        4,
        MAT.redBrick,
        -8,
        pillarHeight / 2,
        -66
    );

    box(
        4,
        pillarHeight,
        4,
        MAT.redBrick,
        8,
        pillarHeight / 2,
        -66
    );

    /* Gate header */
    box(
        20,
        1.2,
        1.0,
        MAT.redBrick,
        0,
        6.4,
        -66
    );

    /* Gate leaves */
    const leftGate = box(
        7.5,
        4.5,
        0.35,
        MAT.metal,
        -4,
        2.25,
        -66
    );

    const rightGate = box(
        7.5,
        4.5,
        0.35,
        MAT.metal,
        4,
        2.25,
        -66
    );

    doors.push({
        type: "gate",
        left: leftGate,
        right: rightGate,
        open: false
    });

    /* Sign */
    const sign = box(
        15,
        1.5,
        0.2,
        MAT.white,
        0,
        6.35,
        -65.4
    );

    sign.material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.55
    });

    addCollider(
        -8,
        -66,
        4,
        4,
        0,
        7
    );

    addCollider(
        8,
        -66,
        4,
        4,
        0,
        7
    );
}


/* =========================================================
   PATHS
   ========================================================= */

function createPath(x, z, width, depth) {
    box(
        width,
        0.12,
        depth,
        MAT.roadLight,
        x,
        0.07,
        z
    );
}


/* =========================================================
   TREES
   ========================================================= */

function createTree(x, z, scale = 1) {

    const group = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.25 * scale,
            0.35 * scale,
            2.5 * scale,
            10
        ),
        MAT.wood
    );

    trunk.position.y = 1.25 * scale;
    trunk.castShadow = true;

    group.add(trunk);

    const crown = new THREE.Mesh(
        new THREE.SphereGeometry(
            1.65 * scale,
            14,
            12
        ),
        MAT.grassDark
    );

    crown.position.y = 3.1 * scale;
    crown.castShadow = true;

    group.add(crown);

    group.position.set(x, 0, z);

    scene.add(group);

    trees.push({
        object: group,
        baseY: 0,
        phase: Math.random() * Math.PI * 2
    });
}


/* =========================================================
   PALM TREE
   ========================================================= */

function createPalm(x, z, scale = 1) {

    const group = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.22 * scale,
            0.4 * scale,
            5 * scale,
            10
        ),
        MAT.wood
    );

    trunk.position.y = 2.5 * scale;

    group.add(trunk);

    for (let i = 0; i < 7; i++) {

        const leaf = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18 * scale,
                0.12 * scale,
                2.8 * scale
            ),
            MAT.grassDark
        );

        leaf.position.y = 5.1 * scale;

        leaf.rotation.y =
            (Math.PI * 2 * i) / 7;

        leaf.rotation.x = -0.35;

        group.add(leaf);
    }

    group.position.set(x, 0, z);

    scene.add(group);

    trees.push({
        object: group,
        baseY: 0,
        phase: Math.random() * Math.PI * 2
    });
}


/* =========================================================
   GARDEN
   ========================================================= */

function createGarden(x, z, width, depth) {

    const garden = box(
        width,
        0.08,
        depth,
        MAT.grassDark,
        x,
        0.04,
        z
    );

    garden.receiveShadow = true;

    for (let i = 0; i < 14; i++) {

        const px =
            x - width / 2 +
            Math.random() * width;

        const pz =
            z - depth / 2 +
            Math.random() * depth;

        const flowerMat =
            i % 3 === 0
                ? MAT.flowerRed
                : i % 3 === 1
                    ? MAT.flowerYellow
                    : MAT.flowerWhite;

        sphere(
            0.10,
            flowerMat,
            px,
            0.12,
            pz
        );
    }
}


/* =========================================================
   SPORTS GROUND
   ========================================================= */

function createSportsGround() {

    const court = box(
        42,
        0.12,
        28,
        material(0x9b4936),
        0,
        0.06,
        48
    );

    court.receiveShadow = true;

    /* Court lines */
    box(
        0.12,
        0.15,
        27,
        MAT.white,
        0,
        0.15,
        48
    );

    box(
        40,
        0.15,
        0.12,
        MAT.white,
        0,
        0.15,
        48
    );

    /* Basketball hoop */
    const pole = cylinder(
        0.10,
        3.4,
        MAT.metal,
        -14,
        1.7,
        48
    );

    const board = box(
        1.4,
        0.9,
        0.12,
        MAT.white,
        -14,
        3.7,
        48
    );

    box(
        1.2,
        0.08,
        0.12,
        MAT.metal,
        -14,
        3.25,
        47.8
    );
}


/* =========================================================
   INTERIOR ROOM
   ========================================================= */

function createRoomFurniture(x, z) {

    /* Teacher desk */
    box(
        2.4,
        0.8,
        1.0,
        MAT.desk,
        x,
        0.4,
        z
    );

    /* Student benches */
    for (let row = 0; row < 3; row++) {

        box(
            3.2,
            0.65,
            0.7,
            MAT.wood,
            x,
            0.33,
            z + 2.0 + row * 1.7
        );

        box(
            3.2,
            0.65,
            0.7,
            MAT.wood,
            x,
            0.33,
            z + 2.9 + row * 1.7
        );
    }

    /* Board */
    box(
        5,
        1.8,
        0.12,
        material(0x18351d),
        x,
        2.2,
        z - 4
    );
}


/* =========================================================
   RECEPTION
   ========================================================= */

function createReception() {

    const receptionDesk = box(
        4.5,
        1.1,
        1.5,
        MAT.desk,
        0,
        0.55,
        -10
    );

    interactiveObjects.push({
        object: receptionDesk,
        type: "reception",
        name: "ABSS Reception"
    });

    /* ABSS sign */
    box(
        2.2,
        0.8,
        0.08,
        MAT.white,
        0,
        1.25,
        -10.8
    );

    /* Reception mam */
    const mam = createNPC(
        "Reception Mam",
        0,
        0,
        -8.2
    );

    mam.userData.role = "reception";

    /* Teachers office immediately left */
    box(
        7,
        0.08,
        5,
        MAT.wood,
        -6,
        0.04,
        -12
    );

    interactiveObjects.push({
        object: mam,
        type: "receptionMam",
        name: "Reception Mam"
    });

    /* Teachers' office interaction */
    const officePoint = sphere(
        0.35,
        MAT.flowerYellow,
        -6,
        0.35,
        -9
    );

    officePoint.visible = false;

    interactiveObjects.push({
        object: officePoint,
        type: "teachersOffice",
        name: "Teachers' Office"
    });
}


/* =========================================================
   NPC
   ========================================================= */

function createNPC(name, x, y, z) {

    const group = new THREE.Group();

    group.name = name;

    const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(
            0.32,
            0.8,
            4,
            8
        ),
        material(0x315c91)
    );

    body.position.y = 1.0;

    group.add(body);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.30,
            16,
            12
        ),
        material(0xc98f68)
    );

    head.position.y = 1.85;

    group.add(head);

    group.position.set(x, y, z);

    scene.add(group);

    const npc = {
        object: group,
        name,
        home: new THREE.Vector3(x, y, z),
        phase: Math.random() * Math.PI * 2
    };

    npcs.push(npc);

    return group;
}


/* =========================================================
   PLAYER
   ========================================================= */

function createPlayer() {

    player = new THREE.Group();
    player.name = "Player";

    /* Legs */
    const legMaterial =
        selectedGender === "girl"
            ? material(0x222222)
            : material(0x1f2c42);

    const leftLeg = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.24,
            0.9,
            0.28
        ),
        legMaterial
    );

    leftLeg.position.set(
        -0.17,
        0.45,
        0
    );

    leftLeg.castShadow = true;

    const rightLeg = leftLeg.clone();

    rightLeg.position.x = 0.17;

    player.add(leftLeg);
    player.add(rightLeg);

    /* Shoes */
    const shoeMaterial = material(0x151515);

    const leftShoe = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.34,
            0.18,
            0.55
        ),
        shoeMaterial
    );

    leftShoe.position.set(
        -0.17,
        0.08,
        -0.10
    );

    player.add(leftShoe);

    const rightShoe = leftShoe.clone();

    rightShoe.position.x = 0.17;

    player.add(rightShoe);

    /* Body */
    const shirtMaterial = material(
        selectedGender === "girl"
            ? 0x9e3030
            : 0x9e3030
    );

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.75,
            0.95,
            0.42
        ),
        shirtMaterial
    );

    body.position.y = 1.25;

    body.castShadow = true;

    player.add(body);

    /* ABSSIT back/front plate */
    const logo = box(
        0.45,
        0.25,
        0.03,
        MAT.white,
        0,
        1.35,
        -0.23
    );

    logo.parent = player;

    /* Arms */
    const armMaterial = material(0xc98f68);

    const leftArm = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.18,
            0.75,
            0.18
        ),
        armMaterial
    );

    leftArm.position.set(
        -0.48,
        1.28,
        0
    );

    player.add(leftArm);

    const rightArm = leftArm.clone();

    rightArm.position.x = 0.48;

    player.add(rightArm);

    /* Head */
    const headMaterial = material(0xc98f68);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.34,
            18,
            14
        ),
        headMaterial
    );

    head.position.y = 2.05;

    head.castShadow = true;

    player.add(head);

    /* Hair */
    const hair = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.35,
            18,
            10,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2
        ),
        material(0x18120d)
    );

    hair.position.y = 2.17;

    player.add(hair);

    player.userData.leftLeg = leftLeg;
    player.userData.rightLeg = rightLeg;
    player.userData.leftArm = leftArm;
    player.userData.rightArm = rightArm;

    player.position.set(
        0,
        0,
        -76
    );

    scene.add(player);

    playerBody = player;

    /* Basic starting collider */
    return player;
}


/* =========================================================
   PLAYER ANIMATION
   ========================================================= */

function animatePlayer(delta) {

    if (!player) {
        return;
    }

    const moving =
        Math.abs(moveX) > 0.05 ||
        Math.abs(moveZ) > 0.05 ||
        keys.KeyW ||
        keys.KeyA ||
        keys.KeyS ||
        keys.KeyD;

    const speedFactor =
        isRunning ? 13 : 8;

    if (moving) {

        const t = performance.now() * 0.001;

        const legAngle =
            Math.sin(t * speedFactor) * 0.45;

        player.userData.leftLeg.rotation.x =
            legAngle;

        player.userData.rightLeg.rotation.x =
            -legAngle;

        player.userData.leftArm.rotation.x =
            -legAngle * 0.55;

        player.userData.rightArm.rotation.x =
            legAngle * 0.55;

    } else {

        player.userData.leftLeg.rotation.x =
            THREE.MathUtils.damp(
                player.userData.leftLeg.rotation.x,
                0,
                8,
                delta
            );

        player.userData.rightLeg.rotation.x =
            THREE.MathUtils.damp(
                player.userData.rightLeg.rotation.x,
                0,
                8,
                delta
            );

        player.userData.leftArm.rotation.x =
            THREE.MathUtils.damp(
                player.userData.leftArm.rotation.x,
                0,
                8,
                delta
            );

        player.userData.rightArm.rotation.x =
            THREE.MathUtils.damp(
                player.userData.rightArm.rotation.x,
                0,
                8,
                delta
            );
    }
}


/* =========================================================
   INPUT
   ========================================================= */

function setupKeyboard() {

    window.addEventListener(
        "keydown",
        (event) => {

            keys[event.code] = true;

            if (
                event.code === "ShiftLeft" ||
                event.code === "ShiftRight"
            ) {
                isRunning = true;
            }

            if (
                event.code === "Space" &&
                canJump
            ) {
                jump();
            }
        }
    );

    window.addEventListener(
        "keyup",
        (event) => {

            keys[event.code] = false;

            if (
                event.code === "ShiftLeft" ||
                event.code === "ShiftRight"
            ) {
                isRunning = false;
            }
        }
    );
}


/* =========================================================
   JOYSTICK
   ========================================================= */

function setupJoystick() {

    const joystick = $("joystick");
    const knob = $("joystickKnob");

    if (!joystick || !knob) {
        return;
    }

    let active = false;

    function updateJoystick(clientX, clientY) {

        const rect =
            joystick.getBoundingClientRect();

        const centerX =
            rect.left + rect.width / 2;

        const centerY =
            rect.top + rect.height / 2;

        let dx = clientX - centerX;
        let dy = clientY - centerY;

        const maxDistance =
            rect.width * 0.32;

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        if (distance > maxDistance) {

            dx =
                (dx / distance) *
                maxDistance;

            dy =
                (dy / distance) *
                maxDistance;
        }

        knob.style.transform =
            `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        moveX =
            THREE.MathUtils.clamp(
                dx / maxDistance,
                -1,
                1
            );

        moveZ =
            THREE.MathUtils.clamp(
                dy / maxDistance,
                -1,
                1
            );
    }

    function resetJoystick() {

        active = false;

        moveX = 0;
        moveZ = 0;

        knob.style.transform =
            "translate(-50%, -50%)";
    }

    joystick.addEventListener(
        "pointerdown",
        (event) => {

            active = true;

            joystick.setPointerCapture(
                event.pointerId
            );

            updateJoystick(
                event.clientX,
                event.clientY
            );
        }
    );

    joystick.addEventListener(
        "pointermove",
        (event) => {

            if (!active) {
                return;
            }

            updateJoystick(
                event.clientX,
                event.clientY
            );
        }
    );

    joystick.addEventListener(
        "pointerup",
        resetJoystick
    );

    joystick.addEventListener(
        "pointercancel",
        resetJoystick
    );

    joystick.addEventListener(
        "pointerleave",
        () => {
            if (active) {
                resetJoystick();
            }
        }
    );
}


/* =========================================================
   FREE LOOK
   ========================================================= */

function setupFreeLook() {

    const area = $("lookArea");

    if (!area) {
        return;
    }

    area.addEventListener(
        "pointerdown",
        (event) => {

            lookPointerId =
                event.pointerId;

            lastLookX =
                event.clientX;

            lastLookY =
                event.clientY;

            area.setPointerCapture(
                event.pointerId
            );
        }
    );

    area.addEventListener(
        "pointermove",
        (event) => {

            if (
                event.pointerId !==
                lookPointerId
            ) {
                return;
            }

            const dx =
                event.clientX -
                lastLookX;

            const dy =
                event.clientY -
                lastLookY;

            lastLookX =
                event.clientX;

            lastLookY =
                event.clientY;

            yaw -= dx * 0.006;

            pitch -= dy * 0.005;

            /* Sky to ground */
            pitch =
                THREE.MathUtils.clamp(
                    pitch,
                    -1.35,
                    1.25
                );
        }
    );

    function stopLook(event) {

        if (
            event.pointerId ===
            lookPointerId
        ) {
            lookPointerId = null;
        }
    }

    area.addEventListener(
        "pointerup",
        stopLook
    );

    area.addEventListener(
        "pointercancel",
        stopLook
    );
}


/* =========================================================
   MOVEMENT DIRECTION
   ========================================================= */

function getMovementDirection() {

    let forward = 0;
    let side = 0;

    if (keys.KeyW || keys.ArrowUp) {
        forward += 1;
    }

    if (keys.KeyS || keys.ArrowDown) {
        forward -= 1;
    }

    if (keys.KeyD || keys.ArrowRight) {
        side += 1;
    }

    if (keys.KeyA || keys.ArrowLeft) {
        side -= 1;
    }

    side += moveX;
    forward += -moveZ;

    const length =
        Math.sqrt(
            side * side +
            forward * forward
        );

    if (length > 1) {

        side /= length;
        forward /= length;
    }

    return {
        side,
        forward
    };
}


/* =========================================================
   PLAYER MOVEMENT
   ========================================================= */

function updatePlayer(delta) {

    if (
        !player ||
        gamePaused
    ) {
        return;
    }

    const direction =
        getMovementDirection();

    const moving =
        Math.abs(direction.side) > 0.01 ||
        Math.abs(direction.forward) > 0.01;

    if (moving) {

        const speed =
            isRunning
                ? runSpeed
                : walkSpeed;

        /* Camera-relative movement */
        const forwardVector =
            new THREE.Vector3(
                Math.sin(yaw),
                0,
                Math.cos(yaw)
            );

        const rightVector =
            new THREE.Vector3(
                Math.cos(yaw),
                0,
                -Math.sin(yaw)
            );

        const movement =
            new THREE.Vector3();

        movement.addScaledVector(
            forwardVector,
            direction.forward
        );

        movement.addScaledVector(
            rightVector,
            direction.side
        );

        movement.normalize();

        const newPosition =
            player.position.clone();

        newPosition.addScaledVector(
            movement,
            speed * delta
        );

        if (
            !checkCollision(
                newPosition,
                0.45
            )
        ) {

            player.position.x =
                newPosition.x;

            player.position.z =
                newPosition.z;
        }

        /* Character faces movement direction */
        const targetRotation =
            Math.atan2(
                movement.x,
                movement.z
            );

        player.rotation.y =
            dampAngle(
                player.rotation.y,
                targetRotation,
                12,
                delta
            );
    }

    /* Gravity */
    playerVelocity.y -=
        gravity * delta;

    player.position.y +=
        playerVelocity.y * delta;

    if (player.position.y <= 0) {

        player.position.y = 0;

        playerVelocity.y = 0;

        canJump = true;
        isJumping = false;
    }
}


/* =========================================================
   ANGLE DAMPING
   ========================================================= */

function dampAngle(
    current,
    target,
    smoothing,
    delta
) {

    let difference =
        target - current;

    while (difference > Math.PI) {
        difference -= Math.PI * 2;
    }

    while (difference < -Math.PI) {
        difference += Math.PI * 2;
    }

    return (
        current +
        difference *
        (1 - Math.exp(-smoothing * delta))
    );
}


/* =========================================================
   COLLISION
   ========================================================= */

function checkCollision(position, radius) {

    for (const collider of colliders) {

        if (
            position.x + radius >
            collider.minX &&
            position.x - radius <
            collider.maxX &&
            position.z + radius >
            collider.minZ &&
            position.z - radius <
            collider.maxZ
        ) {
            return true;
        }
    }

    /* World boundary */

    if (
        position.x < -86 ||
        position.x > 86 ||
        position.z < -86 ||
        position.z > 86
    ) {
        return true;
    }

    return false;
}


/* =========================================================
   JUMP
   ========================================================= */

function jump() {

    if (!canJump) {
        return;
    }

    playerVelocity.y =
        jumpPower;

    canJump = false;
    isJumping = true;
}


/* =========================================================
   ACTION BUTTONS
   ========================================================= */

function setupActionButtons() {

    $("jumpButton").addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();

            jump();
        }
    );

    $("runButton").addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();

            isRunning = true;
        }
    );

    $("runButton").addEventListener(
        "pointerup",
        () => {
            isRunning = false;
        }
    );

    $("runButton").addEventListener(
        "pointercancel",
        () => {
            isRunning = false;
        }
    );

    $("interactButton").addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();

            interact();
        }
    );
}


/* =========================================================
   CAMERA
   ========================================================= */

function updateCamera(delta) {

    if (!player) {
        return;
    }

    const horizontalDistance =
        cameraDistance *
        Math.cos(pitch);

    const verticalDistance =
        cameraDistance *
        Math.sin(pitch);

    const target = new THREE.Vector3(
        player.position.x,
        player.position.y +
        cameraHeight,
        player.position.z
    );

    const offset = new THREE.Vector3(
        Math.sin(yaw) *
            horizontalDistance,

        -verticalDistance,

        Math.cos(yaw) *
            horizontalDistance
    );

    const desiredPosition =
        target.clone().add(offset);

    camera.position.lerp(
        desiredPosition,
        1 -
        Math.exp(-8 * delta)
    );

    camera.lookAt(target);
}


/* =========================================================
   INTERACTION
   ========================================================= */

function interact() {

    if (!player) {
        return;
    }

    let nearest = null;
    let nearestDistance = Infinity;

    for (const item of interactiveObjects) {

        const distance =
            player.position.distanceTo(
                item.object.position
            );

        if (
            distance < nearestDistance
        ) {

            nearestDistance = distance;
            nearest = item;
        }
    }

    if (
        nearest &&
        nearestDistance < 4
    ) {

        handleInteraction(
            nearest.type
        );

        return;
    }

    showDialogue(
        "There is nothing to interact with here."
    );
}


/* =========================================================
   INTERACTION HANDLER
   ========================================================= */

function handleInteraction(type) {

    switch (type) {

        case "reception":
            showDialogue(
                "ABSS Reception — Welcome to the campus."
            );
            completeMissionIfNear(2);
            break;

        case "receptionMam":
            showDialogue(
                "Namaste Mam! Welcome to ABSS Institute of Technology."
            );
            completeMissionIfNear(2);
            break;

        case "teachersOffice":
            showDialogue(
                "Teachers' Office — Faculty members work here."
            );
            completeMissionIfNear(3);
            break;

        default:
            showDialogue(
                "You interacted with an ABSS object."
            );
    }
}


/* =========================================================
   DIALOGUE
   ========================================================= */

function showDialogue(text) {

    const box = $("dialogueBox");
    const textElement = $("dialogueText");

    if (!box || !textElement) {
        return;
    }

    textElement.textContent = text;

    box.classList.remove("hidden");

    clearTimeout(dialogueTimer);

    dialogueTimer =
        setTimeout(
            () => {
                box.classList.add("hidden");
            },
            3500
        );
}


/* =========================================================
   MISSION SYSTEM
   ========================================================= */

function updateMission() {

    if (
        !player ||
        currentMission >= missions.length
    ) {
        return;
    }

    const mission =
        missions[currentMission];

    const distance =
        player.position.distanceTo(
            mission.target
        );

    $("missionText").textContent =
        mission.text;

    if (distance < 6) {

        currentMission++;

        if (
            currentMission <
            missions.length
        ) {

            showDialogue(
                "Mission completed!"
            );

            $("missionText").textContent =
                missions[currentMission].text;

        } else {

            showDialogue(
                "ABSS Campus Explorer completed!"
            );
        }

        saveProgress();
    }
}


function completeMissionIfNear(index) {

    if (
        currentMission === index
    ) {
        currentMission++;
        saveProgress();

        if (
            currentMission <
            missions.length
        ) {
            $("missionText").textContent =
                missions[currentMission].text;
        }
    }
}


/* =========================================================
   MINIMAP
   ========================================================= */

function updateMinimap() {

    if (!player) {
        return;
    }

    const marker =
        $("playerMarker");

    if (!marker) {
        return;
    }

    const x =
        THREE.MathUtils.clamp(
            50 + player.position.x * 0.52,
            5,
            95
        );

    const y =
        THREE.MathUtils.clamp(
            50 + player.position.z * 0.52,
            5,
            95
        );

    marker.style.left =
        `${x}%`;

    marker.style.top =
        `${y}%`;
}


/* =========================================================
   ENVIRONMENT ANIMATION
   ========================================================= */

function animateEnvironment(time) {

    for (const tree of trees) {

        tree.object.rotation.z =
            Math.sin(
                time * 0.8 +
                tree.phase
            ) * 0.015;
    }

    /* NPC subtle movement */
    for (const npc of npcs) {

        npc.object.rotation.y +=
            Math.sin(
                time * 0.5 +
                npc.phase
            ) * 0.0008;
    }
}


/* =========================================================
   DAY / NIGHT
   ========================================================= */

function updateDayNight(delta) {

    worldTime += delta * 0.02;

    if (worldTime >= 24) {
        worldTime = 0;
    }

    const sunAngle =
        ((worldTime - 6) / 12) *
        Math.PI;

    const sunX =
        Math.cos(sunAngle) * 80;

    const sunY =
        Math.sin(sunAngle) * 80;

    sunLight.position.set(
        sunX,
        Math.max(8, sunY),
        30
    );

    const daylight =
        THREE.MathUtils.clamp(
            Math.sin(sunAngle),
            0.12,
            1
        );

    sunLight.intensity =
        0.25 +
        daylight * 1.15;

    ambientLight.intensity =
        0.25 +
        daylight * 0.55;
}


/* =========================================================
   GATE ANIMATION
   ========================================================= */

function updateGate() {

    if (
        doors.length === 0 ||
        !player
    ) {
        return;
    }

    const gate =
        doors[0];

    const distance =
        player.position.distanceTo(
            new THREE.Vector3(
                0,
                0,
                -66
            )
        );

    const shouldOpen =
        distance < 12;

    if (
        shouldOpen &&
        !gate.open
    ) {

        gate.open = true;

        gate.left.position.x =
            -9;

        gate.right.position.x =
            9;
    }

    if (
        !shouldOpen &&
        gate.open
    ) {

        gate.open = false;

        gate.left.position.x =
            -4;

        gate.right.position.x =
            4;
    }
}


/* =========================================================
   MENU
   ========================================================= */

function setupMenu() {

    $("menuButton").addEventListener(
        "click",
        () => {

            gamePaused = true;

            $("menuScreen")
                .classList.remove("hidden");
        }
    );

    $("resumeButton").addEventListener(
        "click",
        closeAllOverlays
    );

    $("mapButton").addEventListener(
        "click",
        () => {

            $("menuScreen")
                .classList.add("hidden");

            $("mapScreen")
                .classList.remove("hidden");
        }
    );

    $("missionsButton").addEventListener(
        "click",
        () => {

            $("menuScreen")
                .classList.add("hidden");

            updateMissionList();

            $("missionsScreen")
                .classList.remove("hidden");
        }
    );

    $("settingsButton").addEventListener(
        "click",
        () => {

            $("menuScreen")
                .classList.add("hidden");

            $("settingsScreen")
                .classList.remove("hidden");
        }
    );

    $("closeMapButton").addEventListener(
        "click",
        closeAllOverlays
    );

    $("closeMissionsButton").addEventListener(
        "click",
        closeAllOverlays
    );

    $("closeSettingsButton").addEventListener(
        "click",
        closeAllOverlays
    );
}


function closeAllOverlays() {

    $("menuScreen")
        .classList.add("hidden");

    $("mapScreen")
        .classList.add("hidden");

    $("missionsScreen")
        .classList.add("hidden");

    $("settingsScreen")
        .classList.add("hidden");

    gamePaused = false;
}


/* =========================================================
   MISSIONS UI
   ========================================================= */

function updateMissionList() {

    const list =
        $("missionList");

    list.innerHTML = "";

    missions.forEach(
        (mission, index) => {

            const item =
                document.createElement("div");

            item.className =
                "missionItem";

            if (
                index <
                currentMission
            ) {
                item.classList.add(
                    "completed"
                );
            }

            item.textContent =
                `${index + 1}. ${mission.text}`;

            list.appendChild(item);
        }
    );
}


/* =========================================================
   SETTINGS
   ========================================================= */

function setupSettings() {

    $("qualityLow").addEventListener(
        "click",
        () => setQuality("low")
    );

    $("qualityMedium").addEventListener(
        "click",
        () => setQuality("medium")
    );

    $("qualityHigh").addEventListener(
        "click",
        () => setQuality("high")
    );
}


function setQuality(value) {

    quality = value;

    if (!renderer) {
        return;
    }

    if (quality === "low") {

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                1
            )
        );

    } else if (quality === "medium") {

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                1.5
            )
        );

    } else {

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );
    }

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}


/* =========================================================
   ACCOUNT SYSTEM
   ========================================================= */

function hasAccount() {

    try {
        return Boolean(
            localStorage.getItem(
                "abssAccount"
            )
        );
    } catch (error) {
        console.warn(
            "localStorage unavailable.",
            error
        );

        return false;
    }
}


function createAccount() {

    const name =
        $("nameInput").value.trim();

    const password =
        $("passwordInput").value;

    if (!name) {

        alert(
            "Please enter your name."
        );

        return;
    }

    if (password.length < 4) {

        alert(
            "Password must contain at least 4 characters."
        );

        return;
    }

    const account = {
        name,
        password,
        gender: selectedGender,
        mission: 0
    };

    try {

        localStorage.setItem(
            "abssAccount",
            JSON.stringify(account)
        );

    } catch (error) {

        alert(
            "Account could not be saved in this browser."
        );

        console.error(error);

        return;
    }

    playerName = name;

    $("accountScreen")
        .classList.add("hidden");

    $("characterScreen")
        .classList.remove("hidden");
}


function login() {

    const password =
        $("loginPassword").value;

    let account = null;

    try {

        account =
            JSON.parse(
                localStorage.getItem(
                    "abssAccount"
                )
            );

    } catch (error) {

        console.error(error);

        return;
    }

    if (
        !account ||
        account.password !== password
    ) {

        alert(
            "Incorrect password."
        );

        return;
    }

    playerName =
        account.name;

    selectedGender =
        account.gender || "boy";

    currentMission =
        Number(account.mission) || 0;

    $("loginScreen")
        .classList.add("hidden");

    beginGame();
}


/* =========================================================
   SAVE PROGRESS
   ========================================================= */

function saveProgress() {

    try {

        const raw =
            localStorage.getItem(
                "abssAccount"
            );

        if (!raw) {
            return;
        }

        const account =
            JSON.parse(raw);

        account.mission =
            currentMission;

        account.gender =
            selectedGender;

        localStorage.setItem(
            "abssAccount",
            JSON.stringify(account)
        );

    } catch (error) {

        console.warn(
            "Could not save progress.",
            error
        );
    }
}


/* =========================================================
   CHARACTER SCREEN
   ========================================================= */

function setupCharacterScreen() {

    $("boyButton").addEventListener(
        "click",
        () => {

            selectedGender = "boy";

            $("boyButton")
                .classList.add("selected");

            $("girlButton")
                .classList.remove("selected");
        }
    );

    $("girlButton").addEventListener(
        "click",
        () => {

            selectedGender = "girl";

            $("girlButton")
                .classList.add("selected");

            $("boyButton")
                .classList.remove("selected");
        }
    );

    $("photoInput").addEventListener(
        "change",
        () => {

            const file =
                $("photoInput").files[0];

            if (!file) {
                return;
            }

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {
                alert(
                    "Please select an image."
                );

                return;
            }

            const reader =
                new FileReader();

            reader.onload = () => {

                $("photoPreview").src =
                    reader.result;

                $("photoPreview")
                    .classList.remove(
                        "hidden"
                    );
            };

            reader.readAsDataURL(file);
        }
    );

    $("finishCharacterButton")
        .addEventListener(
            "click",
            () => {

                saveCharacterChoice();

                $("characterScreen")
                    .classList.add("hidden");

                beginGame();
            }
        );
}


function saveCharacterChoice() {

    try {

        const raw =
            localStorage.getItem(
                "abssAccount"
            );

        if (!raw) {
            return;
        }

        const account =
            JSON.parse(raw);

        account.gender =
            selectedGender;

        localStorage.setItem(
            "abssAccount",
            JSON.stringify(account)
        );

    } catch (error) {

        console.warn(error);
    }
}


/* =========================================================
   INITIAL GAME
   ========================================================= */

function initGame() {

    const canvas =
        $("gameCanvas");

    renderer =
        new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            powerPreference: "high-performance"
        });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
        1.05;


    /* Scene */
    scene = new THREE.Scene();

    scene.background =
        new THREE.Color(0x8fc4df);

    scene.fog =
        new THREE.Fog(
            0x8fc4df,
            90,
            170
        );


    /* Camera */
    camera =
        new THREE.PerspectiveCamera(
            65,
            window.innerWidth /
                window.innerHeight,
            0.05,
            300
        );

    camera.position.set(
        0,
        4,
        -82
    );


    /* Lights */
    ambientLight =
        new THREE.HemisphereLight(
            0xdcecff,
            0x334422,
            0.9
        );

    scene.add(
        ambientLight
    );


    sunLight =
        new THREE.DirectionalLight(
            0xffffff,
            1.35
        );

    sunLight.position.set(
        50,
        80,
        30
    );

    sunLight.castShadow = true;

    sunLight.shadow.mapSize.width =
        2048;

    sunLight.shadow.mapSize.height =
        2048;

    sunLight.shadow.camera.left =
        -100;

    sunLight.shadow.camera.right =
        100;

    sunLight.shadow.camera.top =
        100;

    sunLight.shadow.camera.bottom =
        -100;

    scene.add(
        sunLight
    );


    /* Build world */
    createGround();
    createCollege();

    createHostel(
        "Chandrashekhar Azad Boys Hostel",
        -43,
        20
    );

    createHostel(
        "Girls Hostel",
        43,
        20
    );

    createSportsGround();

    createMainGate();

    createReception();


    /* Paths */
    createPath(
        0,
        -43,
        10,
        35
    );

    createPath(
        -27,
        0,
        12,
        9
    );

    createPath(
        27,
        0,
        12,
        9
    );


    /* Gardens */
    createGarden(
        -34,
        -43,
        22,
        18
    );

    createGarden(
        35,
        -42,
        20,
        18
    );

    createGarden(
        -30,
        48,
        18,
        15
    );

    createGarden(
        32,
        48,
        18,
        15
    );


    /* Trees */
    const treePositions = [
        [-70, -55],
        [-58, -42],
        [-70, -25],
        [-55, -10],
        [-70, 5],
        [-57, 35],
        [-70, 55],

        [70, -55],
        [58, -42],
        [70, -25],
        [55, -8],
        [70, 10],
        [58, 35],
        [70, 55],

        [-35, -58],
        [-20, -58],
        [20, -58],
        [35, -58],

        [-38, 58],
        [-20, 62],
        [20, 62],
        [38, 58]
    ];

    treePositions.forEach(
        ([x, z], index) => {

            createTree(
                x,
                z,
                index % 3 === 0
                    ? 1.25
                    : 1
            );
        }
    );


    /* Palms */
    createPalm(
        -12,
        -55,
        1.1
    );

    createPalm(
        12,
        -55,
        1.1
    );

    createPalm(
        -52,
        0,
        1
    );

    createPalm(
        52,
        0,
        1
    );


    /* Classroom furniture base */
    createRoomFurniture(
        -18,
        -17
    );

    createRoomFurniture(
        12,
        -17
    );


    /* NPC */
    createNPC(
        "Campus Student",
        8,
        0,
        -4
    );

    createNPC(
        "Campus Student",
        -10,
        0,
        8
    );


    /* Player */
    createPlayer();


    /* Clock */
    clock =
        new THREE.Clock();


    /* Events */
    window.addEventListener(
        "resize",
        onResize
    );

    setupKeyboard();
    setupJoystick();
    setupFreeLook();
    setupActionButtons();
    setupMenu();
    setupSettings();
    setupCharacterScreen();


    /* Start render loop */
    animate();
}


/* =========================================================
   RESIZE
   ========================================================= */

function onResize() {

    if (
        !camera ||
        !renderer
    ) {
        return;
    }

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}


/* =========================================================
   GAME LOOP
   ========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );

    if (
        !renderer ||
        !scene ||
        !camera
    ) {
        return;
    }

    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );

    const time =
        performance.now() * 0.001;

    if (gameStarted) {

        updatePlayer(delta);

        animatePlayer(delta);

        updateCamera(delta);

        updateMission();

        updateMinimap();

        updateGate();

        animateEnvironment(time);

        updateDayNight(delta);
    }

    renderer.render(
        scene,
        camera
    );
}


/* =========================================================
   BEGIN GAME
   ========================================================= */

function beginGame() {

    if (!scene) {
        initGame();
    }

    gameStarted = true;
    gamePaused = false;

    $("gameUI")
        .classList.remove("hidden");

    $("missionText").textContent =
        missions[
            Math.min(
                currentMission,
                missions.length - 1
            )
        ].text;

    showDialogue(
        `Welcome to ABSS Map, ${playerName || "Player"}!`
    );
}


/* =========================================================
   LOADING
   ========================================================= */

function loadingSequence() {

    const progress =
        $("loadingProgress");

    const text =
        $("loadingText");

    let value = 0;

    const timer =
        setInterval(
            () => {

                value += 5;

                if (value > 100) {
                    value = 100;
                }

                progress.style.width =
                    `${value}%`;

                if (value < 30) {

                    text.textContent =
                        "Preparing ABSS Map...";

                } else if (value < 60) {

                    text.textContent =
                        "Building campus...";

                } else if (value < 90) {

                    text.textContent =
                        "Preparing player...";

                } else {

                    text.textContent =
                        "Starting game...";
                }

                if (value >= 100) {

                    clearInterval(timer);

                    setTimeout(
                        showInitialScreen,
                        250
                    );
                }

            },
            40
        );
}


/* =========================================================
   INITIAL SCREEN
   ========================================================= */

function showInitialScreen() {

    $("loadingScreen")
        .classList.add("hidden");

    if (hasAccount()) {

        $("loginScreen")
            .classList.remove("hidden");

    } else {

        $("accountScreen")
            .classList.remove("hidden");
    }
}


/* =========================================================
   INITIAL EVENT SETUP
   ========================================================= */

$("createAccountButton")
    .addEventListener(
        "click",
        createAccount
    );

$("loginButton")
    .addEventListener(
        "click",
        login
    );


/* =========================================================
   START
   ========================================================= */

loadingSequence();
