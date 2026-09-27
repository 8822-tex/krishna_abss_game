/* =========================================================
   ABSS MAP — GAME.JS
   ABSS Institute of Technology, Meerut
========================================================= */

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { OrbitControls } from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";


/* =========================================================
   BASIC SETUP
========================================================= */

const gameContainer = document.getElementById("gameContainer");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x8fd3ff);

scene.fog = new THREE.Fog(
    0x8fd3ff,
    80,
    420
);


/* =========================================================
   CAMERA
========================================================= */

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(
    0,
    6,
    18
);


/* =========================================================
   RENDERER
========================================================= */

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.1;

gameContainer.appendChild(renderer.domElement);


/* =========================================================
   LIGHTING
========================================================= */

const hemiLight = new THREE.HemisphereLight(
    0xbfe9ff,
    0x43522f,
    2.0
);

scene.add(hemiLight);


const sun = new THREE.DirectionalLight(
    0xffffff,
    3.2
);

sun.position.set(
    80,
    120,
    50
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -180;
sun.shadow.camera.right = 180;
sun.shadow.camera.top = 180;
sun.shadow.camera.bottom = -180;

sun.shadow.camera.near = 1;
sun.shadow.camera.far = 400;

scene.add(sun);


/* =========================================================
   WORLD
========================================================= */

const world = new THREE.Group();

scene.add(world);


/* =========================================================
   MATERIALS
========================================================= */

const grassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x3e7f35,
        roughness: 0.95
    });


const roadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x30343a,
        roughness: 0.9
    });


const concreteMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xb9b9b9,
        roughness: 0.85
    });


const whiteWall =
    new THREE.MeshStandardMaterial({
        color: 0xf0eee8,
        roughness: 0.75
    });


const redWall =
    new THREE.MeshStandardMaterial({
        color: 0xb92822,
        roughness: 0.7
    });


const darkGlass =
    new THREE.MeshPhysicalMaterial({
        color: 0x79b9cf,
        transparent: true,
        opacity: 0.42,
        roughness: 0.12,
        metalness: 0.05
    });


const blackMetal =
    new THREE.MeshStandardMaterial({
        color: 0x20252a,
        metalness: 0.75,
        roughness: 0.3
    });


const woodMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x75452b,
        roughness: 0.8
    });


const greenLeaf =
    new THREE.MeshStandardMaterial({
        color: 0x246b2c,
        roughness: 0.9
    });


const flowerMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffe45c,
        roughness: 0.8
    });


/* =========================================================
   UTILITY
========================================================= */

function box(
    width,
    height,
    depth,
    material,
    x,
    y,
    z
) {
    const geometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    world.add(mesh);

    return mesh;
}


function cylinder(
    radius,
    height,
    material,
    x,
    y,
    z
) {
    const geometry =
        new THREE.CylinderGeometry(
            radius,
            radius,
            height,
            16
        );

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    world.add(mesh);

    return mesh;
}


/* =========================================================
   CAMPUS GROUND
========================================================= */

const groundGeometry =
    new THREE.PlaneGeometry(
        400,
        400,
        80,
        80
    );

const ground =
    new THREE.Mesh(
        groundGeometry,
        grassMaterial
    );

ground.rotation.x =
    -Math.PI / 2;

ground.receiveShadow = true;

world.add(ground);


/* =========================================================
   ROAD SYSTEM
========================================================= */

function createRoad(
    width,
    length,
    x,
    z,
    rotation = 0
) {
    const geometry =
        new THREE.PlaneGeometry(
            width,
            length
        );

    const road =
        new THREE.Mesh(
            geometry,
            roadMaterial
        );

    road.rotation.x =
        -Math.PI / 2;

    road.rotation.z =
        rotation;

    road.position.set(
        x,
        0.015,
        z
    );

    road.receiveShadow = true;

    world.add(road);

    return road;
}


createRoad(
    18,
    360,
    0,
    0
);

createRoad(
    180,
    12,
    0,
    -60
);

createRoad(
    180,
    12,
    0,
    60
);

createRoad(
    12,
    180,
    -65,
    0
);

createRoad(
    12,
    180,
    65,
    0
);


/* =========================================================
   ROAD SIDE WALK
========================================================= */

function createSidewalk(
    width,
    length,
    x,
    z,
    rotation = 0
) {
    const sidewalk =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                width,
                length
            ),
            concreteMaterial
        );

    sidewalk.rotation.x =
        -Math.PI / 2;

    sidewalk.rotation.z =
        rotation;

    sidewalk.position.set(
        x,
        0.025,
        z
    );

    sidewalk.receiveShadow = true;

    world.add(sidewalk);
}


createSidewalk(
    3,
    360,
    11,
    0
);

createSidewalk(
    3,
    360,
    -11,
    0
);


/* =========================================================
   MAIN COLLEGE BUILDING
========================================================= */

const mainBuilding =
    new THREE.Group();

mainBuilding.position.set(
    0,
    0,
    -72
);

world.add(mainBuilding);


/* =========================================================
   BUILDING FLOOR
========================================================= */

for (let floor = 0; floor < 4; floor++) {

    const floorBody =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                58,
                8,
                24
            ),
            whiteWall
        );

    floorBody.position.y =
        4 + floor * 8;

    floorBody.castShadow = true;
    floorBody.receiveShadow = true;

    mainBuilding.add(
        floorBody
    );


    /* RED STRIP */

    const redStrip =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                59,
                0.8,
                24.5
            ),
            redWall
        );

    redStrip.position.y =
        0.6 + floor * 8;

    mainBuilding.add(
        redStrip
    );


    /* WINDOWS */

    for (
        let wx = -23;
        wx <= 23;
        wx += 7
    ) {

        const windowMesh =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    4.2,
                    4.3,
                    0.15
                ),
                darkGlass
            );

        windowMesh.position.set(
            wx,
            4.2 + floor * 8,
            12.1
        );

        mainBuilding.add(
            windowMesh
        );
    }
}


/* =========================================================
   MAIN ENTRANCE
========================================================= */

const entrance =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            12,
            22,
            1
        ),
        darkGlass
    );

entrance.position.set(
    0,
    11,
    12.4
);

mainBuilding.add(
    entrance
);


/* =========================================================
   ENTRANCE FRAME
========================================================= */

for (
    let x of [-6, 6]
) {

    const pillar =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.8,
                22,
                1.2
            ),
            blackMetal
        );

    pillar.position.set(
        x,
        11,
        13
    );

    mainBuilding.add(
        pillar
    );
}


/* =========================================================
   ABSS SIGN
========================================================= */

function createTextSprite(
    text,
    size = 48
) {

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = 1024;
    canvas.height = 256;

    const context =
        canvas.getContext("2d");

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    context.fillStyle =
        "white";

    context.font =
        `bold ${size}px Arial`;

    context.textAlign =
        "center";

    context.textBaseline =
        "middle";

    context.fillText(
        text,
        canvas.width / 2,
        canvas.height / 2
    );

    const texture =
        new THREE.CanvasTexture(
            canvas
        );

    const material =
        new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

    const sprite =
        new THREE.Sprite(
            material
        );

    sprite.scale.set(
        18,
        4.5,
        1
    );

    return sprite;
}


const sign =
    createTextSprite(
        "ABSS INSTITUTE OF TECHNOLOGY",
        50
    );

sign.position.set(
    0,
    19,
    13.2
);

mainBuilding.add(
    sign
);


/* =========================================================
   RECEPTION
========================================================= */

function createReception() {

    const reception =
        new THREE.Group();

    reception.position.set(
        -15,
        0,
        -58
    );

    world.add(
        reception
    );


    box(
        8,
        1.2,
        3,
        woodMaterial,
        -15,
        1,
        -58
    );


    box(
        0.25,
        2.5,
        2.7,
        blackMetal,
        -18.8,
        2,
        -58
    );


    box(
        0.25,
        2.5,
        2.7,
        blackMetal,
        -11.2,
        2,
        -58
    );

    return reception;
}

createReception();


/* =========================================================
   CLASSROOM INTERIOR OBJECTS
========================================================= */

function createClassroom(
    x,
    z
) {

    const classroom =
        new THREE.Group();

    classroom.position.set(
        x,
        0,
        z
    );

    world.add(
        classroom
    );


    /* BENCHES */

    for (
        let row = 0;
        row < 4;
        row++
    ) {

        for (
            let col = 0;
            col < 2;
            col++
        ) {

            const bx =
                x - 4 + col * 8;

            const bz =
                z - 4 + row * 4;

            box(
                5.5,
                0.5,
                1.7,
                woodMaterial,
                bx,
                1.3,
                bz
            );

            box(
                0.35,
                1.3,
                0.35,
                blackMetal,
                bx - 2,
                0.65,
                bz
            );

            box(
                0.35,
                1.3,
                0.35,
                blackMetal,
                bx + 2,
                0.65,
                bz
            );
        }
    }


    /* BOARD */

    box(
        8,
        4,
        0.15,
        new THREE.MeshStandardMaterial({
            color: 0x172b24
        }),
        x,
        4.5,
        z + 7
    );


    /* TEACHER TABLE */

    box(
        5,
        1,
        2,
        woodMaterial,
        x,
        1.2,
        z + 5
    );
}


/* =========================================================
   CLASSROOMS
========================================================= */

createClassroom(
    -18,
    -105
);

createClassroom(
    18,
    -105
);

createClassroom(
    -18,
    -130
);

createClassroom(
    18,
    -130
);


/* =========================================================
   LABORATORY
========================================================= */

function createLab(
    name,
    x,
    z
) {

    const lab =
        new THREE.Group();

    lab.position.set(
        x,
        0,
        z
    );

    world.add(
        lab
    );


    box(
        20,
        1,
        8,
        blackMetal,
        x,
        1.2,
        z
    );


    for (
        let i = -7;
        i <= 7;
        i += 4
    ) {

        cylinder(
            0.35,
            2.2,
            blackMetal,
            x + i,
            2,
            z
        );
    }


    const label =
        createTextSprite(
            name,
            42
        );

    label.position.set(
        x,
        7,
        z + 0.5
    );

    label.scale.set(
        10,
        2.5,
        1
    );

    world.add(
        label
    );
}


createLab(
    "CHEMISTRY LAB",
    -18,
    -155
);

createLab(
    "PHYSICS LAB",
    18,
    -155
);


/* =========================================================
   HOSTELS
========================================================= */

function createHostel(
    name,
    x,
    z
) {

    const hostel =
        new THREE.Group();

    hostel.position.set(
        x,
        0,
        z
    );

    world.add(
        hostel
    );


    for (
        let floor = 0;
        floor < 4;
        floor++
    ) {

        const body =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    35,
                    8,
                    18
                ),
                whiteWall
            );

        body.position.y =
            4 + floor * 8;

        body.castShadow = true;
        body.receiveShadow = true;

        hostel.add(
            body
        );


        const strip =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    36,
                    0.7,
                    18.5
                ),
                redWall
            );

        strip.position.y =
            0.7 + floor * 8;

        hostel.add(
            strip
        );


        for (
            let wx = -12;
            wx <= 12;
            wx += 6
        ) {

            const win =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        3,
                        4,
                        0.2
                    ),
                    darkGlass
                );

            win.position.set(
                wx,
                4 + floor * 8,
                9.2
            );

            hostel.add(
                win
            );
        }
    }


    const label =
        createTextSprite(
            name,
            44
        );

    label.position.set(
        x,
        35,
        z + 10
    );

    label.scale.set(
        12,
        3,
        1
    );

    world.add(
        label
    );
}


createHostel(
    "CSA BOYS HOSTEL",
    -75,
    -70
);

createHostel(
    "GIRLS HOSTEL",
    75,
    -70
);


/* =========================================================
   MAIN GLASS GATE
========================================================= */

function createMainGate() {

    const gate =
        new THREE.Group();

    gate.position.set(
        0,
        0,
        20
    );

    world.add(
        gate
    );


    /* PILLARS */

    for (
        const x of [-12, 12]
    ) {

        const pillar =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2,
                    10,
                    2
                ),
                concreteMaterial
            );

        pillar.position.set(
            x,
            5,
            0
        );

        pillar.castShadow = true;

        gate.add(
            pillar
        );
    }


    /* GLASS PANELS */

    for (
        let x = -9;
        x <= 9;
        x += 6
    ) {

        const panel =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    5.5,
                    7,
                    0.18
                ),
                darkGlass
            );

        panel.position.set(
            x,
            4,
            0
        );

        gate.add(
            panel
        );


        const frame =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.18,
                    7.5,
                    0.3
                ),
                blackMetal
            );

        frame.position.set(
            x - 2.7,
            4,
            0
        );

        gate.add(
            frame
        );
    }


    const gateSign =
        createTextSprite(
            "ABSS",
            80
        );

    gateSign.position.set(
        0,
        8.5,
        0
    );

    gateSign.scale.set(
        7,
        3.5,
        1
    );

    gate.add(
        gateSign
    );
}

createMainGate();


/* =========================================================
   TREES
========================================================= */

const trees = [];

function createTree(
    x,
    z,
    scale = 1
) {

    const tree =
        new THREE.Group();

    tree.position.set(
        x,
        0,
        z
    );

    tree.scale.setScalar(
        scale
    );

    world.add(
        tree
    );


    const trunk =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.7,
                1,
                7,
                12
            ),
            woodMaterial
        );

    trunk.position.y = 3.5;

    trunk.castShadow = true;

    tree.add(
        trunk
    );


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const leaves =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    2.7,
                    12,
                    10
                ),
                greenLeaf
            );

        leaves.position.set(
            (Math.random() - 0.5) * 3,
            7 + Math.random() * 3,
            (Math.random() - 0.5) * 3
        );

        leaves.castShadow = true;

        tree.add(
            leaves
        );
    }

    trees.push(tree);
}


/* TREE LOCATIONS */

const treePositions = [

    [-35, 5],
    [35, 5],
    [-45, 35],
    [45, 35],
    [-55, -15],
    [55, -15],
    [-35, -35],
    [35, -35],
    [-100, 15],
    [100, 15],
    [-105, -30],
    [105, -30],
    [-45, -180],
    [45, -180],
    [-80, -190],
    [80, -190],
    [-120, -100],
    [120, -100]

];

for (
    const [x, z] of treePositions
) {

    createTree(
        x,
        z,
        0.8 + Math.random() * 0.5
    );
}


/* =========================================================
   GRASS SYSTEM
========================================================= */

const grassBlades = [];


function createGrassPatch(
    centerX,
    centerZ,
    amount = 150
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const height =
            0.35 +
            Math.random() * 0.55;

        const geometry =
            new THREE.PlaneGeometry(
                0.06,
                height
            );

        const material =
            new THREE.MeshStandardMaterial({
                color:
                    new THREE.Color(
                        0.15 +
                        Math.random() * 0.08,

                        0.42 +
                        Math.random() * 0.12,

                        0.12 +
                        Math.random() * 0.06
                    ),

                side:
                    THREE.DoubleSide
            });


        const blade =
            new THREE.Mesh(
                geometry,
                material
            );


        blade.position.set(
            centerX +
            (Math.random() - 0.5) * 25,

            height / 2,

            centerZ +
            (Math.random() - 0.5) * 25
        );


        blade.rotation.y =
            Math.random() *
            Math.PI;


        blade.rotation.x =
            (Math.random() - 0.5) * 0.25;


        blade.castShadow = false;


        world.add(
            blade
        );


        grassBlades.push({
            mesh: blade,

            baseRotation:
                blade.rotation.z,

            phase:
                Math.random() *
                Math.PI * 2,

            speed:
                0.7 +
                Math.random() * 1.4
        });
    }
}


/* GRASS PATCHES */

createGrassPatch(
    -30,
    30,
    180
);

createGrassPatch(
    30,
    30,
    180
);

createGrassPatch(
    -35,
    -20,
    180
);

createGrassPatch(
    35,
    -20,
    180
);

createGrassPatch(
    -45,
    -180,
    180
);

createGrassPatch(
    45,
    -180,
    180
);


/* =========================================================
   FLOWERS
========================================================= */

function createFlower(
    x,
    z
) {

    const stem =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.035,
                0.035,
                0.7,
                6
            ),
            greenLeaf
        );

    stem.position.set(
        x,
        0.35,
        z
    );

    world.add(
        stem
    );


    const flower =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.16,
                8,
                8
            ),
            flowerMaterial
        );

    flower.position.set(
        x,
        0.75,
        z
    );

    world.add(
        flower
    );
}


for (
    let i = 0;
    i < 150;
    i++
) {

    createFlower(
        -50 + Math.random() * 100,
        -5 + Math.random() * 55
    );
}


/* =========================================================
   PLAYER
========================================================= */

const player =
    new THREE.Group();

player.position.set(
    0,
    0,
    10
);

world.add(
    player
);


/* BODY */

const body =
    new THREE.Mesh(
        new THREE.CapsuleGeometry(
            0.55,
            1.4,
            8,
            16
        ),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.75
        })
    );

body.position.y =
    1.35;

body.castShadow = true;

player.add(
    body
);


/* HEAD */

const head =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            0.45,
            20,
            16
        ),
        new THREE.MeshStandardMaterial({
            color: 0xb87956,
            roughness: 0.8
        })
    );

head.position.y =
    2.65;

head.castShadow = true;

player.add(
    head
);


/* ABSSIT SHIRT */

const shirt =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            1.05,
            0.95,
            0.6
        ),
        new THREE.MeshStandardMaterial({
            color: 0xb91c1c
        })
    );

shirt.position.y =
    1.55;

shirt.castShadow = true;

player.add(
    shirt
);


/* LEGS */

for (
    const x of [-0.25, 0.25]
) {

    const leg =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                0.16,
                0.9,
                6,
                10
            ),
            new THREE.MeshStandardMaterial({
                color: 0x22252a
            })
        );

    leg.position.set(
        x,
        0.55,
        0
    );

    leg.castShadow = true;

    player.add(
        leg
    );
}


/* =========================================================
   NPC
========================================================= */

const npcs = [];

function createNPC(
    x,
    z,
    shirtColor = 0xeeeeee
) {

    const npc =
        new THREE.Group();

    npc.position.set(
        x,
        0,
        z
    );

    world.add(
        npc
    );


    const npcBody =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                0.5,
                1.2,
                8,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: shirtColor
            })
        );

    npcBody.position.y =
        1.3;

    npcBody.castShadow = true;

    npc.add(
        npcBody
    );


    const npcHead =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.4,
                16,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: 0xc78b68
            })
        );

    npcHead.position.y =
        2.55;

    npc.add(
        npcHead
    );


    npcs.push({
        mesh: npc,
        startX: x,
        startZ: z,
        phase: Math.random() * 10
    });
}


createNPC(
    -10,
    4,
    0xeeeeee
);

createNPC(
    10,
    4,
    0xeeeeee
);

createNPC(
    -20,
    -40,
    0x3366aa
);


/* =========================================================
   ANIMALS
========================================================= */

const animals = [];

function createAnimal(
    x,
    z,
    type
) {

    const animal =
        new THREE.Group();

    animal.position.set(
        x,
        0,
        z
    );

    world.add(
        animal
    );


    let bodySize = 0.45;

    if (
        type === "rabbit"
    ) {
        bodySize = 0.5;
    }

    if (
        type === "squirrel"
    ) {
        bodySize = 0.3;
    }

    const animalBody =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                bodySize,
                12,
                10
            ),
            new THREE.MeshStandardMaterial({
                color:
                    type === "rabbit"
                        ? 0xd8d8d8
                        : 0x8a5b35
            })
        );

    animalBody.position.y =
        bodySize + 0.1;

    animalBody.castShadow = true;

    animal.add(
        animalBody
    );


    animals.push({
        mesh: animal,
        type,
        phase: Math.random() * 20,
        homeX: x,
        homeZ: z
    });
}


createAnimal(
    -30,
    30,
    "rabbit"
);

createAnimal(
    30,
    35,
    "squirrel"
);

createAnimal(
    -45,
    15,
    "rabbit"
);

createAnimal(
    45,
    20,
    "squirrel"
);


/* =========================================================
   BICYCLE
========================================================= */

function createBicycle(
    x,
    z
) {

    const bicycle =
        new THREE.Group();

    bicycle.position.set(
        x,
        0,
        z
    );

    world.add(
        bicycle
    );


    for (
        const wheelZ of [-0.8, 0.8]
    ) {

        const wheel =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    0.55,
                    0.07,
                    8,
                    24
                ),
                blackMetal
            );

        wheel.rotation.y =
            Math.PI / 2;

        wheel.position.z =
            wheelZ;

        wheel.position.y =
            0.55;

        bicycle.add(
            wheel
        );
    }


    const frame =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.1,
                0.1,
                1.6
            ),
            blackMetal
        );

    frame.position.y =
        0.65;

    bicycle.add(
        frame
    );


    return bicycle;
}


createBicycle(
    8,
    -5
);


/* =========================================================
   CAMERA CONTROLS
========================================================= */

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.enableDamping = true;

controls.dampingFactor =
    0.08;

controls.enablePan = false;

controls.minDistance = 3;

controls.maxDistance = 35;

controls.maxPolarAngle =
    Math.PI * 0.48;

controls.minPolarAngle =
    Math.PI * 0.12;

controls.target.set(
    0,
    1.5,
    10
);


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

const keys = {};

window.addEventListener(
    "keydown",
    event => {
        keys[event.code] = true;
    }
);

window.addEventListener(
    "keyup",
    event => {
        keys[event.code] = false;
    }
);


let moveX = 0;
let moveZ = 0;

let running = false;


/* =========================================================
   MOBILE JOYSTICK
========================================================= */

const joystickOuter =
    document.getElementById(
        "joystickOuter"
    );

const joystickInner =
    document.getElementById(
        "joystickInner"
    );


let joystickActive = false;


function updateJoystick(
    clientX,
    clientY
) {

    const rect =
        joystickOuter.getBoundingClientRect();

    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;

    let dx =
        clientX - centerX;

    let dy =
        clientY - centerY;

    const max =
        rect.width / 2 -
        25;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    if (
        distance > max
    ) {

        dx =
            dx / distance *
            max;

        dy =
            dy / distance *
            max;
    }

    joystickInner.style.transform =
        `translate(calc(-50% + ${dx}px),
                   calc(-50% + ${dy}px))`;

    moveX =
        dx / max;

    moveZ =
        dy / max;
}


joystickOuter.addEventListener(
    "pointerdown",
    event => {

        joystickActive = true;

        joystickOuter.setPointerCapture(
            event.pointerId
        );

        updateJoystick(
            event.clientX,
            event.clientY
        );
    }
);


joystickOuter.addEventListener(
    "pointermove",
    event => {

        if (
            joystickActive
        ) {

            updateJoystick(
                event.clientX,
                event.clientY
            );
        }
    }
);


function resetJoystick() {

    joystickActive = false;

    moveX = 0;
    moveZ = 0;

    joystickInner.style.transform =
        "translate(-50%, -50%)";
}


joystickOuter.addEventListener(
    "pointerup",
    resetJoystick
);

joystickOuter.addEventListener(
    "pointercancel",
    resetJoystick
);


/* =========================================================
   RUN BUTTON
========================================================= */

const runButton =
    document.getElementById(
        "runButton"
    );

runButton.addEventListener(
    "pointerdown",
    () => {
        running = true;
    }
);

runButton.addEventListener(
    "pointerup",
    () => {
        running = false;
    }
);

runButton.addEventListener(
    "pointercancel",
    () => {
        running = false;
    }
);


/* =========================================================
   JUMP
========================================================= */

let verticalVelocity = 0;

let isGrounded = true;

const jumpButton =
    document.getElementById(
        "jumpButton"
    );


function jump() {

    if (
        isGrounded
    ) {

        verticalVelocity =
            7;

        isGrounded =
            false;
    }
}


jumpButton.addEventListener(
    "pointerdown",
    jump
);


window.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "Space"
        ) {
            jump();
        }
    }
);


/* =========================================================
   INTERACTION MESSAGE
========================================================= */

const messageBox =
    document.getElementById(
        "messageBox"
    );

const messageText =
    document.getElementById(
        "messageText"
    );


function showMessage(
    message
) {

    messageText.textContent =
        message;

    messageBox.classList.add(
        "show"
    );

    clearTimeout(
        showMessage.timer
    );

    showMessage.timer =
        setTimeout(
            () => {
                messageBox.classList.remove(
                    "show"
                );
            },
            3000
        );
}


/* =========================================================
   INTERACT BUTTON
========================================================= */

const interactButton =
    document.getElementById(
        "interactButton"
    );


function interact() {

    const playerPosition =
        player.position;

    const gateDistance =
        playerPosition.distanceTo(
            new THREE.Vector3(
                0,
                0,
                20
            )
        );


    if (
        gateDistance < 8
    ) {

        showMessage(
            "Welcome to ABSS Institute of Technology."
        );

        return;
    }


    showMessage(
        "Explore the ABSSIT campus."
    );
}


interactButton.addEventListener(
    "pointerdown",
    interact
);


/* =========================================================
   PAUSE SYSTEM
========================================================= */

const pauseButton =
    document.getElementById(
        "pauseButton"
    );

const pauseMenu =
    document.getElementById(
        "pauseMenu"
    );

const resumeButton =
    document.getElementById(
        "resumeButton"
    );


let paused = false;


pauseButton.addEventListener(
    "click",
    () => {

        paused = true;

        pauseMenu.classList.remove(
            "hidden"
        );
    }
);


resumeButton.addEventListener(
    "click",
    () => {

        paused = false;

        pauseMenu.classList.add(
            "hidden"
        );
    }
);


/* =========================================================
   RESTART
========================================================= */

const restartButton =
    document.getElementById(
        "restartButton"
    );


restartButton.addEventListener(
    "click",
    () => {

        player.position.set(
            0,
            0,
            10
        );

        camera.position.set(
            0,
            6,
            18
        );

        controls.target.set(
            0,
            1.5,
            10
        );

        paused = false;

        pauseMenu.classList.add(
            "hidden"
        );
    }
);


/* =========================================================
   LOADING SYSTEM
========================================================= */

const loadingScreen =
    document.getElementById(
        "loadingScreen"
    );

const loadingProgress =
    document.getElementById(
        "loadingProgress"
    );

const loadingText =
    document.getElementById(
        "loadingText"
    );


const characterScreen =
    document.getElementById(
        "characterScreen"
    );


let loadValue = 0;


function fakeLoading() {

    loadValue +=
        2 + Math.random() * 5;

    if (
        loadValue > 100
    ) {
        loadValue = 100;
    }

    loadingProgress.style.width =
        `${loadValue}%`;


    if (
        loadValue < 25
    ) {

        loadingText.textContent =
            "Preparing ABSS campus...";

    } else if (
        loadValue < 50
    ) {

        loadingText.textContent =
            "Creating buildings...";

    } else if (
        loadValue < 75
    ) {

        loadingText.textContent =
            "Growing campus grass...";

    } else if (
        loadValue < 95
    ) {

        loadingText.textContent =
            "Preparing students and animals...";

    } else {

        loadingText.textContent =
            "Campus ready...";
    }


    if (
        loadValue >= 100
    ) {

        setTimeout(
            () => {

                loadingScreen.classList.add(
                    "hidden"
                );

                characterScreen.classList.remove(
                    "hidden"
                );

            },
            500
        );

    } else {

        requestAnimationFrame(
            fakeLoading
        );
    }
}


fakeLoading();


/* =========================================================
   CHARACTER SELECTION
========================================================= */

const maleButton =
    document.getElementById(
        "maleButton"
    );

const femaleButton =
    document.getElementById(
        "femaleButton"
    );

const startGameButton =
    document.getElementById(
        "startGameButton"
    );


let selectedGender =
    "male";


maleButton.addEventListener(
    "click",
    () => {

        selectedGender =
            "male";

        showMessage(
            "Male character selected."
        );
    }
);


femaleButton.addEventListener(
    "click",
    () => {

        selectedGender =
            "female";

        showMessage(
            "Female character selected."
        );
    }
);


startGameButton.addEventListener(
    "click",
    () => {

        characterScreen.classList.add(
            "hidden"
        );

        showMessage(
            "Welcome to ABSS Map."
        );

        document.getElementById(
            "cameraHint"
        ).style.opacity = "0.8";

    }
);


/* =========================================================
   PLAYER MOVEMENT FUNCTION
========================================================= */

const clock =
    new THREE.Clock();


function updatePlayer(
    delta
) {

    if (
        paused
    ) {
        return;
    }


    let forward = 0;
    let sideways = 0;


    if (
        keys["KeyW"] ||
        keys["ArrowUp"]
    ) {
        forward += 1;
    }


    if (
        keys["KeyS"] ||
        keys["ArrowDown"]
    ) {
        forward -= 1;
    }


    if (
        keys["KeyD"] ||
        keys["ArrowRight"]
    ) {
        sideways += 1;
    }


    if (
        keys["KeyA"] ||
        keys["ArrowLeft"]
    ) {
        sideways -= 1;
    }


    forward +=
        -moveZ;

    sideways +=
        moveX;


    const length =
        Math.sqrt(
            forward * forward +
            sideways * sideways
        );


    if (
        length > 1
    ) {

        forward /= length;
        sideways /= length;
    }


    const speed =
        running
            ? 10
            : 5;


    const movement =
        speed * delta;


    /* CAMERA DIRECTION */

    const direction =
        new THREE.Vector3();

    camera.getWorldDirection(
        direction
    );

    direction.y = 0;

    direction.normalize();


    const right =
        new THREE.Vector3(
            direction.z,
            0,
            -direction.x
        );


    player.position.addScaledVector(
        direction,
        forward * movement
    );


    player.position.addScaledVector(
        right,
        sideways * movement
    );


    /* PLAYER ROTATION */

    if (
        length > 0.05
    ) {

        const targetRotation =
            Math.atan2(
                sideways,
                forward
            );

        player.rotation.y =
            THREE.MathUtils.lerp(
                player.rotation.y,
                targetRotation,
                0.15
            );
    }


    /* GRAVITY */

    verticalVelocity -=
        18 * delta;

    player.position.y +=
        verticalVelocity * delta;


    if (
        player.position.y <= 0
    ) {

        player.position.y = 0;

        verticalVelocity = 0;

        isGrounded = true;
    }


    /* WORLD BOUNDARY */

    player.position.x =
        THREE.MathUtils.clamp(
            player.position.x,
            -180,
            180
        );

    player.position.z =
        THREE.MathUtils.clamp(
            player.position.z,
            -190,
            180
        );
}


/* =========================================================
   GRASS WIND ANIMATION
========================================================= */

function animateGrass(
    time
) {

    for (
        const blade of grassBlades
    ) {

        const wind =
            Math.sin(
                time *
                blade.speed +
                blade.phase
            ) * 0.22;


        blade.mesh.rotation.z =
            blade.baseRotation +
            wind;


        blade.mesh.rotation.x =
            Math.cos(
                time * 0.8 +
                blade.phase
            ) * 0.08;
    }
}


/* =========================================================
   TREE WIND
========================================================= */

function animateTrees(
    time
) {

    for (
        let i = 0;
        i < trees.length;
        i++
    ) {

        const tree =
            trees[i];

        tree.rotation.z =
            Math.sin(
                time * 0.45 +
                i
            ) * 0.015;
    }
}


/* =========================================================
   NPC ANIMATION
========================================================= */

function animateNPCs(
    time
) {

    for (
        let i = 0;
        i < npcs.length;
        i++
    ) {

        const npc =
            npcs[i];

        npc.mesh.position.x =
            npc.startX +
            Math.sin(
                time * 0.25 +
                npc.phase
            ) * 2;

        npc.mesh.position.z =
            npc.startZ +
            Math.cos(
                time * 0.2 +
                npc.phase
            ) * 2;

        npc.mesh.rotation.y =
            Math.sin(
                time * 0.25 +
                npc.phase
            );
    }
}


/* =========================================================
   ANIMAL ANIMATION
========================================================= */

function animateAnimals(
    time
) {

    for (
        let i = 0;
        i < animals.length;
        i++
    ) {

        const animal =
            animals[i];

        const distance =
            animal.mesh.position.distanceTo(
                player.position
            );


        /* RUN AWAY WHEN PLAYER APPROACHES */

        if (
            distance < 7
        ) {

            const away =
                animal.mesh.position
                    .clone()
                    .sub(player.position);

            away.y = 0;

            if (
                away.length() > 0
            ) {

                away.normalize();

                animal.mesh.position.addScaledVector(
                    away,
                    0.08
                );
            }

        } else {

            animal.mesh.position.x =
                animal.homeX +
                Math.sin(
                    time * 0.3 +
                    animal.phase
                ) * 2;

            animal.mesh.position.z =
                animal.homeZ +
                Math.cos(
                    time * 0.25 +
                    animal.phase
                ) * 2;
        }
    }
}


/* =========================================================
   CAMERA FOLLOW
========================================================= */

function updateCamera() {

    const desiredTarget =
        new THREE.Vector3(
            player.position.x,
            player.position.y + 1.5,
            player.position.z
        );


    controls.target.lerp(
        desiredTarget,
        0.12
    );
}


/* =========================================================
   LOCATION UI
========================================================= */

const locationName =
    document.getElementById(
        "locationName"
    );


function updateLocation() {

    const z =
        player.position.z;


    if (
        z > 10
    ) {

        locationName.textContent =
            "Main Gate";

    } else if (
        z > -45
    ) {

        locationName.textContent =
            "Campus Garden";

    } else if (
        z > -95
    ) {

        locationName.textContent =
            "Main College";

    } else if (
        z > -145
    ) {

        locationName.textContent =
            "Academic Block";

    } else {

        locationName.textContent =
            "Laboratory Area";
    }
}


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

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
    }
);


/* =========================================================
   MAIN ANIMATION LOOP
========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    const time =
        clock.elapsedTime;


    updatePlayer(
        delta
    );

    updateCamera();

    updateLocation();

    animateGrass(
        time
    );

    animateTrees(
        time
    );

    animateNPCs(
        time
    );

    animateAnimals(
        time
    );


    controls.update();


    renderer.render(
        scene,
        camera
    );
}


/* =========================================================
   START GAME
========================================================= */

animate();


/* =========================================================
   INITIAL MESSAGE
========================================================= */

setTimeout(
    () => {

        if (
            loadingScreen.classList.contains(
                "hidden"
            )
        ) {

            showMessage(
                "Explore ABSSIT campus using the joystick."
            );
        }

    },
    6000
);
