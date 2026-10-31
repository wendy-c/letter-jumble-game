# Draws Mochi the mascot in five moods: public/images/mochi/happy.svg, confused.svg, idea.svg,
# welcome.svg (a big smile and open arms, for the front page's greeting) and wrong.svg (holding up a
# sign with a red cross, after a wrong answer); and cloudmobile.svg, Mochi in sunglasses driving her
# cloud car (the front page's way to the dragon game).
# She's a head-and-shoulders sticker, matching the 3D Mochi: lilac, pink snout, unicorn horn,
# fluffy ears with rainbow tips, a rainbow mane and rainbow wings peeking out.
# Also the feelings for 中文認字's 感受 topic (public/images/game-asset/feelings/), each shown by
# Mochi or by Tofu (yellow, with floppy ears and fairy wings), plus that topic's icon.
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


# ---------- Tofu: Mochi's best friend ----------
TOFU, TOFU_EAR = "#fff0a8", "#ffd3e6"


def tofu_ear(side):
    # Floppy ears hanging down beside her face, pink inside, with a blue tip.
    cx = 100 + side * 70
    return (f'<g transform="rotate({side * -18} {100 + side * 52} 66)">'
            f'<ellipse cx="{cx}" cy="100" rx="16" ry="34" fill="{TOFU}"/>'
            f'<ellipse cx="{cx}" cy="102" rx="8" ry="22" fill="{TOFU_EAR}" stroke="none"/>'
            f'<circle cx="{cx}" cy="134" r="6" fill="#8cc8f2" stroke-width="2.5"/></g>')


def fairy_wing(side):
    # Two see-through fairy wings each side.
    x, y = 100 + side * 44, 150
    return "".join(f'<ellipse cx="{x + side * dx}" cy="{y + dy}" rx="{rx}" ry="{ry}" fill="#cfe9ff" fill-opacity=".75" stroke="#9db9f2" stroke-width="3" transform="rotate({side * angle} {x} {y})"/>'
                   for dx, dy, rx, ry, angle in [(34, -22, 36, 20, -30), (26, 14, 26, 14, 20)])


def tofu(face, extras_front="", tilt=0):
    parts = [fairy_wing(-1), fairy_wing(1),
             f'<path d="M48 196 Q50 152 100 150 Q150 152 152 196Z" fill="{TOFU}"/>',
             f'<ellipse cx="100" cy="186" rx="22" ry="12" fill="#fffcf0" stroke-width="2.5"/>',
             f'<g transform="rotate({tilt} 100 120)">', tofu_ear(-1), tofu_ear(1),
             f'<ellipse cx="100" cy="106" rx="64" ry="57" fill="{TOFU}"/>', horn(), face, "</g>"]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -48 236 246">\n'
            f'<g stroke="{INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">\n'
            + "\n".join(parts) + extras_front + "\n</g>\n</svg>\n")


def mochi(face, extras_behind="", extras_front="", tilt=0, arms=""):
    parts = [wing(-1), wing(1), arms, body(), f'<g transform="rotate({tilt} 100 120)">', ear(-1), ear(1), head(), mane(), horn(),
             face, "</g>"]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -48 236 246">\n'
            f'<g stroke="{INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">\n'
            + extras_behind + "\n".join(part for part in parts if part) + extras_front + "\n</g>\n</svg>\n")


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


def arm(side):
    # An outlined lilac arm reaching out and up from the shoulder, with a round paw.
    sx, sy = 100 + side * 40, 170
    hx, hy = 100 + side * 86, 116
    return (f'<path d="M{sx} {sy}L{hx} {hy}" stroke-width="27"/>'
            f'<path d="M{sx} {sy}L{hx} {hy}" stroke="{LILAC}" stroke-width="20"/>'
            f'<circle cx="{hx}" cy="{hy}" r="14" fill="{LILAC}"/>'
            f'<circle cx="{hx}" cy="{hy + 2}" r="5.5" fill="{PINK}" stroke="none"/>'
            + "".join(f'<circle cx="{hx + dx}" cy="{hy + dy}" r="2.6" fill="{PINK}" stroke="none"/>' for dx, dy in [(-7, -6), (0, -9), (7, -6)]))


def heart(x, y, s, fill="#ff8fae"):
    return (f'<path d="M{x} {y + s}C{x - s * 1.6} {y - s * .2} {x - s * .9} {y - s * 1.3} {x} {y - s * .4}'
            f'C{x + s * .9} {y - s * 1.3} {x + s * 1.6} {y - s * .2} {x} {y + s}Z" fill="{fill}" stroke-width="2.2"/>')


def welcome():
    # Sparkly open eyes, a big open smile, rosy cheeks and arms open wide for a hug.
    eyes = ""
    for x in (72, 128):
        eyes += (f'<ellipse cx="{x}" cy="102" rx="10" ry="12" fill="{INK}" stroke="none"/>'
                 f'<circle cx="{x - 3.5}" cy="97" r="4.2" fill="#fff" stroke="none"/>'
                 f'<circle cx="{x + 3.5}" cy="107" r="2" fill="#fff" stroke="none"/>')
    smile = f'<path d="M82 137Q100 168 118 137Z" fill="#ff7f9f" stroke-width="3"/>'
    face = (eyes + f'<ellipse cx="52" cy="124" rx="13" ry="8" fill="#ffb3c6" stroke="none"/>'
            f'<ellipse cx="148" cy="124" rx="13" ry="8" fill="#ffb3c6" stroke="none"/>' + snout(smile))
    return mochi(face, arms=arm(-1) + arm(1),
                 extras_front=heart(-2, 84, 8) + heart(202, 84, 7, "#b79cf2") + sparkle(16, 20, 8) + sparkle(186, 22, 7, "#ffb3d9"))


def wrong():
    # A kind "not quite" face (worried brows, a small frown) and a sign with a big red cross held up
    # under her chin, a paw on each side.
    face = (open_eyes(ey=106) +
            f'<path d="M60 88q10-6 20 0M120 88q10-6 20 0" fill="none" stroke-width="3.5"/>'
            + cheeks(2) + snout(f'<path d="M92 144q8-7 16 0" fill="none" stroke-width="3"/>'))
    sign = (f'<rect x="54" y="155" width="92" height="42" rx="9" fill="#fff"/>'
            f'<path d="M87 164l26 26M113 164l-26 26" stroke-width="15"/>'
            f'<path d="M87 164l26 26M113 164l-26 26" stroke="#f0506e" stroke-width="9.5"/>')
    paws = "".join(f'<circle cx="{x}" cy="164" r="10" fill="{LILAC}"/>' for x in (53, 147))
    return mochi(face, extras_front=sign + paws + sparkle(16, 26, 7, "#b79cf2"))


def arm_to(sx, sy, hx, hy):
    # An outlined lilac arm from the shoulder (sx, sy) to a round paw at (hx, hy).
    return (f'<path d="M{sx} {sy}L{hx} {hy}" stroke-width="27"/>'
            f'<path d="M{sx} {sy}L{hx} {hy}" stroke="{LILAC}" stroke-width="20"/>'
            f'<circle cx="{hx}" cy="{hy}" r="13" fill="{LILAC}"/>'
            f'<circle cx="{hx}" cy="{hy + 2}" r="5" fill="{PINK}" stroke="none"/>')


def sunglasses():
    # Heart-shaped lenses with pink rims and a shine, over her eyes.
    lens = lambda x: (f'<path d="M{x} 118C{x - 24} 106 {x - 22} 86 {x - 10} 88 {x - 4} 88 {x} 94 {x} 94'
                      f'C{x} 94 {x + 4} 88 {x + 10} 88 {x + 22} 86 {x + 24} 106 {x} 118Z" fill="#3d2b63" stroke="#ff7fae" stroke-width="4"/>'
                      f'<path d="M{x - 12} 96q3-4 8-4" fill="none" stroke="#ffffff" stroke-width="3" opacity=".8"/>')
    return (lens(72) + lens(128) + '<path d="M90 98q10-6 20 0" fill="none" stroke="#ff7fae" stroke-width="4"/>'
            '<path d="M50 96l-12-4M150 96l12-4" stroke="#ff7fae" stroke-width="4"/>')


def cloud(x, y, w, h, fill):
    # A fluffy cloud with one outline round the outside: puffs along the top of a rounded base, wide
    # w and tall h, its top-left at (x, y). Drawn once thick in ink, then filled on top.
    shapes = lambda paint, extra: "".join(
        f'<circle cx="{x + w * f:.0f}" cy="{y + h * 0.42:.0f}" r="{h * r:.0f}" {paint}{extra}/>'
        for f, r in [(0.12, 0.42), (0.3, 0.55), (0.5, 0.62), (0.7, 0.52), (0.88, 0.4)]) \
        + f'<rect x="{x}" y="{y + h * 0.35:.0f}" width="{w}" height="{h * 0.65:.0f}" rx="{h * 0.32:.0f}" {paint}{extra}/>'
    return shapes(f'fill="{INK}"', ' stroke-width="8"') + shapes(f'fill="{fill}"', ' stroke="none"')


def cloudmobile():
    b = []
    # Rainbow wings peek out behind, then Mochi in sunglasses, smiling.
    face = sunglasses() + f'<ellipse cx="50" cy="128" rx="11" ry="6.5" fill="#ffb3c6" stroke="none"/><ellipse cx="150" cy="128" rx="11" ry="6.5" fill="#ffb3c6" stroke="none"/>' \
        + snout(f'<path d="M86 138Q100 158 114 138Z" fill="#ff7f9f" stroke-width="3"/>')
    b += [wing(-1), wing(1), body(), ear(-1), ear(1), head(), mane(), horn(), face]
    # The cloud car: a big fluffy cloud with a rainbow stripe, a little puff of a headlamp at the front.
    b.append(cloud(-52, 176, 300, 84, "#ffffff"))
    for i, c in enumerate(RAINBOW[:4]):
        b.append(f'<path d="M-30 {228 + i * 6}H226" stroke="{c}" stroke-width="6" stroke-linecap="butt"/>')
    b.append('<circle cx="246" cy="232" r="9" fill="#ffe27a" stroke-width="3"/>')
    b.append(sparkle(270, 230, 9) + sparkle(-66, 212, 7, "#ffb3d9"))
    # The steering wheel on its column, with her paw on top.
    b.append('<path d="M184 210l-10-30" stroke-width="7"/><path d="M184 210l-10-30" stroke="#b39ef0" stroke-width="3"/>')
    b.append('<ellipse cx="172" cy="174" rx="22" ry="26" fill="none" stroke-width="11" transform="rotate(-20 172 174)"/>'
             '<ellipse cx="172" cy="174" rx="22" ry="26" fill="none" stroke="#ff8fb7" stroke-width="6" transform="rotate(-20 172 174)"/>'
             '<circle cx="172" cy="174" r="6" fill="#ffd45e" stroke-width="3"/>')
    b.append(arm_to(136, 170, 158, 152))
    # Sparkles under the car, where it floats.
    b.append(sparkle(30, 278, 7) + sparkle(120, 282, 6, "#8cc8f2") + sparkle(200, 276, 7, "#ffb3d9"))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-80 -48 370 340">\n'
            f'<g stroke="{INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">\n'
            + "\n".join(b) + "\n</g>\n</svg>\n")


# ---------- Feelings (感受) ----------
# Face parts, in the head's coordinates: eyes at x 72 and 128, about y 104; the mouth in the snout.
def closed_eyes(up=True):
    return '<path d="M62 106q10-12 20 0M118 106q10-12 20 0" fill="none" stroke-width="4.5"/>' if up else \
        '<path d="M62 102q10 10 20 0M118 102q10 10 20 0" fill="none" stroke-width="4.5"/>'


def wide_eyes():
    return "".join(f'<circle cx="{x}" cy="102" r="12" fill="#fff" stroke-width="3"/><circle cx="{x}" cy="104" r="6" fill="{INK}" stroke="none"/>'
                   f'<circle cx="{x - 2}" cy="101" r="2" fill="#fff" stroke="none"/>' for x in (72, 128))


def sleepy_eyes():
    return '<path d="M62 104h20M118 104h20" stroke-width="4.5"/><path d="M64 104q8 6 16 0M120 104q8 6 16 0" fill="none" stroke-width="3"/>'


def brows(kind):
    return {
        "sad": '<path d="M60 90l22-8M118 82l22 8" fill="none" stroke-width="3.5"/>',
        "angry": '<path d="M60 82l22 10M118 92l22-10" fill="none" stroke-width="4.5"/>',
        "worried": '<path d="M60 88q10-8 22-4M118 84q12-4 22 4" fill="none" stroke-width="3.5"/>',
    }[kind]


def mouth(kind):
    return {
        "smile": '<path d="M92 140q8 8 16 0" fill="none" stroke-width="3"/>',
        "grin": '<path d="M86 137Q100 158 114 137Z" fill="#ff7f9f" stroke-width="3"/>',
        "smirk": '<path d="M92 142q10 6 18-4" fill="none" stroke-width="3"/>',
        "frown": '<path d="M92 147q8-8 16 0" fill="none" stroke-width="3"/>',
        "o": '<ellipse cx="100" cy="143" rx="6" ry="7" fill="#ff7f9f" stroke-width="3"/>',
        "wavy": '<path d="M88 143q4-5 8 0t8 0 8 0" fill="none" stroke-width="3"/>',
        "flat": '<path d="M93 143h14" stroke-width="3"/>',
        "tiny": '<path d="M96 141q4 4 8 0" fill="none" stroke-width="3"/>',
    }[kind]


def tear(x, y):
    return f'<path d="M{x} {y}q-7 10 0 14 7-4 0-14Z" fill="#a8dcff" stroke-width="2.5"/>'


def sweat(x, y):
    return f'<path d="M{x} {y}q8 12 0 18-8-6 0-18Z" fill="#a8dcff" stroke-width="2.5"/>'


def big_blush():
    return ('<ellipse cx="54" cy="124" rx="15" ry="9" fill="#ff9bb5" stroke="none"/><ellipse cx="146" cy="124" rx="15" ry="9" fill="#ff9bb5" stroke="none"/>'
            '<path d="M46 122l6-4M54 124l6-4M138 122l6-4M146 124l6-4" stroke="#ff6f8f" stroke-width="2"/>')


def note(x, y, fill):
    return f'<ellipse cx="{x}" cy="{y}" rx="6" ry="5" fill="{fill}" stroke-width="2.5"/><path d="M{x + 5} {y}v-20l10 4" fill="none" stroke-width="2.5"/>'


def puff(x, y):
    return f'<path d="M{x} {y}q-8-2-6-10 4-8 12-4 6-6 12 0 6 4 2 12Z" fill="#ffffff" stroke-width="2.5"/>'


def zzz():
    return ''.join(f'<text x="{x}" y="{y}" font-family="Arial Rounded MT Bold,Fredoka,Arial,sans-serif" font-size="{size}" font-weight="700" '
                   f'fill="#8cc8f2" stroke="{INK}" stroke-width="2" paint-order="stroke">z</text>' for x, y, size in [(168, 40, 22), (184, 18, 28), (200, -6, 34)])


def feelings():
    face = lambda eyes, mouthkind, extra="", dy=0: eyes + cheeks(dy) + snout(mouth(mouthkind)) + extra
    return {
        # Mochi
        "confident": mochi(face(open_eyes(), "smirk", brows("angry").replace('stroke-width="4.5"', 'stroke-width="3"')),
                           extras_front=sparkle(16, 30, 9) + sparkle(190, 50, 7), tilt=-5),
        "sad": mochi(face(open_eyes(ey=106) + brows("sad"), "frown", tear(66, 116) + tear(134, 116))),
        "cheerful": mochi(face(closed_eyes(), "grin"), extras_front=note(14, 40, "#ff8fa3") + note(186, 20, "#8cc8f2")),
        "surprised": mochi(face(wide_eyes(), "o"), extras_front=sparkle(14, 26, 10) + sparkle(190, 40, 9, "#ffb3d9") + sparkle(196, 110, 7, "#8cc8f2")),
        "upset": mochi(face(open_eyes(ey=108) + brows("worried"), "frown", tear(134, 118)), tilt=8),
        "proud": mochi(face(closed_eyes(), "grin"), extras_front=sparkle(14, 30, 10) + sparkle(186, 14, 12) + sparkle(196, 80, 7, "#ffb3d9"), tilt=-10),
        "angry": mochi(face(open_eyes(ey=108) + brows("angry"), "frown", '<ellipse cx="54" cy="124" rx="13" ry="8" fill="#ff8f8f" stroke="none"/><ellipse cx="146" cy="124" rx="13" ry="8" fill="#ff8f8f" stroke="none"/>'),
                       extras_front=puff(10, 40) + puff(190, 30)),
        # Tofu
        "satisfied": tofu(face(closed_eyes(), "smile", big_blush())),
        "scared": tofu(face(wide_eyes(), "wavy", sweat(160, 80) + brows("worried")),
                       extras_front='<path d="M2 90q-6 10 0 20M-8 86q-8 14 0 28M198 90q6 10 0 20M208 86q8 14 0 28" fill="none" stroke-width="3"/>'),
        "hopeful": tofu(face(open_eyes(ey=98), "smile"), extras_front=sparkle(160, -10, 14) + sparkle(190, 30, 8, "#ffb3d9") + sparkle(30, 0, 8)),
        "panicked": tofu(face(wide_eyes() + brows("worried"), "o", sweat(156, 78) + sweat(40, 80)),
                         extras_front='<text x="176" y="20" font-family="Arial Rounded MT Bold,Fredoka,Arial,sans-serif" font-size="44" font-weight="700" fill="#ff7f9f" stroke="#4b2e22" stroke-width="2.5" paint-order="stroke">!</text>', tilt=-6),
        "tired": tofu(face(sleepy_eyes(), "flat"), extras_front=zzz(), tilt=10),
        "nervous": tofu(face(open_eyes() + brows("worried"), "wavy", sweat(158, 84))),
        "shy": tofu(face(closed_eyes(up=False), "tiny", big_blush()), tilt=-8),
        "relaxed": tofu(face(closed_eyes(), "smile"), extras_front=note(186, 30, "#8fe3a8")),
    }


os.makedirs(OUT, exist_ok=True)
for name, draw in [("happy", happy), ("confused", confused), ("idea", idea), ("welcome", welcome), ("wrong", wrong), ("cloudmobile", cloudmobile)]:
    with open(os.path.join(OUT, f"{name}.svg"), "w") as f:
        f.write(draw())
FEELINGS = os.path.join(ROOT, "public/images/game-asset/feelings")
os.makedirs(FEELINGS, exist_ok=True)
drawn = feelings()
for name, picture in drawn.items():
    with open(os.path.join(FEELINGS, f"{name}.svg"), "w") as f:
        f.write(picture)
# The 感受 topic's icon: Mochi, cheerful.
with open(os.path.join(ROOT, "public/images/icons/chinese-feelings.svg"), "w") as f:
    f.write(drawn["cheerful"])
print("done")
