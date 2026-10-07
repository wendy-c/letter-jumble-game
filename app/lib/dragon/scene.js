import * as THREE from "three";
import { dragonActionsById } from "../../dragon-data";

const OUTLINE_COLOR = 0x4b2e22;
const LILAC = 0xd9c8ff;
const SNOUT = 0xffe0f0;
const CREAM = 0xfff3d6;
const GOLD = 0xffd45e;
const BLUSH = 0xff9bb5;
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

  const feet = [-1, 1].map((side) => {
    const foot = part(sphere(0.32), lilac, materials, 0.32, 0.035);
    foot.scale.set(1, 0.6, 1.25);
    foot.position.set(side * 0.48, 0.17, 0.3);
    root.add(foot);
    return foot;
  });

  const arms = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.8, 1.38, 0.3);
    const arm = part(new THREE.CapsuleGeometry(0.16, 0.3, 8, 16), lilac, materials, 0.16, 0.03);
    arm.position.y = -0.24;
    pivot.add(arm);
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

  [-1, 1].forEach((side) => {
    const horn = part(new THREE.ConeGeometry(0.11, 0.4, 16), materials.toon(GOLD), materials, 0.1, 0.025);
    horn.position.set(side * 0.38, 1.38, -0.05);
    horn.rotation.z = -side * 0.35;
    head.add(horn);

    const ear = part(new THREE.ConeGeometry(0.16, 0.36, 3), lilac, materials, 0.14, 0.025);
    ear.position.set(side * 0.92, 0.85, -0.12);
    ear.rotation.set(0, 0, -side * 1.15);
    head.add(ear);
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
    root, turn, bodyGroup, body, feet, arms, wings, tail, head, mouth, mouthShape, tongue, smile, eyes, blushMaterial,
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
  }

  group.scale.setScalar(1.2);
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
    blush: 0, chill: 0, heat: 0, fire: 0, foam: 0, fluff: 0,
  };
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
export function createDragonScene(container, { onPet } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.className = "dragon-canvas";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 2.1, 9.6);
  camera.lookAt(0, 1.75, 0);

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
    [run.treat, run.comb, run.towel].forEach((object) => {
      if (!object) return;
      object.parent?.remove(object);
      object.traverse((child) => child.geometry?.dispose());
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
      if (run.t >= run.duration) endRun();
    }

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
