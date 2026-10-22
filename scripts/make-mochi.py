# Draws Mochi the mascot in three moods: public/images/mochi/happy.svg, confused.svg and idea.svg.
# She's a head-and-shoulders sticker, matching the 3D Mochi: lilac, pink snout, unicorn horn,
# fluffy ears with rainbow tips, a rainbow mane and rainbow wings peeking out.
import os, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
OUT = os.path.join(ROOT, "public/images/mochi")
INK = "#4b2e22"
LILAC, LILAC_DARK, PINK, CREAM = "#d9c8ff", "#c4b0f5", "#ffe0f0", "#fff3d6"
RAINBOW = ["#ff8fa3", "#ffb86b", "#ffe27a", "#8fe3a8", "#8cc8f2", "#b79cf2"]


def wing(side):
    # Three rainbow feathers fanning out from behind the shoulder.
    x, y = 100 + side * 46, 152
    out = ""
    for angle, color in [(-62, RAINBOW[4]), (-38, RAINBOW[2]), (-14, RAINBOW[0])]:
        a = angle if side > 0 else 180 - angle
        out += f'<ellipse cx="{x + side * 30}" cy="{y}" rx="34" ry="12" fill="{color}" transform="rotate({a if side > 0 else -angle} {x} {y})"/>'
    return out


def ear(side):
    s = side
    cx = 100 + s * 56
    return (f'<g transform="rotate({s * 28} {cx} 58)">'
            f'<ellipse cx="{cx}" cy="58" rx="17" ry="27" fill="{LILAC}"/>'
            f'<ellipse cx="{cx}" cy="61" rx="9" ry="17" fill="#ffc2dc" stroke="none"/>'
            f'<circle cx="{cx}" cy="70" r="6" fill="#fff" stroke-width="2.5"/>'
            f'<circle cx="{cx - 5}" cy="64" r="4.5" fill="#fff" stroke-width="2"/>'
            f'<circle cx="{cx}" cy="31" r="6" fill="{RAINBOW[0]}" stroke-width="2.5"/>'
            f'<circle cx="{cx - 6}" cy="36" r="4.5" fill="{RAINBOW[5]}" stroke-width="2"/>'
            f'<circle cx="{cx + 6}" cy="36" r="4.5" fill="{RAINBOW[2]}" stroke-width="2"/>'
            f'</g>')


def horn():
    stripes = "".join(f'<path d="M{92 + i * 1.6} {50 - i * 9}l{16 - i * 3.2} -4" stroke="{RAINBOW[0] if i % 2 else RAINBOW[5]}" stroke-width="3.5"/>' for i in range(4))
    return (f'<path d="M88 54 L100 8 L112 54Z" fill="#fff6e0"/>' + stripes +
            f'<path d="M100 8l3 -7 2 7 7 2-7 2-2 7-3-7-7-2Z" fill="#ffd45e" stroke-width="2"/>')


def mane():
    # Rainbow tufts in front of the forehead, either side of the horn.
    return "".join(f'<circle cx="{100 + dx}" cy="{54 + dy}" r="{r}" fill="{c}" stroke-width="2.5"/>'
                   for dx, dy, r, c in [(-30, 8, 9, RAINBOW[4]), (30, 8, 9, RAINBOW[3]), (-18, 2, 10, RAINBOW[0]), (18, 2, 10, RAINBOW[2]), (-6, 0, 9, RAINBOW[1]), (6, 0, 9, RAINBOW[5])])


def cheeks(dy=0):
    return (f'<ellipse cx="54" cy="{124 + dy}" rx="11" ry="6.5" fill="#ffb3c6" stroke="none"/>'
            f'<ellipse cx="146" cy="{124 + dy}" rx="11" ry="6.5" fill="#ffb3c6" stroke="none"/>')


def open_eyes(ex=(72, 128), ey=104):
    out = ""
    for x in ex:
        out += (f'<ellipse cx="{x}" cy="{ey}" rx="9" ry="11" fill="{INK}" stroke="none"/>'
                f'<circle cx="{x - 3}" cy="{ey - 4}" r="3.6" fill="#fff" stroke="none"/>'
                f'<circle cx="{x + 3}" cy="{ey + 4}" r="1.8" fill="#fff" stroke="none"/>')
    return out


def snout(mouth):
    return (f'<ellipse cx="100" cy="134" rx="25" ry="16" fill="{PINK}"/>'
            f'<ellipse cx="93" cy="128" rx="2.4" ry="2" fill="{INK}" stroke="none"/>'
            f'<ellipse cx="107" cy="128" rx="2.4" ry="2" fill="{INK}" stroke="none"/>' + mouth)


def body():
    return (f'<path d="M48 196 Q50 152 100 150 Q150 152 152 196Z" fill="{LILAC}"/>'
            f'<ellipse cx="100" cy="186" rx="22" ry="12" fill="{CREAM}" stroke-width="2.5"/>'
            + "".join(f'<circle cx="{100 + dx}" cy="{156 + dy}" r="{r}" fill="#fff" stroke-width="2.5"/>'
                      for dx, dy, r in [(-12, 0, 8), (12, 0, 8), (0, 4, 9)]))


def head():
    return f'<ellipse cx="100" cy="106" rx="64" ry="57" fill="{LILAC}"/>'


def sparkle(x, y, s, fill="#ffd45e"):
    return (f'<path d="M{x} {y - s}Q{x + s * .2} {y - s * .2} {x + s} {y}Q{x + s * .2} {y + s * .2} {x} {y + s}'
            f'Q{x - s * .2} {y + s * .2} {x - s} {y}Q{x - s * .2} {y - s * .2} {x} {y - s}Z" fill="{fill}" stroke-width="2"/>')


def mochi(face, extras_behind="", extras_front="", tilt=0):
    parts = [wing(-1), wing(1), body(), f'<g transform="rotate({tilt} 100 120)">', ear(-1), ear(1), head(), mane(), horn(),
             face, "</g>"]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -48 236 246">\n'
            f'<g stroke="{INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">\n'
            + extras_behind + "\n".join(parts) + extras_front + "\n</g>\n</svg>\n")


def happy():
    face = open_eyes() + cheeks() + snout(f'<path d="M92 140q8 8 16 0" fill="none" stroke-width="3"/>')
    return mochi(face, extras_front=sparkle(14, 30, 9) + sparkle(188, 60, 7, "#ffb3d9"))


def confused():
    # One eyebrow up, a squinty eye, a wobbly mouth, a sweat drop and question marks.
    face = (f'<ellipse cx="72" cy="106" rx="8" ry="10" fill="{INK}" stroke="none"/><circle cx="69" cy="102" r="3" fill="#fff" stroke="none"/>'
            f'<path d="M118 106q10-8 20 0" fill="none" stroke-width="4"/>'
            f'<path d="M60 86q10-8 22-4" fill="none" stroke-width="3.5"/>'
            f'<path d="M118 90l20 4" fill="none" stroke-width="3.5"/>'
            + cheeks(2) + snout(f'<path d="M88 142q4-5 8 0t8 0 8 0" fill="none" stroke-width="3"/>')
            + f'<path d="M160 82q8 12 0 18-8-6 0-18Z" fill="#a8dcff" stroke-width="2.5"/>')
    marks = (f'<text x="176" y="20" font-family="Arial Rounded MT Bold,Fredoka,Arial,sans-serif" font-size="40" font-weight="700" fill="#a98cf2" stroke="{INK}" stroke-width="2.5" paint-order="stroke" transform="rotate(14 176 20)">?</text>'
             f'<text x="4" y="12" font-family="Arial Rounded MT Bold,Fredoka,Arial,sans-serif" font-size="28" font-weight="700" fill="#f7a8c8" stroke="{INK}" stroke-width="2.5" paint-order="stroke" transform="rotate(-14 4 12)">?</text>')
    return mochi(face, extras_front=marks, tilt=-9)


def idea():
    # A glowing light bulb above her head, happy closed eyes and a big open smile.
    rays = "".join(f'<path d="M{182 + dx} {-6 + dy}l{ex} {ey}" stroke="#f2b632" stroke-width="4"/>'
                   for dx, dy, ex, ey in [(-26, -8, -8, -4), (-20, -24, -6, -6), (0, -32, 0, -8), (20, -24, 6, -6), (26, -8, 8, -4)])
    bulb = (f'<circle cx="182" cy="-6" r="24" fill="#fff6c8" stroke="none" opacity=".9"/>'
            f'<path d="M170 4q-10-8-10-18a22 22 0 0 1 44 0q0 10-10 18v8h-24Z" fill="#ffe27a"/>'
            f'<path d="M174 12h16M174 18h16" stroke-width="3.5"/><path d="M176 24h12" stroke-width="4"/>'
            f'<path d="M176 -6q6 8 6 18M188 -6q-6 8-6 18" fill="none" stroke="#f2b632" stroke-width="2.5"/>'
            f'<path d="M170 -18q4-8 12-8" fill="none" stroke="#fff" stroke-width="4"/>' + rays)
    face = (f'<path d="M62 106q10-12 20 0M118 106q10-12 20 0" fill="none" stroke-width="4.5"/>'
            + cheeks() + snout(f'<path d="M88 138q12 16 24 0Z" fill="#ff8fae" stroke-width="3"/>'))
    return mochi(face, extras_front=bulb + sparkle(14, 30, 9) + sparkle(36, 150, 6, "#ffb3d9") + sparkle(182, 118, 7, "#8cc8f2"))


os.makedirs(OUT, exist_ok=True)
for name, draw in [("happy", happy), ("confused", confused), ("idea", idea)]:
    with open(os.path.join(OUT, f"{name}.svg"), "w") as f:
        f.write(draw())
print("done")
