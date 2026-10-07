import * as THREE from "three";
import { dragonActionsById } from "../../dragon-data";
import { sounds } from "../sounds";

const OUTLINE_COLOR = 0x4b2e22;
const LILAC = 0xd9c8ff;
const SNOUT = 0xffe0f0;
const CREAM = 0xfff3d6;
const GOLD = 0xffd45e;
const BLUSH = 0xff9bb5;
const CLAW = 0xfff3d6;
const PEARL = 0xfff6e0;
const RAINBOW = [0xff8fa3, 0xffb86b, 0xffe27a, 0x8fe3a8, 0x8cc8f2, 0xb79cf2];
const ICY = new THREE.Color(0xa8dcff);
const HOT = new THREE.Color(0xff9a9a);

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const between = (t, start, end) => clamp01((t - start) / (end - start));
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const pulse = (t, start, end) => Math.sin(Math.PI * between(t, start, end));
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (items) => items[Math.floor(Math.random() * items.length)];

/* ---------- Materials and helpers ---------- */

function createMaterials() {
  // Three flat bands of light give the cel-shaded, sticker-like kawaii look.
  const gradientMap = new THREE.DataTexture(new Uint8Array([120, 195, 255]), 3, 1, THREE.RedFormat);
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.needsUpdate = true;

  const cache = new Map();
  const toon = (color) => {
    if (!cache.has(color)) cache.set(color, new THREE.MeshToonMaterial({ color, gradientMap }));
    return cache.get(color);
  };
  const outline = new THREE.MeshBasicMaterial({ color: OUTLINE_COLOR, side: THREE.BackSide });
  const ink = new THREE.MeshBasicMaterial({ color: OUTLINE_COLOR });
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff });

  return {
    toon,
    outline,
    ink,
    white,
    dispose() {
      [...cache.values(), outline, ink, white].forEach((material) => material.dispose());
      gradientMap.dispose();
    },
  };
}

const sphere = (radius, detail = 1) => new THREE.SphereGeometry(radius, Math.round(36 * detail), Math.round(24 * detail));

// A toon mesh with a dark "inverted hull" outline, matching the mascots' brown outlines.
function part(geometry, material, materials, radius = 1, line = 0.045) {
  const mesh = new THREE.Mesh(geometry, material);
  if (line > 0) {
    const outline = new THREE.Mesh(geometry, materials.outline);
    outline.scale.setScalar(1 + line / radius);
    outline.raycast = () => {};
    mesh.add(outline);
  }
  return mesh;
}

function rainbowWingGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.25, 0.85, 1.0, 1.25, 1.35, 0.95);
  shape.bezierCurveTo(1.15, 0.75, 1.25, 0.5, 1.08, 0.38);
  shape.bezierCurveTo(0.95, 0.24, 0.92, 0.06, 0.7, 0.06);
  shape.bezierCurveTo(0.5, -0.1, 0.22, -0.06, 0, 0);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.05, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 24,
  });

  // Colour the wing as a rainbow fan from root to tip.
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const color = new THREE.Color();
  for (let index = 0; index < position.count; index += 1) {
    const reach = clamp01(Math.hypot(position.getX(index), position.getY(index)) / 1.6);
    const scaled = reach * (RAINBOW.length - 1);
    const low = Math.floor(scaled);
    color.set(RAINBOW[low]).lerp(new THREE.Color(RAINBOW[Math.min(low + 1, RAINBOW.length - 1)]), scaled - low);
    color.toArray(colors, index * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function heartGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.12);
  shape.bezierCurveTo(-0.02, -0.08, -0.16, 0.0, -0.13, 0.08);
  shape.bezierCurveTo(-0.1, 0.16, -0.02, 0.13, 0, 0.07);
  shape.bezierCurveTo(0.02, 0.13, 0.1, 0.16, 0.13, 0.08);
  shape.bezierCurveTo(0.16, 0.0, 0.02, -0.08, 0, -0.12);
  return new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
}

/* ---------- The dragon ---------- */

function buildDragon(materials) {
  const lilac = materials.toon(LILAC);
  const root = new THREE.Group();
  const turn = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(turn);
  turn.add(bodyGroup);

  const body = part(sphere(1), lilac, materials, 1, 0.05);
  body.scale.set(1, 1.05, 0.92);
  body.position.y = 1.05;
  bodyGroup.add(body);

  const belly = part(sphere(0.62), materials.toon(CREAM), materials, 0.62, 0.035);
  belly.scale.set(1, 1.15, 0.5);
  belly.position.set(0, 0.95, 0.66);
  bodyGroup.add(belly);

  // A fluffy chest tuft, extra snuggly.
  const tuft = new THREE.Group();
  [[0, 0, 0, 0.2], [-0.17, -0.06, -0.02, 0.15], [0.17, -0.06, -0.02, 0.15], [-0.08, 0.12, -0.04, 0.13], [0.09, 0.12, -0.04, 0.13]]
    .forEach(([x, y, z, radius]) => {
      const puff = part(sphere(radius, 0.6), materials.toon(0xffffff), materials, radius, 0.025);
      puff.position.set(x, y, z);
      tuft.add(puff);
    });
  tuft.position.set(0, 1.72, 0.62);
  bodyGroup.add(tuft);

  const clawMaterial = materials.toon(CLAW);
  const addClaws = (target, positions, rotation) => positions.forEach(([x, y, z]) => {
    const claw = part(new THREE.ConeGeometry(0.045, 0.13, 12), clawMaterial, materials, 0.04, 0.012);
    claw.position.set(x, y, z);
    claw.rotation.copy(rotation);
    target.add(claw);
  });

  // Dragon legs: chunky haunches over big clawed feet.
  const feet = [-1, 1].map((side) => {
    const haunch = part(sphere(0.42), lilac, materials, 0.42, 0.04);
    haunch.scale.set(0.85, 0.95, 1.05);
    haunch.position.set(side * 0.66, 0.5, 0.02);
    bodyGroup.add(haunch);

    const foot = new THREE.Group();
    foot.position.set(side * 0.55, 0.16, 0.32);
    const pad = part(sphere(0.3), lilac, materials, 0.3, 0.035);
    pad.scale.set(1, 0.55, 1.3);
    foot.add(pad);
    addClaws(foot, [[-0.15, -0.02, 0.36], [0, -0.02, 0.4], [0.15, -0.02, 0.36]], new THREE.Euler(Math.PI / 2, 0, 0));
    root.add(foot);
    return foot;
  });

  const arms = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.8, 1.38, 0.3);
    const arm = part(new THREE.CapsuleGeometry(0.15, 0.28, 8, 16), lilac, materials, 0.15, 0.03);
    arm.position.y = -0.22;
    const hand = part(sphere(0.17, 0.7), lilac, materials, 0.17, 0.03);
    hand.position.set(0, -0.48, 0.04);
    hand.scale.set(1, 0.9, 1);
    pivot.add(arm, hand);
    addClaws(pivot, [[-0.08, -0.6, 0.14], [0.02, -0.63, 0.16], [0.1, -0.59, 0.12]], new THREE.Euler(2.4, 0, 0));
    pivot.userData.side = side;
    bodyGroup.add(pivot);
    return pivot;
  });

  const wingGeometry = rainbowWingGeometry();
  const wingMaterial = new THREE.MeshToonMaterial({
    vertexColors: true, side: THREE.DoubleSide, gradientMap: materials.toon(LILAC).gradientMap,
  });
  const wings = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.42, 1.6, -0.62);
    const wing = new THREE.Mesh(wingGeometry, wingMaterial);
    wing.scale.set(side * 1.15, 1.15, 1);
    wing.rotation.set(0.15, 0, side * 0.1);
    pivot.add(wing);
    pivot.userData.side = side;
    bodyGroup.add(pivot);
    return pivot;
  });

  // Rainbow spikes down the back.
  RAINBOW.forEach((color, index) => {
    const angle = 0.55 + index * 0.33;
    const spike = part(new THREE.ConeGeometry(0.12, 0.3, 16), materials.toon(color), materials, 0.12, 0.025);
    spike.position.set(0, 1.05 + 1.08 * Math.cos(angle), -0.97 * Math.sin(angle));
    spike.rotation.x = -angle;
    bodyGroup.add(spike);
  });

  // A curly tail of rainbow segments. Each segment is a child of the last, so sway ripples to the tip.
  const tail = [];
  let parent = new THREE.Group();
  parent.position.set(0, 0.5, -0.8);
  bodyGroup.add(parent);
  [0.3, 0.26, 0.22, 0.18, 0.15, 0.12].forEach((radius, index) => {
    const segment = new THREE.Group();
    segment.position.set(0, index === 0 ? 0 : 0.06 + index * 0.025, index === 0 ? 0 : -0.3);
    const ball = part(sphere(radius, 0.7), materials.toon(RAINBOW[index]), materials, radius, 0.03);
    segment.add(ball);
    parent.add(segment);
    tail.push(segment);
    parent = segment;
  });
  const tailTip = part(new THREE.ConeGeometry(0.16, 0.32, 4), materials.toon(0xff8fa3), materials, 0.14, 0.03);
  tailTip.position.set(0, 0.1, -0.2);
  tailTip.rotation.x = -1.1;
  parent.add(tailTip);

  // Head on a neck pivot, so it can nod, tilt and turn.
  const head = new THREE.Group();
  head.position.set(0, 2.0, 0.15);
  bodyGroup.add(head);

  const skull = part(sphere(0.92), lilac, materials, 0.92, 0.05);
  skull.scale.set(1.12, 0.95, 1);
  skull.position.y = 0.55;
  head.add(skull);

  const snout = part(sphere(0.5), materials.toon(SNOUT), materials, 0.42, 0.035);
  snout.scale.set(1.05, 0.62, 0.72);
  snout.position.set(0, 0.28, 0.74);
  head.add(snout);

  [-1, 1].forEach((side) => {
    const nostril = new THREE.Mesh(sphere(0.035, 0.4), materials.ink);
    nostril.position.set(side * 0.13, 0.39, 1.08);
    head.add(nostril);
  });

  const mouth = new THREE.Group();
  mouth.position.set(0, 0.13, 1.05);
  const mouthShape = new THREE.Mesh(sphere(0.15, 0.6), materials.ink);
  mouthShape.scale.set(1, 0.15, 0.4);
  const tongue = new THREE.Mesh(sphere(0.08, 0.5), materials.toon(0xff8fae));
  tongue.position.set(0, -0.05, 0.03);
  tongue.scale.set(1, 0.6, 0.6);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.022, 8, 20, Math.PI), materials.ink);
  smile.rotation.z = Math.PI;
  smile.position.set(0, 0.03, 0.02);
  mouth.add(mouthShape, tongue, smile);
  head.add(mouth);

  const eyes = [-1, 1].map((side) => {
    const group = new THREE.Group();
    group.position.set(side * 0.4, 0.64, 0.8);
    group.rotation.y = side * 0.32;

    const open = new THREE.Group();
    const pupil = new THREE.Mesh(sphere(0.17, 0.6), materials.ink);
    pupil.scale.set(0.85, 1, 0.5);
    const shine = new THREE.Mesh(sphere(0.055, 0.4), materials.white);
    shine.position.set(-0.045, 0.06, 0.08);
    const sparkle = new THREE.Mesh(sphere(0.025, 0.3), materials.white);
    sparkle.position.set(0.05, -0.05, 0.08);
    open.add(pupil, shine, sparkle);

    const happy = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.028, 8, 20, Math.PI), materials.ink);
    happy.position.y = -0.03;
    happy.visible = false;

    group.add(open, happy);
    head.add(group);
    return { group, open, happy };
  });

  const blushMaterial = new THREE.MeshBasicMaterial({ color: BLUSH, transparent: true, opacity: 0.6, depthWrite: false });
  const blushes = [-1, 1].map((side) => {
    const blush = new THREE.Mesh(new THREE.CircleGeometry(0.14, 24), blushMaterial);
    blush.position.set(side * 0.7, 0.36, 0.66);
    blush.rotation.y = side * 0.8;
    blush.scale.set(1, 0.65, 1);
    head.add(blush);
    return blush;
  });

  // A tall pearly unicorn horn wrapped in a pastel spiral.
  const horn = new THREE.Group();
  horn.position.set(0, 1.72, 0.2);
  horn.rotation.x = 0.28;
  horn.add(part(new THREE.ConeGeometry(0.15, 0.95, 32), materials.toon(PEARL), materials, 0.12, 0.025));
  [[0xffb3d9, 0], [0xb79cf2, Math.PI]].forEach(([color, offset]) => {
    const spiral = new THREE.Curve();
    spiral.getPoint = (t, target = new THREE.Vector3()) => {
      const angle = offset + t * Math.PI * 7;
      const radius = 0.155 * (1 - t) + 0.008;
      return target.set(Math.cos(angle) * radius, -0.47 + t * 0.9, Math.sin(angle) * radius);
    };
    horn.add(new THREE.Mesh(new THREE.TubeGeometry(spiral, 120, 0.022, 8), materials.toon(color)));
  });
  const hornSparkle = part(new THREE.OctahedronGeometry(0.07), materials.toon(GOLD), materials, 0.06, 0.015);
  hornSparkle.position.y = 0.52;
  horn.add(hornSparkle);
  head.add(horn);

  // Big fluffy ears with pink insides and white fur tufts.
  const ears = [-1, 1].map((side) => {
    const ear = new THREE.Group();
    ear.position.set(side * 0.82, 1.12, -0.06);
    ear.rotation.set(0, side * 0.35, -side * 0.55);
    ear.scale.setScalar(1.25);
    const outer = part(sphere(0.3, 0.8), lilac, materials, 0.3, 0.035);
    outer.scale.set(0.62, 1, 0.38);
    const inner = new THREE.Mesh(sphere(0.22, 0.6), materials.toon(0xffc2dc));
    inner.scale.set(0.48, 0.82, 0.2);
    inner.position.set(0, -0.02, 0.08);
    ear.add(outer, inner);
    [[0, -0.16, 0.12, 0.085], [-0.06, -0.05, 0.13, 0.07], [0.06, -0.08, 0.13, 0.07], [0, 0.06, 0.12, 0.06]].forEach(([x, y, z, radius]) => {
      const fluff = part(sphere(radius, 0.4), materials.toon(0xffffff), materials, radius, 0.015);
      fluff.position.set(x, y, z);
      ear.add(fluff);
    });
    [[0, 0.3, 0, 0.09, 0xffb3d9], [-0.05, 0.25, 0.03, 0.07, 0xb79cf2], [0.05, 0.25, 0.03, 0.07, 0xffe27a]].forEach(([x, y, z, radius, color]) => {
      const tip = part(sphere(radius, 0.4), materials.toon(color), materials, radius, 0.015);
      tip.position.set(x, y, z);
      ear.add(tip);
    });
    ear.userData.side = side;
    head.add(ear);
    return ear;
  });

  // Rainbow mane tufts on top of the head.
  RAINBOW.slice(0, 4).forEach((color, index) => {
    const tuftBall = part(sphere(0.14 - index * 0.012, 0.6), materials.toon(color), materials, 0.13, 0.025);
    tuftBall.position.set(0, 1.38 - index * 0.07, -0.2 - index * 0.22);
    head.add(tuftBall);
  });

  // Soap foam that sits on her head during bath time.
  const foam = new THREE.Group();
  [[0, 1.5, 0.05, 0.2], [-0.25, 1.42, 0.1, 0.16], [0.26, 1.42, 0.08, 0.17], [-0.1, 1.62, -0.05, 0.14], [0.13, 1.6, -0.1, 0.13], [0.45, 1.2, 0.3, 0.12]]
    .forEach(([x, y, z, radius]) => {
      const bubble = part(sphere(radius, 0.5), materials.toon(0xffffff), materials, radius, 0.02);
      bubble.position.set(x, y, z);
      foam.add(bubble);
    });
  foam.visible = false;
  head.add(foam);

  return {
    root, turn, bodyGroup, body, feet, arms, wings, tail, head, mouth, mouthShape, tongue, smile, eyes, ears, horn, blushMaterial,
    blushes, foam, lilac, baseColor: new THREE.Color(LILAC), wingMaterial, wingGeometry,
  };
}

/* ---------- Props: treats, comb and towel ---------- */

function buildTreat(id, materials) {
  const group = new THREE.Group();
  const add = (mesh, x = 0, y = 0, z = 0) => {
    mesh.position.set(x, y, z);
    group.add(mesh);
    return mesh;
  };

  if (id === "apple") {
    add(part(sphere(0.3), materials.toon(0xff6b6b), materials, 0.3, 0.03)).scale.set(1, 0.9, 1);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16), materials.ink), 0, 0.3, 0);
    add(part(sphere(0.09, 0.5), materials.toon(0x8fe3a8), materials, 0.09, 0.02), 0.1, 0.32, 0).scale.set(1.4, 0.5, 0.8);
  } else if (id === "carrot") {
    [-0.12, 0, 0.12].forEach((x, index) => {
      const stick = add(part(new THREE.CylinderGeometry(0.05, 0.04, 0.5, 12), materials.toon(0xffa552), materials, 0.05, 0.015), x, 0, 0);
      stick.rotation.z = (index - 1) * 0.3;
    });
  } else if (id === "cupcake") {
    add(part(new THREE.CylinderGeometry(0.22, 0.16, 0.24, 20), materials.toon(0xf7a8c8), materials, 0.2, 0.025));
    add(part(sphere(0.25, 0.7), materials.toon(0xfff0f6), materials, 0.25, 0.025), 0, 0.17, 0).scale.set(1, 0.55, 1);
    add(part(sphere(0.17, 0.6), materials.toon(0xc9b2f7), materials, 0.17, 0.02), 0, 0.29, 0).scale.set(1, 0.65, 1);
    add(part(sphere(0.07, 0.5), materials.toon(0xff6b8a), materials, 0.07, 0.015), 0, 0.42, 0);
    for (let index = 0; index < 10; index += 1) {
      const angle = index * 0.63;
      const sprinkle = add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.018, 0.018), materials.toon(RAINBOW[index % 6])),
        Math.cos(angle) * 0.17, 0.22, Math.sin(angle) * 0.17);
      sprinkle.rotation.y = angle;
    }
  } else if (id === "chilli") {
    add(part(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 28), materials.toon(0xe8b27a), materials, 0.3, 0.025));
    [[-0.1, -0.05, 0.6], [0.12, 0.08, -0.4]].forEach(([x, z, angle]) => {
      const chilli = add(part(new THREE.CapsuleGeometry(0.04, 0.14, 6, 10), materials.toon(0xff4d4d), materials, 0.04, 0.012), x, 0.07, z);
      chilli.rotation.set(Math.PI / 2, 0, angle);
    });
  } else if (id === "icecream") {
    const cone = add(part(new THREE.ConeGeometry(0.17, 0.42, 20), materials.toon(0xf0c48a), materials, 0.15, 0.02), 0, -0.1, 0);
    cone.rotation.x = Math.PI;
    add(part(sphere(0.2, 0.7), materials.toon(0xffb3cf), materials, 0.2, 0.025), 0, 0.17, 0);
    add(part(sphere(0.16, 0.6), materials.toon(0xb8f0d8), materials, 0.16, 0.02), 0, 0.36, 0);
  } else if (id === "milkshake") {
    add(part(new THREE.CylinderGeometry(0.2, 0.15, 0.5, 24), materials.toon(0xffb3cf), materials, 0.18, 0.025));
    add(part(sphere(0.2, 0.6), materials.toon(0xffffff), materials, 0.2, 0.02), 0, 0.28, 0).scale.set(1, 0.6, 1);
    add(part(sphere(0.08, 0.5), materials.toon(0xff4d6d), materials, 0.08, 0.015), 0, 0.4, 0).scale.set(1, 1.15, 1);
    add(new THREE.Mesh(sphere(0.04, 0.3), materials.toon(0x6cc28a)), 0, 0.49, 0).scale.set(1.5, 0.5, 1.5);
    const straw = add(part(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 10), materials.toon(0x8cc8f2), materials, 0.03, 0.01), 0.1, 0.35, 0);
    straw.rotation.z = -0.35;
  }

  group.scale.setScalar(1.2);
  return group;
}

// An easel whose canvas fills in with a rainbow as Mochi paints.
function buildEasel(materials) {
  const easel = new THREE.Group();
  const wood = materials.toon(0xc98a5a);
  [[-0.38, 0.12], [0.38, -0.12]].forEach(([x, tilt]) => {
    const leg = part(new THREE.BoxGeometry(0.07, 1.9, 0.07), wood, materials, 0.05, 0.012);
    leg.position.set(x, 0.92, 0);
    leg.rotation.z = tilt;
    easel.add(leg);
  });
  const backLeg = part(new THREE.BoxGeometry(0.07, 1.8, 0.07), wood, materials, 0.05, 0.012);
  backLeg.position.set(0, 0.85, -0.3);
  backLeg.rotation.x = -0.35;
  easel.add(backLeg);
  const ledge = part(new THREE.BoxGeometry(1.0, 0.07, 0.14), wood, materials, 0.05, 0.012);
  ledge.position.set(0, 0.85, 0.06);
  easel.add(ledge);
  const board = part(new THREE.BoxGeometry(1.15, 0.9, 0.05), materials.toon(0xffffff), materials, 0.2, 0.015);
  board.position.set(0, 1.33, 0.05);
  easel.add(board);

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 200;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.8), new THREE.MeshBasicMaterial({ map: texture }));
  surface.position.set(0, 1.33, 0.08);
  easel.add(surface);

  const context = canvas.getContext("2d");
  const rainbowCss = ["#ff8fa3", "#ffb86b", "#ffe27a", "#8fe3a8", "#8cc8f2", "#b79cf2"];
  function draw(progress) {
    context.fillStyle = "#fffaf2";
    context.fillRect(0, 0, 256, 200);
    context.lineCap = "round";
    context.lineWidth = 15;
    rainbowCss.forEach((color, index) => {
      const share = clamp01(progress * rainbowCss.length - index);
      if (share <= 0) return;
      context.strokeStyle = color;
      context.beginPath();
      context.arc(128, 178, 108 - index * 15, Math.PI, Math.PI + share * Math.PI);
      context.stroke();
    });
    if (progress >= 1) {
      context.fillStyle = "#ffffff";
      context.strokeStyle = "#cbbfe6";
      context.lineWidth = 3;
      [[30, 172], [226, 172]].forEach(([x, y]) => {
        context.beginPath();
        context.arc(x - 12, y, 14, 0, Math.PI * 2);
        context.arc(x + 4, y - 8, 17, 0, Math.PI * 2);
        context.arc(x + 18, y + 2, 13, 0, Math.PI * 2);
        context.fill();
      });
      context.fillStyle = "#ffd45e";
      context.beginPath();
      context.arc(210, 40, 18, 0, Math.PI * 2);
      context.fill();
    }
    texture.needsUpdate = true;
  }
  draw(0);

  easel.userData.dispose = () => {
    texture.dispose();
    surface.material.dispose();
  };
  return { easel, draw };
}

function buildBrush(materials) {
  const brush = new THREE.Group();
  const handle = part(new THREE.CylinderGeometry(0.03, 0.035, 0.55, 10), materials.toon(0xc98a5a), materials, 0.03, 0.01);
  const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.08, 10), materials.toon(0xd6d0e0));
  ferrule.position.y = 0.3;
  const tipMaterial = new THREE.MeshToonMaterial({ color: RAINBOW[0], gradientMap: materials.toon(LILAC).gradientMap });
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 10), tipMaterial);
  tip.position.y = 0.4;
  brush.add(handle, ferrule, tip);
  brush.userData.tip = tip;
  brush.userData.dispose = () => tipMaterial.dispose();
  return brush;
}

// A frilly pink tutu that sits around Mochi's tummy.
function buildTutu(materials) {
  const tutu = new THREE.Group();
  // Two layers of puffy ruffles: a pale inner layer and a fuller outer one.
  [[26, 1.0, 0.86, 0.2, 0xffe3ef], [30, 1.13, 0.72, 0.24, 0xffb3d9]].forEach(([count, reach, y, radius, color]) => {
    for (let index = 0; index < count; index += 1) {
      const angle = ((index + 0.5 * (reach > 1.05 ? 1 : 0)) / count) * Math.PI * 2;
      const ruffle = part(sphere(radius, 0.5), materials.toon(index % 3 ? color : 0xffd0e3), materials, radius, 0.012);
      ruffle.position.set(Math.cos(angle) * reach, y, Math.sin(angle) * reach * 0.94);
      ruffle.scale.set(1, 0.55, 1);
      tutu.add(ruffle);
    }
  });
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.06, 8, 40), materials.toon(0xff8fb8));
  band.rotation.x = Math.PI / 2;
  band.scale.set(1, 0.93, 1);
  band.position.y = 0.95;
  tutu.add(band);
  const bow = part(sphere(0.1, 0.5), materials.toon(0xf06aa8), materials, 0.1, 0.015);
  bow.position.set(0, 0.97, 0.94);
  bow.scale.set(1.6, 0.9, 0.6);
  tutu.add(bow);
  return tutu;
}

function buildComb(materials) {
  const comb = new THREE.Group();
  comb.add(part(new THREE.BoxGeometry(0.7, 0.14, 0.07), materials.toon(0xf7a8c8), materials, 0.07, 0.015));
  for (let index = 0; index < 10; index += 1) {
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.05), materials.toon(0xf7a8c8));
    tooth.position.set(-0.3 + index * 0.067, -0.15, 0);
    comb.add(tooth);
  }
  return comb;
}

function buildTowel(materials) {
  const towel = new THREE.Group();
  towel.add(part(new THREE.BoxGeometry(1.7, 0.85, 0.06), materials.toon(0xffd0e3), materials, 0.2, 0.02));
  [-0.25, 0.25].forEach((y) => {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.08, 0.07), materials.toon(0xffffff));
    stripe.position.y = y;
    towel.add(stripe);
  });
  return towel;
}

/* ---------- Particles ---------- */

function textTexture(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.font = "700 64px Fredoka, 'Arial Rounded MT Bold', sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineWidth = 12;
  context.strokeStyle = "#ffffff";
  context.strokeText(text, 128, 64);
  context.fillStyle = color;
  context.fillText(text, 128, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

class Effects {
  constructor(scene, materials) {
    this.scene = scene;
    this.items = [];
    this.geometries = {
      heart: heartGeometry(),
      sparkle: new THREE.OctahedronGeometry(0.07),
      flame: sphere(0.17, 0.4),
      snow: new THREE.OctahedronGeometry(0.06),
      bubble: sphere(1, 0.5),
      puff: sphere(0.2, 0.4),
      sprinkle: new THREE.BoxGeometry(0.08, 0.025, 0.025),
    };
    this.materials = {
      heart: materials.toon(0xff8fae),
      sparkle: new THREE.MeshBasicMaterial({ color: 0xffd45e, transparent: true }),
      flame: new THREE.MeshBasicMaterial({ color: 0xffa552, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
      snow: new THREE.MeshBasicMaterial({ color: 0xeaf7ff, transparent: true }),
      bubble: new THREE.MeshStandardMaterial({
        color: 0xe6f6ff, emissive: 0x8cc8f2, emissiveIntensity: 0.25, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.5, depthWrite: false,
      }),
      puff: new THREE.MeshBasicMaterial({ color: 0xd6d0e0, transparent: true, depthWrite: false }),
    };
    this.textures = new Map();
  }

  spawn(object, { velocity = new THREE.Vector3(), life = 1, gravity = 0, grow = 0, spin = 0, wobble = 0, opacity = 1 }) {
    object.traverse((child) => {
      if (child.material) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = opacity;
      }
    });
    this.scene.add(object);
    this.items.push({ object, velocity, life, gravity, grow, spin, wobble, opacity, age: 0, seed: Math.random() * 10, baseScale: object.scale.clone() });
  }

  mesh(kind, position, scale = 1, color) {
    const mesh = new THREE.Mesh(this.geometries[kind], this.materials[kind]);
    if (color !== undefined) {
      mesh.material = mesh.material.clone();
      mesh.material.color.set(color);
    }
    mesh.position.copy(position);
    mesh.scale.setScalar(scale);
    return mesh;
  }

  text(text, color, position, size = 0.9) {
    const key = `${text}|${color}`;
    if (!this.textures.has(key)) this.textures.set(key, textTexture(text, color));
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.textures.get(key), transparent: true, depthWrite: false }));
    sprite.position.copy(position);
    sprite.scale.set(size, size / 2, 1);
    return sprite;
  }

  hearts(origin, count = 1) {
    for (let index = 0; index < count; index += 1) {
      const heart = this.mesh("heart", origin.clone().add(new THREE.Vector3(rand(-0.6, 0.6), rand(-0.2, 0.3), rand(-0.1, 0.3))), rand(0.9, 1.4));
      heart.material = heart.material.clone();
      heart.material.color.set(pick([0xff8fae, 0xff6b8a, 0xc9b2f7]));
      this.spawn(heart, { velocity: new THREE.Vector3(rand(-0.2, 0.2), rand(0.7, 1.1), 0), life: rand(1.2, 1.7), grow: 0.3, wobble: 0.6 });
    }
  }

  sparkles(origin, count = 6, spread = 1.4) {
    for (let index = 0; index < count; index += 1) {
      const direction = new THREE.Vector3(rand(-1, 1), rand(-0.4, 1), rand(-0.4, 1)).normalize();
      const sparkle = this.mesh("sparkle", origin.clone().addScaledVector(direction, rand(0.2, 0.6)), rand(0.6, 1.3), pick([0xffd45e, 0xffffff, 0xff8fae, 0x8cc8f2]));
      this.spawn(sparkle, { velocity: direction.multiplyScalar(rand(0.4, spread)), life: rand(0.6, 1.1), spin: rand(3, 8) });
    }
  }

  update(dt) {
    for (let index = this.items.length - 1; index >= 0; index -= 1) {
      const item = this.items[index];
      item.age += dt;
      const progress = item.age / item.life;
      if (progress >= 1) {
        this.remove(index);
        continue;
      }
      item.velocity.y -= item.gravity * dt;
      item.object.position.addScaledVector(item.velocity, dt);
      if (item.wobble) item.object.position.x += Math.sin(item.age * 7 + item.seed) * item.wobble * dt;
      item.object.scale.copy(item.baseScale).multiplyScalar(1 + item.grow * item.age);
      item.object.rotation.y += item.spin * dt;
      item.object.rotation.z += item.spin * 0.6 * dt;
      const fade = progress > 0.65 ? 1 - (progress - 0.65) / 0.35 : 1;
      item.object.traverse((child) => {
        if (child.material) child.material.opacity = item.opacity * fade;
      });
    }
  }

  remove(index) {
    const [item] = this.items.splice(index, 1);
    this.scene.remove(item.object);
    item.object.traverse((child) => {
      if (child.material) child.material.dispose();
    });
  }

  dispose() {
    while (this.items.length) this.remove(this.items.length - 1);
    Object.values(this.geometries).forEach((geometry) => geometry.dispose());
    Object.entries(this.materials).forEach(([kind, material]) => {
      if (kind !== "heart") material.dispose();
    });
    this.textures.forEach((texture) => texture.dispose());
  }
}

/* ---------- Animation ---------- */

function restPose() {
  return {
    hop: 0, turn: 0, lean: 0, squash: 1, shakeX: 0,
    headNod: 0, headTurn: 0, headTilt: 0,
    mouthOpen: 0, happyEyes: false, eyeOpen: 1, eyeScale: 1,
    wingFlap: 0, armL: 0, armR: 0, armHug: 0, tailSway: 0, tailLift: 0,
    blush: 0, chill: 0, heat: 0, fire: 0, foam: 0, fluff: 0, earWiggle: 0,
  };
}

const soundCues = {
  apple: [[0.8, "chomp"], [1.25, "whee"], [2.8, "coo"]],
  carrot: [[0.8, "chomp"], [1.25, "danceTune"]],
  cupcake: [[0.8, "chomp"], [1.3, "giggle"], [2.4, "giggle"]],
  chilli: [[0.8, "chomp"], [1.7, "gasp"], [2.25, "roar"]],
  icecream: [[0.8, "chomp"], [1.3, "coo"], [1.95, "shiver"]],
  milkshake: [[0.55, "slurp"], [1.4, "float"], [1.7, "coo"], [4.1, "sparkle"]],
  comb: [[0.3, "swish"], [0.6, "purr"], [1.3, "swish"], [2.3, "swish"], [3.3, "sparkle"]],
  bath: [[0.1, "bubbles"], [1.4, "bubbles"], [3.0, "rub"], [5.3, "sparkle"], [5.6, "coo"]],
  painting: [[0.8, "brush"], [1.5, "brush"], [2.2, "brush"], [2.9, "brush"], [3.6, "brush"], [4.3, "brush"], [5.3, "sparkle"], [5.6, "coo"]],
  ballet: [[0.3, "musicBox"], [4.9, "sparkle"], [5.3, "coo"]],
  pet: [[0, "purr"], [0.35, "coo"]],
};

function playSoundCues(run, sfx) {
  (soundCues[run.id] ?? []).forEach(([at, name], index) => {
    if (run.t >= at && !run.done[`sound${index}`]) {
      run.done[`sound${index}`] = true;
      sfx[name]?.();
    }
  });
}

// Emits `fn` roughly `rate` times a second while called every frame.
function emit(run, key, rate, dt, fn) {
  run.emitters[key] = (run.emitters[key] ?? 0) + dt * rate;
  while (run.emitters[key] >= 1) {
    run.emitters[key] -= 1;
    fn();
  }
}

function once(run, key, fn) {
  if (run.done[key]) return;
  run.done[key] = true;
  fn();
}

// The treat flies into Mochi's mouth and she munches it. Returns time since the munching ended.
function eatTreat(run, pose, ctx) {
  const t = run.t;
  if (!run.treat) {
    run.treat = buildTreat(run.id, ctx.materials);
    ctx.scene.add(run.treat);
    run.treatStart = ctx.mouthWorld().add(new THREE.Vector3(1.4, -1.6, 1.8));
  }
  const k = easeInOut(between(t, 0, 0.75));
  run.treat.position.lerpVectors(run.treatStart, ctx.mouthWorld(), k);
  run.treat.position.y += Math.sin(k * Math.PI) * 0.7;
  run.treat.rotation.y = t * 5;
  run.treat.scale.setScalar(1.2 * (t < 0.72 ? 1 : Math.max(0.01, 1 - (t - 0.72) * 9)));
  run.treat.visible = t < 0.84;

  pose.headTurn += 0.25 * (1 - k);
  pose.mouthOpen = Math.max(pose.mouthOpen, between(t, 0.3, 0.68) * (t < 0.8 ? 1 : 0));
  if (t >= 0.8 && t < 1.25) {
    pose.mouthOpen = Math.abs(Math.sin((t - 0.8) * 16)) * 0.45;
    pose.happyEyes = true;
    pose.squash += 0.025 * Math.sin(t * 32);
  }
  return t - 1.25;
}

const actions = {
  apple(run, pose, dt, ctx) {
    const r = eatTreat(run, pose, ctx);
    if (r < 0) return;
    const spin = easeInOut(between(r, 0, 1.4));
    pose.turn += spin * Math.PI * 4;
    pose.hop += pulse(r, 0, 1.4) * 0.7;
    pose.squash += r > 1.4 ? -0.12 * pulse(r, 1.4, 1.75) : 0;
    pose.happyEyes = true;
    pose.wingFlap += 0.5 * Math.sin(r * 18) * pulse(r, 0, 1.4);
    pose.armL = pose.armR = 1.2 * pulse(r, 0, 1.4);
    if (r < 1.4) emit(run, "sparkle", 22, dt, () => ctx.fx.sparkles(ctx.bodyWorld(), 1, 2));
  },

  carrot(run, pose, dt, ctx) {
    const r = eatTreat(run, pose, ctx);
    if (r < 0) return;
    const amount = Math.min(1, r * 4) * (1 - between(r, 2.6, 2.95));
    const beat = r * 7;
    pose.hop += Math.abs(Math.sin(beat)) * 0.28 * amount;
    pose.lean += Math.sin(beat) * 0.18 * amount;
    pose.headTilt += Math.sin(beat) * 0.22 * amount;
    pose.armL = (1.3 + 0.7 * Math.sin(beat * 2)) * amount;
    pose.armR = (1.3 + 0.7 * Math.sin(beat * 2 + Math.PI)) * amount;
    pose.tailSway += Math.sin(beat) * 0.6 * amount;
    pose.wingFlap += Math.sin(beat * 2) * 0.35 * amount;
    pose.happyEyes = true;
    pose.mouthOpen = 0.35 * amount;
    if (amount > 0.1) {
      emit(run, "note", 3, dt, () => {
        const side = pick([-1, 1]);
        ctx.fx.spawn(ctx.fx.text(pick(["♪", "♫", "♬"]), pick(["#8a6ae6", "#f06aa8", "#4fb893"]), ctx.headWorld().add(new THREE.Vector3(side * 1.3, 0.2, 0.3)), 0.8),
          { velocity: new THREE.Vector3(side * 0.3, 0.9, 0), life: 1.4, wobble: 0.8 });
      });
    }
  },

  cupcake(run, pose, dt, ctx) {
    const r = eatTreat(run, pose, ctx);
    if (r < 0) return;
    const amount = Math.min(1, r * 5) * (1 - between(r, 2.2, 2.55));
    pose.shakeX += Math.sin(r * 45) * 0.045 * amount;
    pose.squash += Math.sin(r * 30) * 0.05 * amount;
    pose.headTilt += 0.18 * amount;
    pose.happyEyes = true;
    pose.blush = amount;
    pose.mouthOpen = (0.3 + 0.35 * Math.abs(Math.sin(r * 14))) * amount;
    pose.armL = pose.armR = 0.4 * amount;
    pose.armHug = 0.6 * amount;
    if (amount > 0.1) {
      emit(run, "hee", 2.6, dt, () => {
        ctx.fx.spawn(ctx.fx.text(pick(["hee!", "hihi!", "tee hee"]), pick(["#f06aa8", "#8a6ae6"]), ctx.headWorld().add(new THREE.Vector3(rand(-1.4, 1.4), rand(0.4, 1), 0.4)), 1.1),
          { velocity: new THREE.Vector3(0, 0.5, 0), life: 1.1 });
      });
      emit(run, "sprinkle", 14, dt, () => {
        const sprinkle = ctx.fx.mesh("sprinkle", ctx.headWorld().add(new THREE.Vector3(rand(-1, 1), 1.2, rand(-0.3, 0.6))), 1.4, pick(RAINBOW));
        ctx.fx.spawn(sprinkle, { velocity: new THREE.Vector3(rand(-0.6, 0.6), rand(0.5, 1.5), rand(-0.2, 0.4)), gravity: 3, life: 1.2, spin: 8 });
      });
    }
  },

  chilli(run, pose, dt, ctx) {
    const r = eatTreat(run, pose, ctx);
    if (r < 0) return;
    const heatUp = between(r, 0, 0.6) * (1 - between(r, 2.6, 3.1));
    pose.heat = heatUp;
    pose.blush = heatUp;
    pose.eyeScale = 1 + 0.25 * pulse(r, 0, 0.9);
    if (r < 0.75) pose.shakeX += Math.sin(r * 50) * 0.03;
    // Take a big breath in…
    const inhale = pulse(r, 0.6, 1.1);
    pose.headNod -= 0.45 * inhale;
    pose.squash += 0.08 * inhale;
    pose.wingFlap += 0.4 * inhale;
    // …then breathe fire, turned a little so the flames sweep across the scene.
    const fire = between(r, 1.0, 1.15) * (1 - between(r, 2.45, 2.65));
    pose.fire = fire;
    pose.turn += 0.75 * between(r, 0.5, 1.0) * (1 - between(r, 2.6, 3.1));
    pose.headNod += 0.15 * fire;
    pose.headTurn += Math.sin(r * 3) * 0.25 * fire;
    pose.mouthOpen = Math.max(pose.mouthOpen, fire);
    pose.lean -= 0.08 * fire;
    if (fire > 0.2) {
      emit(run, "flame", 70, dt, () => {
        const forward = ctx.headForward();
        const spread = new THREE.Vector3(rand(-0.35, 0.35), rand(-0.15, 0.3), rand(-0.35, 0.35));
        const flame = ctx.fx.mesh("flame", ctx.mouthWorld().addScaledVector(forward, 0.15), rand(0.6, 1.1), pick([0xffe27a, 0xffa552, 0xff6b4d, 0xffd45e]));
        ctx.fx.spawn(flame, { velocity: forward.add(spread).multiplyScalar(rand(3.5, 5)), life: rand(0.45, 0.7), grow: 2.4, opacity: 0.9 });
      });
    }
    if (r > 2.55 && r < 3.2) {
      emit(run, "smoke", 10, dt, () => {
        const puff = ctx.fx.mesh("puff", ctx.mouthWorld().add(new THREE.Vector3(rand(-0.1, 0.1), 0.1, 0)), rand(0.5, 0.9));
        ctx.fx.spawn(puff, { velocity: new THREE.Vector3(rand(-0.2, 0.2), 0.8, 0.2), life: 1.2, grow: 1.4, opacity: 0.7 });
      });
    }
  },

  icecream(run, pose, dt, ctx) {
    const r = eatTreat(run, pose, ctx);
    if (r < 0) return;
    if (r < 0.7) {
      pose.happyEyes = true;
      pose.blush = 0.6;
      once(run, "yum", () => ctx.fx.hearts(ctx.headWorld().add(new THREE.Vector3(0, 0.8, 0.4)), 3));
      return;
    }
    const cold = between(r, 0.7, 1.0) * (1 - between(r, 2.6, 2.95));
    pose.chill = cold;
    pose.shakeX += Math.sin(r * 62) * 0.05 * cold;
    pose.squash -= 0.05 * cold;
    pose.armHug = cold;
    pose.armL = pose.armR = 0.5 * cold;
    pose.mouthOpen = Math.abs(Math.sin(r * 28)) * 0.25 * cold;
    pose.headNod += 0.1 * cold;
    pose.tailLift += 0.4 * cold;
    if (cold > 0.2) {
      emit(run, "snow", 18, dt, () => {
        const flake = ctx.fx.mesh("snow", new THREE.Vector3(rand(-1.8, 1.8), 3.6, rand(-0.6, 1.4)), rand(0.8, 1.6), pick([0xffffff, 0xd8f0ff, 0xbfe3f7]));
        ctx.fx.spawn(flake, { velocity: new THREE.Vector3(0, rand(-1.4, -0.9), 0), life: 2.4, spin: 2, wobble: 0.8 });
      });
      emit(run, "brr", 1.2, dt, () => {
        ctx.fx.spawn(ctx.fx.text("brrr!", "#5b9bf0", ctx.headWorld().add(new THREE.Vector3(pick([-1.3, 1.3]), 0.7, 0.4)), 1.1),
          { velocity: new THREE.Vector3(0, 0.4, 0), life: 1 });
      });
    }
  },

  comb(run, pose, dt, ctx) {
    const t = run.t;
    if (!run.comb) {
      run.comb = buildComb(ctx.materials);
      ctx.turn.add(run.comb);
    }
    // Three strokes down the side of her fluffy head and body.
    const strokes = 3;
    const strokeTime = 3.0 / strokes;
    const active = t > 0.3 && t < 3.3;
    const s = active ? ((t - 0.3) % strokeTime) / strokeTime : 0;
    const angle = 0.5 + s * 1.8;
    run.comb.visible = t < 3.5;
    run.comb.position.set(1.15 + 0.15 * Math.sin(s * Math.PI), 1.25 + 1.45 * Math.cos(angle), 0.35 + 0.25 * Math.sin(angle));
    run.comb.rotation.set(0, -0.5, angle - 0.4);
    run.comb.scale.setScalar(Math.min(1, t * 4) * (t > 3.3 ? Math.max(0.01, 1 - (t - 3.3) * 5) : 1));

    const content = between(t, 0.2, 0.5) * (1 - between(t, 3.4, 3.8));
    pose.happyEyes = content > 0.3;
    pose.headTilt += 0.3 * content;
    pose.blush = content;
    pose.fluff = between(t, 0.5, 3.3);
    pose.shakeX += Math.sin(t * 30) * 0.008 * content;
    pose.tailSway += Math.sin(t * 4) * 0.5 * content;
    if (active) {
      const combWorld = run.comb.getWorldPosition(new THREE.Vector3());
      emit(run, "sparkle", 16, dt, () => ctx.fx.sparkles(combWorld, 1, 0.8));
    }
    if (t > 3.3) once(run, "hearts", () => ctx.fx.hearts(ctx.headWorld().add(new THREE.Vector3(0, 0.9, 0.3)), 4));
  },

  bath(run, pose, dt, ctx) {
    const t = run.t;
    // Phase 1: bubbles and foam.
    const soapy = between(t, 0, 0.4) * (1 - between(t, 3.0, 4.6));
    pose.foam = soapy;
    if (t < 3.0) {
      pose.happyEyes = true;
      pose.blush = 0.7;
      pose.shakeX += Math.sin(t * 20) * 0.012;
      pose.armL = 0.6 + 0.3 * Math.sin(t * 6);
      pose.armR = 0.6 + 0.3 * Math.sin(t * 6 + 1);
      emit(run, "bubble", 26, dt, () => {
        const size = rand(0.07, 0.2);
        const bubble = ctx.fx.mesh("bubble", ctx.bodyWorld().add(new THREE.Vector3(rand(-1.4, 1.4), rand(-1, 1.6), rand(-0.4, 1.2))), size);
        ctx.fx.spawn(bubble, { velocity: new THREE.Vector3(0, rand(0.4, 0.9), 0), life: rand(1.2, 2), wobble: 0.6, grow: 0.3, opacity: 0.55 });
      });
    }
    // Phase 2: a cosy towel rubs her dry.
    if (!run.towel) {
      run.towel = buildTowel(ctx.materials);
      run.towel.visible = false;
      ctx.turn.add(run.towel);
    }
    const drying = t > 3.0 && t < 5.3;
    run.towel.visible = drying;
    if (drying) {
      const d = (t - 3.0) / 2.3;
      run.towel.position.set(Math.sin(d * Math.PI * 7) * 0.55, 2.8 - d * 1.8, 1.25);
      run.towel.rotation.z = Math.sin(d * Math.PI * 7) * 0.15;
      pose.happyEyes = true;
      pose.shakeX += Math.sin(t * 40) * 0.02;
      pose.squash += Math.sin(t * 25) * 0.02;
    }
    // Phase 3: squeaky clean and sparkly.
    if (t > 5.3) {
      pose.happyEyes = true;
      pose.blush = 0.8;
      pose.hop += pulse(t, 5.3, 5.8) * 0.3;
      once(run, "clean", () => {
        ctx.fx.sparkles(ctx.bodyWorld().add(new THREE.Vector3(0, 0.5, 0)), 24, 2.2);
        ctx.fx.hearts(ctx.headWorld().add(new THREE.Vector3(0, 0.9, 0.3)), 2);
      });
    }
  },

  milkshake(run, pose, dt, ctx) {
    const r = eatTreat(run, pose, ctx);
    if (r < 0) return;
    // So sweet she floats up, wings fluttering, then drifts back down.
    const lift = easeInOut(between(r, 0.1, 1.0)) * (1 - easeInOut(between(r, 2.4, 3.3)));
    pose.hop += lift * (0.6 + 0.08 * Math.sin(r * 4));
    pose.wingFlap += Math.sin(r * 22) * 0.55 * lift;
    pose.tailSway += Math.sin(r * 3) * 0.5 * lift;
    pose.armL = pose.armR = 0.9 * lift;
    pose.headTilt += 0.15 * lift;
    pose.happyEyes = true;
    pose.blush = Math.max(lift, 0.5);
    pose.squash += r > 3.3 ? -0.1 * pulse(r, 3.3, 3.55) : 0;
    if (lift > 0.2) {
      emit(run, "hearts", 4, dt, () => ctx.fx.hearts(ctx.headWorld().add(new THREE.Vector3(0, 0.6, 0.3)), 1));
      emit(run, "sparkle", 10, dt, () => ctx.fx.sparkles(ctx.bodyWorld().add(new THREE.Vector3(0, -0.8, 0)), 1, 0.6));
    }
  },

  painting(run, pose, dt, ctx) {
    const t = run.t;
    if (!run.easel) {
      const { easel, draw } = buildEasel(ctx.materials);
      easel.position.set(1.65, 0, 0.75);
      easel.rotation.y = -0.85;
      ctx.turn.add(easel);
      run.easel = easel;
      run.drawEasel = draw;
      run.brush = buildBrush(ctx.materials);
      run.brush.position.set(0.02, -0.62, 0.16);
      run.brush.rotation.x = -1.1;
      ctx.arms[1].add(run.brush);
    }
    run.easel.scale.setScalar(Math.max(0.01, easeInOut(between(t, 0, 0.5))) * (t > 6.3 ? Math.max(0.01, 1 - (t - 6.3) * 2) : 1));
    run.brush.visible = t > 0.3 && t < 5.4;

    const painting = between(t, 0.7, 5.0);
    const atEasel = between(t, 0.2, 0.7) * (1 - between(t, 5.0, 5.6));
    pose.turn += 0.55 * atEasel;
    pose.headTurn += 0.25 * atEasel;
    pose.headTilt += 0.12 * atEasel;
    if (t > 0.7 && t < 5.0) {
      pose.armR = 1.5 + 0.45 * Math.sin(t * 9);
      pose.armL = 0.25;
      pose.mouthOpen = 0.15;
      pose.tailSway += Math.sin(t * 5) * 0.3;
      run.drawEasel(painting);
      const stripe = Math.min(RAINBOW.length - 1, Math.floor(painting * RAINBOW.length));
      run.brush.userData.tip.material.color.set(RAINBOW[stripe]);
      emit(run, "splatter", 9, dt, () => {
        const tip = run.brush.userData.tip.getWorldPosition(new THREE.Vector3());
        const drop = ctx.fx.mesh("sparkle", tip, rand(0.6, 1), RAINBOW[stripe]);
        ctx.fx.spawn(drop, { velocity: new THREE.Vector3(rand(-0.5, 0.5), rand(0.2, 1), rand(-0.3, 0.5)), gravity: 3, life: 0.8, spin: 6 });
      });
    }
    if (t >= 5.0) {
      run.drawEasel(1);
      pose.happyEyes = true;
      pose.blush = 0.9;
      pose.hop += pulse(t, 5.4, 5.9) * 0.3;
      pose.armL = pose.armR = 1.3 * pulse(t, 5.3, 6.6);
      once(run, "proud", () => {
        const easelWorld = run.easel.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 1.4, 0));
        ctx.fx.sparkles(easelWorld, 16, 1.6);
        ctx.fx.hearts(ctx.headWorld().add(new THREE.Vector3(0, 0.9, 0.3)), 2);
      });
    }
  },

  ballet(run, pose, dt, ctx) {
    const t = run.t;
    if (!run.tutu) {
      run.tutu = buildTutu(ctx.materials);
      ctx.bodyGroup.add(run.tutu);
    }
    run.tutu.scale.setScalar(Math.max(0.01, easeInOut(between(t, 0, 0.4))) * (t > 5.8 ? Math.max(0.01, 1 - (t - 5.8) * 2.5) : 1));

    // Rise onto tiptoe with arms up in a circle…
    const poised = between(t, 0.4, 0.9) * (1 - between(t, 4.6, 5.0));
    pose.hop += 0.2 * poised;
    pose.armL = pose.armR = 2.35 * poised;
    pose.armHug = 0.35 * poised;
    pose.headNod -= 0.12 * poised;
    pose.happyEyes = true;
    pose.blush = 0.7;
    // …two slow pirouettes…
    pose.turn += easeInOut(between(t, 1.0, 3.4)) * Math.PI * 4;
    if (t > 1.0 && t < 3.4) emit(run, "trail", 14, dt, () => ctx.fx.sparkles(ctx.bodyWorld().add(new THREE.Vector3(0, -0.4, 0)), 1, 1.2));
    // …a graceful sway…
    const sway = pulse(t, 3.4, 4.6);
    pose.lean += Math.sin((t - 3.4) * Math.PI * 1.7) * 0.16 * sway;
    pose.tailLift += 0.6 * sway;
    pose.wingFlap += 0.35 * sway;
    // …and a curtsy.
    const curtsy = pulse(t, 4.8, 5.9);
    pose.headNod += 0.4 * curtsy;
    pose.squash -= 0.1 * curtsy;
    pose.armL = Math.max(pose.armL, 0.6 * curtsy);
    pose.armR = Math.max(pose.armR, 0.6 * curtsy);
    if (t > 5.2) once(run, "hearts", () => ctx.fx.hearts(ctx.headWorld().add(new THREE.Vector3(0, 0.9, 0.3)), 3));
  },

  pet(run, pose, dt, ctx) {
    const t = run.t;
    const amount = between(t, 0, 0.2) * (1 - between(t, 1.7, 2.2));
    pose.happyEyes = true;
    pose.blush = amount;
    pose.squash += 0.08 * Math.sin(t * 9) * amount;
    pose.headTilt += 0.3 * amount;
    pose.armHug = amount;
    pose.armL = pose.armR = 0.5 * amount;
    pose.tailSway += Math.sin(t * 10) * 0.6 * amount;
    once(run, "hearts", () => ctx.fx.hearts(ctx.headWorld().add(new THREE.Vector3(0, 0.8, 0.4)), 5));
  },
};

function applyPose(dragon, pose, userTurn) {
  dragon.root.position.y = pose.hop;
  dragon.root.rotation.z = pose.lean;
  dragon.turn.rotation.y = pose.turn + userTurn;
  dragon.bodyGroup.position.x = pose.shakeX;
  const spread = 1 + (1 - pose.squash) * 0.5;
  dragon.bodyGroup.scale.set(spread, pose.squash, spread);
  dragon.body.scale.set(1 + pose.fluff * 0.04, 1.05 + pose.fluff * 0.03, 0.92 + pose.fluff * 0.04);

  dragon.head.rotation.set(pose.headNod, pose.headTurn, pose.headTilt);
  dragon.mouthShape.scale.y = 0.15 + pose.mouthOpen * 0.85;
  dragon.mouthShape.visible = pose.mouthOpen > 0.12;
  dragon.smile.visible = !dragon.mouthShape.visible;
  dragon.tongue.visible = pose.mouthOpen > 0.25;

  dragon.eyes.forEach(({ open, happy }) => {
    open.visible = !pose.happyEyes;
    happy.visible = pose.happyEyes;
    open.scale.set(pose.eyeScale, pose.eyeScale * pose.eyeOpen, pose.eyeScale);
  });
  dragon.blushMaterial.opacity = 0.45 + pose.blush * 0.5;
  dragon.blushes.forEach((blush) => blush.scale.set(1 + pose.blush * 0.25, 0.65 + pose.blush * 0.15, 1));

  dragon.ears.forEach((ear) => {
    const side = ear.userData.side;
    ear.rotation.z = -side * (0.55 + pose.earWiggle);
  });
  dragon.wings.forEach((wing) => {
    const side = wing.userData.side;
    wing.rotation.set(0, side * (-0.3 + pose.wingFlap), side * 0.1);
  });
  dragon.arms.forEach((arm) => {
    const side = arm.userData.side;
    const raise = side < 0 ? pose.armL : pose.armR;
    arm.rotation.set(-raise * 0.6, 0, side * (0.35 + raise * 0.9) - side * pose.armHug * 0.9);
  });
  dragon.tail.forEach((segment, index) => {
    // The tail curls round to her side, so its rainbow peeks out from the front.
    segment.rotation.y = (index === 0 ? 1.1 : 0.12) + pose.tailSway * 0.18 * (index + 1) * 0.6;
    segment.rotation.x = 0.18 + pose.tailLift * 0.15;
  });

  const color = dragon.lilac.color.copy(dragon.baseColor);
  if (pose.heat > 0) color.lerp(HOT, pose.heat * 0.45);
  if (pose.chill > 0) color.lerp(ICY, pose.chill * 0.6);

  dragon.foam.visible = pose.foam > 0.02;
  dragon.foam.scale.setScalar(Math.max(0.01, pose.foam));
}

function shadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 64);
  gradient.addColorStop(0, "rgba(90, 60, 160, 0.35)");
  gradient.addColorStop(1, "rgba(90, 60, 160, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

/* ---------- Public API ---------- */

// Builds the scene inside `container`. Throws if WebGL isn't available.
export function createDragonScene(container, { onPet, sfx = sounds } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.className = "dragon-canvas";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 2.5, 11.8);
  camera.lookAt(0, 2.25, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd6c5f5, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.8);
  sun.position.set(3, 6, 5);
  scene.add(sun);
  const fireLight = new THREE.PointLight(0xff8a3d, 0, 7);
  scene.add(fireLight);

  const materials = createMaterials();
  const dragon = buildDragon(materials);
  scene.add(dragon.root);

  const shadowMap = shadowTexture();
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.005;
  scene.add(shadow);

  const fx = new Effects(scene, materials);
  const ctx = {
    scene,
    materials,
    fx,
    turn: dragon.turn,
    bodyGroup: dragon.bodyGroup,
    arms: dragon.arms,
    mouthWorld: () => dragon.mouth.getWorldPosition(new THREE.Vector3()),
    headWorld: () => dragon.head.getWorldPosition(new THREE.Vector3()),
    bodyWorld: () => dragon.body.getWorldPosition(new THREE.Vector3()),
    headForward: () => dragon.head.getWorldDirection(new THREE.Vector3()),
  };

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const idleAmount = reducedMotion ? 0.3 : 1;
  let run = null;
  const restTurn = 0.2;
  let userTurn = restTurn;
  let targetTurn = restTurn;
  let nextBlink = 2;
  let blinkStart = -1;
  let elapsed = 0;
  let frame = 0;
  let last = performance.now();

  function endRun() {
    if (!run) return;
    [run.treat, run.comb, run.towel, run.easel, run.brush, run.tutu].forEach((object) => {
      if (!object) return;
      object.parent?.remove(object);
      object.traverse((child) => child.geometry?.dispose());
      object.userData.dispose?.();
    });
    run = null;
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    elapsed += dt;

    const pose = restPose();
    pose.squash = 1 + 0.022 * Math.sin(elapsed * 2.2) * idleAmount;
    pose.headNod = 0.045 * Math.sin(elapsed * 1.1) * idleAmount;
    pose.headTilt = 0.06 * Math.sin(elapsed * 0.7) * idleAmount;
    pose.tailSway = 0.45 * Math.sin(elapsed * 1.6) * idleAmount;
    pose.wingFlap = 0.14 * Math.sin(elapsed * 2.4) * idleAmount;
    pose.armL = pose.armR = 0.05 * Math.sin(elapsed * 2.2) * idleAmount;

    if (elapsed > nextBlink) {
      blinkStart = elapsed;
      nextBlink = elapsed + rand(2.5, 5);
    }
    if (blinkStart >= 0) pose.eyeOpen = Math.max(0.08, Math.abs(Math.cos(between(elapsed, blinkStart, blinkStart + 0.18) * Math.PI)));

    if (run) {
      run.t += dt;
      actions[run.id](run, pose, dt, ctx);
      playSoundCues(run, sfx);
      if (run.t >= run.duration) endRun();
    }
    // Happy ears wiggle.
    if (pose.happyEyes) pose.earWiggle += 0.16 * Math.sin(elapsed * 14);

    userTurn += (targetTurn - userTurn) * Math.min(1, dt * 8);
    applyPose(dragon, pose, userTurn);
    shadow.scale.setScalar(1 - Math.min(0.4, pose.hop * 0.4));

    fireLight.intensity = pose.fire * (6 + Math.random() * 3);
    fireLight.position.copy(ctx.mouthWorld()).addScaledVector(ctx.headForward(), 0.8);

    fx.update(dt);
    renderer.render(scene, camera);
  }

  function resize() {
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the whole dragon in view on narrow (portrait) stages.
    camera.fov = width / height < 0.9 ? 30 / Math.max(0.62, width / height / 0.9) : 30;
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  // Drag sideways to turn Mochi around; a tap on her is a snuggle.
  const canvas = renderer.domElement;
  const raycaster = new THREE.Raycaster();
  let pointer = null;
  function onPointerDown(event) {
    pointer = { id: event.pointerId, x: event.clientX, startX: event.clientX, startY: event.clientY, startTurn: targetTurn };
    canvas.setPointerCapture?.(event.pointerId);
  }
  function onPointerMove(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    targetTurn = pointer.startTurn + (event.clientX - pointer.startX) * 0.012;
  }
  function onPointerUp(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY);
    pointer = null;
    if (moved > 6) return;
    const rect = canvas.getBoundingClientRect();
    const point = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(point, camera);
    if (raycaster.intersectObject(dragon.root, true).length > 0) onPet?.();
  }
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  frame = requestAnimationFrame(tick);

  return {
    play(id) {
      const action = dragonActionsById[id];
      if (!action || !actions[id]) return;
      endRun();
      run = { id, t: 0, duration: action.duration, emitters: {}, done: {} };
    },
    dispose() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      endRun();
      fx.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
      });
      dragon.wingMaterial.dispose();
      dragon.blushMaterial.dispose();
      shadow.material.dispose();
      shadowMap.dispose();
      materials.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
