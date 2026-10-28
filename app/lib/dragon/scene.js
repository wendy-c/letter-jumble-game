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

// Mochi's friend Tofu: pale yellow, with floppy ears and two pairs of fairy wings.
const TOFU = { color: 0xfff0a8, belly: 0xfffcf0, snout: 0xffe3c8, ears: "floppy", wings: "fairy" };

// Fairy wings: see-through pastel petals with soft white edges. The top pair sweeps up and out;
// the bottom pair is smaller and hangs down.
function fairyWingShape(lower) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  if (lower) {
    shape.bezierCurveTo(0.3, -0.04, 0.85, -0.22, 0.98, -0.58);
    shape.bezierCurveTo(1.06, -0.92, 0.62, -0.98, 0.42, -0.72);
    shape.bezierCurveTo(0.26, -0.48, 0.1, -0.2, 0, 0);
  } else {
    shape.bezierCurveTo(0.1, 0.6, 0.66, 1.42, 1.22, 1.32);
    shape.bezierCurveTo(1.62, 1.2, 1.4, 0.58, 0.94, 0.32);
    shape.bezierCurveTo(0.62, 0.13, 0.3, 0.02, 0, 0);
  }
  return shape;
}

function fairyWingGeometry(lower) {
  const shape = fairyWingShape(lower);
  const geometry = new THREE.ShapeGeometry(shape, 24);
  const pastel = [0xffb3dc, 0xd2b8ff, 0xa8e8cc, 0xa9d4ff].map((color) => new THREE.Color(color));
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const color = new THREE.Color();
  for (let index = 0; index < position.count; index += 1) {
    const reach = clamp01(Math.hypot(position.getX(index), position.getY(index)) / (lower ? 1.1 : 1.7)) * (pastel.length - 1);
    const low = Math.min(Math.floor(reach), pastel.length - 2);
    color.copy(pastel[low]).lerp(pastel[low + 1], reach - low);
    color.toArray(colors, index * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const edge = new THREE.CatmullRomCurve3(shape.getPoints(40).map((point) => new THREE.Vector3(point.x, point.y, 0.01)), true);
  return { geometry, edgeGeometry: new THREE.TubeGeometry(edge, 80, 0.022, 6, true) };
}

// Builds Mochi, or with `options` another dragon: { color, belly, snout, ears: "floppy", wings: "fairy" }.
function buildDragon(materials, options = {}) {
  const bodyColor = options.color ?? LILAC;
  const lilac = materials.toon(bodyColor);
  const root = new THREE.Group();
  const turn = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(turn);
  turn.add(bodyGroup);

  const body = part(sphere(1), lilac, materials, 1, 0.05);
  body.scale.set(1, 1.05, 0.92);
  body.position.y = 1.05;
  bodyGroup.add(body);

  const belly = part(sphere(0.62), materials.toon(options.belly ?? CREAM), materials, 0.62, 0.035);
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
    foot.userData.baseY = 0.16;
    const pad = part(sphere(0.3), lilac, materials, 0.3, 0.035);
    pad.scale.set(1, 0.55, 1.3);
    foot.add(pad);
    addClaws(foot, [[-0.15, -0.02, 0.36], [0, -0.02, 0.4], [0.15, -0.02, 0.36]], new THREE.Euler(Math.PI / 2, 0, 0));
    turn.add(foot);
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
  // Mochi has one pair of rainbow wings; Tofu has two pairs of see-through fairy wings.
  const fairy = options.wings === "fairy";
  const fairyMaterial = fairy
    ? new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.78, side: THREE.DoubleSide, depthWrite: false })
    : null;
  const wingPairs = fairy
    ? [{ y: 1.62, x: 0.36, scale: 1.1, tilt: 0.05, ...fairyWingGeometry(false) }, { y: 1.28, x: 0.44, scale: 0.95, tilt: 0, ...fairyWingGeometry(true) }]
    : [{ y: 1.6, x: 0.42, scale: 1.15, tilt: 0.1, geometry: wingGeometry }];
  const wings = wingPairs.flatMap(({ y, x, scale, tilt, geometry, edgeGeometry }) => [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * x, y, -0.62);
    const wing = new THREE.Mesh(geometry, fairy ? fairyMaterial : wingMaterial);
    wing.scale.set(side * scale, scale, 1);
    wing.rotation.set(0.15, 0, side * tilt);
    if (edgeGeometry) wing.add(new THREE.Mesh(edgeGeometry, materials.toon(0xc4b0f5)));
    pivot.add(wing);
    pivot.userData.side = side;
    bodyGroup.add(pivot);
    return pivot;
  }));

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

  const snout = part(sphere(0.5), materials.toon(options.snout ?? SNOUT), materials, 0.42, 0.035);
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

  // Long floppy ears that hang down and flap (Tofu's).
  const floppyEars = () => [-1, 1].map((side) => {
    const ear = new THREE.Group();
    ear.position.set(side * 0.98, 0.95, -0.05);
    ear.rotation.set(0.1, side * 0.35, 0);
    const outer = part(sphere(0.3, 0.8), lilac, materials, 0.3, 0.035);
    outer.scale.set(0.72, 1.7, 0.42);
    outer.position.y = -0.42;
    const inner = new THREE.Mesh(sphere(0.22, 0.6), materials.toon(0xffc2dc));
    inner.scale.set(0.6, 1.55, 0.22);
    inner.position.set(0, -0.44, 0.1);
    const tip = part(sphere(0.12, 0.5), materials.toon(side < 0 ? RAINBOW[0] : RAINBOW[4]), materials, 0.12, 0.015);
    tip.position.y = -0.92;
    ear.add(outer, inner, tip);
    ear.userData.side = side;
    ear.userData.floppy = true;
    head.add(ear);
    return ear;
  });

  // Big fluffy ears with pink insides and white fur tufts.
  const ears = options.ears === "floppy" ? floppyEars() : [-1, 1].map((side) => {
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
    blushes, foam, lilac, baseColor: new THREE.Color(bodyColor),
    // Frees the materials that belong to this dragon (geometries go with the scene).
    dispose() {
      wingMaterial.dispose();
      fairyMaterial?.dispose();
      blushMaterial.dispose();
    },
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
  } else if (id === "cupcake" || id === "bananaCupcake") {
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
    if (id === "bananaCupcake") {
      const slice = add(part(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 20), materials.toon(0xfff0a8), materials, 0.1, 0.012), 0.05, 0.42, 0.06);
      slice.rotation.set(0.5, 0, 0.3);
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
  } else if (id === "lemon") {
    const lemon = add(part(sphere(0.26), materials.toon(0xfff06a), materials, 0.26, 0.025));
    lemon.scale.set(1.25, 0.95, 0.95);
    [-1, 1].forEach((side) => {
      const tip = add(part(sphere(0.06, 0.5), materials.toon(0xfff06a), materials, 0.06, 0.012), side * 0.33, 0, 0);
      tip.scale.set(1.2, 0.8, 0.8);
    });
    add(part(sphere(0.07, 0.5), materials.toon(0x8fe3a8), materials, 0.07, 0.012), 0.08, 0.24, 0).scale.set(1.6, 0.5, 0.8);
  } else if (id === "salad") {
    add(part(new THREE.CylinderGeometry(0.32, 0.2, 0.2, 24), materials.toon(0xffffff), materials, 0.28, 0.025));
    [[0, 0.14, 0, 0x8fe3a8], [-0.15, 0.12, 0.06, 0x6cc28a], [0.15, 0.12, -0.05, 0x8fe3a8], [0.05, 0.16, 0.14, 0x6cc28a]].forEach(([x, y, z, color]) => {
      const leaf = add(part(sphere(0.13, 0.5), materials.toon(color), materials, 0.12, 0.015), x, y, z);
      leaf.scale.set(1.3, 0.6, 1);
    });
    [[0.12, 0.2, 0.08], [-0.1, 0.2, -0.08]].forEach(([x, y, z]) => add(part(sphere(0.06, 0.4), materials.toon(0xff6b6b), materials, 0.06, 0.012), x, y, z));
    add(part(sphere(0.05, 0.4), materials.toon(0xffa552), materials, 0.05, 0.012), -0.02, 0.22, 0.04);
  } else if (id === "noodles") {
    add(part(new THREE.CylinderGeometry(0.32, 0.2, 0.24, 24), materials.toon(0x8cc8f2), materials, 0.28, 0.025));
    const broth = add(new THREE.Mesh(new THREE.CircleGeometry(0.29, 24), materials.toon(0xffe2a8)), 0, 0.121, 0);
    broth.rotation.x = -Math.PI / 2;
    [-0.08, 0, 0.08].forEach((x) => {
      const noodle = add(part(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 8), materials.toon(0xffd27a), materials, 0.02, 0.008), x, 0.3, 0);
      noodle.rotation.z = x * 2;
    });
    [-0.05, 0.05].forEach((x) => {
      const stick = add(part(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 8), materials.toon(0xe8b27a), materials, 0.02, 0.008), x + 0.12, 0.42, 0);
      stick.rotation.z = -0.5;
    });
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

function buildToothbrush(materials) {
  const brush = new THREE.Group();
  const handle = part(new THREE.BoxGeometry(0.07, 0.6, 0.06), materials.toon(0x8cc8f2), materials, 0.05, 0.012);
  const head = part(new THREE.BoxGeometry(0.09, 0.16, 0.07), materials.toon(0x8cc8f2), materials, 0.05, 0.012);
  head.position.y = 0.36;
  const bristles = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.07), materials.toon(0xffffff));
  bristles.position.set(0, 0.36, 0.07);
  const paste = new THREE.Mesh(sphere(0.045, 0.4), materials.toon(0xb8f0d8));
  paste.position.set(0, 0.36, 0.12);
  brush.add(handle, head, bristles, paste);
  return brush;
}

// A round floor cushion for meditation.
function buildCushion(materials) {
  const cushion = new THREE.Group();
  const pad = part(new THREE.CylinderGeometry(1.05, 1.1, 0.22, 32), materials.toon(0xffb3d9), materials, 0.3, 0.025);
  pad.position.y = 0.11;
  const button = part(sphere(0.08, 0.4), materials.toon(0xf06aa8), materials, 0.08, 0.012);
  button.position.y = 0.24;
  cushion.add(pad, button);
  return cushion;
}

// A sandcastle that rises out of a sand pile as Mochi pats it, plus a bucket and spade.
function buildSandcastle(materials) {
  const group = new THREE.Group();
  const sand = materials.toon(0xf3d38c);
  const pile = part(sphere(0.75, 0.6), sand, materials, 0.5, 0.025);
  pile.scale.set(1, 0.28, 0.8);
  group.add(pile);

  const castle = new THREE.Group();
  const keep = part(new THREE.CylinderGeometry(0.28, 0.32, 0.55, 20), sand, materials, 0.25, 0.02);
  keep.position.y = 0.38;
  castle.add(keep);
  [[-0.38, 0.05], [0.38, 0.05], [0, -0.32]].forEach(([x, z]) => {
    const tower = part(new THREE.CylinderGeometry(0.13, 0.15, 0.42, 16), sand, materials, 0.13, 0.015);
    tower.position.set(x, 0.3, z);
    const roof = part(new THREE.ConeGeometry(0.17, 0.24, 16), sand, materials, 0.13, 0.015);
    roof.position.set(x, 0.63, z);
    castle.add(tower, roof);
  });
  const door = new THREE.Mesh(sphere(0.09, 0.4), materials.toon(0xc9a060));
  door.scale.set(1, 1.3, 0.3);
  door.position.set(0, 0.22, 0.3);
  castle.add(door);
  const flag = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 6), materials.toon(0x8b5a3c));
  pole.position.y = 0.16;
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.12), new THREE.MeshBasicMaterial({ color: 0xff8fae, side: THREE.DoubleSide }));
  cloth.position.set(0.09, 0.26, 0);
  flag.add(pole, cloth);
  flag.position.y = 0.65;
  castle.add(flag);
  group.add(castle);

  const bucket = part(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 18), materials.toon(0x8cc8f2), materials, 0.18, 0.02);
  bucket.position.set(0.9, 0.15, 0.3);
  const spade = part(new THREE.BoxGeometry(0.06, 0.4, 0.04), materials.toon(0xffd45e), materials, 0.05, 0.012);
  spade.position.set(-0.85, 0.2, 0.35);
  spade.rotation.z = 0.5;
  group.add(bucket, spade);

  group.userData.castle = castle;
  group.userData.flag = flag;
  group.userData.dispose = () => cloth.material.dispose();
  return group;
}

// A mixing bowl of batter with a whisk, for baking.
function buildMixingBowl(materials) {
  const group = new THREE.Group();
  const bowl = part(new THREE.SphereGeometry(0.42, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), materials.toon(0x8cc8f2), materials, 0.42, 0.03);
  const batter = new THREE.Mesh(new THREE.CircleGeometry(0.38, 32), materials.toon(0xfff3d6));
  batter.rotation.x = -Math.PI / 2;
  batter.position.y = -0.04;
  const whisk = new THREE.Group();
  whisk.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5), materials.toon(0xb79cf2)));
  [0, Math.PI / 3, (2 * Math.PI) / 3].forEach((angle) => {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 20), materials.toon(0xdfe6ef));
    loop.scale.set(1, 1.6, 1);
    loop.rotation.y = angle;
    loop.position.y = -0.3;
    whisk.add(loop);
  });
  whisk.position.y = 0.2;
  group.add(bowl, batter, whisk);
  group.userData.whisk = whisk;
  return group;
}

// A round flask whose liquid changes colour, for a science experiment.
function buildFlask(materials) {
  const group = new THREE.Group();
  const glass = new THREE.Mesh(sphere(0.32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false }));
  const neck = part(new THREE.CylinderGeometry(0.09, 0.11, 0.36, 20, 1, true), materials.toon(0xe6f4fc), materials, 0.1, 0.012);
  neck.position.y = 0.42;
  const liquidMaterial = new THREE.MeshToonMaterial({ color: 0xff8fae, gradientMap: materials.toon(LILAC).gradientMap });
  const liquid = new THREE.Mesh(new THREE.SphereGeometry(0.28, 28, 18, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65), liquidMaterial);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.02, 8, 32), materials.ink);
  rim.rotation.x = Math.PI / 2;
  group.add(liquid, glass, neck, rim);
  group.userData.liquid = liquidMaterial;
  group.userData.dispose = () => {
    liquidMaterial.dispose();
    glass.material.dispose();
  };
  return group;
}

// Glasses that sit on Tofu's snout: round reading glasses, or big science goggles.
function buildGlasses(materials, goggles) {
  const group = new THREE.Group();
  const frame = materials.toon(goggles ? 0x8cc8f2 : 0xc98a55);
  const lensMaterial = new THREE.MeshBasicMaterial({ color: goggles ? 0xcfe8ff : 0xffffff, transparent: true, opacity: goggles ? 0.45 : 0.2, depthWrite: false });
  [-1, 1].forEach((side) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(goggles ? 0.22 : 0.19, goggles ? 0.05 : 0.03, 10, 28), frame);
    ring.position.set(side * 0.4, 0, 0);
    ring.rotation.y = side * 0.3;
    const lens = new THREE.Mesh(new THREE.CircleGeometry(goggles ? 0.2 : 0.17, 24), lensMaterial);
    lens.position.copy(ring.position);
    lens.rotation.y = ring.rotation.y;
    group.add(ring, lens);
  });
  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4), frame);
  bridge.rotation.z = Math.PI / 2;
  group.add(bridge);
  group.position.set(0, 0.66, 0.95);
  group.userData.dispose = () => lensMaterial.dispose();
  return group;
}

// An open storybook with a page that turns. It's built with its pages facing +z; the reader turns
// it round so the pages face her and the starry front cover faces out.
function buildBook(materials) {
  const group = new THREE.Group();
  const cover = materials.toon(0xb79cf2);
  [-1, 1].forEach((side) => {
    const half = new THREE.Group();
    const board = part(new THREE.BoxGeometry(0.46, 0.62, 0.03), cover, materials, 0.3, 0.015);
    board.position.x = side * 0.23;
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.05), materials.toon(0xfffdf5));
    pages.position.set(side * 0.22, 0, 0.04);
    half.add(board, pages);
    half.rotation.y = -side * 0.35;
    group.add(half);
  });
  const star = part(new THREE.OctahedronGeometry(0.08), materials.toon(GOLD), materials, 0.07, 0.012);
  star.position.set(-0.23, 0.05, -0.05);
  group.add(star);
  // The turning page hinges on the spine, just in front of where the two halves' pages meet, and
  // swings from lying on the right-hand pages to the left-hand ones, so it never pokes through
  // the covers. `turn` (0 to 1) sets how far over it is.
  const turning = new THREE.Group();
  const page = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.54), new THREE.MeshBasicMaterial({ color: 0xfffaf0, side: THREE.DoubleSide }));
  page.position.x = 0.2;
  turning.add(page);
  turning.position.z = 0.085;
  group.add(turning);
  group.userData.turn = (amount) => {
    turning.rotation.y = -0.35 - (Math.PI - 0.7) * amount;
  };
  group.userData.turn(0);
  group.userData.dispose = () => page.material.dispose();
  return group;
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

// A white clawfoot bathtub round Mochi's middle, full of water. Built around her feet.
function buildTub(materials) {
  const group = new THREE.Group();
  const bowl = new THREE.Group();
  bowl.scale.set(1, 1, 0.8);
  const enamel = new THREE.MeshToonMaterial({ color: 0xffffff, side: THREE.DoubleSide, gradientMap: materials.toon(0xffffff).gradientMap });
  const water = new THREE.MeshToonMaterial({ color: 0x9fd8f5, gradientMap: materials.toon(0xffffff).gradientMap });
  const sides = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.3, 0.95, 40, 1, true), enamel);
  sides.position.y = 0.63;
  const rim = part(new THREE.TorusGeometry(1.5, 0.08, 10, 40), materials.toon(0xffffff), materials, 0.08, 0.02);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1.1;
  const surface = new THREE.Mesh(new THREE.CircleGeometry(1.45, 40), water);
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = 0.98;
  bowl.add(sides, rim, surface);
  // Soap suds floating on the water.
  [[-1.1, 0.4], [-0.9, -0.6], [1.15, -0.3], [0.5, 0.95], [-0.4, 1.0], [0.9, 0.7]].forEach(([x, z]) => {
    const suds = part(sphere(0.13, 0.5), materials.toon(0xffffff), materials, 0.13, 0.015);
    suds.position.set(x, 1.0, z);
    bowl.add(suds);
  });
  group.add(bowl);
  [[-1, -0.75], [1, -0.75], [-1, 0.75], [1, 0.75]].forEach(([x, z]) => {
    const foot = part(sphere(0.12), materials.toon(0xffd45e), materials, 0.12, 0.015);
    foot.position.set(x, 0.1, z);
    group.add(foot);
  });
  group.userData.dispose = () => {
    enamel.dispose();
    water.dispose();
  };
  return group;
}

// A yellow rubber duck, facing +x.
function buildDuck(materials) {
  const duck = new THREE.Group();
  const yellow = materials.toon(0xffe27a);
  const body = part(sphere(0.2), yellow, materials, 0.2, 0.02);
  body.scale.set(1.25, 0.8, 1);
  const head = part(sphere(0.13), yellow, materials, 0.13, 0.02);
  head.position.set(0.14, 0.18, 0);
  const beak = part(new THREE.ConeGeometry(0.055, 0.12, 12), materials.toon(0xffa552), materials, 0.05, 0.012);
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.3, 0.16, 0);
  const tail = part(new THREE.ConeGeometry(0.07, 0.14, 10), yellow, materials, 0.06, 0.012);
  tail.rotation.z = Math.PI / 4;
  tail.position.set(-0.24, 0.1, 0);
  duck.add(body, head, beak, tail);
  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(sphere(0.025), materials.toon(0x4b2e22));
    eye.position.set(0.22, 0.22, side * 0.075);
    duck.add(eye);
  });
  return duck;
}

// A spotty shower curtain on a rail, in front of Tofu, with a shower head above her. The cloth
// is drawn from its left end so it can slide open and closed (userData.cloth.scale.x).
function buildShowerCurtain(materials) {
  const group = new THREE.Group();
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const paint = canvas.getContext("2d");
  paint.fillStyle = "#cfeefa";
  paint.fillRect(0, 0, 128, 128);
  [[20, 20, "#ffffff"], [84, 36, "#ffb3d1"], [44, 76, "#ffffff"], [104, 100, "#ffffff"], [12, 112, "#ffb3d1"], [70, 4, "#ffe27a"], [100, 68, "#ffe27a"]].forEach(([x, y, color]) => {
    paint.fillStyle = color;
    paint.beginPath();
    paint.arc(x, y, 9, 0, Math.PI * 2);
    paint.fill();
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 2);
  const clothMaterial = new THREE.MeshToonMaterial({ map: texture, side: THREE.DoubleSide, gradientMap: materials.toon(0xffffff).gradientMap });
  const geometry = new THREE.PlaneGeometry(2.8, 1.75, 42, 1);
  geometry.translate(1.4, 0, 0);
  const position = geometry.attributes.position;
  for (let index = 0; index < position.count; index += 1) position.setZ(index, Math.sin(position.getX(index) * 9) * 0.07);
  geometry.computeVertexNormals();
  const cloth = new THREE.Mesh(geometry, clothMaterial);
  cloth.position.set(-1.4, 1.95 - 0.875, 0);
  const metal = materials.toon(0xd6d0e0);
  const rail = part(new THREE.CylinderGeometry(0.04, 0.04, 3.0, 10), metal, materials, 0.04, 0.012);
  rail.rotation.z = Math.PI / 2;
  rail.position.y = 1.97;
  group.add(rail, cloth);
  group.position.z = 1.3;
  // The shower head, above her.
  const pipe = part(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 10), metal, materials, 0.04, 0.012);
  pipe.position.set(0, 3.55, -1.15);
  const rose = part(new THREE.CylinderGeometry(0.12, 0.26, 0.16, 20), metal, materials, 0.22, 0.015);
  rose.position.set(0, 3.1, -1.15);
  group.add(pipe, rose);
  group.userData.cloth = cloth;
  group.userData.dispose = () => {
    texture.dispose();
    clothMaterial.dispose();
  };
  return group;
}

/* ---------- Particles ---------- */

function textTexture(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  // Smaller letters for longer words, so they all fit ("ready or not!").
  let size = 64;
  do {
    context.font = `700 ${size}px Fredoka, 'Arial Rounded MT Bold', sans-serif`;
    size -= 4;
  } while (context.measureText(text).width > 232 && size >= 28);
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

/* ---------- The park's props ---------- */

// A pink and white checked picnic blanket with a basket on it.
function buildPicnic(materials) {
  const group = new THREE.Group();
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const paint = canvas.getContext("2d");
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      paint.fillStyle = (row + col) % 2 ? "#ffffff" : "#ff9fc3";
      paint.fillRect(col * 16, row * 16, 16, 16);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const cloth = new THREE.MeshBasicMaterial({ map: texture });
  const blanket = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.8), cloth);
  blanket.rotation.x = -Math.PI / 2;
  blanket.position.y = 0.015;
  group.add(blanket);

  const basket = new THREE.Group();
  const wicker = materials.toon(0xd9a066);
  basket.add(part(new THREE.CylinderGeometry(0.34, 0.27, 0.38, 20), wicker, materials, 0.3, 0.02));
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 24, Math.PI), wicker);
  handle.position.y = 0.18;
  basket.add(handle);
  basket.position.set(0, 0.2, 0.25);
  group.add(basket);
  group.userData.basket = basket;
  group.userData.dispose = () => {
    texture.dispose();
    cloth.dispose();
  };
  return group;
}

// A round, leafy bush to hide behind.
function buildBush(materials) {
  const group = new THREE.Group();
  [[0, 0.62, 0, 0.62, 0x6fcf8f], [-0.62, 0.42, 0.1, 0.48, 0x8fe3a8], [0.6, 0.45, 0.08, 0.5, 0x8fe3a8], [0.1, 1.1, -0.05, 0.42, 0x8fe3a8]].forEach(([x, y, z, r, color]) => {
    const leaf = part(sphere(r, 0.6), materials.toon(color), materials, r, 0.03);
    leaf.position.set(x, y, z);
    group.add(leaf);
  });
  [[-0.3, 0.9, 0.5], [0.42, 0.7, 0.5], [0.05, 1.35, 0.32]].forEach(([x, y, z]) => {
    const berry = new THREE.Mesh(sphere(0.07, 0.5), materials.toon(0xff8fae));
    berry.position.set(x, y, z);
    group.add(berry);
  });
  return group;
}

// A bubble wand: a stick with a ring on top.
function buildBubbleWand(materials) {
  const group = new THREE.Group();
  const stick = part(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 10), materials.toon(0xff8fae), materials, 0.03, 0.012);
  stick.position.y = 0.35;
  const ring = part(new THREE.TorusGeometry(0.16, 0.03, 10, 28), materials.toon(0xb79cf2), materials, 0.16, 0.012);
  ring.position.y = 0.86;
  group.add(stick, ring);
  group.userData.ring = ring;
  return group;
}

// A metal rod from point `a` to point `b`.
function rod(a, b, radius, material, materials) {
  const from = new THREE.Vector3(...a);
  const to = new THREE.Vector3(...b);
  const mesh = part(new THREE.CylinderGeometry(radius, radius, from.distanceTo(to), 10), material, materials, radius, 0.012);
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
  return mesh;
}

// A kick scooter, pointing the way its rider faces (+z in her turn group). The stem stands
// in front of her tummy and the handlebars curve back to where her hands reach.
function buildScooter(materials, color) {
  const group = new THREE.Group();
  const paint = materials.toon(color);
  const metal = materials.toon(0xd6d0e0);
  const deck = part(new THREE.BoxGeometry(0.5, 0.08, 1.8), paint, materials, 0.06, 0.015);
  deck.position.set(0, 0.2, 0.4);
  group.add(deck);
  const wheels = [-0.4, 1.2].map((z) => {
    const axle = new THREE.Group();
    axle.position.set(0, 0.12, z);
    axle.rotation.z = Math.PI / 2;
    const wheel = part(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 18), materials.toon(0x6b5a8e), materials, 0.12, 0.015);
    axle.add(wheel);
    group.add(axle);
    return wheel;
  });
  group.add(rod([0, 0.2, 1.3], [0, 1.33, 1.08], 0.04, metal, materials));
  group.add(rod([-0.5, 1.33, 1.08], [0.5, 1.33, 1.08], 0.035, metal, materials));
  [-1, 1].forEach((side) => {
    group.add(rod([side * 0.5, 1.33, 1.08], [side * 0.66, 1.33, 0.8], 0.035, metal, materials));
    group.add(rod([side * 0.6, 1.33, 0.9], [side * 0.68, 1.33, 0.76], 0.055, paint, materials));
  });
  group.userData.wheels = wheels;
  return group;
}

/* ---------- Animation ---------- */

function restPose() {
  return {
    hop: 0, turn: 0, lean: 0, squash: 1, shakeX: 0,
    headNod: 0, headTurn: 0, headTilt: 0,
    mouthOpen: 0, happyEyes: false, eyeOpen: 1, eyeScale: 1,
    wingFlap: 0, armL: 0, armR: 0, armHug: 0, tailSway: 0, tailLift: 0,
    blush: 0, chill: 0, heat: 0, fire: 0, foam: 0, fluff: 0, earWiggle: 0, step: 0, x: 0, z: 0, earFlap: 0,
  };
}

// Walking to another room: turn sideways, toddle on the spot while the room slides past, then
// turn back. `direction` is 1 for the next room on the right, -1 for the left.
const walkTime = 1.9;
function walkPose(walk, pose, userTurn) {
  const t = walk.t;
  const sideways = easeInOut(between(t, 0, 0.3)) * (1 - easeInOut(between(t, 1.55, walkTime)));
  pose.turn += (walk.direction * Math.PI / 2 - userTurn) * sideways;
  const stepping = between(t, 0.25, 0.4) * (1 - between(t, 1.45, 1.6));
  const stride = Math.sin((t - 0.25) * 12);
  pose.step = stride * stepping;
  pose.hop += Math.abs(stride) * 0.1 * stepping;
  pose.lean += stride * 0.05 * stepping;
  pose.armL += (0.3 + stride * 0.35) * stepping;
  pose.armR += (0.3 - stride * 0.35) * stepping;
  pose.tailSway += stride * 0.6 * stepping;
  pose.headNod += 0.05 * Math.abs(stride) * stepping;
  if (stepping > 0.5) pose.happyEyes = true;
}

const soundCues = {
  apple: [[0.8, "chomp"], [1.25, "whee"], [2.8, "coo"]],
  carrot: [[0.8, "chomp"], [1.25, "danceTune"]],
  cupcake: [[0.8, "chomp"], [1.3, "giggle"], [2.4, "giggle"]],
  chilli: [[0.8, "chomp"], [1.7, "gasp"], [2.25, "roar"]],
  icecream: [[0.8, "chomp"], [1.3, "coo"], [1.95, "shiver"]],
  milkshake: [[0.55, "slurp"], [1.4, "float"], [1.7, "coo"], [4.1, "sparkle"]],
  comb: [[0.3, "swish"], [0.6, "purr"], [1.3, "swish"], [2.3, "swish"], [3.3, "sparkle"]],
  bath: [[0.1, "bubbles"], [0.9, "squeak"], [1.4, "giggle"], [1.9, "squeak"], [2.3, "bubbles"], [3.0, "rub"], [5.3, "sparkle"], [5.6, "coo"]],
  painting: [[0.8, "brush"], [1.5, "brush"], [2.2, "brush"], [2.9, "brush"], [3.6, "brush"], [4.3, "brush"], [5.3, "sparkle"], [5.6, "coo"]],
  ballet: [[0.3, "musicBox"], [4.9, "sparkle"], [5.3, "coo"]],
  lemon: [[0.8, "chomp"], [1.3, "pucker"], [2.4, "giggle"]],
  salad: [[0.8, "chomp"], [1.1, "chomp"], [1.5, "sparkle"], [2.2, "coo"]],
  noodles: [[0.6, "slurp"], [1.6, "slurp"], [2.9, "purr"], [3.3, "coo"]],
  teeth: [[0.4, "brush"], [0.9, "brush"], [1.4, "brush"], [1.9, "brush"], [2.4, "brush"], [3.0, "bubbles"], [3.9, "sparkle"]],
  meditation: [[0.2, "bell"], [3.2, "bell"], [5.6, "coo"]],
  sandcastle: [[0.5, "scoop"], [1.2, "scoop"], [1.9, "scoop"], [2.6, "scoop"], [3.3, "scoop"], [4.6, "sparkle"], [5.0, "coo"]],
  pet: [[0, "purr"], [0.35, "coo"]],
  twirl: [[0.1, "whee"], [1.6, "coo"]],
  wave: [[0.2, "coo"], [1.1, "coo"]],
  // Tofu: soft nibbles, squeaks and a higher-pitched coo.
  shyApple: [[1.05, "nibble"], [1.45, "nibble"], [1.85, "nibble"], [2.5, "coo", 1.35]],
  shyCupcake: [[1.05, "nibble"], [1.45, "nibble"], [1.85, "nibble"], [2.5, "sparkle"], [2.8, "coo", 1.35]],
  shyChilli: [[1.05, "nibble"], [1.45, "nibble"], [1.85, "nibble"], [2.45, "squeak"], [2.9, "gasp"], [3.4, "squeak"]],
  shyIcecream: [[1.05, "nibble"], [1.45, "nibble"], [1.85, "nibble"], [2.5, "shiver"]],
  shyLemon: [[1.05, "nibble"], [1.45, "nibble"], [1.85, "nibble"], [2.45, "pucker"], [3.2, "giggle"]],
  shyMilkshake: [[1.1, "slurp"], [2.6, "float"], [3.0, "coo", 1.35]],
  tofuShy: [[0, "squeak"], [1.1, "coo", 1.35]],
  tofuFlutter: [[0.1, "whee"], [1.5, "coo", 1.35]],
  tofuGiggle: [[0.1, "giggle"]],
  baking: [[0.6, "rub"], [2.0, "rub"], [4.3, "ding"], [4.6, "sparkle"], [5.0, "coo", 1.35]],
  tofuBath: [[0.1, "swish"], [0.8, "bubbles"], [1.6, "bubbles"], [2.2, "giggle"], [2.6, "bubbles"], [3.4, "bubbles"], [3.9, "swish"], [4.5, "rub"], [5.6, "sparkle"], [5.9, "coo", 1.35]],
  science: [[0.5, "fizz"], [2.0, "fizz"], [3.5, "poof"], [4.6, "giggle"], [5.0, "sparkle"]],
  singing: [[0.2, "song"], [5.8, "coo", 1.35]],
  reading: [[1.4, "page"], [3.0, "page"], [4.6, "page"], [5.7, "sparkle"], [6.0, "coo", 1.35]],
  friend: [[0.1, "coo"], [0.9, "whee"], [2.5, "giggle"], [3.1, "danceTune"], [5.8, "purr"], [6.1, "sparkle"], [7.0, "coo"], [7.7, "whee"]],
  // The park, with both dragons.
  picnic: [[0.2, "swish"], [1.0, "sparkle"], [1.9, "chomp"], [2.0, "nibble"], [2.6, "chomp"], [2.7, "nibble"], [3.3, "chomp"], [3.4, "nibble"], [4.0, "giggle"], [5.3, "coo"]],
  hideSeek: [[0.6, "squeak"], [1.2, "squeak"], [1.8, "squeak"], [2.4, "coo", 1.35], [3.1, "gasp"], [5.8, "giggle"], [6.2, "sparkle"]],
  parkBubbles: [[0.9, "bubbles"], [2.0, "bubbles"], [3.1, "bubbles"], [1.8, "squeak"], [2.9, "squeak"], [4.0, "squeak"], [5.6, "giggle"]],
  scooters: [[0.8, "whee"], [3.0, "giggle"], [3.6, "whee"], [6.0, "sparkle"], [6.2, "coo"]],
  parkHello: [[0.2, "coo"], [0.6, "coo", 1.35]],
  parkHug: [[0.3, "purr"], [0.9, "sparkle"], [1.2, "coo"]],
};

function playSoundCues(run, sfx) {
  (soundCues[run.id] ?? []).forEach(([at, name, value], index) => {
    if (run.t >= at && !run.done[`sound${index}`]) {
      run.done[`sound${index}`] = true;
      sfx[name]?.(value);
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
    run.treat = buildTreat(run.model, ctx.materials);
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

// Tofu takes a treat in both paws and nibbles it: three shy little bites. Returns the time since
// the nibbling ended.
function nibbleTreat(run, pose, ctx) {
  const t = run.t;
  if (!run.treat) {
    run.treat = buildTreat(run.model, ctx.materials);
    ctx.scene.add(run.treat);
    run.treatStart = ctx.mouthWorld().add(new THREE.Vector3(1.3, -1.5, 1.6));
  }
  const held = ctx.mouthWorld().add(new THREE.Vector3(0, -0.3, 0.45));
  const k = easeInOut(between(t, 0, 0.9));
  run.treat.position.lerpVectors(run.treatStart, held, k);
  run.treat.position.y += Math.sin(k * Math.PI) * 0.4;
  run.treat.rotation.y = Math.sin(t * 2) * 0.3;
  const bites = Math.min(3, Math.floor(between(t, 1.0, 2.2) * 3));
  const gone = t < 2.3 ? 1 : Math.max(0.01, 1 - (t - 2.3) * 8);
  run.treat.scale.setScalar(1.1 * (1 - bites * 0.25) * gone);
  run.treat.visible = t < 2.42;
  const hold = between(t, 0.6, 0.95) * (1 - between(t, 2.2, 2.55));
  pose.armL = Math.max(pose.armL, 1.05 * hold);
  pose.armR = Math.max(pose.armR, 1.05 * hold);
  pose.armHug = Math.max(pose.armHug, 0.85 * hold);
  pose.headNod += 0.18 * hold;
  pose.blush = Math.max(pose.blush, 0.6 * hold);
  if (t > 1.0 && t < 2.2) pose.mouthOpen = Math.max(pose.mouthOpen, 0.3 * Math.abs(Math.sin((t - 1.0) * Math.PI * 2.5)));
  return t - 2.4;
}

// A short word floating up beside the dragon's head, once per action.
function say(run, ctx, text, color) {
  once(run, `say:${text}`, () => ctx.fx.spawn(ctx.fx.text(text, color, ctx.headWorld().add(new THREE.Vector3(1.2, 0.9, 0.4)), 1.0),
    { velocity: new THREE.Vector3(0, 0.35, 0), life: 1.4 }));
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

  // Mochi in a bathtub: she boops her rubber duck, splashes, then hops out for the towel.
  // Tofu showers behind a curtain (she's shy), with lots and lots of bubbles, then the towel.
  tofuBath(run, pose, dt, ctx) {
    const t = run.t;
    if (!run.curtain) {
      run.curtain = buildShowerCurtain(ctx.materials);
      ctx.turn.add(run.curtain);
      run.props.push(run.curtain);
    }
    const shut = easeInOut(between(t, 0, 0.7)) * (1 - easeInOut(between(t, 3.9, 4.4)));
    const there = between(t, 0, 0.3) * (1 - between(t, 4.4, 4.7));
    run.curtain.scale.setScalar(Math.max(0.01, there));
    run.curtain.userData.cloth.scale.x = 0.12 + 0.88 * shut;
    pose.foam = 1.3 * between(t, 0.8, 1.4) * (1 - between(t, 4.0, 4.6));
    if (t > 0.5 && t < 4.0) {
      pose.happyEyes = true;
      pose.blush = 0.8;
      pose.headTilt += 0.12 * Math.sin(t * 3);
      pose.shakeX += Math.sin(t * 18) * 0.01;
      // The shower runs onto her head...
      emit(run, "shower", 40, dt, () => {
        const from = ctx.headWorld().add(new THREE.Vector3(rand(-0.3, 0.3), 1.05, rand(-0.4, 0.1)));
        ctx.fx.spawn(ctx.fx.mesh("snow", from, rand(0.7, 1.1), 0x6fb3e6), { velocity: new THREE.Vector3(rand(-0.3, 0.3), -3, 0), life: 0.35 });
      });
      // ...and lots of bubbles float up over the curtain.
      emit(run, "bubble", 45, dt, () => {
        // From either side of the curtain, drifting outwards, so her face still peeks out.
        const side = Math.random() < 0.5 ? -1 : 1;
        const bubble = ctx.fx.mesh("bubble", ctx.bodyWorld().add(new THREE.Vector3(side * rand(0.6, 1.4), rand(0.6, 1.0), rand(0.4, 1.4))), rand(0.08, 0.24));
        ctx.fx.spawn(bubble, { velocity: new THREE.Vector3(side * rand(0.1, 0.5), rand(0.5, 1.1), rand(0, 0.3)), life: rand(1.5, 2.4), wobble: 0.4, grow: 0.25, opacity: 0.6 });
      });
    }
    if (!run.towel) {
      run.towel = buildTowel(ctx.materials);
      run.towel.visible = false;
      ctx.turn.add(run.towel);
    }
    const drying = t > 4.5 && t < 5.6;
    run.towel.visible = drying;
    if (drying) {
      const d = (t - 4.5) / 1.1;
      run.towel.position.set(Math.sin(d * Math.PI * 5) * 0.5, 2.8 - d * 1.6, 1.25);
      run.towel.rotation.z = Math.sin(d * Math.PI * 5) * 0.15;
      pose.happyEyes = true;
      pose.shakeX += Math.sin(t * 40) * 0.02;
    }
    if (t > 5.6) {
      pose.happyEyes = true;
      pose.blush = 0.9;
      pose.hop += pulse(t, 5.6, 6.1) * 0.25;
      once(run, "clean", () => {
        ctx.fx.sparkles(ctx.bodyWorld().add(new THREE.Vector3(0, 0.5, 0)), 24, 2.2);
        ctx.fx.hearts(ctx.headWorld().add(new THREE.Vector3(0, 0.9, 0.3)), 2);
      });
    }
  },

  bath(run, pose, dt, ctx) {
    const t = run.t;
    if (!run.tub) {
      run.tub = buildTub(ctx.materials);
      run.duck = buildDuck(ctx.materials);
      run.duck.rotation.y = -Math.PI / 2.6;
      ctx.turn.add(run.tub, run.duck);
      run.props.push(run.tub, run.duck);
    }
    // Phase 1: in the tub with the duck.
    const inTub = easeInOut(between(t, 0, 0.5)) * (1 - easeInOut(between(t, 2.9, 3.3)));
    run.tub.scale.setScalar(Math.max(0.01, inTub));
    run.duck.scale.setScalar(Math.max(0.01, 1.7 * inTub));
    const boop = pulse(t, 0.8, 1.2) + pulse(t, 1.8, 2.2);
    run.duck.position.set(0.8, 1.08 + 0.03 * Math.sin(t * 5) + 0.3 * boop, 0.85);
    run.duck.rotation.z = 0.25 * boop;
    pose.foam = between(t, 0, 0.4) * (1 - between(t, 3.0, 4.6));
    if (t < 3.0) {
      pose.happyEyes = true;
      pose.blush = 0.7;
      // Boop the duck with one hand, then splash with both.
      if (boop > 0) ctx.arms[1].userData.forward = -1.2 * boop;
      const splashing = between(t, 1.2, 1.4) * (1 - between(t, 2.6, 2.9));
      pose.armL = Math.max(pose.armL, splashing * (0.9 + 0.6 * Math.sin(t * 16)));
      pose.armR = Math.max(pose.armR, splashing * (0.9 + 0.6 * Math.sin(t * 16 + Math.PI)));
      pose.shakeX += Math.sin(t * 20) * 0.015 * splashing;
      emit(run, "splash", 45 * splashing, dt, () => {
        const angle = rand(0, Math.PI * 2);
        const from = ctx.bodyWorld().add(new THREE.Vector3(Math.cos(angle) * 1.15, -0.05, Math.sin(angle) * 0.9));
        const drop = ctx.fx.mesh("snow", from, rand(0.9, 1.6), 0x6fb3e6);
        ctx.fx.spawn(drop, { velocity: new THREE.Vector3(Math.cos(angle) * rand(0.6, 1.4), rand(2.2, 3.4), Math.sin(angle) * rand(0.6, 1.4)), gravity: 7, life: 0.8, spin: 6 });
      });
      emit(run, "bubble", 8, dt, () => {
        const bubble = ctx.fx.mesh("bubble", ctx.bodyWorld().add(new THREE.Vector3(rand(-1.3, 1.3), rand(0, 0.6), rand(-0.3, 1.0))), rand(0.07, 0.16));
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

  lemon(run, pose, dt, ctx) {
    const r = eatTreat(run, pose, ctx);
    if (r < 0) return;
    // A big sour pucker: scrunched eyes, shivers, then a giggle.
    const sour = between(r, 0, 0.2) * (1 - between(r, 1.8, 2.3));
    pose.happyEyes = sour > 0.3;
    pose.squash -= 0.09 * sour;
    pose.shakeX += Math.sin(r * 55) * 0.04 * sour;
    pose.headTilt += Math.sin(r * 12) * 0.12 * sour;
    pose.armHug = sour;
    pose.earWiggle += 0.3 * sour;
    pose.tailLift += 0.8 * sour;
    pose.mouthOpen = 0.18 * sour;
    if (r < 1.8) {
      emit(run, "sour", 2.4, dt, () => ctx.fx.spawn(ctx.fx.text(pick(["sour!", "eek!", "so sour!"]), "#c8a800", ctx.headWorld().add(new THREE.Vector3(pick([-1.3, 1.3]), 0.7, 0.4)), 1.1),
        { velocity: new THREE.Vector3(0, 0.5, 0), life: 1 }));
      emit(run, "drops", 10, dt, () => {
        const drop = ctx.fx.mesh("snow", ctx.headWorld().add(new THREE.Vector3(rand(-0.9, 0.9), rand(0.6, 1.1), 0.4)), 1, 0xfff06a);
        ctx.fx.spawn(drop, { velocity: new THREE.Vector3(rand(-0.4, 0.4), rand(0.3, 0.8), 0), gravity: 2.5, life: 0.9 });
      });
    } else {
      pose.happyEyes = true;
      pose.blush = 0.7;
      pose.mouthOpen = 0.3 * pulse(r, 1.9, 2.5);
    }
  },

  salad(run, pose, dt, ctx) {
    const r = eatTreat(run, pose, ctx);
    if (r < 0) return;
    // Flexes both arms: strong and healthy!
    const flex = between(r, 0.1, 0.4) * (1 - between(r, 2.6, 3.1));
    pose.armL = pose.armR = 2.1 * flex + 0.15 * Math.sin(r * 10) * flex;
    pose.armHug = -0.2 * flex;
    pose.squash += 0.06 * flex;
    pose.hop += 0.12 * pulse(r, 0.2, 0.6) + 0.12 * pulse(r, 1.4, 1.8);
    pose.happyEyes = true;
    pose.blush = 0.6 * flex;
    pose.wingFlap += 0.4 * flex;
    pose.headNod -= 0.12 * flex;
    if (flex > 0.3) {
      emit(run, "strong", 1.4, dt, () => ctx.fx.spawn(ctx.fx.text(pick(["strong!", "healthy!", "yum!"]), "#4fb893", ctx.headWorld().add(new THREE.Vector3(pick([-1.4, 1.4]), 0.6, 0.4)), 1.1),
        { velocity: new THREE.Vector3(0, 0.5, 0), life: 1.1 }));
      emit(run, "sparkle", 12, dt, () => ctx.fx.sparkles(ctx.bodyWorld(), 1, 1.6));
    }
  },

  noodles(run, pose, dt, ctx) {
    const r = eatTreat(run, pose, ctx);
    if (!run.strands) {
      // Noodles hanging from her mouth that slurp up.
      run.strands = new THREE.Group();
      [-0.08, 0, 0.08].forEach((x) => {
        const strand = part(new THREE.CylinderGeometry(0.02, 0.02, 1, 8), ctx.materials.toon(0xffd27a), ctx.materials, 0.02, 0.008);
        strand.position.set(x, -0.5, 0);
        run.strands.add(strand);
      });
      run.strands.visible = false;
      ctx.scene.add(run.strands);
    }
    if (r < 0) return;
    const slurp = between(r, 0, 1.6);
    run.strands.visible = slurp < 1;
    run.strands.position.copy(ctx.mouthWorld()).add(new THREE.Vector3(0, -0.05, 0.05));
    run.strands.scale.set(1, Math.max(0.01, (1 - slurp) * 0.9), 1);
    run.strands.rotation.z = Math.sin(r * 18) * 0.15 * (1 - slurp);
    if (slurp < 1) {
      pose.mouthOpen = 0.25;
      pose.headNod -= 0.08;
      pose.shakeX += Math.sin(r * 30) * 0.01;
    }
    // Then a cosy, contented sigh: comfort food.
    const cosy = between(r, 1.7, 2.2) * (1 - between(r, 3.6, 4.0));
    pose.happyEyes = r > 1.6;
    pose.blush = Math.max(pose.blush, cosy);
    pose.armHug = cosy;
    pose.armL = pose.armR = 0.4 * cosy;
    pose.headTilt += 0.25 * cosy;
    pose.squash += 0.04 * Math.sin(r * 3) * cosy;
    if (cosy > 0.3) {
      emit(run, "steam", 6, dt, () => {
        const puff = ctx.fx.mesh("puff", ctx.headWorld().add(new THREE.Vector3(rand(-0.4, 0.4), 1.0, 0.3)), rand(0.4, 0.7));
        ctx.fx.spawn(puff, { velocity: new THREE.Vector3(0, 0.6, 0), life: 1.2, grow: 1, opacity: 0.5 });
      });
      emit(run, "hearts", 2, dt, () => ctx.fx.hearts(ctx.headWorld().add(new THREE.Vector3(0, 0.8, 0.3)), 1));
    }
  },

  teeth(run, pose, dt, ctx) {
    const t = run.t;
    if (!run.toothbrush) {
      run.toothbrush = buildToothbrush(ctx.materials);
      ctx.scene.add(run.toothbrush);
    }
    const brushing = t > 0.3 && t < 3.4;
    run.toothbrush.visible = t < 3.6;
    // The brush scrubs side to side across her open, smiling mouth.
    run.toothbrush.position.copy(ctx.mouthWorld()).add(new THREE.Vector3(0.18 + Math.sin(t * 16) * 0.16, -0.36, 0.28));
    run.toothbrush.rotation.set(0, 0, Math.PI / 2 - 0.2);
    run.toothbrush.scale.setScalar(Math.min(1, t * 4) * (t > 3.4 ? Math.max(0.01, 1 - (t - 3.4) * 5) : 1));
    if (brushing) {
      pose.mouthOpen = 0.55;
      pose.armR = 1.3 + Math.sin(t * 16) * 0.1;
      pose.headTilt += Math.sin(t * 16) * 0.04;
      emit(run, "foam", 14, dt, () => {
        const bubble = ctx.fx.mesh("bubble", ctx.mouthWorld().add(new THREE.Vector3(rand(-0.25, 0.25), rand(-0.1, 0.1), 0.25)), rand(0.05, 0.1));
        ctx.fx.spawn(bubble, { velocity: new THREE.Vector3(rand(-0.3, 0.3), rand(0.2, 0.6), 0.2), life: 0.9, opacity: 0.7 });
      });
    }
    // Then a big sparkly grin.
    if (t > 3.6) {
      pose.happyEyes = true;
      pose.mouthOpen = 0.5 * pulse(t, 3.6, 4.8);
      pose.blush = 0.7;
      once(run, "clean", () => ctx.fx.sparkles(ctx.mouthWorld().add(new THREE.Vector3(0, 0, 0.3)), 14, 1.2));
    }
  },

  meditation(run, pose, dt, ctx) {
    const t = run.t;
    if (!run.cushion) {
      run.cushion = buildCushion(ctx.materials);
      ctx.turn.add(run.cushion);
    }
    run.cushion.scale.setScalar(Math.max(0.01, easeInOut(between(t, 0, 0.5)) * (1 - between(t, 5.8, 6.3))));
    // Eyes closed, floating gently above the cushion and breathing slowly.
    const calm = between(t, 0.4, 1.2) * (1 - between(t, 5.2, 6.0));
    pose.happyEyes = calm > 0.2;
    pose.hop += 0.35 * calm + 0.06 * Math.sin(t * 1.6) * calm;
    pose.squash += 0.05 * Math.sin(t * 1.6) * calm;
    pose.armL = pose.armR = 0.9 * calm;
    pose.armHug = -0.3 * calm;
    pose.wingFlap += 0.1 * Math.sin(t * 1.6) * calm;
    pose.tailSway *= 1 - 0.8 * calm;
    pose.blush = 0.5 * calm;
    if (calm > 0.4) {
      emit(run, "om", 0.6, dt, () => ctx.fx.spawn(ctx.fx.text(pick(["ommm…", "breathe…", "calm…"]), "#8a6ae6", ctx.headWorld().add(new THREE.Vector3(pick([-1.3, 1.3]), 0.8, 0.3)), 1.1),
        { velocity: new THREE.Vector3(0, 0.25, 0), life: 2 }));
      emit(run, "petals", 4, dt, () => {
        const petal = ctx.fx.mesh("heart", ctx.bodyWorld().add(new THREE.Vector3(rand(-1.6, 1.6), rand(1.2, 2), rand(-0.3, 0.6))), 0.6, pick([0xffb3d9, 0xd9c8ff, 0xfff0f6]));
        ctx.fx.spawn(petal, { velocity: new THREE.Vector3(rand(-0.1, 0.1), -0.35, 0), life: 2.6, spin: 1, wobble: 0.6 });
      });
    }
    if (t > 5.4) once(run, "refreshed", () => ctx.fx.sparkles(ctx.headWorld().add(new THREE.Vector3(0, 0.8, 0.3)), 10, 1));
  },

  sandcastle(run, pose, dt, ctx) {
    const t = run.t;
    if (!run.sandcastle) {
      run.sandcastle = buildSandcastle(ctx.materials);
      run.sandcastle.position.set(1.55, 0, 0.9);
      ctx.turn.add(run.sandcastle);
    }
    const appear = easeInOut(between(t, 0, 0.5)) * (1 - between(t, 6.1, 6.6));
    run.sandcastle.scale.setScalar(Math.max(0.01, appear));
    // The castle rises out of the pile with each pat, then the flag pops up.
    const built = easeInOut(between(t, 0.5, 4.0));
    const { castle, flag } = run.sandcastle.userData;
    castle.scale.set(1, Math.max(0.01, built), 1);
    flag.visible = t > 4.3;
    flag.scale.setScalar(Math.max(0.01, between(t, 4.3, 4.6)));

    const atCastle = between(t, 0.2, 0.6) * (1 - between(t, 4.2, 4.8));
    pose.turn += 0.55 * atCastle;
    pose.headTurn += 0.2 * atCastle;
    pose.headNod += 0.15 * atCastle;
    if (t > 0.5 && t < 4.0) {
      const pat = Math.abs(Math.sin(t * 6));
      pose.armR = 0.6 + 0.8 * pat;
      pose.armL = 0.6 + 0.8 * (1 - pat);
      pose.squash += 0.03 * pat;
      emit(run, "sand", 10, dt, () => {
        const grain = ctx.fx.mesh("sparkle", run.sandcastle.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(rand(-0.4, 0.4), 0.4, rand(-0.2, 0.3))), 0.6, 0xf3d38c);
        ctx.fx.spawn(grain, { velocity: new THREE.Vector3(rand(-0.6, 0.6), rand(0.4, 1), rand(-0.2, 0.4)), gravity: 3, life: 0.7 });
      });
    }
    if (t > 4.4) {
      pose.happyEyes = true;
      pose.blush = 0.8;
      pose.hop += pulse(t, 4.5, 5.0) * 0.35;
      pose.armL = pose.armR = Math.max(pose.armL, 1.4 * pulse(t, 4.4, 5.6));
      once(run, "done", () => ctx.fx.sparkles(run.sandcastle.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.9, 0)), 16, 1.6));
    }
  },

  twirl(run, pose, dt, ctx) {
    const t = run.t;
    pose.turn += easeInOut(between(t, 0.1, 1.5)) * Math.PI * 2;
    pose.hop += pulse(t, 0.1, 1.5) * 0.4;
    pose.armL = pose.armR = 1.8 * pulse(t, 0, 1.7);
    pose.wingFlap += 0.4 * Math.sin(t * 16) * pulse(t, 0, 1.7);
    pose.happyEyes = true;
    pose.blush = 0.6;
    if (t < 1.5) emit(run, "trail", 16, dt, () => ctx.fx.sparkles(ctx.bodyWorld(), 1, 1.2));
  },

  wave(run, pose, dt, ctx) {
    const t = run.t;
    const up = between(t, 0, 0.3) * (1 - between(t, 1.8, 2.2));
    pose.armR = 1.9 * up;
    pose.headTilt += (0.2 + Math.sin(t * 12) * 0.08) * up;
    pose.lean += Math.sin(t * 12) * 0.05 * up;
    pose.happyEyes = true;
    pose.mouthOpen = 0.3 * up;
    pose.blush = 0.5;
    // The waving hand stays up in front and sways side to side.
    ctx.arms[1].userData.forward = -0.25 * up;
    ctx.arms[1].userData.wave = Math.sin(t * 12) * 0.5 * up;
    once(run, "hi", () => ctx.fx.spawn(ctx.fx.text("hi!", "#f06aa8", ctx.headWorld().add(new THREE.Vector3(1.3, 0.9, 0.4)), 1.1),
      { velocity: new THREE.Vector3(0, 0.4, 0), life: 1.4 }));
  },

  // Mochi calls her friend Tofu, who flies in. They say hi, dance, hug, and Tofu flies home.
  friend(run, pose, dt, ctx) {
    const t = run.t;
    if (!run.friend) {
      run.friend = ctx.makeFriend();
      run.friendShadow = ctx.makeShadow();
    }
    const tofu = run.friend;
    const tofuPose = restPose();
    tofuPose.squash = 1 + 0.022 * Math.sin(t * 2.4);
    tofuPose.tailSway = 0.45 * Math.sin(t * 1.7);
    tofuPose.headTilt = -0.06 * Math.sin(t * 0.8);

    // Mochi calls out and makes room on her left.
    const together = easeInOut(between(t, 0.8, 2.0)) * (1 - easeInOut(between(t, 7.8, 8.8)));
    pose.x = -1.15 * together;
    pose.turn += 0.35 * together;
    tofuPose.turn = -0.45;
    if (t < 1.0) {
      pose.armR = 1.6 * pulse(t, 0, 1.0);
      pose.headNod -= 0.15 * pulse(t, 0, 1.0);
      pose.headTurn += 0.3 * pulse(t, 0, 1.0);
      once(run, "call", () => ctx.fx.spawn(ctx.fx.text("Tofu!", "#f06aa8", ctx.headWorld().add(new THREE.Vector3(1.1, 0.9, 0.4)), 1.1),
        { velocity: new THREE.Vector3(0.3, 0.4, 0), life: 1.3 }));
    }

    // Tofu flies in on both pairs of wings, lands with a bounce, and later flies off again.
    const landed = new THREE.Vector3(1.35, 0, 0);
    const sky = new THREE.Vector3(4.8, 5.2, -1.5);
    const arrive = easeInOut(between(t, 0.7, 2.4));
    const leave = easeInOut(between(t, 7.7, 9.0));
    const position = new THREE.Vector3().lerpVectors(sky, landed, arrive).lerp(sky, leave);
    const flying = (1 - between(t, 2.2, 2.5)) + between(t, 7.5, 7.8);
    position.y += Math.sin(t * 9) * 0.08 * Math.min(1, flying);
    tofuPose.wingFlap = Math.min(1, flying) * 0.7 * Math.sin(t * 24) + 0.14 * Math.sin(t * 2.6);
    tofuPose.earFlap = Math.min(1, flying) * 0.5 * Math.sin(t * 24 + 1) + 0.3 * pulse(t, 2.3, 2.9);
    tofuPose.squash -= 0.12 * pulse(t, 2.35, 2.75);
    tofuPose.turn += 0.6 * leave;
    if (t > 0.7 && t < 2.3) emit(run, "trail", 14, dt, () => ctx.fx.sparkles(tofu.body.getWorldPosition(new THREE.Vector3()), 1, 1));

    // Hi!
    if (t > 2.5 && t < 3.1) {
      pose.happyEyes = tofuPose.happyEyes = true;
      tofuPose.armR = 1.7 * pulse(t, 2.5, 3.1);
      once(run, "hi", () => {
        ctx.fx.spawn(ctx.fx.text("hi!", "#f2b632", tofu.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0.6, 1.0, 0.3)), 1.0),
          { velocity: new THREE.Vector3(0, 0.4, 0), life: 1.3 });
        ctx.fx.hearts(new THREE.Vector3(0.1, 3.3, 0.4), 3);
      });
    }

    // Dance together: bouncing in turn, arms up, and a twirl each.
    if (t > 3.1 && t < 5.7) {
      const beat = (t - 3.1) * 4.6;
      pose.hop += Math.max(0, Math.sin(beat)) * 0.35;
      tofuPose.hop = Math.max(0, -Math.sin(beat)) * 0.35;
      pose.armL = pose.armR = 1.3 + 0.4 * Math.sin(beat);
      tofuPose.armL = tofuPose.armR = 1.3 - 0.4 * Math.sin(beat);
      pose.happyEyes = tofuPose.happyEyes = true;
      pose.blush = tofuPose.blush = 0.7;
      const spin = easeInOut(between(t, 4.4, 5.2)) * Math.PI * 2;
      pose.turn += spin;
      tofuPose.turn += spin;
      emit(run, "notes", 3, dt, () => ctx.fx.spawn(ctx.fx.text(pick(["♪", "♫"]), pick(["#8a6ae6", "#f06aa8", "#f2b632"]), new THREE.Vector3(rand(-2, 2), rand(3, 3.8), 0.5), 0.9),
        { velocity: new THREE.Vector3(rand(-0.2, 0.2), 0.6, 0), life: 1.4 }));
    }

    // A big hug.
    const hug = pulse(t, 5.7, 7.0);
    if (hug > 0) {
      pose.lean -= 0.16 * hug;
      tofuPose.lean += 0.16 * hug;
      pose.armHug = tofuPose.armHug = hug;
      pose.armL = pose.armR = Math.max(pose.armL, 0.6 * hug);
      tofuPose.armL = tofuPose.armR = 0.6 * hug;
      pose.happyEyes = tofuPose.happyEyes = true;
      pose.blush = tofuPose.blush = hug;
      once(run, "hug", () => {
        ctx.fx.hearts(new THREE.Vector3(0.1, 2.9, 0.4), 7);
        ctx.fx.spawn(ctx.fx.text("hugs!", "#f06aa8", new THREE.Vector3(0.1, 3.75, 1.3), 1.0), { velocity: new THREE.Vector3(0, 0.15, 0), life: 1.6 });
      });
    }

    // Bye-bye waves from both.
    const bye = between(t, 7.0, 7.3) * (1 - between(t, 8.6, 9.0));
    if (bye > 0) {
      tofuPose.armR = 1.9 * bye;
      tofu.arms[1].userData.forward = -0.25 * bye;
      tofu.arms[1].userData.wave = Math.sin(t * 12) * 0.5 * bye;
      pose.armR = Math.max(pose.armR, 1.9 * bye);
      ctx.arms[1].userData.forward = -0.25 * bye;
      ctx.arms[1].userData.wave = Math.sin(t * 12 + 1) * 0.5 * bye;
      pose.happyEyes = true;
      once(run, "bye", () => ctx.fx.spawn(ctx.fx.text("bye-bye!", "#8a6ae6", ctx.headWorld().add(new THREE.Vector3(-0.2, 1.1, 0.4)), 1.0),
        { velocity: new THREE.Vector3(0, 0.4, 0), life: 1.4 }));
    }

    if (tofuPose.happyEyes) tofuPose.earWiggle += 0.12 * Math.sin(t * 14);
    tofuPose.x = position.x;
    tofuPose.hop += position.y;
    applyPose(tofu, tofuPose, 0);
    tofu.root.position.z = position.z;
    tofu.root.scale.setScalar(0.85);
    run.friendShadow.position.set(position.x, 0.006, position.z);
    run.friendShadow.scale.setScalar(Math.max(0.2, 0.85 - position.y * 0.18));
    run.friendShadow.material.opacity = Math.max(0, 1 - position.y * 0.25);
  },

  /* ----- The park: Mochi (pose) and Tofu (ctx.partnerPose) together ----- */

  // A picnic on a checked blanket: a cupcake each from the basket, then happy hearts.
  picnic(run, pose, dt, ctx) {
    const t = run.t;
    const tofu = ctx.partner;
    const tofuPose = ctx.partnerPose;
    if (!run.picnic) {
      run.picnic = buildPicnic(ctx.materials);
      run.picnic.position.set(0, 0, 1.2);
      ctx.scene.add(run.picnic);
      run.cakes = [buildTreat("cupcake", ctx.materials), buildTreat("cupcake", ctx.materials)];
      run.cakes.forEach((cake) => ctx.scene.add(cake));
      run.props.push(run.picnic, ...run.cakes);
    }
    const show = easeInOut(between(t, 0, 0.6)) * (1 - easeInOut(between(t, 6.6, 7.3)));
    run.picnic.scale.setScalar(Math.max(0.01, show));

    // Sitting down together, turned towards the blanket.
    const sitting = between(t, 0.3, 0.8) * (1 - between(t, 6.4, 7.0));
    pose.squash -= 0.07 * sitting;
    tofuPose.squash -= 0.07 * sitting;
    pose.turn += 0.35 * sitting;
    tofuPose.turn -= 0.45 * sitting;

    // A cupcake each pops out of the basket and flies up to each mouth, then three bites.
    const basket = run.picnic.userData.basket.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.35, 0));
    const mouths = [ctx.mouthWorld().add(new THREE.Vector3(0, -0.15, 0.35)), tofu.mouth.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, -0.15, 0.3))];
    run.cakes.forEach((cake, index) => {
      const fly = easeInOut(between(t, 0.9 + index * 0.15, 1.6 + index * 0.15));
      cake.position.lerpVectors(basket, mouths[index], fly);
      cake.position.y += Math.sin(fly * Math.PI) * 0.8;
      const bites = [1.9, 2.6, 3.3].filter((at) => t > at + index * 0.1).length;
      cake.scale.setScalar(t < 0.9 ? 0.01 : [0.85, 0.6, 0.35, 0.01][bites]);
      cake.visible = bites < 3 && t > 0.9;
    });
    [pose, tofuPose].forEach((who, index) => {
      if (t > 1.8 && t < 3.6) {
        who.mouthOpen = Math.max(0, Math.sin((t - 1.8 - index * 0.1) * 9)) * 0.7;
        who.armL = who.armR = 0.7;
        who.armHug = 0.6;
      }
      if (t > 3.6 && t < 6.2) {
        who.happyEyes = true;
        who.blush = 0.8;
        who.hop += Math.max(0, Math.sin((t - 3.6) * 7 + index * 1.5)) * 0.12;
      }
    });
    if (t > 3.7) once(run, "yum", () => {
      ctx.fx.hearts(new THREE.Vector3(0.1, 3.2, 0.6), 6);
      ctx.fx.spawn(ctx.fx.text("yum!", "#f06aa8", new THREE.Vector3(0, 3.8, 1), 1.0), { velocity: new THREE.Vector3(0, 0.3, 0), life: 1.5 });
    });
  },

  // Tofu counts with her eyes covered while Mochi tiptoes behind a bush; then Tofu finds her.
  hideSeek(run, pose, dt, ctx) {
    const t = run.t;
    const tofu = ctx.partner;
    const tofuPose = ctx.partnerPose;
    const bushAt = new THREE.Vector3(-2.5, 0, 0.9);
    if (!run.bush) {
      run.bush = buildBush(ctx.materials);
      run.bush.position.copy(bushAt);
      ctx.scene.add(run.bush);
      run.props.push(run.bush);
    }
    // A big bush: Mochi only just fits behind it.
    run.bush.scale.setScalar(Math.max(0.01, 1.75 * easeInOut(between(t, 0, 0.5)) * (1 - easeInOut(between(t, 7.6, 8.2)))));

    // Tofu covers her eyes and counts to three.
    const covering = between(t, 0.3, 0.6) * (1 - between(t, 2.4, 2.7));
    tofuPose.armL = tofuPose.armR = Math.max(tofuPose.armL, 2.1 * covering);
    tofuPose.armHug = Math.max(tofuPose.armHug, 0.95 * covering);
    tofuPose.headNod += 0.25 * covering;
    if (covering > 0.5) tofuPose.happyEyes = true;
    const tofuHead = () => tofu.head.getWorldPosition(new THREE.Vector3());
    [[0.6, "1"], [1.2, "2"], [1.8, "3"]].forEach(([at, count]) => {
      if (t > at) once(run, `count${count}`, () => ctx.fx.spawn(ctx.fx.text(count, "#8a6ae6", tofuHead().add(new THREE.Vector3(0.5, 1.0, 0.4)), 0.9), { velocity: new THREE.Vector3(0, 0.4, 0), life: 0.9 }));
    });
    if (t > 2.4) once(run, "ready", () => ctx.fx.spawn(ctx.fx.text("ready or not!", "#f06aa8", tofuHead().add(new THREE.Vector3(0, 1.1, 0.4)), 1.3), { velocity: new THREE.Vector3(0, 0.3, 0), life: 1.4 }));

    // Mochi tiptoes behind the bush, crouches, then pops up when she's found.
    const hiding = easeInOut(between(t, 0.6, 2.2)) * (1 - easeInOut(between(t, 6.6, 7.8)));
    pose.x += (bushAt.x + 0.2 - pose.x) * hiding;
    pose.z = -1.1 * hiding;
    const tiptoe = (between(t, 0.6, 0.8) * (1 - between(t, 2.0, 2.2))) + (between(t, 6.6, 6.8) * (1 - between(t, 7.6, 7.8)));
    if (tiptoe > 0) {
      const stride = Math.sin(t * 13);
      pose.step = stride * tiptoe;
      pose.hop += Math.abs(stride) * 0.06 * tiptoe;
      pose.turn -= 1.2 * tiptoe * (t < 4 ? 1 : -1);
    }
    const crouch = between(t, 2.1, 2.4) * (1 - between(t, 5.6, 5.8));
    pose.squash -= 0.2 * crouch;
    pose.hop -= 0.85 * crouch;
    pose.earWiggle += 0.15 * Math.sin(t * 10) * crouch;

    // Tofu looks around, wondering where Mochi is…
    const looking = between(t, 2.7, 3.0) * (1 - between(t, 4.4, 4.7));
    tofuPose.headTurn += 0.6 * Math.sin((t - 2.7) * 3) * looking;
    tofuPose.turn += 0.5 * Math.sin((t - 2.7) * 2) * looking;
    if (t > 3.1) once(run, "where", () => ctx.fx.spawn(ctx.fx.text("?", "#8a6ae6", tofuHead().add(new THREE.Vector3(0.4, 1.0, 0.4)), 0.9), { velocity: new THREE.Vector3(0, 0.3, 0), life: 1.2 }));
    // …then tiptoes over to the bush, and back to her spot at the end.
    const toBush = easeInOut(between(t, 4.6, 5.6)) * (1 - easeInOut(between(t, 6.8, 7.8)));
    tofuPose.x += (-1.0 - tofuPose.x) * toBush;
    const walking = (between(t, 4.6, 4.8) * (1 - between(t, 5.4, 5.6))) + (between(t, 6.8, 7.0) * (1 - between(t, 7.6, 7.8)));
    if (walking > 0) {
      const stride = Math.sin(t * 12);
      tofuPose.step = stride * walking;
      tofuPose.hop += Math.abs(stride) * 0.08 * walking;
      tofuPose.turn -= 1.1 * walking * (t < 6 ? 1 : -1);
    }

    // Found you! Mochi springs up and they both giggle.
    if (t > 5.7 && t < 6.7) {
      pose.hop += pulse(t, 5.7, 6.2) * 0.6;
      pose.armL = pose.armR = 1.6 * pulse(t, 5.7, 6.6);
      pose.happyEyes = tofuPose.happyEyes = true;
      pose.blush = tofuPose.blush = 0.8;
      tofuPose.hop += pulse(t, 5.9, 6.4) * 0.3;
      once(run, "found", () => {
        ctx.fx.spawn(ctx.fx.text("found you!", "#f06aa8", tofuHead().add(new THREE.Vector3(0.2, 1.1, 0.4)), 1.2), { velocity: new THREE.Vector3(0, 0.35, 0), life: 1.5 });
        ctx.fx.hearts(new THREE.Vector3(-1.9, 2.8, 0.6), 5);
      });
    }
  },

  // Mochi blows bubbles from a wand; Tofu hops up to pop them.
  parkBubbles(run, pose, dt, ctx) {
    const t = run.t;
    const tofu = ctx.partner;
    const tofuPose = ctx.partnerPose;
    if (!run.wand) {
      run.wand = buildBubbleWand(ctx.materials);
      run.wand.position.set(0.75, 1.25, 0.85);
      run.wand.rotation.z = -0.25;
      ctx.turn.add(run.wand);
      run.props.push(run.wand);
    }
    run.wand.scale.setScalar(Math.max(0.01, easeInOut(between(t, 0, 0.4)) * (1 - easeInOut(between(t, 6.0, 6.6)))));
    const holding = between(t, 0.2, 0.6) * (1 - between(t, 5.8, 6.2));
    pose.armR = Math.max(pose.armR, 1.25 * holding);
    pose.turn += 0.25 * holding;

    // Three big blows, each a stream of bubbles drifting over to Tofu.
    [0.9, 2.0, 3.1].forEach((at) => {
      const blowing = pulse(t, at, at + 0.7);
      if (blowing > 0) {
        pose.mouthOpen = Math.max(pose.mouthOpen, 0.45 * blowing);
        pose.squash += 0.04 * blowing;
        emit(run, `blow${at}`, 5, dt, () => {
          const bubble = ctx.fx.mesh("bubble", run.wand.userData.ring.getWorldPosition(new THREE.Vector3()), rand(0.14, 0.28));
          ctx.fx.spawn(bubble, { velocity: new THREE.Vector3(rand(0.9, 1.8), rand(0.3, 1.0), rand(0, 0.6)), life: rand(2.0, 2.8), wobble: 0.8, opacity: 0.45 });
        });
      }
    });

    // Tofu bounces about, reaching up to pop them.
    if (t > 1.3 && t < 5.4) {
      const bounce = Math.max(0, Math.sin((t - 1.3) * 5.5));
      tofuPose.hop += bounce * 0.4;
      tofuPose.armL = 1.2 + 0.6 * Math.sin(t * 5.5);
      tofuPose.armR = 1.2 - 0.6 * Math.sin(t * 5.5);
      tofuPose.happyEyes = bounce > 0.5;
      tofuPose.wingFlap += 0.4 * Math.sin(t * 20) * bounce;
    }
    [1.8, 2.9, 4.0].forEach((at) => {
      if (t > at) once(run, `pop${at}`, () => {
        const spot = tofu.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(rand(-0.3, 0.3), 0.9, 0.4));
        ctx.fx.sparkles(spot, 8, 1.2);
        ctx.fx.spawn(ctx.fx.text("pop!", "#8cc8f2", spot.clone().add(new THREE.Vector3(0, 0.3, 0)), 0.8), { velocity: new THREE.Vector3(0, 0.4, 0), life: 0.9 });
      });
    });
    if (t > 5.4) {
      pose.happyEyes = tofuPose.happyEyes = true;
      pose.blush = tofuPose.blush = 0.7;
      once(run, "end", () => ctx.fx.hearts(new THREE.Vector3(0.1, 3.0, 0.6), 4));
    }
  },

  // Both hop on scooters, ride off to the right, turn round and ride back.
  scooters(run, pose, dt, ctx) {
    const t = run.t;
    const tofu = ctx.partner;
    const tofuPose = ctx.partnerPose;
    if (!run.scooters) {
      run.scooters = [buildScooter(ctx.materials, 0xff8fae), buildScooter(ctx.materials, 0x8cc8f2)];
      ctx.turn.add(run.scooters[0]);
      tofu.turn.add(run.scooters[1]);
      run.props.push(...run.scooters);
    }
    const show = easeInOut(between(t, 0, 0.5)) * (1 - easeInOut(between(t, 6.5, 7.1)));
    run.scooters.forEach((scooter) => scooter.scale.setScalar(Math.max(0.01, show)));

    const riding = between(t, 0.5, 0.8) * (1 - between(t, 6.0, 6.3));
    // Out to the right, turn round, and back again.
    const out = easeInOut(between(t, 0.8, 3.0));
    const back = easeInOut(between(t, 3.6, 5.9));
    const travel = 3.4 * (out - back);
    // Facing right on the way out, left on the way back (whatever way the player had turned them).
    const direction = 1 - 2 * easeInOut(between(t, 3.0, 3.6));
    const facing = direction * Math.PI / 2 - ctx.userTurn;
    const speed = Math.abs(out - back) > 0 && t > 0.8 && t < 5.9 ? 1 : 0;
    [[pose, 0, ctx.arms], [tofuPose, 0.25, tofu.arms]].forEach(([who, lag, arms], index) => {
      who.x += travel * (1 - lag * 0.2);
      who.turn = who.turn * (1 - riding) + facing * riding;
      // She steps up onto the deck; the scooter stays on the ground.
      who.hop += 0.26 * riding;
      run.scooters[index].position.y = -0.26 * riding;
      // Both hands reach forward to hold the handlebars.
      who.armHug = Math.max(who.armHug, 0.75 * riding);
      if (riding > 0) arms.forEach((arm) => { arm.userData.forward = -1.45 * riding; });
      if (riding > 0.5) {
        who.happyEyes = true;
        who.earFlap += 0.25 * Math.sin(t * 14);
      }
    });
    run.scooters.forEach((scooter) => scooter.userData.wheels.forEach((wheel) => {
      wheel.rotation.y += dt * 14 * speed;
    }));
    if (t > 1.2) once(run, "whee", () => ctx.fx.spawn(ctx.fx.text("wheee!", "#f06aa8", ctx.headWorld().add(new THREE.Vector3(0.4, 1.0, 0.4)), 1.1), { velocity: new THREE.Vector3(0.6, 0.3, 0), life: 1.4 }));
    if (t > 6.0) {
      pose.happyEyes = tofuPose.happyEyes = true;
      pose.armL = pose.armR = Math.max(pose.armL, 1.5 * pulse(t, 6.0, 6.9));
      tofuPose.armL = tofuPose.armR = Math.max(tofuPose.armL, 1.5 * pulse(t, 6.0, 6.9));
      once(run, "done", () => ctx.fx.sparkles(new THREE.Vector3(0.1, 2.4, 0.6), 16, 1.6));
    }
  },

  // A tap in the park: both wave hello.
  parkHello(run, pose, dt, ctx) {
    const t = run.t;
    const tofuPose = ctx.partnerPose;
    const waving = pulse(t, 0, 2.2);
    pose.armR = tofuPose.armR = 1.9 * waving;
    ctx.arms[1].userData.forward = -0.25 * waving;
    ctx.arms[1].userData.wave = Math.sin(t * 12) * 0.5 * waving;
    ctx.partner.arms[1].userData.forward = -0.25 * waving;
    ctx.partner.arms[1].userData.wave = Math.sin(t * 12 + 1) * 0.5 * waving;
    pose.happyEyes = tofuPose.happyEyes = waving > 0.3;
    once(run, "hi", () => ctx.fx.spawn(ctx.fx.text("hi!", "#f2b632", new THREE.Vector3(0.1, 3.7, 0.8), 1.0), { velocity: new THREE.Vector3(0, 0.4, 0), life: 1.3 }));
  },

  // Another tap: a best friends' hug.
  parkHug(run, pose, dt, ctx) {
    const t = run.t;
    const tofuPose = ctx.partnerPose;
    const hug = pulse(t, 0, 2.4);
    pose.x += 0.55 * hug;
    tofuPose.x -= 0.55 * hug;
    pose.turn += 0.6 * hug;
    tofuPose.turn -= 0.6 * hug;
    pose.armHug = tofuPose.armHug = hug;
    pose.armL = pose.armR = tofuPose.armL = tofuPose.armR = 0.6 * hug;
    pose.happyEyes = tofuPose.happyEyes = hug > 0.3;
    pose.blush = tofuPose.blush = hug;
    if (t > 0.8) once(run, "hearts", () => ctx.fx.hearts(new THREE.Vector3(0.1, 3.0, 0.6), 6));
  },

  /* ----- Tofu: shy treats ----- */

  shyApple(run, pose, dt, ctx) {
    const after = nibbleTreat(run, pose, ctx);
    if (after <= 0) return;
    const wiggle = pulse(after, 0, 1.0);
    pose.happyEyes = true;
    pose.blush = 0.9;
    pose.squash += 0.05 * Math.sin(after * 18) * wiggle;
    pose.earFlap += 0.4 * Math.sin(after * 10) * wiggle;
    pose.tailSway += Math.sin(after * 9) * wiggle;
    once(run, "hearts", () => ctx.fx.hearts(ctx.headWorld().add(new THREE.Vector3(0, 0.8, 0.4)), 3));
    say(run, ctx, "thanks!", "#f06aa8");
  },

  shyCupcake(run, pose, dt, ctx) {
    const after = nibbleTreat(run, pose, ctx);
    if (after <= 0) return;
    pose.eyeScale = 1 + 0.3 * pulse(after, 0, 1.4);
    pose.hop += 0.18 * (pulse(after, 0.1, 0.45) + pulse(after, 0.55, 0.9));
    pose.blush = 0.8;
    pose.earFlap += 0.3 * pulse(after, 0, 1.2);
    if (after < 1) {
      emit(run, "sprinkles", 12, dt, () => {
        const sprinkle = ctx.fx.mesh("sprinkle", ctx.headWorld().add(new THREE.Vector3(rand(-0.8, 0.8), rand(0.6, 1.2), 0.4)), 1.2, pick([0xff8fae, 0xffe27a, 0x8cc8f2, 0x8fe3a8]));
        ctx.fx.spawn(sprinkle, { velocity: new THREE.Vector3(rand(-0.3, 0.3), rand(0.2, 0.6), 0), gravity: 1.5, life: 1, spin: 6 });
      });
    }
    say(run, ctx, "sweet!", "#f2b632");
  },

  // Too spicy: her ears shoot up, her eyes water and she fans her mouth. No fire for Tofu!
  shyChilli(run, pose, dt, ctx) {
    const after = nibbleTreat(run, pose, ctx);
    if (after <= 0) return;
    const hot = between(after, 0, 0.3) * (1 - between(after, 1.7, 2.0));
    pose.heat = hot;
    pose.eyeOpen = Math.min(pose.eyeOpen, 1 - 0.85 * hot);
    pose.earFlap += 1.0 * hot;
    pose.armR = Math.max(pose.armR, (1.3 + 0.5 * Math.sin(after * 24)) * hot);
    pose.mouthOpen = Math.max(pose.mouthOpen, 0.45 * hot);
    pose.shakeX += 0.03 * Math.sin(after * 40) * hot;
    if (hot > 0.5) {
      emit(run, "steam", 6, dt, () => ctx.fx.spawn(ctx.fx.mesh("puff", ctx.headWorld().add(new THREE.Vector3(pick([-0.9, 0.9]), 0.9, 0)), 0.8, 0xffffff),
        { velocity: new THREE.Vector3(0, 0.9, 0), life: 0.8, grow: 1.2, opacity: 0.7 }));
      emit(run, "tears", 5, dt, () => ctx.fx.spawn(ctx.fx.mesh("snow", ctx.headWorld().add(new THREE.Vector3(pick([-0.45, 0.45]), 0.55, 0.85)), 1.4, 0x8cc8f2),
        { velocity: new THREE.Vector3(pick([-0.5, 0.5]), 0.4, 0.2), gravity: 3, life: 0.7 }));
    }
    say(run, ctx, "eep! hot!", "#ff6f6f");
  },

  shyIcecream(run, pose, dt, ctx) {
    const after = nibbleTreat(run, pose, ctx);
    if (after <= 0) return;
    const cold = between(after, 0, 0.3) * (1 - between(after, 1.5, 1.8));
    pose.chill = cold;
    pose.armHug = Math.max(pose.armHug, cold);
    pose.armL = Math.max(pose.armL, 0.6 * cold);
    pose.armR = Math.max(pose.armR, 0.6 * cold);
    pose.shakeX += 0.04 * Math.sin(after * 50) * cold;
    pose.wingFlap -= 0.5 * cold;
    pose.earFlap -= 0.25 * cold;
    pose.eyeOpen = Math.min(pose.eyeOpen, 1 - 0.6 * cold);
    if (cold > 0.5) {
      emit(run, "snow", 8, dt, () => ctx.fx.spawn(ctx.fx.mesh("snow", ctx.headWorld().add(new THREE.Vector3(rand(-1.2, 1.2), rand(0.8, 1.4), 0.3)), 1.5),
        { velocity: new THREE.Vector3(0, -0.6, 0), life: 1.2, spin: 2, wobble: 0.4 }));
    }
    say(run, ctx, "brrr!", "#6fb3e6");
  },

  shyLemon(run, pose, dt, ctx) {
    const after = nibbleTreat(run, pose, ctx);
    if (after <= 0) return;
    const sour = pulse(after, 0, 0.8);
    pose.eyeOpen = Math.min(pose.eyeOpen, 1 - 0.85 * sour);
    pose.squash -= 0.08 * sour;
    pose.earFlap += 1.1 * sour;
    pose.mouthOpen = Math.max(pose.mouthOpen, 0.2 * sour);
    if (after > 0.8) {
      pose.happyEyes = true;
      pose.squash += 0.04 * Math.sin(after * 20) * (1 - between(after, 1.6, 2.0));
    }
    say(run, ctx, "sour!", "#f2b632");
  },

  // Sips a milkshake and floats up dreamily on her fairy wings.
  shyMilkshake(run, pose, dt, ctx) {
    const after = nibbleTreat(run, pose, ctx);
    if (after <= 0) return;
    const float = easeInOut(between(after, 0, 0.6)) * (1 - easeInOut(between(after, 1.6, 2.2)));
    pose.hop += 0.5 * float;
    pose.wingFlap += 0.5 * Math.sin(after * 28) * float;
    pose.happyEyes = true;
    pose.blush = 1;
    pose.headTilt += 0.15 * Math.sin(after * 3) * float;
    once(run, "hearts", () => ctx.fx.hearts(ctx.headWorld().add(new THREE.Vector3(0, 0.8, 0.4)), 4));
    say(run, ctx, "mmm!", "#f06aa8");
  },

  /* ----- Tofu: when she's tapped ----- */

  // Hides her face in her paws, then peeks out with a shy smile.
  tofuShy(run, pose, dt, ctx) {
    const t = run.t;
    const hide = between(t, 0, 0.25) * (1 - between(t, 1.3, 1.7));
    const peek = between(t, 0.85, 1.05);
    pose.armL = Math.max(pose.armL, 1.5 * hide);
    pose.armR = Math.max(pose.armR, 1.5 * hide * (1 - 0.6 * peek));
    pose.armHug = Math.max(pose.armHug, hide);
    pose.headNod += 0.25 * hide;
    pose.blush = 1;
    pose.earFlap -= 0.3 * hide;
    if (t < 0.9) pose.eyeOpen = 0.1;
    else pose.happyEyes = true;
    pose.headTilt += 0.2 * peek * hide;
  },

  // Flutters her fairy wings and hovers for a moment.
  tofuFlutter(run, pose, dt, ctx) {
    const t = run.t;
    const up = easeInOut(between(t, 0, 0.5)) * (1 - easeInOut(between(t, 1.5, 2.1)));
    pose.hop += 0.45 * up;
    pose.wingFlap += 0.6 * Math.sin(t * 30) * up;
    pose.earFlap += 0.35 * Math.sin(t * 15) * up;
    pose.happyEyes = true;
    pose.blush = 0.7;
    if (up > 0.3) emit(run, "glitter", 14, dt, () => ctx.fx.sparkles(ctx.bodyWorld().add(new THREE.Vector3(0, -0.4, -0.6)), 1, 0.6));
  },

  // Giggles behind her paw, ears bouncing.
  tofuGiggle(run, pose, dt, ctx) {
    const t = run.t;
    const giggle = between(t, 0, 0.2) * (1 - between(t, 1.6, 2.1));
    pose.squash += 0.05 * Math.sin(t * 26) * giggle;
    pose.armR = Math.max(pose.armR, 1.3 * giggle);
    pose.armHug = Math.max(pose.armHug, 0.5 * giggle);
    pose.happyEyes = true;
    pose.blush = 0.9;
    pose.earFlap += 0.45 * Math.sin(t * 13) * giggle;
    pose.tailSway += Math.sin(t * 11) * giggle;
    say(run, ctx, "hee hee", "#b79cf2");
  },

  /* ----- Tofu: activities in the kitchen ----- */

  // Whisks up banana muffin batter, then ding! A muffin pops out of the oven.
  baking(run, pose, dt, ctx) {
    const t = run.t;
    if (!run.bowl) {
      run.bowl = buildMixingBowl(ctx.materials);
      run.bowl.position.set(0, 1.0, 1.25);
      ctx.turn.add(run.bowl);
      run.props.push(run.bowl);
    }
    run.bowl.scale.setScalar(Math.max(0.01, easeInOut(between(t, 0, 0.4)) * (1 - easeInOut(between(t, 4.1, 4.5)))));
    const { whisk } = run.bowl.userData;
    const stirring = between(t, 0.5, 0.8) * (1 - between(t, 3.6, 3.9));
    whisk.position.set(0.12 * Math.sin(t * 9) * stirring, 0.2, 0.12 * Math.cos(t * 9) * stirring);
    whisk.rotation.y = t * 9;
    pose.armR = Math.max(pose.armR, (0.9 + 0.2 * Math.sin(t * 9)) * stirring);
    pose.armL = Math.max(pose.armL, 0.7 * stirring);
    pose.headNod += 0.2 * stirring;
    pose.headTilt += 0.08 * Math.sin(t * 3) * stirring;
    if (stirring > 0.5) {
      emit(run, "flour", 3, dt, () => ctx.fx.spawn(ctx.fx.mesh("puff", run.bowl.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(rand(-0.2, 0.2), 0.3, 0)), 0.6, 0xffffff),
        { velocity: new THREE.Vector3(rand(-0.2, 0.2), 0.6, 0.1), life: 0.9, grow: 1, opacity: 0.8 }));
    }
    if (t > 4.3) {
      if (!run.cupcake) {
        run.cupcake = buildTreat("bananaCupcake", ctx.materials);
        ctx.turn.add(run.cupcake);
        run.props.push(run.cupcake);
      }
      const pop = easeInOut(between(t, 4.3, 4.8));
      run.cupcake.position.set(0, 1.1 + 0.6 * pop, 1.3);
      run.cupcake.scale.setScalar(Math.max(0.01, 1.3 * pop * (1 - between(t, 6.7, 7.1))));
      run.cupcake.rotation.y = t * 1.5;
      pose.happyEyes = true;
      pose.blush = 0.8;
      pose.armL = pose.armR = Math.max(pose.armL, 1.4 * pulse(t, 4.4, 6.6));
      pose.hop += 0.25 * pulse(t, 4.5, 5.0);
      once(run, "ding", () => ctx.fx.sparkles(run.cupcake.getWorldPosition(new THREE.Vector3()), 12, 1.2));
      say(run, ctx, "ding!", "#f2b632");
    }
  },

  // Swirls a flask of potion in her goggles: it changes colour, bubbles, then POOF!
  science(run, pose, dt, ctx) {
    const t = run.t;
    if (!run.flask) {
      run.goggles = buildGlasses(ctx.materials, true);
      ctx.head.add(run.goggles);
      run.flask = buildFlask(ctx.materials);
      run.flask.position.set(0, 1.05, 1.3);
      ctx.turn.add(run.flask);
      run.props.push(run.goggles, run.flask);
    }
    run.flask.scale.setScalar(Math.max(0.01, easeInOut(between(t, 0, 0.4)) * (1 - easeInOut(between(t, 6.8, 7.2)))));
    run.goggles.scale.setScalar(Math.max(0.01, easeInOut(between(t, 0, 0.3)) * (1 - easeInOut(between(t, 6.9, 7.3)))));
    run.flask.userData.liquid.color.setHSL((0.95 + t * 0.22) % 1, 0.75, 0.72);
    const swirl = between(t, 0.4, 0.7) * (1 - between(t, 3.2, 3.5));
    run.flask.rotation.z = 0.25 * Math.sin(t * 6) * swirl;
    pose.armL = Math.max(pose.armL, 0.9 * (swirl + between(t, 3.5, 3.6)) * (1 - between(t, 6.4, 6.8)));
    pose.armR = Math.max(pose.armR, 0.9 * (swirl + between(t, 3.5, 3.6)) * (1 - between(t, 6.4, 6.8)));
    pose.headTilt += 0.18 * swirl;
    pose.eyeScale = 1 + 0.15 * swirl;
    if (swirl > 0.5) {
      emit(run, "bubbles", 6, dt, () => {
        const bubble = ctx.fx.mesh("bubble", run.flask.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(rand(-0.05, 0.05), 0.65, 0)), rand(0.05, 0.09));
        ctx.fx.spawn(bubble, { velocity: new THREE.Vector3(rand(-0.15, 0.15), 0.9, 0), life: 0.9, wobble: 0.5 });
      });
    }
    // POOF: a rainbow cloud, and Tofu jumps!
    const startled = pulse(t, 3.5, 4.3);
    pose.hop += 0.4 * startled;
    pose.earFlap += 1.2 * startled;
    pose.eyeScale += 0.4 * startled;
    pose.shakeX += 0.04 * Math.sin(t * 40) * startled;
    if (t > 3.5) {
      once(run, "poof", () => {
        [0xff8fa3, 0xffb86b, 0xffe27a, 0x8fe3a8, 0x8cc8f2, 0xb79cf2].forEach((color) => {
          const puff = ctx.fx.mesh("puff", run.flask.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.7, 0)), 1.2, color);
          ctx.fx.spawn(puff, { velocity: new THREE.Vector3(rand(-1, 1), rand(0.4, 1.2), rand(0, 0.4)), life: 1.4, grow: 1.6, opacity: 0.85 });
        });
      });
    }
    if (t > 4.5) {
      pose.happyEyes = true;
      pose.blush = 0.8;
      pose.squash += 0.04 * Math.sin(t * 22) * (1 - between(t, 5.8, 6.3));
      say(run, ctx, "eureka!", "#5cc596");
    }
  },

  // Sings a sweet song, swaying with her paws together.
  singing(run, pose, dt, ctx) {
    const t = run.t;
    const singing = between(t, 0.1, 0.4) * (1 - between(t, 5.4, 5.8));
    pose.lean += 0.1 * Math.sin(t * 3) * singing;
    pose.headTilt += 0.15 * Math.sin(t * 3) * singing;
    pose.mouthOpen = Math.max(pose.mouthOpen, (0.15 + 0.35 * Math.abs(Math.sin(t * 6))) * singing * (Math.sin(t * 1.6) > -0.6 ? 1 : 0.2));
    pose.armL = Math.max(pose.armL, 0.6 * singing);
    pose.armR = Math.max(pose.armR, 0.6 * singing);
    pose.armHug = Math.max(pose.armHug, 0.6 * singing);
    pose.wingFlap += 0.2 * Math.sin(t * 8) * singing;
    pose.happyEyes = t > 0.5;
    pose.blush = 0.6;
    if (singing > 0.5) {
      emit(run, "notes", 2.5, dt, () => ctx.fx.spawn(ctx.fx.text(pick(["♪", "♫"]), pick(["#8a6ae6", "#f06aa8", "#f2b632", "#5cc596"]), ctx.headWorld().add(new THREE.Vector3(rand(-1.2, 1.2), 1.0, 0.4)), 0.8),
        { velocity: new THREE.Vector3(rand(-0.2, 0.2), 0.6, 0), life: 1.6, wobble: 0.5 }));
    }
    pose.hop += 0.2 * pulse(t, 5.8, 6.3);
  },

  // Reads a storybook in her glasses, turning the pages, then looks up delighted.
  reading(run, pose, dt, ctx) {
    const t = run.t;
    if (!run.book) {
      run.glasses = buildGlasses(ctx.materials, false);
      ctx.head.add(run.glasses);
      run.book = buildBook(ctx.materials);
      // Pages towards Tofu, tilted up to her eyes; the cover faces us.
      run.book.position.set(0, 1.3, 1.2);
      run.book.rotation.set(0.35, Math.PI, 0);
      ctx.turn.add(run.book);
      run.props.push(run.glasses, run.book);
    }
    const show = easeInOut(between(t, 0, 0.4)) * (1 - easeInOut(between(t, 6.9, 7.3)));
    run.book.scale.setScalar(Math.max(0.01, show));
    run.glasses.scale.setScalar(Math.max(0.01, show));
    const turnPage = (t % 1.6) / 1.6;
    run.book.userData.turn(t > 0.8 && t < 5.5 ? easeInOut(between(turnPage, 0.5, 0.85)) : 0);
    const reading = between(t, 0.3, 0.6) * (1 - between(t, 5.4, 5.7));
    pose.armL = Math.max(pose.armL, 0.85 * reading);
    pose.armR = Math.max(pose.armR, 0.85 * reading);
    pose.armHug = Math.max(pose.armHug, 0.7 * reading);
    pose.headNod += (0.25 + 0.04 * Math.sin(t * 2)) * reading;
    pose.headTilt += 0.06 * Math.sin(t * 1.5) * reading;
    if (t > 5.6) {
      pose.happyEyes = true;
      pose.blush = 0.8;
      pose.earFlap += 0.4 * pulse(t, 5.6, 6.6);
      once(run, "idea", () => ctx.fx.sparkles(ctx.headWorld().add(new THREE.Vector3(0, 1.0, 0.3)), 10, 1));
      say(run, ctx, "so fun!", "#8a6ae6");
    }
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
  dragon.root.position.set(pose.x, pose.hop, pose.z);
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

  // Walking lifts one foot, then the other.
  dragon.feet.forEach((foot, index) => {
    foot.position.y = foot.userData.baseY + Math.max(0, (index === 0 ? 1 : -1) * pose.step) * 0.16;
  });

  dragon.ears.forEach((ear) => {
    const side = ear.userData.side;
    // Floppy ears hang down and swing out; pointy ones stand up and wiggle.
    ear.rotation.z = ear.userData.floppy
      ? side * (0.45 + pose.earWiggle * 1.5 + pose.earFlap)
      : -side * (0.55 + pose.earWiggle);
  });
  dragon.wings.forEach((wing) => {
    const side = wing.userData.side;
    wing.rotation.set(0, side * (-0.3 + pose.wingFlap), side * 0.1);
  });
  dragon.arms.forEach((arm) => {
    const side = arm.userData.side;
    const raise = side < 0 ? pose.armL : pose.armR;
    // A wave holds the arm up in front (`forward`) and sways it (`wave`); both reset each frame.
    arm.rotation.set(arm.userData.forward ?? -raise * 0.6, arm.userData.wave ?? 0, side * (0.35 + raise * 0.9) - side * pose.armHug * 0.9);
    arm.userData.wave = 0;
    arm.userData.forward = undefined;
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

// Builds the scene inside `container`, with Mochi or (`dragon: "tofu"`) Tofu. Throws if WebGL
// isn't available.
export function createDragonScene(container, { onPet, sfx = sounds, dragon: who = "mochi" } = {}) {
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
  const dragon = who === "tofu" ? buildDragon(materials, TOFU) : buildDragon(materials);
  scene.add(dragon.root);
  // In the park, Mochi plays with Tofu: Mochi on the left, Tofu (a little smaller) on the right.
  const inPark = who === "park";
  const homeX = inPark ? -1.15 : 0;
  const partnerHomeX = 1.3;
  const partner = inPark ? buildDragon(materials, TOFU) : null;
  if (partner) {
    partner.root.scale.setScalar(0.85);
    scene.add(partner.root);
  }

  const shadowMap = shadowTexture();
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.005;
  scene.add(shadow);

  const partnerShadow = partner ? new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false })) : null;
  if (partnerShadow) {
    partnerShadow.rotation.x = -Math.PI / 2;
    partnerShadow.position.y = 0.005;
    scene.add(partnerShadow);
  }

  const fx = new Effects(scene, materials);
  const ctx = {
    // In the park: Tofu and her pose for this frame (park activities move both dragons), and how
    // far the player has turned them.
    partner,
    partnerPose: null,
    userTurn: 0,
    // Tofu, built fresh for each visit and removed when it ends.
    makeFriend() {
      const friend = buildDragon(materials, TOFU);
      friend.root.userData.dispose = friend.dispose;
      scene.add(friend.root);
      return friend;
    },
    makeShadow() {
      const friendShadow = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false }));
      friendShadow.rotation.x = -Math.PI / 2;
      friendShadow.userData.dispose = () => friendShadow.material.dispose();
      scene.add(friendShadow);
      return friendShadow;
    },
    scene,
    materials,
    fx,
    turn: dragon.turn,
    head: dragon.head,
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
  let walk = null;
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
    [run.treat, run.comb, run.towel, run.easel, run.brush, run.tutu, run.strands, run.toothbrush, run.cushion, run.sandcastle, run.friend?.root, run.friendShadow, ...run.props].forEach((object) => {
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
    pose.x = homeX;
    pose.squash = 1 + 0.022 * Math.sin(elapsed * 2.2) * idleAmount;
    pose.headNod = 0.045 * Math.sin(elapsed * 1.1) * idleAmount;
    pose.headTilt = 0.06 * Math.sin(elapsed * 0.7) * idleAmount;
    pose.tailSway = 0.45 * Math.sin(elapsed * 1.6) * idleAmount;
    pose.wingFlap = 0.14 * Math.sin(elapsed * 2.4) * idleAmount;
    pose.armL = pose.armR = 0.05 * Math.sin(elapsed * 2.2) * idleAmount;
    if (who === "tofu") {
      // Tofu's fairy wings shimmer and her floppy ears sway.
      pose.wingFlap = 0.08 * Math.sin(elapsed * 7) * idleAmount;
      pose.earFlap = 0.1 * Math.sin(elapsed * 1.7) * idleAmount;
    }

    if (elapsed > nextBlink) {
      blinkStart = elapsed;
      nextBlink = elapsed + rand(2.5, 5);
    }
    if (blinkStart >= 0) pose.eyeOpen = Math.max(0.08, Math.abs(Math.cos(between(elapsed, blinkStart, blinkStart + 0.18) * Math.PI)));

    // Tofu's idle sway in the park (a little out of step with Mochi's).
    if (partner) {
      const partnerPose = restPose();
      partnerPose.x = partnerHomeX;
      partnerPose.squash = 1 + 0.022 * Math.sin(elapsed * 2.4 + 1) * idleAmount;
      partnerPose.headTilt = -0.06 * Math.sin(elapsed * 0.8) * idleAmount;
      partnerPose.tailSway = 0.45 * Math.sin(elapsed * 1.7) * idleAmount;
      partnerPose.wingFlap = 0.08 * Math.sin(elapsed * 7) * idleAmount;
      partnerPose.earFlap = 0.1 * Math.sin(elapsed * 1.7) * idleAmount;
      partnerPose.eyeOpen = pose.eyeOpen;
      partnerPose.turn = -0.3;
      ctx.partnerPose = partnerPose;
    }
    ctx.userTurn = userTurn;

    if (run) {
      run.t += dt;
      actions[run.id](run, pose, dt, ctx);
      playSoundCues(run, sfx);
      if (run.t >= run.duration) endRun();
    }
    if (walk) {
      walk.t += dt;
      walkPose(walk, pose, userTurn);
      if (walk.t >= walkTime) walk = null;
    }
    // Happy ears wiggle.
    if (pose.happyEyes) pose.earWiggle += 0.16 * Math.sin(elapsed * 14);

    userTurn += (targetTurn - userTurn) * Math.min(1, dt * 8);
    applyPose(dragon, pose, userTurn);
    shadow.scale.setScalar(1 - Math.min(0.4, Math.max(0, pose.hop) * 0.4));
    shadow.position.set(pose.x, 0.005, pose.z);
    if (partner) {
      const partnerPose = ctx.partnerPose;
      if (partnerPose.happyEyes) partnerPose.earWiggle += 0.12 * Math.sin(elapsed * 14);
      applyPose(partner, partnerPose, userTurn);
      partnerShadow.scale.setScalar(0.85 * (1 - Math.min(0.4, Math.max(0, partnerPose.hop) * 0.4)));
      partnerShadow.position.set(partnerPose.x, 0.005, partnerPose.z);
    }

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
    if (raycaster.intersectObject(dragon.root, true).length > 0 || (partner && raycaster.intersectObject(partner.root, true).length > 0)) onPet?.();
  }
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  frame = requestAnimationFrame(tick);

  return {
    // Plays an action from dragon-data (by its id), using its `animation` if it has one.
    play(id) {
      const action = dragonActionsById[id];
      const animation = action?.animation ?? id;
      if (!action || !actions[animation]) return;
      endRun();
      run = { id: animation, model: action.model ?? animation, t: 0, duration: action.duration, emitters: {}, done: {}, props: [] };
    },
    // Walks to the next room on the right (1) or left (-1). Skipped when motion is reduced.
    walk(direction) {
      if (!reducedMotion) walk = { t: 0, direction };
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
      dragon.dispose();
      partner?.dispose();
      partnerShadow?.material.dispose();
      shadow.material.dispose();
      shadowMap.dispose();
      materials.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
