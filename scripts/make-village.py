# Draws Rainbow Village: public/images/village/village-start.svg (the scene before Tofu moves in,
# with just the two houses' clearings), village.svg (after, with the park's clearing too), and the
# places on it: mochi-house.svg, tofu-house.svg and park.svg. The houses sit on the clearings at
# (23%, 64%), (77%, 64%) and the park at (50%, 33%), matching RainbowVillage.jsx.
# Run from the project root: python3 scripts/make-village.py
import math, os

INK = "#4b2e22"
OUT = "public/images/village"
RAINBOW = ["#ff8fa3", "#ffb86b", "#ffe27a", "#8fe3a8", "#8cc8f2", "#b79cf2"]


def svg(body, view):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}">\n'
            f'<g stroke="{INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">\n{body}\n</g>\n</svg>\n')


def sparkle(x, y, s, fill="#fff6c8"):
    return (f'<path d="M{x} {y - s}Q{x + s * .2} {y - s * .2} {x + s} {y}Q{x + s * .2} {y + s * .2} {x} {y + s}'
            f'Q{x - s * .2} {y + s * .2} {x - s} {y}Q{x - s * .2} {y - s * .2} {x} {y - s}Z" fill="{fill}" stroke-width="2.5"/>')


def cloud(x, y, s=1.0):
    return (f'<path d="M{x - 50 * s} {y + 16 * s}q-18 0-16-16t22-12q6-22 30-20 20 2 24 18 20-6 30 10 8 20-12 20Z" '
            f'fill="#ffffff" stroke-width="3.5"/>')


def tree(x, y, s=1.0, color="#8fe3a8"):
    return (f'<path d="M{x} {y}v{-24 * s}" stroke-width="7"/><path d="M{x} {y}v{-24 * s}" stroke="#c98a55" stroke-width="3"/>'
            f'<circle cx="{x}" cy="{y - 44 * s}" r="{24 * s}" fill="{color}" stroke-width="3.5"/>'
            f'<circle cx="{x - 8 * s}" cy="{y - 52 * s}" r="{5 * s}" fill="#ffffff" stroke="none" opacity=".5"/>')


def flower(x, y, color):
    petals = "".join(f'<circle cx="{x + 5 * math.cos(a):.1f}" cy="{y + 5 * math.sin(a):.1f}" r="4" fill="{color}" stroke="none"/>'
                     for a in [i * math.pi * 2 / 5 for i in range(5)])
    return petals + f'<circle cx="{x}" cy="{y}" r="2.6" fill="#ffd45e" stroke="none"/>'


def road_sign(x, y, scale, lines):
    """The wooden road sign from the dragons' rooms (DragonDen.jsx), its top-left at (x, y)."""
    text = "".join(
        f'<text x="86" y="{38 + i * 17 - (len(lines) - 1) * 0}" text-anchor="middle" font-family="Fredoka,Arial Rounded MT Bold,Arial,sans-serif" '
        f'font-size="15" font-weight="700" fill="{INK}" stroke="none">{line}</text>' for i, line in enumerate(lines))
    if len(lines) == 1:
        text = text.replace('y="38"', 'y="47"')
    return (f'<g transform="translate({x} {y}) scale({scale})">'
            '<path d="M100 50v56" stroke-width="14"/><path d="M100 50v56" stroke="#b9794a" stroke-width="7"/><path d="M86 106h28" stroke-width="5"/>'
            '<path d="M30 14h118a6 6 0 0 1 6 6v44a6 6 0 0 1-6 6H30L6 42Z" fill="#e0a56a"/>'
            '<path d="M34 26h108M34 58h108" stroke="#c98a55" stroke-width="2.5"/>'
            f'<circle cx="140" cy="20" r="2.5" fill="{INK}" stroke="none"/><circle cx="140" cy="64" r="2.5" fill="{INK}" stroke="none"/>'
            f'{text}</g>')


def village(with_park):
    b = ['<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7ecff"/><stop offset="1" stop-color="#fdf0ff"/></linearGradient></defs>',
         '<rect x="-10" y="-10" width="820" height="620" fill="url(#sky)" stroke="none"/>']
    # A big rainbow behind the hills.
    for i, color in enumerate(RAINBOW):
        r = 330 - i * 22
        b.append(f'<path d="M{400 - r} 330a{r} {r} 0 0 1 {2 * r} 0" fill="none" stroke="{color}" stroke-width="22"/>')
    b.append('<path d="M70 330a330 330 0 0 1 660 0" fill="none" stroke-width="3"/><path d="M180 330a220 220 0 0 1 440 0" fill="none" stroke-width="3"/>')
    b.append(cloud(120, 110) + cloud(690, 80, 0.85) + cloud(400, 40, 0.6))
    b.append(sparkle(250, 70, 10) + sparkle(560, 150, 8, "#ffe0ee") + sparkle(720, 200, 7))
    # Rolling hills.
    b.append('<path d="M-10 300q120-70 260-20t280-10 280 20V610H-10Z" fill="#b5e8cf"/>')
    b.append('<path d="M-10 360q160-50 300 0t300-10 220 10V610H-10Z" fill="#9fdcbf"/>')
    # Clearings for the houses and the park.
    b.append('<ellipse cx="184" cy="440" rx="130" ry="34" fill="#c8eed8" stroke="none"/>')
    b.append('<ellipse cx="616" cy="440" rx="130" ry="34" fill="#c8eed8" stroke="none"/>')
    if with_park:
        b.append('<ellipse cx="400" cy="250" rx="120" ry="30" fill="#c8eed8" stroke="none"/>')
    # A winding path from the front, branching to each house (and on up to the park).
    path = "M400 620Q390 540 400 480M400 480Q300 470 214 446M400 470Q500 466 588 446"
    if with_park:
        path += "M400 480Q410 420 400 360Q392 300 400 262"
    b.append(f'<path d="{path}" fill="none" stroke-width="36"/><path d="{path}" fill="none" stroke="#ffe7b0" stroke-width="28"/>')
    b.append(f'<path d="{path}" fill="none" stroke="#f2c779" stroke-width="3" stroke-dasharray="2 22"/>')
    # Trees, flowers and a little sign.
    for x, y, s, c in [(60, 420, 1.1, "#8fe3a8"), (330, 330, 0.8, "#b5e8a8"), (480, 330, 0.8, "#8fe3a8"), (760, 410, 1.1, "#b5e8a8"),
                       (40, 560, 1.0, "#8fe3a8"), (770, 570, 1.0, "#8fe3a8")]:
        b.append(tree(x, y, s, c))
    for x, y, c in [(120, 520, "#ff8fa3"), (150, 540, "#ffe27a"), (300, 560, "#b79cf2"), (520, 560, "#ff8fa3"), (640, 530, "#8cc8f2"),
                    (680, 550, "#ffe27a"), (260, 400, "#ffb3d1"), (540, 395, "#b79cf2"), (350, 520, "#ffe27a"), (460, 530, "#ff8fa3")]:
        b.append(flower(x, y, c))
    b.append(road_sign(436, 466, 1.25, ["Rainbow", "Village"]))
    return svg("\n".join(b), "0 0 800 600")


def mochi_house():
    b = []
    # Chimney puffing rainbow smoke, kept inside the picture.
    b.append('<rect x="132" y="50" width="20" height="36" fill="#c4b0f5"/><rect x="128" y="44" width="28" height="10" rx="3" fill="#b39ef0"/>')
    for i, c in enumerate(["#ff8fa3", "#ffe27a", "#8cc8f2"]):
        b.append(f'<circle cx="{146 + i * 11}" cy="{34 - i * 10}" r="{6 + i * 1.5}" fill="{c}" stroke-width="3"/>')
    b.append('<rect x="40" y="104" width="120" height="80" fill="#e3d6fb"/>')
    # A rainbow-striped roof.
    b.append('<path d="M24 108Q100 30 176 108Z" fill="#ffffff"/>')
    for i, c in enumerate(RAINBOW[:5]):
        inset = i * 9
        b.append(f'<path d="M{28 + inset} 106Q100 {36 + inset * 1.6:.0f} {172 - inset} 106" fill="none" stroke="{c}" stroke-width="9"/>')
    b.append('<path d="M24 108Q100 30 176 108Z" fill="none"/>')
    b.append('<path d="M100 40l3-9 3 9 9 3-9 3-3 9-3-9-9-3Z" fill="#ffd45e" stroke-width="2.5"/>')
    # A door in the middle, with a square window each side, level with the walls.
    b.append('<path d="M84 184v-38a16 16 0 0 1 32 0v38Z" fill="#ff8fa3"/><circle cx="108" cy="166" r="3" fill="#ffd45e" stroke-width="2"/>')
    for x in (50, 128):
        b.append(f'<rect x="{x}" y="122" width="24" height="24" rx="3" fill="#c9e6fb" stroke-width="3"/>'
                 f'<path d="M{x + 12} 122v24M{x} 134h24" stroke-width="2.5"/>'
                 f'<rect x="{x - 3}" y="146" width="30" height="6" rx="2" fill="#ffd3e6" stroke-width="2.5"/>')
    b.append('<path d="M88 112q6-7 12 0 6-7 12 0-12 14-12 14t-12-14Z" fill="#ffd3e6" stroke-width="2.5"/>')
    b.append('<path d="M20 186h160" stroke="#9fdcbf" stroke-width="8"/>')
    return svg("\n".join(b), "0 0 200 200")


def tofu_house():
    b = []
    # An upright chimney with a puff of smoke, standing on the right-hand slope of the roof.
    b.append('<rect x="128" y="50" width="18" height="40" fill="#ffb3d1"/><rect x="124" y="44" width="26" height="9" rx="3" fill="#ff8fa3"/>')
    b.append('<circle cx="140" cy="32" r="6" fill="#ffffff" stroke-width="3"/><circle cx="150" cy="22" r="4.5" fill="#ffffff" stroke-width="3"/>')
    b.append('<rect x="46" y="100" width="108" height="84" fill="#fff2bf"/>')
    # A pointed mint roof, the same on both sides, with scallops along the eaves.
    b.append('<path d="M28 106L100 36l72 70Z" fill="#9fdcbf"/>')
    for i in range(7):
        x = 34 + i * 19
        b.append(f'<path d="M{x} 106q9.5 13 19 0" fill="#9fdcbf" stroke-width="3"/>')
    # A little round attic window.
    b.append('<circle cx="100" cy="78" r="11" fill="#c9e6fb" stroke-width="3.5"/><path d="M100 67v22M89 78h22" stroke-width="2.5"/>')
    # Round windows with a cross frame, and flower boxes underneath.
    for cx in (68, 132):
        b.append(f'<circle cx="{cx}" cy="128" r="13" fill="#c9e6fb" stroke-width="3.5"/>'
                 f'<path d="M{cx} 115v26M{cx - 13} 128h26" stroke-width="2.5"/>'
                 f'<path d="M{cx - 7} 121a8 8 0 0 1 6-4" stroke="#ffffff" stroke-width="2.5" fill="none"/>')
        b.append(flower(cx - 6, 145, "#ffe27a") + flower(cx + 6, 145, "#ff8fa3"))
        b.append(f'<rect x="{cx - 15}" y="147" width="30" height="9" rx="3" fill="#ffb3d1" stroke-width="2.5"/>')
    b.append('<path d="M86 184v-28a14 14 0 0 1 28 0v28Z" fill="#ffb86b"/><circle cx="107" cy="170" r="3" fill="#ffd45e" stroke-width="2"/>')
    b.append(sparkle(36, 56, 7) + sparkle(172, 70, 6, "#ffe0ee"))
    b.append('<path d="M20 186h160" stroke="#9fdcbf" stroke-width="8"/>')
    return svg("\n".join(b), "0 0 200 200")


def park():
    b = []
    # A pond, a slide, a swing and two trees on a lawn.
    b.append('<ellipse cx="100" cy="176" rx="84" ry="12" fill="#c8eed8" stroke="none"/>')
    b.append(tree(30, 176, 0.95) + tree(176, 172, 0.85, "#b5e8a8"))
    # Swing set.
    b.append('<path d="M40 176L58 92M96 176L78 92M54 92h28" stroke-width="7"/><path d="M40 176L58 92M96 176L78 92M54 92h28" stroke="#ff8fa3" stroke-width="3"/>')
    b.append('<path d="M62 94v50M74 94v50" stroke-width="2.5"/><rect x="58" y="142" width="20" height="7" rx="3" fill="#ffe27a" stroke-width="3"/>')
    # Slide with a ladder.
    b.append('<path d="M118 176V102M134 176V102" stroke-width="4"/>')
    for y in range(114, 176, 14):
        b.append(f'<path d="M118 {y}h16" stroke-width="3"/>')
    b.append('<rect x="112" y="94" width="28" height="10" rx="3" fill="#b79cf2" stroke-width="3"/>')
    b.append('<path d="M138 98q24 30 34 76h-12q-10-40-26-66Z" fill="#8cc8f2" stroke-width="3.5"/>')
    b.append('<ellipse cx="100" cy="182" rx="18" ry="5" fill="#8cc8f2" stroke-width="2.5"/>')
    b.append(sparkle(40, 50, 6) + sparkle(162, 40, 6, "#ffe0ee"))
    b.append('<path d="M20 190h160" stroke="#9fdcbf" stroke-width="8"/>')
    return svg("\n".join(b), "0 0 200 200")


os.makedirs(OUT, exist_ok=True)
for name, draw in [("village-start", lambda: village(False)), ("village", lambda: village(True)), ("mochi-house", mochi_house), ("tofu-house", tofu_house), ("park", park)]:
    with open(os.path.join(OUT, f"{name}.svg"), "w") as f:
        f.write(draw())
print("done")
