# Draws Mochi's rooms: public/images/dragon/home.svg, bathroom.svg and beach.svg.
# Each is 600×400 with the floor from y=260, so Mochi stands on it; the middle (x 200-400) is
# kept clear for her, and the main pieces sit within x 130-470, which still shows on phones.
import math, os, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
OUT = os.path.join(ROOT, "public/images/dragon")
INK = "#4b2e22"
W, H, FLOOR = 600, 400, 260


def svg(body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice">\n'
            f'<g stroke="{INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">\n{body}\n</g>\n</svg>\n')


def sparkle(x, y, s, fill="#fff6c8", stroke=True):
    line = "" if stroke else ' stroke="none"'
    return (f'<path d="M{x} {y - s}Q{x + s * .2} {y - s * .2} {x + s} {y}Q{x + s * .2} {y + s * .2} {x} {y + s}'
            f'Q{x - s * .2} {y + s * .2} {x - s} {y}Q{x - s * .2} {y - s * .2} {x} {y - s}Z" fill="{fill}" stroke-width="2"{line}/>')


def heart(x, y, s, fill):
    return (f'<path d="M{x} {y + s * .9}C{x - s * .4} {y + s * .6} {x - s} {y + s * .1} {x - s} {y - s * .3}'
            f'C{x - s} {y - s * .9} {x - s * .2} {y - s} {x} {y - s * .45}C{x + s * .2} {y - s} {x + s} {y - s * .9} {x + s} {y - s * .3}'
            f'C{x + s} {y + s * .1} {x + s * .4} {y + s * .6} {x} {y + s * .9}Z" fill="{fill}" stroke="none"/>')


def face(x, y, s=1.0):
    return (f'<g stroke="none"><circle cx="{x - 7 * s}" cy="{y}" r="{2.6 * s}" fill="{INK}"/><circle cx="{x + 7 * s}" cy="{y}" r="{2.6 * s}" fill="{INK}"/>'
            f'<ellipse cx="{x - 12 * s}" cy="{y + 5 * s}" rx="{3.5 * s}" ry="{2.2 * s}" fill="#ff9bb5"/><ellipse cx="{x + 12 * s}" cy="{y + 5 * s}" rx="{3.5 * s}" ry="{2.2 * s}" fill="#ff9bb5"/></g>'
            f'<path d="M{x - 3 * s} {y + 4 * s}q{3 * s} {3 * s} {6 * s} 0" fill="none" stroke-width="2"/>')


def home():
    b = []
    # Wallpaper with little hearts and stars.
    b.append(f'<rect x="-10" y="-10" width="620" height="{FLOOR + 10}" fill="#f4ebff" stroke="none"/>')
    for row in range(5):
        for col in range(9):
            x, y = 22 + col * 70 + (35 if row % 2 else 0), 24 + row * 48
            b.append(heart(x, y, 6, "#e7d8ff") if (row + col) % 2 else sparkle(x, y, 6, "#ffe9a8", stroke=False))
    # Rainbow bunting across the top.
    b.append('<path d="M-10 26 Q300 70 610 26" fill="none" stroke-width="2.5"/>')
    colors = ["#ff8fa3", "#ffb86b", "#ffe27a", "#8fe3a8", "#8cc8f2", "#b79cf2"]
    for i in range(14):
        t = (i + 0.5) / 14
        x = -10 + 620 * t
        y = 26 + 44 * 4 * t * (1 - t)
        b.append(f'<path d="M{x - 11:.0f} {y - 1:.0f} L{x + 11:.0f} {y + 1:.0f} L{x:.0f} {y + 22:.0f}Z" fill="{colors[i % 6]}" stroke-width="2.5"/>')
    # Skirting board.
    b.append(f'<rect x="-10" y="{FLOOR - 26}" width="620" height="26" fill="#e3d3ff"/>')
    # Wooden floor.
    b.append(f'<rect x="-10" y="{FLOOR}" width="620" height="{H - FLOOR + 10}" fill="#f8d9b3"/>')
    for y in (300, 345):
        b.append(f'<path d="M-10 {y}H610" stroke="#e7b989" stroke-width="2.5"/>')
    for x, y0, y1 in [(60, FLOOR, 300), (250, FLOOR, 300), (450, FLOOR, 300), (150, 300, 345), (380, 300, 345), (560, 300, 345), (80, 345, 400), (300, 345, 400), (500, 345, 400)]:
        b.append(f'<path d="M{x} {y0}V{y1}" stroke="#e7b989" stroke-width="2.5"/>')
    # Round rug in the middle, where Mochi stands.
    b.append('<ellipse cx="300" cy="332" rx="168" ry="44" fill="#ffd3e6"/>')
    b.append('<ellipse cx="300" cy="332" rx="138" ry="33" fill="#fff0f6" stroke="#f7a8c8" stroke-width="3" stroke-dasharray="2 9"/>')
    # Arched window with a starry night sky and pink curtains (left).
    b.append('<path d="M118 200V112a52 52 0 0 1 104 0V200Z" fill="#b9a4f5"/>')
    b.append('<path d="M130 196V114a40 40 0 0 1 80 0V196Z" fill="#7d6ad8"/>')
    b.append('<circle cx="186" cy="110" r="14" fill="#fff6c8"/><circle cx="192" cy="105" r="12" fill="#7d6ad8" stroke="none"/>')
    b.append(sparkle(150, 100, 6) + sparkle(160, 150, 5) + sparkle(196, 168, 4))
    b.append('<path d="M170 76V196M130 140H210" stroke-width="4"/>')
    b.append('<path d="M108 66q-12 70 6 140h18q-14-60 8-140Z" fill="#ffb3d1"/>')
    b.append('<path d="M232 66q12 70-6 140h-18q14-60-8-140Z" fill="#ffb3d1"/>')
    b.append('<rect x="100" y="58" width="140" height="12" rx="6" fill="#f2b632"/>')
    # Framed rainbow picture (right).
    b.append('<rect x="408" y="70" width="88" height="70" rx="8" fill="#fff6c8"/>')
    b.append('<rect x="416" y="78" width="72" height="54" rx="4" fill="#dff2ff"/>')
    for i, c in enumerate(["#ff8fa3", "#ffe27a", "#8fe3a8", "#8cc8f2"]):
        r = 28 - i * 6
        b.append(f'<path d="M{452 - r} 128a{r} {r} 0 0 1 {2 * r} 0" fill="none" stroke="{c}" stroke-width="5"/>')
    b.append('<path d="M424 128q6-8 14 0M466 128q6-8 14 0" fill="#fff" stroke-width="2"/>')
    # Toy box with a teddy (left floor) and a lamp with a plant (right).
    b.append('<rect x="112" y="214" width="78" height="56" rx="8" fill="#9fdcbf"/>')
    b.append('<path d="M112 230H190" stroke-width="3"/><circle cx="151" cy="246" r="8" fill="#ffe27a"/>')
    b.append('<circle cx="140" cy="202" r="16" fill="#e8b48a"/><circle cx="128" cy="190" r="6" fill="#e8b48a"/><circle cx="152" cy="190" r="6" fill="#e8b48a"/>')
    b.append(face(140, 202, 0.7))
    b.append('<path d="M448 270l8-60h28l8 60Z" fill="#ffd3e6"/>')
    b.append('<path d="M470 210V196" stroke-width="4"/><path d="M444 196h52l-10-36h-32Z" fill="#fff6c8"/>')
    b.append('<path d="M470 160v-5" stroke-width="3"/>')
    b.append('<rect x="508" y="230" width="44" height="40" rx="6" fill="#ffb86b"/>')
    for dx, dy, rot in [(-14, -14, -30), (0, -26, 0), (14, -14, 30)]:
        b.append(f'<ellipse cx="{530 + dx}" cy="{226 + dy}" rx="9" ry="20" fill="#8fe3a8" transform="rotate({rot} {530 + dx} {226 + dy})"/>')
    return svg("\n".join(b))


def bathroom():
    b = []
    # Mint tiles on the wall.
    b.append(f'<rect x="-10" y="-10" width="620" height="{FLOOR + 10}" fill="#e3f7f2" stroke="none"/>')
    for y in range(16, FLOOR, 34):
        b.append(f'<path d="M-10 {y}H610" stroke="#c4ebe1" stroke-width="2"/>')
    for row, y in enumerate(range(-18, FLOOR, 34)):
        for x in range(-20 + (17 if row % 2 else 0), 620, 34):
            b.append(f'<path d="M{x} {y}V{y + 34}" stroke="#c4ebe1" stroke-width="2"/>')
    b.append(f'<rect x="-10" y="{FLOOR - 70}" width="620" height="70" fill="#b5e8d6" stroke="none"/>')
    b.append(f'<path d="M-10 {FLOOR - 70}H610" stroke-width="3"/>')
    # Checked floor.
    b.append(f'<rect x="-10" y="{FLOOR}" width="620" height="{H - FLOOR + 10}" fill="#ffffff"/>')
    for row, y in enumerate(range(FLOOR, H, 36)):
        for col, x in enumerate(range(-10, 620, 40)):
            if (row + col) % 2:
                b.append(f'<rect x="{x}" y="{y}" width="40" height="36" fill="#d4eefd" stroke="none"/>')
    b.append(f'<path d="M-10 {FLOOR}H610" stroke-width="3"/>')
    # Round bath mat for Mochi.
    b.append('<ellipse cx="300" cy="334" rx="150" ry="38" fill="#ffd3e6"/>')
    b.append('<ellipse cx="300" cy="334" rx="122" ry="28" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="1 12"/>')
    # Clawfoot bathtub full of bubbles (left).
    b.append('<path d="M86 222h150q-2 54-42 60h-66q-40-6-42-60Z" fill="#ffffff"/>')
    b.append('<rect x="78" y="212" width="166" height="14" rx="7" fill="#f7a8c8"/>')
    for x in (104, 214):
        b.append(f'<path d="M{x} 280l-6 18h14l2-16" fill="#f2b632"/>')
    for x, y, r in [(100, 204, 16), (124, 196, 20), (152, 200, 17), (180, 194, 21), (208, 202, 16), (228, 208, 11), (140, 182, 10), (196, 178, 9)]:
        b.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff" stroke="#8cc8f2" stroke-width="3"/>')
    # Rubber duck on the edge.
    b.append('<path d="M214 206q-4-18 12-20 14 0 12 14l10 2q-2 12-16 12h-12q-8 0-6-8Z" fill="#ffe27a"/>')
    b.append('<path d="M238 198l9-2-8 6" fill="#ffb86b" stroke-width="2"/><circle cx="230" cy="194" r="2" fill="#4b2e22" stroke="none"/>')
    # Tap and shower on the wall above.
    b.append('<path d="M96 210V120q0-16 16-16h18" fill="none" stroke-width="6"/><path d="M96 210V120q0-16 16-16h18" fill="none" stroke="#c9d4e0" stroke-width="2.5"/>')
    b.append('<path d="M126 96h30l-6 16h-18Z" fill="#c9d4e0"/>')
    for x in (134, 141, 148):
        b.append(f'<path d="M{x} 120v8" stroke="#8cc8f2" stroke-width="3"/>')
    # Round mirror over a sink (right).
    b.append('<ellipse cx="452" cy="104" rx="42" ry="50" fill="#ffd3e6"/><ellipse cx="452" cy="104" rx="32" ry="40" fill="#e6f6ff"/>')
    b.append('<path d="M434 82q8-14 22-16" fill="none" stroke="#fff" stroke-width="5"/>')
    b.append('<path d="M406 182h92q-4 34-46 34t-46-34Z" fill="#ffffff"/><rect x="440" y="214" width="24" height="56" rx="6" fill="#ffffff"/>')
    b.append('<path d="M452 182v-14h12" fill="none" stroke-width="5"/><path d="M452 182v-14h12" fill="none" stroke="#c9d4e0" stroke-width="2"/>')
    b.append('<rect x="418" y="160" width="12" height="22" rx="5" fill="#b79cf2"/><circle cx="424" cy="156" r="4" fill="#b79cf2"/>')
    # Towel on a rail (far right) and floating bubbles.
    b.append('<path d="M512 120H578" stroke-width="6"/><path d="M512 120H578" stroke="#c9d4e0" stroke-width="2"/>')
    b.append('<path d="M518 120h52v86q-26 8-52 0Z" fill="#ffb3d1"/><path d="M518 186q26 8 52 0" fill="none" stroke="#fff" stroke-width="4"/>')
    for x, y, r in [(268, 70, 10), (300, 40, 7), (330, 84, 12), (370, 50, 6), (240, 120, 6)]:
        b.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff" fill-opacity=".7" stroke="#8cc8f2" stroke-width="2.5"/>')
        b.append(f'<circle cx="{x - r * .35:.1f}" cy="{y - r * .35:.1f}" r="{r * .25:.1f}" fill="#fff" stroke="none"/>')
    return svg("\n".join(b))


def beach():
    b = []
    b.append('<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#fff2df"/></linearGradient></defs>')
    b.append('<rect x="-10" y="-10" width="620" height="220" fill="url(#sky)" stroke="none"/>')
    # Smiling sun and fluffy clouds.
    for i in range(12):
        a = 2 * math.pi * i / 12
        b.append(f'<path d="M{404 + math.cos(a) * 40:.1f} {64 + math.sin(a) * 40:.1f}L{404 + math.cos(a) * 52:.1f} {64 + math.sin(a) * 52:.1f}" stroke="#f2b632" stroke-width="5"/>')
    b.append('<circle cx="404" cy="64" r="32" fill="#ffe27a"/>' + face(404, 64, 1.1))
    for cx, cy, s in [(120, 64, 1.0), (300, 40, 0.75)]:
        b.append(f'<path d="M{cx - 44 * s} {cy + 14 * s}q-16 0-14-14t20-10q4-20 26-18 18 2 22 16 18-6 26 8 8 18-10 18Z" fill="#ffffff"/>')
    # The sea, with white wave crests.
    b.append('<path d="M-10 168H610V252H-10Z" fill="#8cd3f2"/>')
    b.append('<path d="M-10 168H610" stroke-width="3"/>')
    for y, off in [(188, 0), (208, 30)]:
        d = f"M{-10 + off} {y}" + "".join(f"q15 -8 30 0" for _ in range(22))
        b.append(f'<path d="{d}" fill="none" stroke="#fff" stroke-width="3"/>')
    # Sand, with a frothy wet edge.
    b.append(f'<path d="M-10 236q40-14 80 0t80 0 80 0 80 0 80 0 80 0 80 0 80 0V410H-10Z" fill="#ffe7b0"/>')
    b.append(f'<path d="M-10 236q40-14 80 0t80 0 80 0 80 0 80 0 80 0 80 0 80 0" fill="none" stroke="#fff" stroke-width="5"/>')
    for x, y in [(60, 300), (140, 360), (240, 380), (420, 372), (520, 320), (560, 380), (360, 300), (200, 290)]:
        b.append(f'<circle cx="{x}" cy="{y}" r="2.5" fill="#f2c779" stroke="none"/>')
    # Towel for Mochi to stand on.
    b.append('<path d="M168 318 L432 318 L452 356 L148 356Z" fill="#b79cf2" stroke-width="3"/>')
    for i in range(1, 6):
        x0 = 168 + 264 * i / 6
        x1 = 148 + 304 * i / 6
        b.append(f'<path d="M{x0:.0f} 318L{x1:.0f} 356" stroke="#fff" stroke-width="6"/>')
    # Palm tree (left).
    b.append('<path d="M128 290q-6-90 26-160" fill="none" stroke-width="16"/><path d="M128 290q-6-90 26-160" fill="none" stroke="#c98a55" stroke-width="10"/>')
    for i in range(5):
        b.append(f'<path d="M{124 + i * 2} {250 - i * 28}q8 4 16 0" fill="none" stroke-width="2"/>')
    for rot in (-150, -110, -60, -20, 20):
        b.append(f'<path d="M154 130q40-30 80-6-38-2-80 6Z" fill="#8fe3a8" transform="rotate({rot} 154 130)"/>')
    b.append('<circle cx="146" cy="138" r="7" fill="#a46a3c"/><circle cx="160" cy="140" r="7" fill="#a46a3c"/>')
    # Striped beach umbrella and a beach ball (right).
    b.append('<path d="M500 300V128" stroke-width="5"/>')
    b.append('<path d="M432 150q68-74 136 0Z" fill="#ff8fa3"/>')
    b.append('<path d="M478 150q4-52 22-74 18 22 22 74q-22-8-44 0Z" fill="#fff6c8"/>')
    b.append('<path d="M432 150q68-74 136 0q-12-8-23 0-11-8-23 0-11-8-22 0-11-8-22 0-11-8-23 0-11-8-23 0" fill="none" stroke-width="3"/>')
    b.append('<path d="M500 76v-8" stroke-width="4"/>')
    b.append('<circle cx="452" cy="292" r="20" fill="#fff"/>')
    b.append('<path d="M436 280q16 10 32 0M434 298q18 10 36 0" fill="none" stroke="#ff8fa3" stroke-width="6"/>')
    b.append('<path d="M452 272q-8 20 0 40" fill="none" stroke="#8cc8f2" stroke-width="6"/>')
    b.append('<circle cx="452" cy="292" r="20" fill="none"/>')
    # Starfish and a shell.
    star = "".join(f"{'M' if i == 0 else 'L'}{82 + math.cos(-math.pi / 2 + i * math.pi / 5) * (16 if i % 2 == 0 else 7):.1f} {336 + math.sin(-math.pi / 2 + i * math.pi / 5) * (16 if i % 2 == 0 else 7):.1f}" for i in range(10)) + "Z"
    b.append(f'<path d="{star}" fill="#ffb86b"/>')
    b.append('<path d="M548 352q-16-24 0-30 16 6 0 30Z" fill="#ffd3e6"/><path d="M540 340l8 12 8-12" fill="none" stroke-width="2"/>')
    # A seagull.
    b.append('<path d="M262 104q10-10 20 0 10-10 20 0" fill="none" stroke-width="3"/>')
    return svg("\n".join(b))


os.makedirs(OUT, exist_ok=True)
for name, draw in [("home", home), ("bathroom", bathroom), ("beach", beach)]:
    with open(os.path.join(OUT, f"{name}.svg"), "w") as f:
        f.write(draw())
print("done")
