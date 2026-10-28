# Draws the pictures that used to be emoji, in the app's outlined pastel style: the games' word
# pictures (public/images/game-asset/<folder>/), Mochi and Tofu's activities
# (game-asset/dragon/) and a few interface icons (public/images/icons/ui-*). People and animals get
# faces; things don't.
# Run from the project root: python3 scripts/draw-words.py
import math, os

INK = "#4b2e22"
SKIN = "#ffe2c4"
IMAGES = "public/images/game-asset"
pictures = {}


def svg(body):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">\n'
            f'<g stroke="{INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">\n{body}\n</g>\n</svg>\n')


def eye(x, y, s=1.0):
    return (f'<ellipse cx="{x}" cy="{y}" rx="{3 * s:.1f}" ry="{3.4 * s:.1f}" fill="{INK}" stroke="none"/>'
            f'<circle cx="{x + 1 * s:.1f}" cy="{y - 1 * s:.1f}" r="{1 * s:.1f}" fill="#fff" stroke="none"/>')


def cheek(x, y, s=1.0):
    return f'<ellipse cx="{x}" cy="{y}" rx="{4 * s:.1f}" ry="{2.4 * s:.1f}" fill="#ffb3c6" stroke="none"/>'


def smile(x, y, w=6):
    return f'<path d="M{x - w / 2} {y}q{w / 2} {w / 2} {w} 0" fill="none" stroke-width="2.5"/>'


def sparkle(x, y, s, fill="#ffd45e"):
    return (f'<path d="M{x} {y - s}Q{x + s * .2} {y - s * .2} {x + s} {y}Q{x + s * .2} {y + s * .2} {x} {y + s}'
            f'Q{x - s * .2} {y + s * .2} {x - s} {y}Q{x - s * .2} {y - s * .2} {x} {y - s}Z" fill="{fill}" stroke-width="2"/>')


def limb(points, colour, width):
    """A thick outlined line, for arms, legs, tails and branches: a list of points or a path."""
    d = points if isinstance(points, str) else "M" + "L".join(f"{px} {py}" for px, py in points)
    return (f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="{width}"/>'
            f'<path d="{d}" fill="none" stroke="{colour}" stroke-width="{width - 5}"/>')


def burst(x, y, r1, r2, angles, width=3):
    """Little lines around a point, for a clap, a press or a kick."""
    out = ""
    for a in angles:
        c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
        out += f'<path d="M{x + r1 * c:.1f} {y + r1 * s:.1f}L{x + r2 * c:.1f} {y + r2 * s:.1f}" stroke-width="{width}"/>'
    return out


def kid(x, y, s=1.0, arms=None, legs=None, hair="#8b5a3c", shirt="#8fe3a8", shorts="#5b6b8c", facing=0, eyes="open", back=False):
    """A whole child with the head's centre at (x, y), `s` times the usual size (about 80 tall).
    `arms` are two lists of points from the shoulders (±11, 17) and `legs` two from the hips
    (±6, 42), around the head's centre; hands and shoes go on their ends. Shoes point outwards, or
    all one way when `facing` is 1 (right) or -1 (left). With `back`, they face away from us."""
    arms = arms or [[(-11, 17), (-17, 38)], [(11, 17), (17, 38)]]
    legs = legs or [[(-6, 42), (-7, 64)], [(6, 42), (7, 64)]]
    body = "".join(limb(leg, shorts, 12) for leg in legs)
    for leg in legs:
        fx, fy = leg[-1]
        body += f'<ellipse cx="{fx + 3 * (facing or (1 if fx >= 0 else -1))}" cy="{fy + 2}" rx="7" ry="4.5" fill="#ff8fa3" stroke-width="3"/>'
    body += (f'<path d="M-13 32h26l2 14H-15Z" fill="{shorts}"/>'
             f'<path d="M-9 13h18q5 0 6 6l2 17h-34l2-17q1-6 6-6Z" fill="{shirt}"/>')
    for arm in arms:
        body += limb(arm, SKIN, 10) + f'<circle cx="{arm[-1][0]}" cy="{arm[-1][1]}" r="5" fill="{SKIN}" stroke-width="3"/>'
    if back:
        # The back of the head: ears, hair all over and a little swirl.
        body += (f'<circle cx="-13" cy="2" r="4" fill="{SKIN}" stroke-width="3"/><circle cx="13" cy="2" r="4" fill="{SKIN}" stroke-width="3"/>'
                 f'<circle cx="0" cy="0" r="13" fill="{hair}"/><path d="M-3-4q5-4 8 2" fill="none" stroke-width="2.5"/>')
        return f'<g transform="translate({x} {y}) scale({s})">{body}</g>'
    body += (f'<circle cx="0" cy="0" r="13" fill="{SKIN}"/>'
             f'<path d="M-13 1q-1-15 13-15 14 0 13 15-4-8-13-8-9 0-13 8Z" fill="{hair}"/>')
    if eyes == "closed":
        body += '<path d="M-8 2q3-3 6 0M2 2q3-3 6 0" fill="none" stroke-width="2.2"/>'
    else:
        body += eye(-5, 2, .8) + eye(5, 2, .8)
    body += cheek(-9, 7, .7) + cheek(9, 7, .7) + smile(0, 7.5, 5)
    return f'<g transform="translate({x} {y}) scale({s})">{body}</g>'


# ---------- Letter Jumble for Movers ----------
A = "animals/"
pictures[A + "penguin"] = svg(
    '<path d="M64 14C40 14 30 40 30 70c0 26 12 44 34 44s34-18 34-44C98 40 88 14 64 14Z" fill="#5b6b8c"/>'
    '<path d="M64 36c-16 0-22 18-22 38 0 20 8 34 22 34s22-14 22-34c0-20-6-38-22-38Z" fill="#ffffff"/>'
    '<path d="M30 64q-14 14-10 30 10-6 14-16M98 64q14 14 10 30-10-6-14-16" fill="#5b6b8c"/>'
    '<path d="M44 112l-10 8h20ZM84 112l10 8H74Z" fill="#ffb86b"/>'
    '<path d="M58 50l6 8 6-8Z" fill="#ffb86b"/>' + eye(52, 42) + eye(76, 42) + cheek(46, 54) + cheek(82, 54))
pictures[A + "shark"] = svg(
    '<path d="M4 110q15-8 30 0t30 0 30 0 30 0v16H4Z" fill="#8cc8f2"/>'
    '<path d="M10 74Q30 46 76 46q30 0 44 20-14 18-44 18H40L22 96l4-16Z" fill="#9db4cc"/>'
    '<path d="M62 46l8-26 14 26Z" fill="#9db4cc"/><path d="M24 76l-14-20 8 26Z" fill="#9db4cc"/>'
    '<path d="M40 74q36 8 76-6" fill="none" stroke="#ffffff" stroke-width="5"/>'
    '<path d="M92 72l4 4 4-4 4 4" fill="none" stroke-width="2.5"/>' + eye(98, 58) + cheek(90, 64))
pictures[A + "snail"] = svg(
    '<path d="M10 104q4-12 30-12h56q14 0 18-12 6 4 4 14-4 12-20 12H18q-8 0-8-2Z" fill="#ffe2c4"/>'
    '<path d="M108 80v-22M120 80l4-20" fill="none" stroke-width="3"/><circle cx="108" cy="56" r="4" fill="#ffe2c4" stroke-width="3"/><circle cx="124" cy="58" r="4" fill="#ffe2c4" stroke-width="3"/>'
    '<circle cx="56" cy="64" r="34" fill="#ffb3d1"/><path d="M56 64m-6 0a6 6 0 1 1 12 0 14 14 0 1 1-28 0 22 22 0 1 1 44 0" fill="none" stroke="#e8789f" stroke-width="5"/>'
    + eye(110, 88, 0.8) + smile(112, 96, 5))

BF = "body-and-face/"


def bear(x, fat):
    """A standing bear, fat or thin, with its head at (x, 53)."""
    fur, light = "#d9a77a", "#f5dcc0"
    if fat:
        body = (f'<ellipse cx="{x - 14}" cy="116" rx="11" ry="6" fill="{fur}"/><ellipse cx="{x + 14}" cy="116" rx="11" ry="6" fill="{fur}"/>'
                f'<ellipse cx="{x - 27}" cy="88" rx="8" ry="12" fill="{fur}"/><ellipse cx="{x + 27}" cy="88" rx="8" ry="12" fill="{fur}"/>'
                f'<ellipse cx="{x}" cy="91" rx="28" ry="25" fill="{fur}"/><ellipse cx="{x}" cy="95" rx="17" ry="15" fill="{light}" stroke="none"/>')
    else:
        body = (limb([(x - 4, 104), (x - 6, 120)], fur, 10) + limb([(x + 4, 104), (x + 6, 120)], fur, 10)
                + limb([(x - 7, 74), (x - 15, 96)], fur, 9) + limb([(x + 7, 74), (x + 15, 96)], fur, 9)
                + f'<ellipse cx="{x}" cy="88" rx="10" ry="22" fill="{fur}"/><ellipse cx="{x}" cy="91" rx="5" ry="14" fill="{light}" stroke="none"/>')
    return body + (f'<circle cx="{x - 10}" cy="40" r="6" fill="{fur}"/><circle cx="{x + 10}" cy="40" r="6" fill="{fur}"/>'
                   f'<circle cx="{x - 10}" cy="40" r="2.5" fill="#f5b8a0" stroke="none"/><circle cx="{x + 10}" cy="40" r="2.5" fill="#f5b8a0" stroke="none"/>'
                   f'<circle cx="{x}" cy="53" r="14" fill="{fur}"/><ellipse cx="{x}" cy="59" rx="6" ry="4.5" fill="{light}" stroke-width="2.5"/>'
                   f'<ellipse cx="{x}" cy="57.5" rx="2.4" ry="1.8" fill="{INK}" stroke="none"/>'
                   + eye(x - 6, 50, .8) + eye(x + 6, 50, .8) + cheek(x - 10, 57, .7) + cheek(x + 10, 57, .7))


def down_arrow(x):
    return f'<path d="M{x - 5} 4h10v13h8L{x} 31 {x - 13} 17h8Z" fill="#ff6f6f" stroke-width="3"/>'


# The two pictures are the same bears; the arrow says which word it is.
pictures[BF + "thin"] = svg(bear(30, False) + bear(86, True) + down_arrow(30))
pictures[BF + "fat"] = svg(bear(30, False) + bear(86, True) + down_arrow(86))


S = "sports-and-leisure/"
# A band on stage: a guitarist, a drummer behind the drums and a singer.
def note(x, y):
    return f'<ellipse cx="{x}" cy="{y}" rx="4" ry="3" fill="{INK}" stroke="none"/><path d="M{x + 3.5} {y}v-14q5 2 7 7" fill="none" stroke-width="2.5"/>'


pictures[S + "band"] = svg(
    '<path d="M-4 100h136v32H-4Z" fill="#c9b6f5"/>'
    + kid(64, 30, 0.6, arms=[[(-11, 17), (-24, 20), (-30, 8)], [(11, 17), (24, 20), (30, 8)]], hair="#4b2e22", shirt="#ffd45e")
    + '<path d="M46 35l-8-8M82 35l8-8" stroke-width="3"/>'
    '<path d="M92 50v46" stroke-width="3"/><ellipse cx="92" cy="49" rx="11" ry="3" fill="#ffd45e" stroke-width="3"/>'
    '<path d="M39 58v8q9 5 18 0v-8" fill="#ff8fa3"/><ellipse cx="48" cy="58" rx="9" ry="3.5" fill="#ffffff" stroke-width="3"/>'
    '<path d="M71 58v8q9 5 18 0v-8" fill="#ff8fa3"/><ellipse cx="80" cy="58" rx="9" ry="3.5" fill="#ffffff" stroke-width="3"/>'
    '<circle cx="64" cy="80" r="18" fill="#ffffff"/><circle cx="64" cy="80" r="12" fill="none" stroke="#ff8fa3" stroke-width="3"/>'
    + kid(26, 56, 0.62, arms=[[(-11, 17), (-14, 32), (0, 30)], [(11, 17), (18, 22), (28, 14)]], hair="#c98a55", shirt="#8fe3a8")
    + limb([(28, 74), (50, 56)], "#8b5a3c", 7) + '<rect x="48" y="50" width="7" height="9" rx="2" fill="#8b5a3c" stroke-width="2.5" transform="rotate(50 51 54)"/>'
    '<circle cx="20" cy="80" r="9" fill="#ff8fa3"/><circle cx="28" cy="73" r="7" fill="#ff8fa3"/><circle cx="23" cy="77" r="2.5" fill="#4b2e22" stroke="none"/>'
    f'<circle cx="26" cy="74.6" r="3.2" fill="{SKIN}" stroke-width="2.5"/><circle cx="43.4" cy="64.7" r="3.2" fill="{SKIN}" stroke-width="2.5"/>'
    + kid(102, 56, 0.62, arms=[[(-11, 17), (-16, 36)], [(11, 17), (20, 24), (10, 10)]], hair="#a46a3c", shirt="#ff8fb7")
    .replace(smile(0, 7.5, 5), f'<ellipse cx="0" cy="8.5" rx="2.6" ry="3.2" fill="{INK}" stroke="none"/>')
    + '<path d="M108 62l3 12" stroke-width="4"/><circle cx="107" cy="58" r="4.5" fill="#d6d0e0" stroke-width="3"/>'
    f'<circle cx="108.2" cy="62.2" r="3.2" fill="{SKIN}" stroke-width="2.5"/>'
    + note(116, 30) + note(10, 30) + note(104, 16))
pictures[S + "sailing"] = svg(
    '<path d="M4 108q15-8 30 0t30 0 30 0 30 0v16H4Z" fill="#8cc8f2"/>'
    '<path d="M22 92h84l-12 16H34Z" fill="#c98a55"/><path d="M64 92V14" stroke-width="5"/>'
    '<path d="M64 18 100 84H64Z" fill="#ffffff"/><path d="M60 26 28 84h32Z" fill="#ffb3d1"/>'
    '<path d="M64 14l14 6-14 6Z" fill="#ff8fa3"/>')
pictures[S + "comic-book"] = svg(
    '<path d="M18 20h92v92H18Z" fill="#ffe27a"/><path d="M18 20h92v92H18Z" fill="none"/>'
    '<path d="M24 26h38v38H24ZM68 26h36v24H68ZM68 56h36v50H68ZM24 70h38v36H24Z" fill="#ffffff" stroke-width="3"/>'
    '<path d="M74 38q12-10 22 0-4 8-12 4l-6 6 2-8Z" fill="#ffffff" stroke-width="2.5"/>'
    '<path d="M86 74l4 10 10 2-8 6 2 10-8-6-8 6 2-10-8-6 10-2Z" fill="#ff8fa3" stroke-width="2.5"/>'
    '<circle cx="42" cy="46" r="10" fill="#8cc8f2" stroke-width="3"/><path d="M30 96q12-16 24 0" fill="#8fe3a8" stroke-width="3"/>')
pictures[S + "fishing"] = svg(
    '<path d="M4 110q15-8 30 0t30 0 30 0 30 0v16H4Z" fill="#8cc8f2"/>'
    '<path d="M18 104L92 14" stroke-width="6"/><path d="M18 104L92 14" stroke="#c98a55" stroke-width="2.5"/>'
    '<circle cx="30" cy="88" r="7" fill="#ffd45e" stroke-width="3"/>'
    '<path d="M92 14q8 30 8 58" fill="none" stroke-width="2"/>'
    '<path d="M86 84q14-12 28 0-14 12-28 0Z M84 84l-8-6v12Z" fill="#ffb86b" stroke-width="3"/>'
    '<path d="M100 72v8" stroke-width="2"/><circle cx="106" cy="82" r="1.8" fill="#4b2e22" stroke="none"/>')
pictures[S + "film"] = svg(
    '<path d="M16 50h96v62H16Z" fill="#5b4a72"/>'
    '<path d="M14 30l92-16 4 22-92 16Z" fill="#ffffff"/>'
    '<path d="M30 28l12 20M56 24l12 20M82 20l12 20" stroke="#5b4a72" stroke-width="7"/>'
    '<path d="M16 66h96" stroke="#ffffff" stroke-width="3"/>'
    '<path d="M30 80h40M30 94h28" stroke="#ffd45e" stroke-width="5"/>')
pictures[S + "goal"] = svg(
    '<path d="M10 104V30h108v74" fill="none" stroke-width="6"/>'
    + "".join(f'<path d="M{10 + i * 18} 30v74" stroke="#d6d0e0" stroke-width="2"/>' for i in range(1, 6))
    + "".join(f'<path d="M10 {30 + i * 15}h108" stroke="#d6d0e0" stroke-width="2"/>' for i in range(1, 5))
    + '<path d="M10 104V30h108v74" fill="none" stroke-width="6"/><path d="M4 112h120" stroke="#8fe3a8" stroke-width="8"/>'
    '<circle cx="80" cy="88" r="16" fill="#ffffff"/><path d="M80 80l7 5-3 8h-8l-3-8Z" fill="#4b2e22" stroke-width="2"/>')
pictures[S + "ice-skates"] = svg(
    '<path d="M30 20h26v44q30 4 38 22H26Z" fill="#ffffff"/><path d="M30 20h26" stroke-width="5"/>'
    '<path d="M36 34h14M36 46h14" stroke="#8cc8f2" stroke-width="3"/>'
    '<path d="M26 86h68v10H26Z" fill="#d6d0e0"/><path d="M20 106h82q8 0 10-8" fill="none" stroke-width="5"/>'
    '<path d="M36 96v10M84 96v10" stroke-width="4"/>' + sparkle(108, 30, 9, "#cfe9ff"))
pictures[S + "party"] = svg(
    '<path d="M20 112 46 30l36 56Z" fill="#ffb3d1"/><path d="M32 74l26 12M40 50l26 22" stroke="#ffe27a" stroke-width="6"/>'
    '<path d="M20 112 46 30l36 56Z" fill="none"/>'
    '<circle cx="90" cy="30" r="6" fill="#8cc8f2" stroke-width="3"/><circle cx="108" cy="58" r="5" fill="#8fe3a8" stroke-width="3"/>'
    '<path d="M64 20l6-10M98 80l12 4M78 46l14-8" stroke="#ff8fa3" stroke-width="4"/>' + sparkle(112, 22, 8) + sparkle(30, 22, 6, "#b79cf2"))
pictures[S + "present"] = svg(
    '<path d="M20 54h88v58H20Z" fill="#b79cf2"/><path d="M14 40h100v18H14Z" fill="#c9b6f5"/>'
    '<path d="M56 40h16v72H56Z" fill="#ff8fa3"/>'
    '<path d="M64 40c-10-18-34-22-32-6 2 10 22 8 32 6Zm0 0c10-18 34-22 32-6-2 10-22 8-32 6Z" fill="#ff8fa3"/>')
pictures[S + "roller-skates"] = svg(
    '<path d="M26 18h34v44q30 4 40 26H26Z" fill="#ff8fb7"/><path d="M26 18h34" stroke-width="5"/>'
    '<path d="M34 32h16M34 44h16" stroke="#ffffff" stroke-width="3"/>'
    '<path d="M22 88h84v10H22Z" fill="#ffd3e6"/>'
    + "".join(f'<circle cx="{x}" cy="108" r="9" fill="#ffe27a"/>' for x in (36, 64, 92)))
pictures[S + "ticket"] = svg(
    '<path d="M10 40h108v16a8 8 0 0 0 0 16v16H10V72a8 8 0 0 0 0-16Z" fill="#ffe27a"/>'
    '<path d="M86 40v48" fill="none" stroke-width="3" stroke-dasharray="4 6"/>'
    '<path d="M26 56h44M26 70h32" stroke="#ff8fa3" stroke-width="5"/>'
    '<path d="M100 56l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1Z" fill="#ff8fa3" stroke-width="2"/>')
pictures[S + "videoing"] = svg(
    '<path d="M14 40h70v52H14Z" fill="#8cc8f2"/><path d="M84 56l30-16v52L84 76Z" fill="#b79cf2"/>'
    '<circle cx="36" cy="28" r="12" fill="#d6d0e0"/><circle cx="64" cy="28" r="12" fill="#d6d0e0"/>'
    '<circle cx="28" cy="54" r="5" fill="#ff6f6f" stroke-width="3"/>'
    '<path d="M30 96l-8 18M68 96l8 18" stroke-width="4"/>')
pictures[S + "pirate"] = svg(
    '<path d="M28 116q4-30 36-30t36 30Z" fill="#ff6f6f"/><path d="M40 98l48 10M40 108l48-10" stroke="#ffffff" stroke-width="4"/>'
    '<circle cx="64" cy="66" r="26" fill="#ffe2c4"/>'
    '<path d="M34 50q30-30 60 0Z" fill="#4b2e22"/><path d="M26 52h76" stroke-width="6"/>'
    '<circle cx="64" cy="36" r="5" fill="#ffffff" stroke-width="2"/>'
    '<path d="M38 56l40 18" stroke-width="3"/><path d="M70 62h14v12H70Z" fill="#4b2e22"/>'
    + eye(54, 66) + cheek(48, 76) + smile(64, 80, 10))


# ---------- Letter Jumble for Starters: animals ----------
def face(x, y, s=1.0):
    return eye(x - 8 * s, y, s) + eye(x + 8 * s, y, s) + cheek(x - 14 * s, y + 7 * s, s) + cheek(x + 14 * s, y + 7 * s, s) + smile(x, y + 8 * s, 6 * s)


pictures[A + "bird"] = svg(
    '<path d="M22 70q0-32 34-36 30-2 40 20l16 4-14 8q-4 28-38 30-38 2-38-26Z" fill="#8cc8f2"/>'
    '<path d="M42 66q16-14 34 4-16 14-34-4Z" fill="#6fb3e6"/><path d="M100 54l14 6-14 4Z" fill="#ffb86b"/>'
    '<path d="M50 96l-4 16M66 96l4 16" stroke-width="3"/>' + eye(88, 50) + cheek(80, 58))
pictures[A + "duck"] = svg(
    '<circle cx="84" cy="50" r="19" fill="#ffe27a"/>'
    '<path d="M14 56q10 14 30 12h42q20 0 20 20 0 22-40 22-42 0-48-26-4-12-4-28Z" fill="#ffe27a"/>'
    '<path d="M44 82q20-10 36 0-6 16-28 12-8-2-8-12Z" fill="#ffd45e" stroke-width="3"/>'
    '<path d="M100 44q14-4 20 2-4 8-20 6Z" fill="#ffb86b"/>' + eye(88, 44) + cheek(84, 54)
    + '<path d="M-2 104q15-8 30 0t30 0 30 0 30 0 30 0v26H-2Z" fill="#8cc8f2"/>')
pictures[A + "goat"] = svg(
    '<path d="M30 96v18M46 96v18M74 96v18M90 96v18" stroke-width="6"/>'
    '<ellipse cx="60" cy="80" rx="40" ry="22" fill="#ffffff"/><path d="M20 76q-10-4-12 6" fill="none" stroke-width="3"/>'
    '<path d="M84 42q-4-18 6-26M100 42q4-18-4-28" fill="none" stroke="#c98a55" stroke-width="6"/>'
    '<ellipse cx="92" cy="54" rx="18" ry="20" fill="#ffffff"/><path d="M74 48q-10-2-12 6 8 2 12-2M110 48q10-2 12 6-8 2-12-2" fill="#ffffff" stroke-width="3"/>'
    '<path d="M92 74q-4 10 0 14 4-4 0-14Z" fill="#ffffff" stroke-width="3"/>'
    + eye(85, 52) + eye(99, 52) + cheek(80, 62) + cheek(104, 62) + smile(92, 64, 6))
pictures[A + "frog"] = svg(
    '<ellipse cx="64" cy="82" rx="44" ry="30" fill="#8fe3a8"/><circle cx="42" cy="44" r="16" fill="#8fe3a8"/><circle cx="86" cy="44" r="16" fill="#8fe3a8"/>'
    '<circle cx="42" cy="44" r="7" fill="#fff" stroke-width="2"/><circle cx="86" cy="44" r="7" fill="#fff" stroke-width="2"/>'
    '<circle cx="43" cy="45" r="3.5" fill="#4b2e22" stroke="none"/><circle cx="87" cy="45" r="3.5" fill="#4b2e22" stroke="none"/>'
    '<path d="M44 78q20 16 40 0" fill="none" stroke-width="3"/>' + cheek(36, 76) + cheek(92, 76)
    + '<path d="M22 104q-10 8-6 12h24M106 104q10 8 6 12H88" fill="#8fe3a8" stroke-width="3"/>')
pictures[A + "lizard"] = svg(
    limb("M64 108C62 120 76 122 80 114 82 108 76 106 74 110", "#8fe3a8", 9)
    + limb("M64 74C64 90 66 98 64 108", "#8fe3a8", 15)
    + "".join(limb(leg, "#8fe3a8", 10) for leg in ([(54, 42), (40, 42), (34, 30)], [(74, 42), (88, 42), (94, 30)],
                                                  [(54, 70), (40, 72), (36, 84)], [(74, 70), (88, 72), (92, 84)]))
    + burst(34, 30, 4, 9, (-170, -120, -70)) + burst(94, 30, 4, 9, (-110, -60, -10))
    + burst(36, 84, 4, 9, (70, 120, 170)) + burst(92, 84, 4, 9, (10, 60, 110))
    + "".join(f'<circle cx="{fx}" cy="{fy}" r="4.5" fill="#8fe3a8" stroke-width="3"/>' for fx, fy in ((34, 30), (94, 30), (36, 84), (92, 84)))
    + '<ellipse cx="64" cy="56" rx="14" ry="26" fill="#8fe3a8"/>'
    '<g fill="#6cc28a" stroke="none"><circle cx="60" cy="50" r="3"/><circle cx="69" cy="60" r="3"/><circle cx="60" cy="70" r="2.5"/><circle cx="68" cy="44" r="2.5"/></g>'
    '<ellipse cx="64" cy="24" rx="16" ry="14" fill="#8fe3a8"/>'
    + eye(57, 22) + eye(71, 22) + cheek(51, 30, .7) + cheek(77, 30, .7) + smile(64, 30, 6))
pictures[A + "pet"] = svg(
    '<ellipse cx="64" cy="82" rx="26" ry="22" fill="#ffb3d1"/>'
    '<ellipse cx="34" cy="54" rx="10" ry="13" fill="#ffb3d1"/><ellipse cx="52" cy="36" rx="10" ry="13" fill="#ffb3d1"/>'
    '<ellipse cx="76" cy="36" rx="10" ry="13" fill="#ffb3d1"/><ellipse cx="94" cy="54" rx="10" ry="13" fill="#ffb3d1"/>'
    '<path d="M54 76q10-8 20 0-4 10-10 12-6-2-10-12Z" fill="#ff8fae" stroke="none"/>')
pictures[A + "giraffe"] = svg(
    "".join(limb([(lx, 80), (lx, 116)], "#ffd45e", 11) + f'<path d="M{lx - 5} 116h10v6h-10Z" fill="#8b5a3c" stroke-width="3"/>' for lx in (38, 50, 72, 84))
    + '<path d="M31 70l-8 22" stroke-width="3"/><path d="M23 90l-4 8 8-3Z" fill="#8b5a3c" stroke-width="2.5"/>'
    + limb([(72, 64), (84, 28)], "#c98a55", 10)
    + '<ellipse cx="60" cy="74" rx="30" ry="14" fill="#ffd45e"/>'
    '<path d="M75 68L87 28h14L93 74Z" fill="#ffd45e"/>'
    '<path d="M92 16l-2-10M103 16l2-10" stroke-width="4"/><circle cx="90" cy="6" r="3.5" fill="#c98a55" stroke-width="3"/><circle cx="105" cy="6" r="3.5" fill="#c98a55" stroke-width="3"/>'
    '<path d="M86 20q-10-5-13 2 7 4 13 2Z" fill="#ffd45e" stroke-width="3"/>'
    '<ellipse cx="98" cy="24" rx="15" ry="11" fill="#ffd45e"/><ellipse cx="109" cy="28" rx="8" ry="6.5" fill="#ffe9a0" stroke-width="3"/>'
    '<g fill="#e0954e" stroke="none"><ellipse cx="44" cy="70" rx="5" ry="4"/><ellipse cx="58" cy="77" rx="5.5" ry="4"/><ellipse cx="73" cy="72" rx="4" ry="3.5"/>'
    '<ellipse cx="40" cy="80" rx="3.5" ry="3"/><ellipse cx="56" cy="66" rx="3.5" ry="3"/><ellipse cx="86" cy="52" rx="3" ry="4"/><ellipse cx="84" cy="64" rx="3" ry="3.5"/><ellipse cx="90" cy="40" rx="2.5" ry="3"/></g>'
    '<circle cx="111" cy="26" r="1.4" fill="#4b2e22" stroke="none"/><path d="M106 31q3 2 6 0" fill="none" stroke-width="2.2"/>'
    + eye(97, 21, .85) + cheek(93, 29, .7))
pictures[A + "hippo"] = svg(
    '<ellipse cx="64" cy="82" rx="46" ry="32" fill="#b9a8e0"/><ellipse cx="64" cy="52" rx="34" ry="24" fill="#b9a8e0"/>'
    '<ellipse cx="64" cy="66" rx="28" ry="16" fill="#cfc2ef"/><circle cx="56" cy="64" r="3" fill="#4b2e22" stroke="none"/><circle cx="72" cy="64" r="3" fill="#4b2e22" stroke="none"/>'
    '<circle cx="38" cy="32" r="7" fill="#b9a8e0"/><circle cx="90" cy="32" r="7" fill="#b9a8e0"/>' + eye(50, 42) + eye(78, 42) + cheek(40, 54) + cheek(88, 54))
pictures[A + "snake"] = svg(
    '<path d="M18 108q-6-20 18-22h50q20 0 20-14t-20-14H48q-20 0-20-16t20-18h40" fill="none" stroke-width="20"/>'
    '<path d="M18 108q-6-20 18-22h50q20 0 20-14t-20-14H48q-20 0-20-16t20-18h40" fill="none" stroke="#8fe3a8" stroke-width="13"/>'
    '<ellipse cx="96" cy="24" rx="14" ry="11" fill="#8fe3a8"/><path d="M110 26l8 2-6 4" fill="none" stroke="#ff6f6f" stroke-width="2.5"/>' + eye(98, 21, 0.8))
pictures[A + "crocodile"] = svg(
    "".join(f'<rect x="{lx}" y="82" width="12" height="22" rx="5" fill="#7fcf86"/>' for lx in (30, 46, 66, 80))
    + '<path d="M32 72Q12 72 4 54q0 28 28 34Z" fill="#8fd18f"/>'
    '<ellipse cx="56" cy="78" rx="30" ry="16" fill="#8fd18f"/>'
    '<path d="M34 86q22 10 46 0" fill="none" stroke="#d8f5c8" stroke-width="5"/>'
    + "".join(f'<path d="M{sx} 65l5-8 5 8Z" fill="#6cc28a" stroke-width="3"/>' for sx in (32, 42, 52, 62))
    + '<path d="M74 74h36q8 0 8 6-2 6-14 6H78Z" fill="#a8e0a0"/>'
    '<path d="M72 62q2-10 14-10l26 4q10 2 10 10 0 6-8 6l-40 2Z" fill="#8fd18f"/>'
    + "".join(f'<path d="M{tx} 72l3 5 3-5Z" fill="#ffffff" stroke-width="2"/>' for tx in (84, 94, 104))
    + '<circle cx="86" cy="50" r="9" fill="#8fd18f"/><circle cx="116" cy="57" r="3.5" fill="#8fd18f" stroke-width="3"/>'
    + eye(86, 49, .9) + cheek(98, 64, .8))
pictures[A + "dolphin"] = svg(
    '<path d="M34 94Q20 90 12 98q12 6 22 6 2 8 10 14 4-12-2-20Z" fill="#a3b8d9"/>'
    '<path d="M64 46Q66 28 82 24q-6 10-2 18Z" fill="#a3b8d9"/>'
    '<path d="M30 96Q34 46 80 40q20-2 30 10 4 4 12 6 2 6-6 6-12 2-24 2-36 2-50 36Z" fill="#a3b8d9"/>'
    '<path d="M46 90Q60 70 96 64" fill="none" stroke="#e6f4fc" stroke-width="5"/>'
    '<path d="M84 63q-2 13-12 17 0-10 2-16Z" fill="#8ea6cc"/>'
    '<path d="M108 59q5 1 9-1" fill="none" stroke-width="2.5"/>' + eye(100, 50) + cheek(96, 57)
    + '<path d="M-2 116q15-8 30 0t30 0 30 0 30 0 30 0v14H-2Z" fill="#8cc8f2"/>'
    '<circle cx="22" cy="104" r="3" fill="#cfe9ff" stroke-width="2.5"/><circle cx="52" cy="102" r="2.5" fill="#cfe9ff" stroke-width="2.5"/>')
pictures[A + "dragonfly"] = svg(
    '<g transform="rotate(-20 64 64)">'
    '<g fill="#e6f4fc" stroke-width="3"><ellipse cx="36" cy="42" rx="28" ry="10" transform="rotate(-8 36 42)"/><ellipse cx="92" cy="42" rx="28" ry="10" transform="rotate(8 92 42)"/>'
    '<ellipse cx="38" cy="58" rx="24" ry="9" transform="rotate(12 38 58)"/><ellipse cx="90" cy="58" rx="24" ry="9" transform="rotate(-12 90 58)"/></g>'
    '<path d="M14 44q20-6 44-2M70 42q24-4 44 2M18 54q18 4 38 6M72 60q20-2 38-6" fill="none" stroke="#8cc8f2" stroke-width="2"/>'
    '<path d="M58 52q-2 36 4 62 2 5 4 0 6-26 4-62Z" fill="#6fd3d0"/>'
    '<path d="M59 66h10M59 78h10M60 90h8M61 102h6" stroke-width="2.5"/>'
    '<ellipse cx="64" cy="48" rx="11" ry="10" fill="#4fbfbf"/>'
    '<circle cx="64" cy="30" r="13" fill="#6fd3d0"/>'
    '<circle cx="55" cy="24" r="8" fill="#a6ece8" stroke-width="3"/><circle cx="73" cy="24" r="8" fill="#a6ece8" stroke-width="3"/>'
    + eye(55, 24) + eye(73, 24) + cheek(52, 34, .7) + cheek(76, 34, .7) + smile(64, 35, 6) + '</g>')

# ---------- Letter Jumble for Starters: food ----------
F = "food/"
# A whole coconut and half of one, white inside.
pictures[F + "coconut"] = svg(
    '<circle cx="46" cy="56" r="34" fill="#8b5a3c"/>'
    '<path d="M22 40q8-10 18-12M20 62q4 14 14 20M60 30q10 4 14 14" fill="none" stroke="#6b4228" stroke-width="3"/>'
    '<g fill="#5a3620" stroke="none"><circle cx="40" cy="30" r="2.6"/><circle cx="48" cy="28" r="2.6"/><circle cx="44" cy="35" r="2.6"/></g>'
    '<path d="M54 82q0 36 32 36t32-36Z" fill="#8b5a3c"/>'
    '<path d="M64 98q8 8 20 10M100 104q8-6 12-14" fill="none" stroke="#6b4228" stroke-width="3"/>'
    '<ellipse cx="86" cy="82" rx="32" ry="12" fill="#ffffff"/><ellipse cx="86" cy="82" rx="23" ry="7.5" fill="#fff6e0" stroke-width="2.5"/>')
pictures[F + "kiwi"] = svg(
    '<ellipse cx="44" cy="70" rx="30" ry="34" fill="#a46a3c"/>'
    '<circle cx="80" cy="66" r="34" fill="#8fd36f"/><circle cx="80" cy="66" r="24" fill="#c8f0a0" stroke="none"/><ellipse cx="80" cy="66" rx="8" ry="6" fill="#fff6e0" stroke="none"/>'
    + "".join(f'<circle cx="{80 + 15 * math.cos(a):.1f}" cy="{66 + 15 * math.sin(a):.1f}" r="2" fill="#4b2e22" stroke="none"/>' for a in [i * math.pi / 5 for i in range(10)]))
pictures[F + "carrot"] = svg(
    '<path d="M64 120 38 50q8-12 26-12t26 12Z" fill="#ffa552"/><path d="M48 66h10M54 84h10M60 100h6" stroke-width="3"/>'
    '<path d="M64 38q-16-20-8-30 8 6 8 18 2-14 14-18 4 12-8 26" fill="#8fe3a8" stroke-width="3"/>')
pictures[F + "onion"] = svg(
    '<path d="M64 26q-30 26-30 52a30 30 0 0 0 60 0q0-26-30-52Z" fill="#d9a7e8"/>'
    '<path d="M64 30q-12 30 0 74M64 30q12 30 0 74" fill="none" stroke="#b77fcf" stroke-width="3"/>'
    '<path d="M60 26q-2-12 4-18M68 26q4-10 10-12" fill="none" stroke="#6fcf8f" stroke-width="4"/><path d="M54 108l-4 8M64 108v8M74 108l4 8" stroke-width="3"/>')
pictures[F + "potato"] = svg(
    '<path d="M22 70q-4-30 32-36 40-8 52 16 10 26-12 40-28 16-52 4-18-8-20-24Z" fill="#d9a066"/>'
    '<circle cx="46" cy="58" r="3" fill="#a46a3c" stroke="none"/><circle cx="76" cy="50" r="3" fill="#a46a3c" stroke="none"/><circle cx="86" cy="78" r="3" fill="#a46a3c" stroke="none"/><circle cx="52" cy="84" r="3" fill="#a46a3c" stroke="none"/>')
pictures[F + "tomato"] = svg(
    '<path d="M64 36c-30 0-46 18-46 40s20 38 46 38 46-16 46-38-16-40-46-40Z" fill="#ff6f6f"/>'
    '<path d="M64 38 50 28l8 10-18-2 18 8M64 38l14-10-8 10 18-2-18 8" fill="#6fcf8f" stroke-width="3"/><path d="M64 38V22" stroke-width="4"/>'
    '<path d="M38 60q4-10 14-12" fill="none" stroke="#ffffff" stroke-width="5"/>')
pictures[F + "bread"] = svg(
    '<path d="M20 62q-6-30 44-30t44 30q-4 8-12 8v40H32V70q-8 0-12-8Z" fill="#e8b46b"/>'
    '<path d="M38 70v40h52V70q8-2 10-8-2-18-36-18T28 62q2 6 10 8Z" fill="#fff2d6"/>'
    '<path d="M52 60q12-6 24 0" fill="none" stroke="#e8b46b" stroke-width="3"/>')
pictures[F + "burger"] = svg(
    '<path d="M18 58q0-34 46-34t46 34Z" fill="#e8b46b"/><path d="M14 60h100l-6 10H20Z" fill="#8fe3a8"/>'
    '<path d="M16 72h96v12H16Z" fill="#a46a3c"/><path d="M14 86h100l-8 8-8-6-8 6-8-6-8 6-8-6-8 6-8-6-8 6-8-6-8 6Z" fill="#ffd45e"/>'
    '<path d="M18 96h92q0 16-16 16H34q-16 0-16-16Z" fill="#e8b46b"/>'
    '<path d="M44 38h4M64 32h4M82 40h4" stroke="#fff6e0" stroke-width="4"/>')
# A roast chicken on a plate.
pictures[F + "chicken"] = svg(
    '<ellipse cx="64" cy="100" rx="56" ry="16" fill="#ffffff"/><ellipse cx="64" cy="98" rx="42" ry="10" fill="none" stroke="#d6d0e0" stroke-width="3"/>'
    + limb([(84, 60), (100, 34)], "#fff6e0", 10) + limb([(98, 70), (116, 50)], "#fff6e0", 10)
    + '<circle cx="98" cy="31" r="5" fill="#fff6e0" stroke-width="3"/><circle cx="104" cy="35" r="5" fill="#fff6e0" stroke-width="3"/>'
    '<circle cx="114" cy="46" r="5" fill="#fff6e0" stroke-width="3"/><circle cx="120" cy="51" r="5" fill="#fff6e0" stroke-width="3"/>'
    '<path d="M18 90q-4-34 34-42 40-6 56 20 8 18-12 24-14 4-34 4-38 0-44-6Z" fill="#e8a25a"/>'
    '<ellipse cx="84" cy="66" rx="12" ry="16" transform="rotate(35 84 66)" fill="#d98a45"/>'
    '<ellipse cx="100" cy="76" rx="10" ry="13" transform="rotate(40 100 76)" fill="#d98a45"/>'
    '<path d="M32 66q14-12 32-12" fill="none" stroke="#f5c27a" stroke-width="5"/>'
    '<path d="M10 96q6-10 16-6-4 10-16 6ZM114 98q-4-10-14-8 2 10 14 8Z" fill="#8fe3a8" stroke-width="3"/>')
# A milk carton with a cow on the front.
pictures[F + "milk"] = svg(
    '<path d="M78 46l20-10v74l-20 10Z" fill="#cfe9ff"/>'
    '<path d="M54 22l20-10 24 24-20 10Z" fill="#6fb3e6"/><path d="M52 24l20-10" stroke-width="7"/>'
    '<path d="M30 46h48v74H30Z" fill="#ffffff"/><path d="M30 46l24-24 24 24Z" fill="#8cc8f2"/>'
    '<path d="M30 102h48v18H30Z" fill="#8cc8f2"/>'
    f'<text x="54" y="116" text-anchor="middle" font-family="Fredoka,Arial Rounded MT Bold,Arial,sans-serif" font-size="12" font-weight="700" fill="#ffffff" stroke="none">MILK</text>'
    '<path d="M42 64l-3-7M66 64l3-7" stroke-width="3"/>'
    '<ellipse cx="41" cy="70" rx="6" ry="3.5" fill="#ffffff" stroke-width="3"/><ellipse cx="67" cy="70" rx="6" ry="3.5" fill="#ffffff" stroke-width="3"/>'
    '<ellipse cx="54" cy="76" rx="13" ry="13" fill="#ffffff"/><path d="M44 68q4-6 10-4-2 8-10 10Z" fill="#4b2e22" stroke="none"/>'
    '<ellipse cx="54" cy="86" rx="10" ry="6" fill="#ffb3c6"/><circle cx="50" cy="86" r="1.6" fill="#4b2e22" stroke="none"/><circle cx="58" cy="86" r="1.6" fill="#4b2e22" stroke="none"/>'
    + eye(49, 75, .7) + eye(59, 75, .7))
pictures[F + "chocolate"] = svg(
    '<path d="M30 16h62v96H30Z" fill="#8b5a3c"/>'
    + "".join(f'<path d="M{36 + c * 26} {22 + r * 22}h20v16H{36 + c * 26}Z" fill="#a46a3c" stroke-width="3"/>' for c in range(2) for r in range(4))
    + '<path d="M26 68h70v48H26Z" fill="#ff8fa3"/><path d="M26 68l12 8 12-8 12 8 12-8 12 8 10-8" fill="none" stroke-width="3"/>')
pictures[F + "fries"] = svg(
    "".join(f'<path d="M{x} 70V{y}h10v{70 - y}" fill="#ffd45e"/>' for x, y in [(34, 26), (46, 18), (58, 22), (70, 14), (82, 24)])
    + '<path d="M26 56h76l-10 58H36Z" fill="#ff6f6f"/><path d="M30 72h68" stroke="#ffffff" stroke-width="5"/><path d="M58 84l6 8 6-8" fill="none" stroke="#ffe27a" stroke-width="4"/>')
pictures[F + "ice-cream"] = svg(
    '<path d="M42 64 64 120l22-56Z" fill="#e8b46b"/><path d="M48 76l30 0M52 88h22M56 100h14" stroke="#c98a55" stroke-width="3"/>'
    '<path d="M38 66q-10-4-6-16 2-10 14-8-2-18 18-20 18 0 20 18 14-2 14 10 0 12-12 16Z" fill="#ffb3d1"/>'
    '<path d="M64 22q4-10 12-8" fill="none" stroke-width="3"/><circle cx="78" cy="14" r="6" fill="#ff6f6f" stroke-width="3"/>')
pictures[F + "pie"] = svg(
    '<path d="M12 74h104l-12 28H24Z" fill="#e8b46b"/><path d="M14 74q0-32 50-32t50 32Z" fill="#f3c98a"/>'
    '<path d="M36 52l10 18M64 46v24M92 52l-10 18" stroke="#c98a55" stroke-width="4"/>'
    '<path d="M12 74q6 6 13 0t13 0 13 0 13 0 13 0 13 0 13 0 13 0" fill="none" stroke-width="3"/>')
pictures[F + "drink"] = svg(
    '<path d="M36 34h56l-8 80H44Z" fill="#ffb3d1"/><path d="M38 52h52" stroke="#ffffff" stroke-width="4"/>'
    '<path d="M68 34l10-24h14" fill="none" stroke-width="5"/><path d="M68 34l10-24h14" fill="none" stroke="#8cc8f2" stroke-width="2.5"/>'
    '<path d="M32 30h64v8H32Z" fill="#ffffff"/>')
pictures[F + "fruit-juice"] = svg(
    '<path d="M34 34h52v80H34Z" fill="#ffd45e"/><path d="M34 34l10-12h36l6 12" fill="#ffe27a"/>'
    '<path d="M70 22V6l12-4" fill="none" stroke-width="4"/>'
    '<circle cx="60" cy="74" r="16" fill="#ffa552"/><path d="M60 58v32M44 74h32M49 63l22 22M71 63 49 85" stroke="#ffd45e" stroke-width="2"/>'
    '<path d="M58 56q4-8 12-6" fill="#8fe3a8" stroke-width="2.5"/>')
pictures[F + "lemonade"] = svg(
    '<path d="M30 30h60l-8 84H38Z" fill="#fff6a8"/><path d="M34 62h52" stroke="#ffffff" stroke-width="3"/>'
    '<circle cx="48" cy="80" r="6" fill="#ffffff" stroke-width="2"/><circle cx="66" cy="94" r="5" fill="#ffffff" stroke-width="2"/>'
    '<path d="M70 30a18 18 0 1 1 30 0Z" fill="#ffe27a"/><path d="M78 30a8 8 0 1 1 14 0" fill="none" stroke="#f2c94c" stroke-width="3"/>'
    '<path d="M52 30l-6-22" stroke-width="5"/><path d="M52 30l-6-22" stroke="#ff8fa3" stroke-width="2"/>')


# ---------- Letter Jumble for Starters: body, clothes, people and home ----------
ST = "starters/"


def person(x, y, s=1.0, hair="#8b5a3c", shirt="#8cc8f2", style="short", extra=""):
    """A head-and-shoulders person with the head's centre at (x, y), `s` times the usual size.
    Drawn around (0, 0) and moved into place, so every part scales together. `extra` is drawn on
    top in the picture's own coordinates (e.g. glasses or a crown)."""
    hairs = {
        "short": '<path d="M-23 0q-2-27 23-27 25 0 23 27-6-14-23-14-17 0-23 14Z" fill="HAIR"/>',
        "long": '<path d="M-23 0q-2-27 23-27 25 0 23 27-6-14-23-14-17 0-23 14Z" fill="HAIR"/>',
        "bun": '<circle cx="0" cy="-27" r="9" fill="HAIR"/><path d="M-23 0q-2-27 23-27 25 0 23 27-6-14-23-14-17 0-23 14Z" fill="HAIR"/>',
        "bald": '<path d="M-22 4q-3-10 3-14M22 4q3-10-3-14" fill="none" stroke="HAIR" stroke-width="5"/>',
        "baby": '<path d="M0-22q5-6 0-11" fill="none" stroke-width="3"/>',
        "pigtails": '<circle cx="-25" cy="-4" r="8" fill="HAIR"/><circle cx="25" cy="-4" r="8" fill="HAIR"/>'
                    '<path d="M-23 0q-2-27 23-27 25 0 23 27-6-14-23-14-17 0-23 14Z" fill="HAIR"/>',
    }
    behind = '<path d="M-26 24q-6-18-2-30h56q4 12-2 30Z" fill="HAIR"/>' if style == "long" else ""
    body = (behind + f'<path d="M-30 46q0-28 30-28t30 28Z" fill="{shirt}"/>'
            f'<circle cx="0" cy="0" r="22" fill="{SKIN}"/>' + hairs[style]
            + eye(-8, 2) + eye(8, 2) + cheek(-13, 9) + cheek(13, 9) + smile(0, 11, 6)).replace("HAIR", hair)
    return f'<g transform="translate({x} {y}) scale({s})">{body}</g>' + extra


def glasses(x, y, s=1.0):
    return (f'<circle cx="{x - 8 * s:.1f}" cy="{y + 2 * s:.1f}" r="{6 * s:.1f}" fill="none" stroke-width="{2.5 * s:.1f}"/>'
            f'<circle cx="{x + 8 * s:.1f}" cy="{y + 2 * s:.1f}" r="{6 * s:.1f}" fill="none" stroke-width="{2.5 * s:.1f}"/>'
            f'<path d="M{x - 2 * s:.1f} {y + 2 * s:.1f}h{4 * s:.1f}" stroke-width="{2.5 * s:.1f}"/>')


# People
pictures[ST + "mother"] = svg(person(64, 54, 1.4, "#8b5a3c", "#ff8fb7", "long"))
pictures[ST + "father"] = svg(person(64, 54, 1.4, "#4b2e22", "#8cc8f2", "short"))
pictures[ST + "grandma"] = svg(person(64, 54, 1.4, "#d6d0e0", "#c9b6f5", "bun", glasses(64, 54, 1.4)))
pictures[ST + "grandpa"] = svg(person(64, 54, 1.4, "#d6d0e0", "#8fe3a8", "bald", glasses(64, 54, 1.4)
                                      + '<path d="M50 74q14 8 28 0" fill="none" stroke="#d6d0e0" stroke-width="5"/>'))
pictures[ST + "boy"] = svg(person(64, 58, 1.25, "#c98a55", "#8fe3a8", "short"))
pictures[ST + "girl"] = svg(person(64, 58, 1.25, "#a46a3c", "#ffb3d1", "pigtails"))
pictures[ST + "child"] = svg(person(64, 60, 1.15, "#e8b46b", "#ffe27a", "short"))
pictures[ST + "baby"] = svg(
    '<ellipse cx="64" cy="98" rx="34" ry="22" fill="#cfe9ff"/>' + person(64, 60, 1.25, "#e8b46b", "#cfe9ff", "baby")
    + '<circle cx="64" cy="82" r="6" fill="#ff8fb7" stroke-width="2.5"/>')
pictures[ST + "man"] = svg(person(64, 54, 1.4, "#7a4e2b", "#6fb3e6", "short"))
pictures[ST + "woman"] = svg(person(64, 54, 1.4, "#e8b46b", "#b79cf2", "long"))
pictures[ST + "person"] = svg(person(64, 54, 1.4, "#a46a3c", "#ffd45e", "short"))


# The Food and drinks topic's icon: a burger and a drink with a straw.
pictures["../icons/starters-food-and-drinks"] = svg(
    limb([(98, 34), (106, 10), (116, 10)], "#ff8fa3", 9)
    + '<path d="M76 40h42l-6 76H82Z" fill="#ffb3d1"/><path d="M79 70h36" stroke="#ffffff" stroke-width="6"/>'
    '<rect x="72" y="32" width="50" height="10" rx="4" fill="#ffffff"/>'
    '<path d="M12 72q0-30 34-30t34 30Z" fill="#f2b766"/>'
    '<path d="M32 54l3-2M46 50l3 1M58 56l3-1M40 62l3-1" stroke="#fff6e0" stroke-width="3"/>'
    '<path d="M10 76q5-7 11 0t11 0 11 0 11 0 11 0 11 0v6H10Z" fill="#8fe3a8"/>'
    '<rect x="10" y="82" width="72" height="12" rx="6" fill="#8b5a3c"/>'
    '<path d="M14 82h64l-8 8-8-8-8 8-8-8-8 8-8-8-8 8Z" fill="#ffd45e" stroke-width="3"/>'
    '<path d="M12 96h68q0 16-14 16H26q-14 0-14-16Z" fill="#f2b766"/>')


HM = "home/"
# A table with a friendly face on its front.
pictures[HM + "table"] = svg(
    '<path d="M26 72h10v42H26ZM92 72h10v42H92Z" fill="#c98a55"/>'
    '<path d="M20 58h88v18H20Z" fill="#c98a55"/>'
    '<rect x="10" y="46" width="108" height="14" rx="5" fill="#d9a066"/>'
    + eye(56, 66, .8) + eye(72, 66, .8) + cheek(49, 71, .7) + cheek(79, 71, .7) + smile(64, 71, 6))


CL = "clothes/"


def trainer(x, y, colour, dark):
    """A trainer facing right, its heel at (x, y)."""
    return (f'<g transform="translate({x} {y})">'
            f'<path d="M0 0V-30q0-6 6-6h20q6 0 9 6l8 12q6 6 18 8l16 4q14 4 15 6Z" fill="{colour}"/>'
            f'<path d="M5-31q10 8 24 0" fill="{dark}" stroke-width="3"/>'
            '<path d="M8-14q20 6 40-2" fill="none" stroke="#ffffff" stroke-width="4"/>'
            '<path d="M34-24l7-4M39-17l8-4M45-11l8-4" stroke="#ffffff" stroke-width="3"/>'
            f'<path d="M70-7q12 1 20 6" fill="none" stroke="{dark}" stroke-width="3"/>'
            '<path d="M-2 0h96q6 0 6 6v2q0 6-6 6H4q-6 0-6-6Z" fill="#ffffff"/></g>')


pictures[CL + "shoes"] = svg(trainer(24, 68, "#ff8fb7", "#e8679a") + trainer(10, 102, "#ff8fb7", "#e8679a"))

pictures[ST + "parents"] = svg(person(42, 58, 1.0, "#8b5a3c", "#ff8fb7", "long") + person(86, 58, 1.0, "#4b2e22", "#8cc8f2", "short"))
pictures[ST + "men"] = svg(person(42, 58, 1.0, "#7a4e2b", "#6fb3e6", "short") + person(86, 58, 1.0, "#4b2e22", "#8fe3a8", "short"))
pictures[ST + "women"] = svg(person(42, 58, 1.0, "#e8b46b", "#b79cf2", "long") + person(86, 58, 1.0, "#8b5a3c", "#ff8fb7", "bun"))
pictures[ST + "children"] = svg(person(42, 64, 0.9, "#c98a55", "#8fe3a8", "short") + person(86, 64, 0.9, "#a46a3c", "#ffb3d1", "pigtails"))
pictures[ST + "friend"] = svg(person(40, 62, 0.95, "#e8b46b", "#ffe27a", "short") + person(88, 62, 0.95, "#a46a3c", "#ffb3d1", "long")
                              + '<path d="M58 106q6-8 12 0" fill="none" stroke-width="3"/>'
                              + '<path d="M64 24c-6-8-16-4-12 4l12 10 12-10c4-8-6-12-12-4Z" fill="#ff8fae" stroke-width="2.5"/>')
pictures[ST + "people"] = svg(person(30, 66, 0.8, "#c98a55", "#8fe3a8", "short") + person(98, 66, 0.8, "#4b2e22", "#ffd45e", "short")
                              + person(64, 58, 0.9, "#a46a3c", "#ffb3d1", "long"))
pictures[ST + "family"] = svg(person(30, 54, 0.85, "#4b2e22", "#8cc8f2", "short") + person(98, 54, 0.85, "#8b5a3c", "#ff8fb7", "long")
                              + person(64, 76, 0.7, "#a46a3c", "#ffe27a", "pigtails"))
pictures[ST + "brother"] = svg(person(64, 58, 1.25, "#7a4e2b", "#ffa552", "short"))
pictures[ST + "sister"] = svg(person(64, 58, 1.25, "#c98a55", "#c9b6f5", "long"))

# Body
pictures[ST + "face"] = svg(
    f'<circle cx="64" cy="64" r="46" fill="{SKIN}"/><path d="M18 58q0-42 46-42t46 42q-14-22-46-22T18 58Z" fill="#8b5a3c"/>'
    + eye(48, 66, 1.6) + eye(80, 66, 1.6) + cheek(38, 80, 1.6) + cheek(90, 80, 1.6) + smile(64, 86, 14))
# A child with long hair, the arrow pointing at it.
pictures[ST + "hair"] = svg(person(64, 74, 1.5, "#a46a3c", "#8fe3a8", "long")
                            + '<path d="M46 40q10-8 18-8M72 34q10 2 16 10" fill="none" stroke="#c98a55" stroke-width="3"/>' + down_arrow(64))
pictures[ST + "eye"] = svg(
    '<path d="M10 64q54-56 108 0-54 56-108 0Z" fill="#ffffff"/><circle cx="64" cy="64" r="22" fill="#8cc8f2"/><circle cx="64" cy="64" r="11" fill="#4b2e22" stroke="none"/>'
    '<circle cx="58" cy="58" r="5" fill="#ffffff" stroke="none"/><path d="M24 40l-8-10M44 28l-4-12M64 24V12M84 28l4-12M104 40l8-10" stroke-width="4"/>')
# A child's face, the arrow pointing at an ear.
pictures[ST + "ear"] = svg(
    person(54, 60, 1.5, "#a46a3c", "#8fe3a8", "short")
    + f'<ellipse cx="20" cy="74" rx="8" ry="11" fill="{SKIN}"/><ellipse cx="88" cy="74" rx="8" ry="11" fill="{SKIN}"/>'
    '<path d="M18 69q-3 5 0 10M90 69q3 5 0 10" fill="none" stroke="#f2b8a0" stroke-width="3"/>'
    '<path d="M126 66h-14v-8L98 74l14 14v-8h14Z" fill="#ff6f6f" stroke-width="3"/>')
pictures[ST + "nose"] = svg(
    f'<circle cx="64" cy="64" r="50" fill="{SKIN}" stroke="none"/><path d="M64 24q-6 30-22 48-8 12 4 20 10 6 18-2 8 8 18 2 12-8 4-20-16-18-22-48Z" fill="#ffd6b8"/>'
    '<ellipse cx="54" cy="84" rx="4" ry="3" fill="#4b2e22" stroke="none"/><ellipse cx="74" cy="84" rx="4" ry="3" fill="#4b2e22" stroke="none"/>')
# A child with a big open smile, the arrow pointing at the mouth.
pictures[ST + "mouth"] = svg(
    person(50, 58, 1.5, "#8b5a3c", "#ffd45e", "short").replace(
        smile(0, 11, 6), '<path d="M-8 9q8 11 16 0Z" fill="#ff8fa3" stroke-width="2.5"/><path d="M-6 10h12" stroke="#ffffff" stroke-width="2.2"/>')
    + '<path d="M126 66H90v-8L68 74l22 16v-8h36Z" fill="#ff6f6f" stroke-width="3"/>')
pictures[ST + "arm"] = svg(
    f'<path d="M26 62Q50 40 72 56q6 4 8-4l2-18 22-4 2 50q0 20-18 20L26 96Z" fill="{SKIN}"/>'
    '<path d="M80 62q-4 8 2 14" fill="none" stroke="#f2b8a0" stroke-width="3"/>'
    # A fist: knuckles on top, the thumb wrapped across the front.
    f'<path d="M78 40V22q0-8 7-9 3-6 9-2 4-5 9 0 7 0 8 8l1 21Z" fill="{SKIN}"/>'
    '<path d="M90 13v8M100 13v8" stroke-width="2.5"/>'
    + limb([(80, 28), (98, 28)], SKIN, 12)
    + '<path d="M2 50l30 2q8 22 0 50L2 104Z" fill="#8cc8f2"/>' + sparkle(110, 66, 7) + sparkle(50, 28, 6, "#ffb3d9"))
# A whole child inside a dashed outline, with an arrow pointing at them.
pictures[ST + "body"] = svg(
    '<rect x="24" y="8" width="72" height="114" rx="34" fill="#fff0f4" stroke="#ff6f6f" stroke-width="3" stroke-dasharray="7 7"/>'
    + kid(60, 30, 1.05, arms=[[(-11, 17), (-20, 38)], [(11, 17), (20, 38)]], shirt="#8cc8f2")
    + '<path d="M126 58h-14v-8L98 64l14 14v-8h14Z" fill="#ff6f6f" stroke-width="3"/>')
# A bare foot from the side, toes to the right.
# A sitting cat, the arrow pointing at its curly tail.
pictures[ST + "tail"] = svg(
    limb("M78 96C106 96 110 72 102 58 96 46 104 36 110 40", "#ffb86b", 13)
    + '<path d="M101 64l7-3M101 52l7 1" stroke="#e8894a" stroke-width="3"/>'
    '<ellipse cx="72" cy="94" rx="15" ry="15" fill="#ffb86b"/><ellipse cx="52" cy="88" rx="28" ry="24" fill="#ffb86b"/>'
    '<path d="M60 76q6 4 4 12M70 82q4 4 2 10" fill="none" stroke="#e8894a" stroke-width="3"/>'
    '<rect x="32" y="94" width="10" height="20" rx="5" fill="#ffb86b"/><rect x="46" y="96" width="10" height="18" rx="5" fill="#ffb86b"/>'
    '<ellipse cx="78" cy="110" rx="10" ry="5" fill="#ffb86b"/>'
    '<path d="M16 46l2-22 15 13ZM40 37l12-15 5 21Z" fill="#ffb86b"/><path d="M20 40l1-9 6 5ZM44 36l5-7 2 9Z" fill="#ffb3c6" stroke="none"/>'
    '<circle cx="35" cy="54" r="20" fill="#ffb86b"/>'
    '<path d="M26 40q4 4 2 8M36 36v8" fill="none" stroke="#e8894a" stroke-width="3"/>'
    + eye(28, 54, .9) + eye(42, 54, .9) + cheek(23, 62, .7) + cheek(47, 62, .7)
    + '<path d="M33 60l2 2 2-2Z" fill="#ff8fae" stroke-width="2"/>' + smile(35, 64, 5) + down_arrow(110))
pictures[ST + "foot"] = svg(
    f'<path d="M32 10v68q-4 28 16 28h58q14 0 14-12 0-8-10-10L82 82q-20-6-24-24l-2-48Z" fill="{SKIN}"/>'
    + "".join(f'<circle cx="{tx}" cy="{ty}" r="{tr}" fill="{SKIN}" stroke-width="3"/>' for tx, ty, tr in ((86, 82, 4.5), (94, 84, 5), (102, 86, 5.5)))
    + f'<ellipse cx="112" cy="93" rx="9" ry="8" fill="{SKIN}"/><ellipse cx="116" cy="91" rx="3.5" ry="3" fill="#ffffff" stroke-width="2"/>'
    '<path d="M48 76q4-4 8 0M64 98q14 2 28 0" fill="none" stroke="#f2b8a0" stroke-width="3"/>'
    '<path d="M28-4h32l-2 26H30Z" fill="#8cc8f2"/><path d="M30 18h28" stroke="#ffffff" stroke-width="3"/>')
pictures[ST + "hand"] = svg(
    f'<path d="M38 112V64l-12-18q-4-10 6-12 8 0 12 10l6 12V24q0-8 8-8t8 8v34-42q0-8 8-8t8 8v42-36q0-8 8-8t8 8v38-26q0-8 8-8t8 8v52q0 30-30 30H58q-20 0-20-12Z" fill="{SKIN}"/>'
    '<path d="M58 64v24M72 62v26M86 64v24" stroke="#f2b8a0" stroke-width="3"/>')
pictures[ST + "leg"] = svg(
    f'<path d="M46 6h30v74l-2 26h28q14 0 14 12H44l2-38Z" fill="{SKIN}"/><path d="M42 6h38v34H42Z" fill="#5b6b8c"/>'
    '<path d="M54 74q6 6 16 0" fill="none" stroke="#f2b8a0" stroke-width="3"/>')

# Clothes and accessories
pictures[ST + "dress"] = svg(
    '<path d="M50 14h28l4 26 30 70H16l30-70Z" fill="#ff8fb7"/><path d="M48 40h32" stroke-width="4"/>'
    '<path d="M50 14l-8 6M78 14l8 6" fill="none" stroke-width="4"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="3.5" fill="#ffffff" stroke="none"/>' for x, y in [(40, 76), (64, 66), (86, 80), (52, 96), (78, 100)]))
# A clothes rail: a T-shirt, a dress and jeans on hangers.
def hanger(x):
    return f'<path d="M{x} 30q0-6 4-6" fill="none" stroke-width="3"/><path d="M{x - 13} 38L{x} 30l13 8" fill="none" stroke-width="3"/>'


pictures[ST + "clothes"] = svg(
    '<path d="M10 24v94M118 24v94" stroke-width="7"/><path d="M10 24v94M118 24v94" stroke="#d6d0e0" stroke-width="2.5"/>'
    '<path d="M2 118h18M110 118h18" stroke-width="6"/><path d="M6 24h116" stroke-width="7"/><path d="M6 24h116" stroke="#c98a55" stroke-width="2.5"/>'
    + hanger(31) + hanger(64) + hanger(97)
    + '<path d="M22 38h18l10 10-6 7-4-3v36H22V52l-4 3-6-7Z" fill="#8cc8f2"/><path d="M26 38q5 6 10 0" fill="none" stroke-width="3"/>'
    '<path d="M56 38h16l-2 14 14 44H44l12-44Z" fill="#ff8fb7"/><path d="M56 52h16" stroke-width="3"/>'
    '<path d="M84 38h26l2 62H100l-3-42-3 42H82Z" fill="#5b6b8c"/><path d="M84 46h26M97 46v12" stroke="#8ea6cc" stroke-width="2.5"/>')
pictures[ST + "jacket"] = svg(
    '<path d="M40 16h48l28 24-12 20-10-8v62H34V52l-10 8-12-20Z" fill="#ffa552"/>'
    '<path d="M64 20v94" stroke-width="3"/><path d="M48 16l16 22 16-22" fill="#ffe2c4"/><path d="M42 70h14M72 70h14" stroke-width="3"/>')
pictures[ST + "coat"] = svg(
    '<path d="M42 12h44l28 26-12 18-10-8v68H36V48l-10 8-12-18Z" fill="#a46a3c"/>'
    '<path d="M64 16v100" stroke-width="3"/><path d="M46 12l18 24 18-24" fill="#c98a55"/>'
    + "".join(f'<circle cx="56" cy="{y}" r="3.5" fill="#ffd45e" stroke-width="2"/><circle cx="72" cy="{y}" r="3.5" fill="#ffd45e" stroke-width="2"/>' for y in (56, 76, 96)))
pictures[ST + "jeans"] = svg(
    '<path d="M32 12h64l8 104H74L64 52l-10 64H24Z" fill="#6f8fd6"/><path d="M32 22h64" stroke-width="3"/>'
    '<path d="M44 28v14M84 28v14" stroke="#ffd45e" stroke-width="2.5"/><path d="M64 22v30" stroke-width="3"/>')
pictures[ST + "shorts"] = svg(
    '<path d="M24 26h80l10 64H76L64 54 52 90H14Z" fill="#8fe3a8"/><path d="M24 36h80" stroke-width="3"/><path d="M64 36v18" stroke-width="3"/>')
pictures[ST + "bag"] = svg(
    '<path d="M44 34q0-22 20-22t20 22" fill="none" stroke-width="6"/>'
    '<path d="M24 34h80q8 0 8 10v60q0 10-10 10H26q-10 0-10-10V44q0-10 8-10Z" fill="#ff8fa3"/>'
    '<path d="M36 64h56v30H36Z" fill="#ffb3d1"/><path d="M36 74h56" stroke-width="3"/>')
pictures[ST + "handbag"] = svg(
    '<path d="M42 50q0-30 22-30t22 30" fill="none" stroke-width="6"/>'
    '<path d="M24 50h80l-8 60H32Z" fill="#c9b6f5"/><path d="M58 66h12v10H58Z" fill="#ffd45e" stroke-width="3"/>')
pictures[ST + "glasses"] = svg(
    '<circle cx="38" cy="66" r="24" fill="#d8f0ff"/><circle cx="90" cy="66" r="24" fill="#d8f0ff"/>'
    '<path d="M62 62q2-6 4 0" fill="none" stroke-width="5"/><path d="M14 60 4 46M114 60l10-14" stroke-width="5"/>'
    '<path d="M28 56q6-6 14-6M80 56q6-6 14-6" fill="none" stroke="#ffffff" stroke-width="4"/>')
pictures[ST + "watch"] = svg(
    '<path d="M48 8h32v30H48ZM48 90h32v30H48Z" fill="#ff8fb7"/>'
    '<circle cx="64" cy="64" r="30" fill="#ffe27a"/><circle cx="64" cy="64" r="22" fill="#ffffff" stroke-width="3"/>'
    '<path d="M64 50v14l10 6" fill="none" stroke-width="4"/><path d="M94 64h6" stroke-width="5"/>')

# Home
pictures[ST + "house"] = svg(
    '<path d="M24 60h80v54H24Z" fill="#fff2bf"/><path d="M14 62 64 18l50 44Z" fill="#ff8fa3"/>'
    '<path d="M54 114V84h20v30Z" fill="#c98a55"/><path d="M32 72h16v16H32ZM80 72h16v16H80Z" fill="#cfe9ff" stroke-width="3"/>')
pictures[ST + "home"] = svg(
    '<path d="M24 60h80v54H24Z" fill="#e3d6fb"/><path d="M14 62 64 18l50 44Z" fill="#b79cf2"/>'
    '<path d="M54 114V84h20v30Z" fill="#ff8fa3"/>'
    '<path d="M64 74c-8-10-22-4-16 6l16 14 16-14c6-10-8-16-16-6Z" fill="#ff6f8f" stroke-width="2.5" transform="translate(-22 -6) scale(0.7) translate(30 20)"/>'
    '<path d="M86 70c-4-6-12-2-9 3l9 8 9-8c3-5-5-9-9-3Z" fill="#ff6f8f" stroke-width="2.5"/>'
    '<path d="M2 116h124" stroke="#8fe3a8" stroke-width="6"/>')
# A dining room: a window and a lamp, a laid table and two chairs.
pictures[ST + "dining-room"] = svg(
    '<path d="M0 0h128v104H0Z" fill="#fff6e0" stroke="none"/><path d="M-4 104h136v28H-4Z" fill="#e0b07a"/>'
    '<rect x="10" y="14" width="30" height="34" rx="3" fill="#cfe9ff"/><path d="M25 14v34M10 31h30" stroke-width="3"/>'
    '<path d="M64 0v18" stroke-width="3"/><path d="M50 30q0-12 14-12t14 12Z" fill="#ffd45e"/>'
    '<path d="M14 54v56M14 82h20M32 82v28" fill="none" stroke-width="5"/><path d="M114 54v56M114 82H94M96 82v28" fill="none" stroke-width="5"/>'
    '<path d="M30 72v38M98 72v38" stroke-width="6"/>'
    '<path d="M22 70h84v8q-7 8-14 0-7 8-14 0-7 8-14 0-7 8-14 0-7 8-14 0-7 8-14 0Z" fill="#ffb3d1"/>'
    '<ellipse cx="40" cy="68" rx="12" ry="3.5" fill="#ffffff" stroke-width="3"/><ellipse cx="88" cy="68" rx="12" ry="3.5" fill="#ffffff" stroke-width="3"/>'
    '<path d="M54 60h20q0 10-10 10t-10-10Z" fill="#ffffff" stroke-width="3"/><path d="M60 54q-2-4 0-8M68 54q-2-4 0-8" fill="none" stroke="#d6d0e0" stroke-width="2.5"/>')
pictures[ST + "garden"] = svg(
    '<path d="M4 98h120v26H4Z" fill="#9fdcbf"/>'
    + "".join(f'<path d="M{x} 100V{y}" stroke="#4fb893" stroke-width="4"/><circle cx="{x}" cy="{y - 6}" r="10" fill="{c}"/><circle cx="{x}" cy="{y - 6}" r="4" fill="#ffd45e" stroke-width="2"/>'
              for x, y, c in [(26, 56, "#ff8fa3"), (64, 44, "#b79cf2"), (102, 60, "#ffb86b")])
    + '<path d="M40 100q4-14 12-16M84 100q-4-14-12-16" fill="none" stroke="#4fb893" stroke-width="4"/>')
pictures[ST + "bed"] = svg(
    '<path d="M14 40v76M114 64v52" stroke-width="7"/><path d="M14 74h100v26H14Z" fill="#cfe9ff"/>'
    '<path d="M20 52h28v22H20Z" fill="#ffffff" stroke-width="3"/><path d="M48 66h66v18H48Z" fill="#ffb3d1"/>'
    '<path d="M14 40q0-10 10-10h4v44H14Z" fill="#c98a55"/>')
pictures[ST + "bookcase"] = svg(
    '<path d="M20 10h88v108H20Z" fill="#c98a55"/><path d="M28 18h72v28H28ZM28 54h72v28H28ZM28 90h72v20H28Z" fill="#fff2d6" stroke-width="3"/>'
    + "".join(f'<path d="M{x} {y}h{w}v{-h}h{-w}Z" fill="{c}" stroke-width="2.5"/>' for x, y, w, h, c in [(32, 46, 8, 24, "#ff8fa3"), (42, 46, 10, 20, "#8cc8f2"), (54, 46, 8, 26, "#ffd45e"), (66, 46, 12, 22, "#8fe3a8"), (32, 82, 12, 22, "#b79cf2"), (46, 82, 8, 26, "#ffb86b"), (58, 82, 10, 20, "#ff8fa3"), (82, 82, 10, 24, "#8cc8f2")]))
pictures[ST + "armchair"] = svg(
    '<path d="M28 18h72q8 0 8 10v48H20V28q0-10 8-10Z" fill="#b79cf2"/>'
    '<path d="M8 56h22v50H8ZM98 56h22v50H98Z" fill="#c9b6f5"/><path d="M30 76h68v30H30Z" fill="#d9c8ff"/>'
    '<path d="M16 106v12M112 106v12" stroke-width="6"/>')
pictures[ST + "wall"] = svg(
    "".join(f'<path d="M{x} {y}h{w}v18h{-w}Z" fill="{c}" stroke-width="3"/>' for row, y in enumerate(range(16, 116, 20))
            for x, w, c in ([(8, 36, "#ff8f6f"), (44, 36, "#ffa587"), (80, 40, "#ff8f6f")] if row % 2 == 0 else [(8, 18, "#ffa587"), (26, 36, "#ff8f6f"), (62, 36, "#ffa587"), (98, 22, "#ff8f6f")])))
pictures[ST + "picture"] = svg(
    '<path d="M64 6 40 30M64 6l24 24" fill="none" stroke-width="3"/>'
    '<path d="M14 30h100v84H14Z" fill="#e8b46b"/><path d="M24 40h80v64H24Z" fill="#cfe9ff" stroke-width="3"/>'
    '<path d="M24 104 52 70l18 18 14-14 20 30Z" fill="#8fe3a8" stroke-width="3"/><circle cx="84" cy="56" r="8" fill="#ffe27a" stroke-width="3"/>')
pictures[ST + "mirror"] = svg(
    '<ellipse cx="64" cy="54" rx="38" ry="44" fill="#ffb3d1"/><ellipse cx="64" cy="54" rx="28" ry="34" fill="#d8f0ff" stroke-width="3"/>'
    '<path d="M48 40q6-12 18-14M50 56l14-14" fill="none" stroke="#ffffff" stroke-width="5"/><path d="M56 98h16v22H56Z" fill="#ffb3d1"/>')
pictures[ST + "phone"] = svg(
    '<path d="M38 8h52q8 0 8 8v96q0 8-8 8H38q-8 0-8-8V16q0-8 8-8Z" fill="#b79cf2"/>'
    '<path d="M38 22h52v76H38Z" fill="#d8f0ff" stroke-width="3"/><circle cx="64" cy="108" r="4" fill="#ffffff" stroke-width="2"/>'
    '<path d="M46 34h14v14H46ZM68 34h14v14H68ZM46 56h14v14H46ZM68 56h14v14H68Z" fill="#ffb3d1" stroke-width="2.5"/>')
pictures[ST + "radio"] = svg(
    '<path d="M40 30 90 10" stroke-width="4"/><path d="M14 30h100q6 0 6 6v68q0 6-6 6H14q-6 0-6-6V36q0-6 6-6Z" fill="#ffa552"/>'
    '<circle cx="42" cy="70" r="22" fill="#fff2d6"/><circle cx="42" cy="70" r="12" fill="#c98a55" stroke-width="3"/>'
    '<path d="M76 50h32v14H76Z" fill="#d8f0ff" stroke-width="3"/><circle cx="82" cy="86" r="6" fill="#ffd45e" stroke-width="3"/><circle cx="102" cy="86" r="6" fill="#ffd45e" stroke-width="3"/>')


# ---------- CVC Sounds ----------
C = "cvc/"
pictures[C + "hat"] = svg(
    '<ellipse cx="64" cy="82" rx="54" ry="16" fill="#ffd45e"/><path d="M34 80q0-44 30-44t30 44Z" fill="#ffd45e"/>'
    '<path d="M36 70q28 10 56 0" fill="none" stroke="#ff8fa3" stroke-width="8"/><circle cx="92" cy="66" r="6" fill="#ff8fa3" stroke-width="3"/>')
pictures[C + "map"] = svg(
    '<path d="M10 28l36-10 36 10 36-10v82l-36 10-36-10-36 10Z" fill="#fff2bf"/><path d="M46 18v82M82 28v82" stroke-width="3"/>'
    '<path d="M18 60q16-16 30 0t32 0" fill="none" stroke="#8cc8f2" stroke-width="5"/>'
    '<path d="M86 50l14 14M100 50 86 64" stroke="#ff6f6f" stroke-width="5"/><path d="M24 88q10-8 18 0" fill="#8fe3a8" stroke-width="3"/>')
pictures[C + "cap"] = svg(
    '<path d="M58 80q30-12 60 2 8 10-4 16-30 8-58-8Z" fill="#6fb3e6"/><path d="M66 84q24-6 46 4" fill="none" stroke="#8cc8f2" stroke-width="3"/>'
    '<path d="M14 82q-4-54 48-56 46 0 50 50-48 18-98 6Z" fill="#8cc8f2"/>'
    '<path d="M62 26q-16 22-14 58M62 26q22 18 24 52" fill="none" stroke="#6fb3e6" stroke-width="3"/>'
    '<path d="M14 82q50 12 98-6" fill="none" stroke-width="4"/>'
    '<circle cx="62" cy="26" r="5" fill="#ffd45e" stroke-width="3"/>' + sparkle(68, 56, 9))
pictures[C + "jam"] = svg(
    '<path d="M32 40h64v66q0 10-10 10H42q-10 0-10-10Z" fill="#ff6f8f"/><path d="M28 26h72v16H28Z" fill="#fff2bf"/>'
    '<path d="M28 34l6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6" fill="none" stroke="#ff8fa3" stroke-width="3"/>'
    '<path d="M44 62h40v24H44Z" fill="#ffffff" stroke-width="3"/><circle cx="64" cy="74" r="6" fill="#ff6f8f" stroke="none"/><path d="M64 68q2-4 6-4" fill="none" stroke="#4fb893" stroke-width="2.5"/>')
pictures[C + "van"] = svg(
    '<path d="M10 40q0-10 10-10h64q12 0 18 10l12 22q6 4 6 12v22H10Z" fill="#ffe27a"/>'
    '<path d="M86 38h12l12 24H86Z" fill="#cfe9ff" stroke-width="3"/><path d="M22 42h22v20H22ZM50 42h26v20H50Z" fill="#cfe9ff" stroke-width="3"/>'
    '<circle cx="34" cy="98" r="12" fill="#6b5a8e"/><circle cx="92" cy="98" r="12" fill="#6b5a8e"/><circle cx="34" cy="98" r="4" fill="#ffffff" stroke-width="2"/><circle cx="92" cy="98" r="4" fill="#ffffff" stroke-width="2"/>')
pictures[C + "ten"] = svg(
    '<path d="M14 18h100v92H14Z" fill="#b79cf2"/>'
    '<text x="64" y="94" text-anchor="middle" font-family="Fredoka,Arial Rounded MT Bold,Arial,sans-serif" font-size="70" font-weight="700" fill="#ffffff" stroke="none">10</text>')
pictures[C + "pen"] = svg(
    '<path d="M86 14l28 28-62 62-28-28Z" fill="#8cc8f2"/><path d="M24 76l28 28-34 10Z" fill="#fff2bf"/><path d="M14 120l8-16 6 6Z" fill="#4b2e22"/>'
    '<path d="M76 24l28 28" stroke-width="3"/><path d="M98 30 66 62" stroke="#ffffff" stroke-width="4"/>')
pictures[C + "get"] = svg(
    "".join(f'<circle cx="{ax}" cy="92" r="10" fill="#ff6f6f"/>' for ax in (40, 62, 86))
    + '<path d="M18 94h92l-10 28H28Z" fill="#e0b07a"/><path d="M24 104h80M28 114h72" stroke="#c98a55" stroke-width="2.5"/>'
    '<path d="M46 96l-2 26M64 96v26M82 96l2 26" stroke="#c98a55" stroke-width="2.5"/>'
    '<rect x="14" y="88" width="100" height="9" rx="4" fill="#c98a55"/>'
    '<path d="M50 80v-6M64 82v-6M78 80v-6" stroke-width="3"/>'
    '<circle cx="64" cy="52" r="18" fill="#ff6f6f"/><path d="M52 58q0 6 5 9" fill="none" stroke="#ffffff" stroke-width="3"/>'
    '<path d="M50-4h28v14H50Z" fill="#8cc8f2"/>'
    + limb([(48, 18), (41, 30), (46, 40)], SKIN, 11)
    + f'<path d="M48 8h32q6 0 6 8v14H42V16q0-8 6-8Z" fill="{SKIN}"/>'
    + "".join(f'<rect x="{fx}" y="22" width="8" height="24" rx="4" fill="{SKIN}" stroke-width="3"/>' for fx in (49, 57, 65, 73)))
pictures[C + "web"] = svg(
    "".join(f'<path d="M64 64L{64 + 56 * math.cos(a):.1f} {64 + 56 * math.sin(a):.1f}" stroke-width="2.5"/>' for a in [i * math.pi / 4 for i in range(8)])
    + "".join('<path d="' + "".join(f'{"M" if i == 0 else "L"}{64 + r * math.cos(i * math.pi / 4):.1f} {64 + r * math.sin(i * math.pi / 4):.1f}' for i in range(9)) + '" fill="none" stroke-width="2.5"/>' for r in (16, 30, 44))
    + '<circle cx="86" cy="86" r="9" fill="#4b2e22"/><path d="M78 84l-8 4M78 90l-6 6M94 84l8 4M94 90l6 6" stroke-width="2.5"/>')
pictures[C + "wet"] = svg(
    '<path d="M64 20q-34 40-34 60a34 34 0 0 0 68 0q0-20-34-60Z" fill="#8cc8f2"/>'
    '<path d="M46 80q0 14 12 20" fill="none" stroke="#ffffff" stroke-width="5"/>'
    '<path d="M22 30q-8 12 0 16 8-4 0-16ZM106 40q-8 12 0 16 8-4 0-16ZM18 96q-6 10 0 13 6-3 0-13Z" fill="#cfe9ff" stroke-width="3"/>')
# A push pin, tipped over to show its point.
pictures[C + "pin"] = svg(
    '<g transform="rotate(32 64 64)">'
    '<path d="M64 84v36" stroke-width="6"/><path d="M64 84v32" stroke="#d6d0e0" stroke-width="2.5"/>'
    '<ellipse cx="64" cy="82" rx="22" ry="7" fill="#ff6f6f"/>'
    '<path d="M54 80l4-38h12l4 38Z" fill="#ff6f6f"/>'
    '<path d="M44 40V26h40v14q0 7-20 7t-20-7Z" fill="#ff6f6f"/><ellipse cx="64" cy="26" rx="20" ry="7" fill="#ff8f8f"/>'
    '<path d="M50 30v8M60 52l-2 22" stroke="#ffffff" stroke-width="3"/></g>')
pictures[C + "bin"] = svg(
    '<path d="M28 36h72l-8 78H36Z" fill="#8fe3a8"/><path d="M22 26h84v12H22Z" fill="#6fcf8f"/><path d="M52 26v-8h24v8" fill="none" stroke-width="4"/>'
    '<path d="M50 50v50M64 50v50M78 50v50" stroke="#4fb893" stroke-width="4"/>')
# A pan lid lifted off a steaming pot.
pictures[C + "lid"] = svg(
    '<path d="M22 84h84v20q0 14-14 14H36q-14 0-14-14Z" fill="#ff8f8f"/><path d="M22 84h84" stroke-width="5"/>'
    '<path d="M22 92H10M106 92h12" stroke-width="7"/>'
    '<path d="M50 78q-4-6 0-12M64 76q-4-6 0-12M78 78q-4-6 0-12" fill="none" stroke="#c9b6f5" stroke-width="3"/>'
    '<g transform="rotate(-10 64 46)"><path d="M28 54q0-24 36-24t36 24Z" fill="#d6d0e0"/>'
    '<ellipse cx="64" cy="54" rx="38" ry="5" fill="#c4bcd4"/><path d="M40 44q8-8 20-9" fill="none" stroke="#ffffff" stroke-width="3"/>'
    '<rect x="56" y="20" width="16" height="10" rx="4" fill="#8b5a3c"/></g>')
pictures[C + "win"] = svg(
    '<path d="M38 18h52v28a26 26 0 0 1-52 0Z" fill="#ffd45e"/><path d="M38 26H22q0 22 18 26M90 26h16q0 22-18 26" fill="none" stroke-width="5"/>'
    '<path d="M58 72h12v16H58Z" fill="#ffd45e"/><path d="M40 88h48v14H40Z" fill="#c98a55"/><path d="M34 102h60v12H34Z" fill="#a46a3c"/>'
    '<path d="M64 26l4 8 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1Z" fill="#ffffff" stroke-width="2"/>')
pictures[C + "zip"] = svg(
    '<path d="M24 14h80v100H24Z" fill="#8cc8f2"/><path d="M64 14v100" stroke-width="3"/>'
    + "".join(f'<path d="M58 {y}h12" stroke-width="3"/>' for y in range(20, 70, 8))
    + '<path d="M56 66h16v16H56Z" fill="#d6d0e0"/><path d="M60 82h8v24h-8Z" fill="#d6d0e0"/><circle cx="64" cy="98" r="3" fill="#ffffff" stroke-width="2"/>')
pictures[C + "pot"] = svg(
    '<path d="M20 52h88v44q0 18-18 18H38q-18 0-18-18Z" fill="#ff8f6f"/><path d="M12 52h104" stroke-width="6"/>'
    '<path d="M20 64H8M108 64h12" stroke-width="7"/><path d="M48 40q-4-8 2-14M64 40q-4-10 2-18M80 40q-4-8 2-14" fill="none" stroke="#d6d0e0" stroke-width="4"/>')
pictures[C + "cot"] = svg(
    '<path d="M14 30v86M114 30v86M14 102h100" stroke-width="6"/><path d="M14 44h100" stroke-width="5"/>'
    + "".join(f'<path d="M{x} 44v58" stroke="#c98a55" stroke-width="4"/>' for x in range(28, 114, 14))
    + '<path d="M18 80h92v20H18Z" fill="#cfe9ff"/><circle cx="40" cy="74" r="12" fill="#ffe2c4"/>' + eye(36, 74, 0.7) + eye(44, 74, 0.7)
    + '<path d="M50 80h56v14H50Z" fill="#ffb3d1"/>')
pictures[C + "top"] = svg(
    '<path d="M98 66q0-8 8-8 4-6 10-2 8 0 8 8 0 6-6 6h-14q-6 0-6-4ZM6 92q0-6 6-6 4-5 9-1 6 0 6 6 0 4-4 4H10q-4 0-4-3Z" fill="#ffffff" stroke-width="3"/>'
    '<path d="M42 58h40v68H42Z" fill="#c9b6f5"/><path d="M36 52h52v10H36Z" fill="#b79cf2"/>'
    '<path d="M56 84v-8a6 6 0 0 1 12 0v8Z" fill="#c9e6fb" stroke-width="3"/><path d="M56 104v-8a6 6 0 0 1 12 0v8Z" fill="#c9e6fb" stroke-width="3"/>'
    '<path d="M56 122v-8a6 6 0 0 1 12 0v8Z" fill="#c98a55" stroke-width="3"/>'
    '<path d="M4 122h120" stroke="#8fe3a8" stroke-width="6"/>'
    + kid(62, 13, 0.55, arms=[[(-11, 17), (-20, 2), (-22, -12)], [(11, 17), (20, 2), (22, -12)]], shirt="#ffd45e")
    + '<path d="M122 22H106v-8L90 28l16 14v-8h16Z" fill="#ff6f6f" stroke-width="3"/>')
pictures[C + "mop"] = svg(
    '<path d="M86 10 56 82" stroke-width="7"/><path d="M86 10 56 82" stroke="#c98a55" stroke-width="3"/>'
    '<path d="M40 80h34l6 10H34Z" fill="#8cc8f2"/>'
    + "".join(f'<path d="M{x} 90q-2 14 {(x - 56) / 4:.0f} 24" fill="none" stroke-width="6"/><path d="M{x} 90q-2 14 {(x - 56) / 4:.0f} 24" fill="none" stroke="#ffffff" stroke-width="3"/>' for x in (38, 48, 58, 68, 78))
    + '<path d="M14 118h100" stroke="#cfe9ff" stroke-width="5"/>')
pictures[C + "box"] = svg(
    '<path d="M18 50 64 30l46 20v50l-46 20-46-20Z" fill="#d9a066"/><path d="M18 50l46 20 46-20M64 70v50" fill="none" stroke-width="4"/>'
    '<path d="M18 50 6 34l46-18 12 14ZM110 50l12-16-46-18-12 14Z" fill="#e8b46b"/><path d="M40 82l12 5" stroke="#ffffff" stroke-width="4"/>')
pictures[C + "bus"] = svg(
    '<path d="M10 30q0-10 10-10h90q8 0 8 10v64H10Z" fill="#ffd45e"/>'
    '<path d="M18 30h20v24H18ZM44 30h20v24H44ZM70 30h20v24H70ZM96 30h16v24H96Z" fill="#cfe9ff" stroke-width="3"/>'
    '<path d="M10 68h108" stroke="#ff8fa3" stroke-width="6"/><circle cx="30" cy="96" r="12" fill="#6b5a8e"/><circle cx="96" cy="96" r="12" fill="#6b5a8e"/>'
    '<circle cx="30" cy="96" r="4" fill="#ffffff" stroke-width="2"/><circle cx="96" cy="96" r="4" fill="#ffffff" stroke-width="2"/>')
pictures[C + "bug"] = svg(
    '<path d="M38 88 22 98M38 72 18 72M40 56 26 44M90 88l16 10M90 72h20M88 56l14-12" stroke-width="4"/>'
    '<ellipse cx="64" cy="74" rx="30" ry="36" fill="#ff6f6f"/><path d="M64 40v70" stroke-width="3"/>'
    '<circle cx="50" cy="66" r="5" fill="#4b2e22" stroke="none"/><circle cx="78" cy="66" r="5" fill="#4b2e22" stroke="none"/><circle cx="52" cy="90" r="5" fill="#4b2e22" stroke="none"/><circle cx="76" cy="90" r="5" fill="#4b2e22" stroke="none"/>'
    '<circle cx="64" cy="34" r="14" fill="#4b2e22"/><path d="M58 22l-8-12M70 22l8-12" stroke-width="3"/>'
    '<circle cx="60" cy="33" r="2.5" fill="#ffffff" stroke="none"/><circle cx="68" cy="33" r="2.5" fill="#ffffff" stroke="none"/>')
pictures[C + "tub"] = svg(
    '<path d="M10 58h108v12q0 34-34 34H44q-34 0-34-34Z" fill="#ffffff"/><path d="M6 56h116" stroke-width="6"/>'
    '<path d="M30 104l-6 12M98 104l6 12" stroke-width="5"/><path d="M24 22q0-10 10-10t10 10v34" fill="none" stroke-width="5"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#cfe9ff" stroke-width="3"/>' for x, y, r in [(48, 46, 10), (66, 42, 12), (86, 48, 9), (100, 38, 6)]))
pictures[C + "nut"] = svg(
    '<path d="M64 12q-30 8-36 40-4 30 12 48 12 14 24 14t24-14q16-18 12-48-6-32-36-40Z" fill="#d9a066"/>'
    '<path d="M28 50q36-10 72 0" fill="none" stroke-width="3"/><path d="M28 50q2-34 36-38 34 4 36 38" fill="#a46a3c"/>'
    '<path d="M48 74q4 18 16 26" fill="none" stroke="#c98a55" stroke-width="3"/>')
pictures[C + "put"] = svg(
    '<path d="M18 70h92v44H18Z" fill="#d9a066"/><path d="M18 70l12-14h68l12 14" fill="#e8b46b"/>'
    '<path d="M44 14h40v30H44Z" fill="#8cc8f2"/><path d="M64 48v14M54 54l10 10 10-10" fill="none" stroke="#ff6f6f" stroke-width="5"/>')


# ---------- Consonant Digraphs ----------
D = "digraphs/"
pictures[D + "cheese"] = svg(
    '<path d="M14 70 96 30l18 40Z" fill="#ffe27a"/><path d="M14 70h100v38H14Z" fill="#ffd45e"/>'
    '<circle cx="40" cy="88" r="7" fill="#f2c94c" stroke-width="3"/><circle cx="78" cy="94" r="5" fill="#f2c94c" stroke-width="3"/><circle cx="96" cy="82" r="4" fill="#f2c94c" stroke-width="3"/><circle cx="70" cy="58" r="5" fill="#f2c94c" stroke-width="3"/>')
pictures[D + "cherry"] = svg(
    '<path d="M44 82q10-40 40-62M88 76q-4-34-4-56" fill="none" stroke="#4fb893" stroke-width="4"/>'
    '<path d="M84 20q16-10 26 4-14 8-26-4Z" fill="#8fe3a8" stroke-width="3"/>'
    '<circle cx="40" cy="90" r="22" fill="#ff4f6f"/><circle cx="88" cy="88" r="22" fill="#ff4f6f"/>'
    '<path d="M30 82q4-6 10-6M78 80q4-6 10-6" fill="none" stroke="#ffffff" stroke-width="4"/>')
pictures[D + "peach"] = svg(
    '<path d="M64 30c-30-6-48 18-44 44 4 26 26 42 44 42s40-16 44-42c4-26-14-50-44-44Z" fill="#ffb8a0"/>'
    '<path d="M64 32q-12 40 0 82" fill="none" stroke="#ff8f7a" stroke-width="4"/>'
    '<path d="M64 32q4-14 2-20M66 24q18-14 30-4-14 12-30 4Z" fill="#8fe3a8" stroke-width="3"/>')
pictures[D + "ship"] = svg(
    '<path d="M4 108q15-8 30 0t30 0 30 0 30 0v16H4Z" fill="#8cc8f2"/>'
    '<path d="M10 74h108l-16 30H26Z" fill="#ff8f6f"/><path d="M30 50h70v24H30Z" fill="#ffffff"/>'
    '<path d="M44 26h22v24H44Z" fill="#ffd45e"/><path d="M42 26h26" stroke-width="5"/>'
    '<circle cx="46" cy="62" r="5" fill="#cfe9ff" stroke-width="2.5"/><circle cx="64" cy="62" r="5" fill="#cfe9ff" stroke-width="2.5"/><circle cx="82" cy="62" r="5" fill="#cfe9ff" stroke-width="2.5"/>')
pictures[D + "shell"] = svg(
    '<path d="M64 112 20 78q-8-40 44-58 52 18 44 58Z" fill="#ffd3e6"/>'
    + "".join(f'<path d="M64 112 {x} {y}" stroke="#e8789f" stroke-width="3"/>' for x, y in [(28, 64), (40, 40), (64, 24), (88, 40), (100, 64)])
    + '<path d="M50 112h28v8H50Z" fill="#ffb3d1"/>')
pictures[D + "wish"] = svg(
    '<path d="M86 22l7 16 18 2-13 12 4 18-16-9-16 9 4-18-13-12 18-2Z" fill="#ffd45e"/>'
    '<path d="M70 56q-30 20-56 56" fill="none" stroke="#ffe27a" stroke-width="6"/><path d="M60 70q-20 20-34 40" fill="none" stroke="#fff6c8" stroke-width="4"/>'
    + sparkle(30, 30, 8, "#cfe9ff") + sparkle(108, 96, 7) + sparkle(46, 52, 5, "#ffb3d9"))
pictures[D + "brush"] = svg(
    '<path d="M18 104 92 30" stroke-width="12"/><path d="M18 104 92 30" stroke="#8cc8f2" stroke-width="7"/>'
    '<path d="M86 26l18-18 18 18-18 18Z" fill="#ffffff"/>'
    + "".join(f'<path d="M{90 + i * 5} {22 - i * 5}l10 10" stroke="#8cc8f2" stroke-width="2"/>' for i in range(4))
    + '<path d="M96 6q4-6 10-4 4 6-2 10Z" fill="#cfe9ff" stroke-width="2.5"/>')
pictures[D + "wash"] = svg(
    f'<path d="M14 100q20-10 34 0M114 100q-20-10-34 0" fill="none" stroke-width="3"/>'
    f'<path d="M30 94q0-20 20-24l28-4q16 0 16 14t-20 18Z" fill="{SKIN}"/>'
    '<path d="M38 54h52v26H38Z" fill="#ffd3e6"/><path d="M44 62h40" stroke="#ffffff" stroke-width="3"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#cfe9ff" stroke-width="2.5"/>' for x, y, r in [(30, 44, 9), (50, 30, 7), (82, 34, 10), (102, 52, 7), (66, 18, 6)]))
pictures[D + "thumb"] = svg(
    f'<path d="M36 112V62q0-6 6-10l14-10 4-26q2-8 10-6 10 2 8 16l-2 18h28q10 0 10 10 0 6-6 8 6 2 6 8 0 6-6 8 6 2 6 8 0 8-8 10 4 4 0 10-4 6-12 6Z" fill="{SKIN}"/>'
    '<path d="M18 60h18v52H18Z" fill="#8cc8f2"/><path d="M80 66h18M80 82h18M78 98h16" stroke="#f2b8a0" stroke-width="3"/>' + sparkle(108, 22, 8))
pictures[D + "three"] = svg(
    '<path d="M14 18h100v92H14Z" fill="#8fe3a8"/>'
    '<text x="64" y="96" text-anchor="middle" font-family="Fredoka,Arial Rounded MT Bold,Arial,sans-serif" font-size="80" font-weight="700" fill="#ffffff" stroke="none">3</text>')
pictures[D + "think"] = svg(
    person(52, 64, 1.2, "#8b5a3c", "#8cc8f2", "short")
    + '<circle cx="96" cy="30" r="18" fill="#ffffff"/><circle cx="80" cy="54" r="5" fill="#ffffff" stroke-width="3"/><circle cx="72" cy="62" r="3" fill="#ffffff" stroke-width="2.5"/>'
    '<text x="96" y="38" text-anchor="middle" font-family="Fredoka,Arial Rounded MT Bold,Arial,sans-serif" font-size="24" font-weight="700" fill="#b79cf2" stroke="none">?</text>')
pictures[D + "graph"] = svg(
    '<path d="M16 16v96h96" fill="none" stroke-width="5"/>'
    '<path d="M28 80h16v32H28ZM52 56h16v56H52ZM76 70h16v42H76ZM100 36h12v76H100Z" fill="#8cc8f2"/>'
    '<path d="M52 56h16v56H52Z" fill="#ff8fa3"/><path d="M100 36h12v76H100Z" fill="#8fe3a8"/>')
pictures[D + "photo"] = svg(
    '<path d="M12 40q0-8 8-8h16l8-12h40l8 12h16q8 0 8 8v62q0 8-8 8H20q-8 0-8-8Z" fill="#b79cf2"/>'
    '<circle cx="64" cy="70" r="26" fill="#ffffff"/><circle cx="64" cy="70" r="16" fill="#8cc8f2" stroke-width="3"/>'
    '<circle cx="58" cy="64" r="5" fill="#ffffff" stroke="none"/><circle cx="100" cy="44" r="5" fill="#ffd45e" stroke-width="2.5"/>')
pictures[D + "phase"] = svg(
    '<circle cx="64" cy="64" r="46" fill="#5b6b8c"/><path d="M64 18a46 46 0 0 1 0 92Z" fill="#ffe27a"/>'
    '<circle cx="80" cy="46" r="5" fill="#f2c94c" stroke="none"/><circle cx="86" cy="80" r="4" fill="#f2c94c" stroke="none"/>' + sparkle(22, 22, 7, "#fff6c8"))
pictures[D + "phantom"] = svg(
    '<path d="M24 110V60q0-42 40-42t40 42v50l-10-10-10 10-10-10-10 10-10-10-10 10-10-10Z" fill="#ffffff"/>'
    + eye(52, 58, 1.3) + eye(76, 58, 1.3) + cheek(44, 70) + cheek(84, 70)
    + '<ellipse cx="64" cy="78" rx="6" ry="8" fill="#ff8fae" stroke-width="2.5"/>')
pictures[D + "where"] = svg(
    person(46, 66, 1.1, "#a46a3c", "#ffb3d1", "pigtails")
    + '<path d="M80 24h32v32H80Z" fill="none" stroke="none"/>'
    '<text x="98" y="56" text-anchor="middle" font-family="Fredoka,Arial Rounded MT Bold,Arial,sans-serif" font-size="54" font-weight="700" fill="#8a6ae6" stroke="#ffffff" stroke-width="3" paint-order="stroke">?</text>'
    '<path d="M18 50l-8-4M18 60H8" stroke-width="3"/>')

# One child cups a hand by their mouth and whispers into the other child's ear.
pictures[D + "whisper"] = svg(
    person(94, 66, 0.9, "#a46a3c", "#ffb3d1", "long").replace(smile(0, 11, 6), f'<ellipse cx="0" cy="12" rx="2.5" ry="3" fill="{INK}" stroke="none"/>')
    + f'<ellipse cx="75" cy="68" rx="5" ry="7" fill="{SKIN}"/><path d="M76 64q-3 4 0 8" fill="none" stroke-width="2"/>'
    + '<g transform="rotate(10 36 90)">' + person(36, 66, 0.9, "#8b5a3c", "#8fe3a8", "short")
    + limb([(46, 108), (56, 92), (58, 80)], SKIN, 10) + f'<ellipse cx="58" cy="76" rx="5" ry="8" fill="{SKIN}"/></g>'
    + '<path d="M64 62q3 4 0 8M68 58q5 8 0 16" fill="none" stroke="#b79cf2" stroke-width="2.5"/>')
# A thick book and a thin one; the arrow points at the thick one.
pictures[D + "thick"] = svg(
    down_arrow(48)
    + '<path d="M16 50l24-14h40L56 50Z" fill="#ffffff"/><path d="M56 50l24-14v72l-24 14Z" fill="#ffffff"/>'
    + "".join(f'<path d="M{56 + 24 * f:.0f} {50 - 14 * f:.1f}v70" stroke="#d6d0e0" stroke-width="2"/>'
              f'<path d="M{16 + 24 * f:.0f} {50 - 14 * f:.1f}h38" stroke="#d6d0e0" stroke-width="2"/>' for f in (.25, .5, .75))
    + '<path d="M16 50l24-14h40L56 50Z" fill="none"/><path d="M56 50l24-14v72l-24 14Z" fill="none"/>'
    '<path d="M16 50h40v72H16Z" fill="#8cc8f2"/><rect x="24" y="64" width="24" height="12" rx="2" fill="#ffffff" stroke-width="2.5"/>'
    '<path d="M92 50l4-3h22l-4 3Z" fill="#ffffff"/><path d="M114 50l4-3v72l-4 3Z" fill="#ffffff"/>'
    '<path d="M92 50h22v72H92Z" fill="#ffb3d1"/><rect x="96" y="64" width="14" height="10" rx="2" fill="#ffffff" stroke-width="2.5"/>')

pictures[D + "lock"] = svg(
    '<path d="M40 56V40a24 24 0 0 1 48 0v16" fill="none" stroke-width="8"/><path d="M40 56V40a24 24 0 0 1 48 0v16" fill="none" stroke="#d6d0e0" stroke-width="4"/>'
    '<path d="M26 56h76v56H26Z" fill="#ffd45e"/><circle cx="64" cy="80" r="8" fill="#4b2e22"/><path d="M64 84v14" stroke-width="6"/>')
pictures[D + "kick"] = svg(
    '<path d="M8 64q10 16 28 20M14 88q14 10 30 10" fill="none" stroke="#c9b6f5" stroke-width="4"/>'
    + limb([(28, 20), (44, 58), (70, 82)], SKIN, 20)
    + limb([(62, 74), (70, 82)], "#ffffff", 21)
    + '<path d="M58 80q2-8 10-6l10 6q12 2 20 8 6 6-2 10H64q-8 0-8-8Z" fill="#ff6f6f"/>'
    '<path d="M57 92h41" stroke-width="3"/><path d="M76 82l4-4M82 85l4-4" stroke="#ffffff" stroke-width="2.5"/>'
    '<path d="M4-4h40l6 32q-20 10-40 4Z" fill="#5b6b8c"/>'
    '<circle cx="110" cy="76" r="15" fill="#ffffff"/><path d="M110 70l6 4-2 7h-8l-2-7Z" fill="#4b2e22" stroke-width="2"/>'
    '<path d="M110 70v-9M116 74l8-3M114 81l5 7M106 81l-5 7M104 74l-8-3" stroke-width="2"/>'
    + burst(100, 90, 10, 17, (45, 90, 125)))
pictures[D + "king"] = svg(
    person(64, 66, 1.3, "#e8b46b", "#b79cf2", "short",
           '<path d="M38 38l6-24 12 14 8-18 8 18 12-14 6 24Z" fill="#ffd45e"/><circle cx="64" cy="22" r="3" fill="#ff6f6f" stroke-width="2"/>'))
pictures[D + "ring"] = svg(
    '<circle cx="64" cy="78" r="34" fill="none" stroke-width="16"/><circle cx="64" cy="78" r="34" fill="none" stroke="#ffd45e" stroke-width="10"/>'
    '<path d="M48 40l8-18h16l8 18-16 14Z" fill="#cfe9ff"/><path d="M48 40h32M56 22l8 32 8-32" fill="none" stroke-width="2.5"/>' + sparkle(100, 22, 8))
pictures[D + "song"] = svg(
    '<path d="M44 92V28l56-12v62" fill="none" stroke-width="6"/><path d="M44 28l56-12v14L44 42Z" fill="#4b2e22"/>'
    '<ellipse cx="34" cy="94" rx="14" ry="10" fill="#b79cf2"/><ellipse cx="90" cy="80" rx="14" ry="10" fill="#ff8fa3"/>' + sparkle(16, 30, 7) + sparkle(116, 104, 7, "#8cc8f2"))
pictures[D + "long"] = svg(
    '<path d="M6 50h116v28H6Z" fill="#ffd45e"/>'
    + "".join(f'<path d="M{x} 50v{14 if i % 2 == 0 else 8}" stroke-width="3"/>' for i, x in enumerate(range(16, 120, 10)))
    + '<path d="M18 98h92M18 98l10-8M18 98l10 8M110 98l-10-8M110 98l-10 8" fill="none" stroke="#ff6f6f" stroke-width="4"/>')
pictures[D + "lunch"] = svg(
    '<path d="M14 40h100v70H14Z" fill="#ff8fb7"/><path d="M20 46h88v58H20Z" fill="#ffffff" stroke-width="3"/>'
    '<path d="M64 46v58M20 76h44" stroke-width="3"/>'
    '<ellipse cx="42" cy="61" rx="14" ry="8" fill="#ffffff" stroke-width="2.5"/><path d="M34 60h16" stroke="#4b2e22" stroke-width="5"/>'
    '<circle cx="36" cy="90" r="6" fill="#8fe3a8" stroke-width="2.5"/><circle cx="50" cy="90" r="6" fill="#8fe3a8" stroke-width="2.5"/>'
    '<path d="M72 56q10-8 26 0v20H72Z" fill="#ffa552" stroke-width="2.5"/><circle cx="84" cy="92" r="8" fill="#ff6f6f" stroke-width="2.5"/>')


# ---------- R & L Blends: R blends ----------
B = "blends/"
pictures[B + "brave"] = svg(
    '<path d="M36 64 14 110h40Z" fill="#ff6f6f"/>' + person(64, 52, 1.2, "#4b2e22", "#8cc8f2", "short")
    + '<path d="M50 92h28l-14 18Z" fill="#ffd45e" stroke-width="3"/><path d="M60 96h8" stroke-width="2"/>')
pictures[B + "crab"] = svg(
    '<path d="M28 64 14 44M100 64l14-20M30 86l-16 12M98 86l16 12M36 96l-8 16M92 96l8 16" stroke-width="5"/>'
    '<path d="M10 38q-4-14 8-18l-2 12 10-6q4 12-8 16Z M118 38q4-14-8-18l2 12-10-6q-4 12 8 16Z" fill="#ff6f6f" stroke-width="3"/>'
    '<ellipse cx="64" cy="80" rx="40" ry="26" fill="#ff6f6f"/><path d="M50 52v-12M78 52v-12" stroke-width="3"/>'
    '<circle cx="50" cy="38" r="5" fill="#ffffff" stroke-width="2.5"/><circle cx="78" cy="38" r="5" fill="#ffffff" stroke-width="2.5"/>'
    '<circle cx="50" cy="38" r="2" fill="#4b2e22" stroke="none"/><circle cx="78" cy="38" r="2" fill="#4b2e22" stroke="none"/>' + cheek(44, 82) + cheek(84, 82) + smile(64, 84, 10))
pictures[B + "crown"] = svg(
    '<path d="M16 94 12 36l28 26 24-38 24 38 28-26-4 58Z" fill="#ffd45e"/><path d="M16 94h96v16H16Z" fill="#f2c94c"/>'
    '<circle cx="12" cy="34" r="6" fill="#ff8fa3" stroke-width="3"/><circle cx="64" cy="22" r="6" fill="#8cc8f2" stroke-width="3"/><circle cx="116" cy="34" r="6" fill="#ff8fa3" stroke-width="3"/>'
    '<circle cx="40" cy="102" r="4" fill="#ff6f6f" stroke-width="2"/><circle cx="64" cy="102" r="4" fill="#8fe3a8" stroke-width="2"/><circle cx="88" cy="102" r="4" fill="#ff6f6f" stroke-width="2"/>')
pictures[B + "cross"] = svg(
    '<path d="M-4 84h136v44H-4Z" fill="#a39cb4"/>'
    + "".join(f'<rect x="{sx}" y="90" width="12" height="28" rx="2" fill="#ffffff" stroke="none"/>' for sx in (10, 32, 54, 76, 98))
    + '<path d="M18 84V40" stroke-width="5"/><rect x="8" y="10" width="20" height="34" rx="5" fill="#5b6b8c"/>'
    '<circle cx="18" cy="19" r="5" fill="#b07a86" stroke-width="2.5"/><circle cx="18" cy="34" r="5" fill="#8fe3a8" stroke-width="2.5"/>'
    '<path d="M38 52h10M34 62h12M38 72h8" stroke="#c9b6f5" stroke-width="3"/>'
    + kid(74, 30, 1.0, arms=[[(-11, 17), (-20, 34)], [(11, 17), (20, 32)]], legs=[[(-6, 42), (-16, 62)], [(6, 42), (14, 63)]], shirt="#ffd45e", facing=1))
pictures[B + "drum"] = svg(
    '<path d="M18 50v44q0 16 46 16t46-16V50" fill="#ff8fa3"/><ellipse cx="64" cy="50" rx="46" ry="14" fill="#fff6e0"/>'
    '<path d="M22 60l20 46M42 64l22 46M64 64l22 46M86 64l20 40" stroke="#ffd45e" stroke-width="3"/>'
    '<path d="M36 34 8 8M92 34l28-26" stroke-width="5"/><circle cx="8" cy="8" r="5" fill="#ffd45e" stroke-width="3"/><circle cx="120" cy="8" r="5" fill="#ffd45e" stroke-width="3"/>')
pictures[B + "draw"] = svg(
    '<path d="M10 22h88v88H10Z" fill="#ffffff"/><path d="M22 92q14-30 30-10t32-30" fill="none" stroke="#8cc8f2" stroke-width="5"/>'
    '<circle cx="34" cy="44" r="9" fill="#ffd45e" stroke-width="3"/>'
    '<path d="M84 96 116 52l8 6-32 44-10 4Z" fill="#ff8fa3"/><path d="M84 96l8 6-10 4Z" fill="#4b2e22"/>')
pictures[B + "dream"] = svg(
    '<path d="M10 110q4-24 30-24 20 0 26 18H10Z" fill="#cfe9ff"/>' + person(36, 74, 0.7, "#8b5a3c", "#cfe9ff", "short").replace(eye(-8, 2) + eye(8, 2), '<path d="M-13 3q5 4 10 0M3 3q5 4 10 0" fill="none" stroke-width="3"/>')
    + '<circle cx="60" cy="56" r="4" fill="#ffffff" stroke-width="2.5"/><circle cx="68" cy="46" r="6" fill="#ffffff" stroke-width="2.5"/>'
    '<path d="M68 34q-6-22 18-22 6-10 18-6 14 0 14 14 8 8 0 16-6 8-18 4-12 6-22-2-10 2-10-4Z" fill="#ffffff"/>'
    + sparkle(92, 22, 6) + '<path d="M84 26q4-6 10-2-6 4-10 2Z" fill="#ff8fa3" stroke-width="2"/>')
pictures[B + "free"] = svg(
    '<defs><clipPath id="cage"><path d="M24 102V62q0-32 26-32t26 32v40Z"/></clipPath></defs>'
    '<path d="M50 30V20" stroke-width="3"/><circle cx="50" cy="15" r="5" fill="none" stroke-width="3"/>'
    '<path d="M24 102V62q0-32 26-32t26 32v40Z" fill="#fff6e0"/>'
    '<g clip-path="url(#cage)" stroke-width="3">' + "".join(f'<path d="M{bx} 20v90"/>' for bx in (33, 42, 50, 58, 67)) + '</g>'
    '<path d="M40 102V72h22v30Z" fill="#fff6e0" stroke-width="3"/>'
    '<path d="M62 72l18-6v30l-18 6Z" fill="none" stroke-width="3"/><path d="M68 70v30M74 68v30" stroke-width="2.5"/>'
    '<path d="M24 102V62q0-32 26-32t26 32v40" fill="none"/>'
    '<rect x="18" y="100" width="64" height="12" rx="4" fill="#c98a55"/>'
    '<path d="M78 84q6-20 8-30" fill="none" stroke-width="2.5" stroke-dasharray="3 6"/>'
    '<path d="M82 50l-12 2 6-10Z" fill="#ffd45e" stroke-width="3"/>'
    '<ellipse cx="94" cy="46" rx="15" ry="11" fill="#ffd45e"/><circle cx="106" cy="36" r="10" fill="#ffd45e"/>'
    '<path d="M115 34l7 3-7 3Z" fill="#ffb86b" stroke-width="3"/>'
    '<path d="M88 42q-2-22 16-26-2 16-8 28Z" fill="#ffe9a0"/>'
    + eye(108, 34, .8) + cheek(104, 41, .7) + sparkle(116, 64, 6) + sparkle(78, 22, 5, "#b79cf2"))
pictures[B + "grass"] = svg(
    '<path d="M4 108h120v16H4Z" fill="#6fcf8f"/>'
    + "".join(f'<path d="M{x} 110 {x + 4} {y} {x + 12} 110 {x + 18} {y + 14} {x + 22} 110Z" fill="{c}" stroke-width="3"/>'
              for x, y, c in [(6, 52, "#8fe3a8"), (28, 40, "#6fcf8f"), (50, 56, "#8fe3a8"), (72, 36, "#6fcf8f"), (94, 50, "#8fe3a8")]))
pictures[B + "grow"] = svg(
    '<path d="M30 92h68l-8 26H38Z" fill="#ff8f6f"/><path d="M26 86h76v10H26Z" fill="#ff8f6f"/>'
    '<path d="M64 86V40" stroke="#4fb893" stroke-width="5"/><path d="M64 70q-20-4-24-18 18-2 24 12M64 60q18-4 22-20-18 0-22 14" fill="#8fe3a8" stroke-width="3"/>'
    '<circle cx="64" cy="28" r="14" fill="#ffd45e"/><circle cx="64" cy="28" r="6" fill="#c98a55" stroke-width="2.5"/>'
    '<path d="M108 74V30M98 40l10-10 10 10" fill="none" stroke="#8cc8f2" stroke-width="5"/>')
pictures[B + "press"] = svg(
    '<path d="M20 106q0-6 6-6h76q6 0 6 6v12H20Z" fill="#d6d0e0"/>'
    '<path d="M36 101q0-17 28-17t28 17Z" fill="#ff6f6f"/><path d="M44 95q4-5 10-6" fill="none" stroke="#ffffff" stroke-width="3"/>'
    + burst(64, 86, 24, 32, (-170, -150, -30, -10))
    # A hand from the side: the pointing finger presses and the other fingers curl under the palm.
    + '<path d="M104 2l28 14-14 28-28-14Z" fill="#8cc8f2"/>'
    + "".join(f'<circle cx="{fx}" cy="{fy}" r="7" fill="{SKIN}"/>' for fx, fy in ((84, 60), (94, 63), (104, 59)))
    + limb([(82, 48), (65, 78)], SKIN, 15)
    + f'<path d="M76 50q-2-14 12-18l16-6q12-2 12 10l-2 14q-4 14-18 12l-12-2q-8-2-8-10Z" fill="{SKIN}"/>'
    + limb([(100, 36), (88, 40), (80, 46)], SKIN, 11)
    + '<path d="M62 74q3 3 7 2" fill="none" stroke-width="2"/>')
pictures[B + "print"] = svg(
    '<path d="M32 14h64v34H32Z" fill="#ffffff"/><path d="M14 46h100v44H14Z" fill="#b79cf2"/>'
    '<path d="M32 78h64v38H32Z" fill="#ffffff"/><path d="M42 90h44M42 102h30" stroke="#8cc8f2" stroke-width="4"/>'
    '<circle cx="98" cy="58" r="5" fill="#8fe3a8" stroke-width="2.5"/>')
pictures[B + "tree"] = svg(
    '<path d="M56 116V74h16v42Z" fill="#c98a55"/>'
    '<circle cx="40" cy="62" r="26" fill="#8fe3a8"/><circle cx="88" cy="62" r="26" fill="#8fe3a8"/><circle cx="64" cy="38" r="30" fill="#8fe3a8"/>'
    '<path d="M44 74q20 10 40 0" fill="#8fe3a8" stroke="none"/><circle cx="54" cy="30" r="6" fill="#ffffff" stroke="none" opacity=".45"/>'
    '<circle cx="46" cy="56" r="4" fill="#ff6f6f" stroke-width="2"/><circle cx="82" cy="50" r="4" fill="#ff6f6f" stroke-width="2"/><circle cx="70" cy="72" r="4" fill="#ff6f6f" stroke-width="2"/>')
pictures[B + "train"] = svg(
    '<path d="M4 112h120" stroke-width="5"/><path d="M14 46h56v52H14Z" fill="#ff8fa3"/><path d="M70 62h44v36H70Z" fill="#ff8fa3"/>'
    '<path d="M84 62V40h16v22" fill="#4b2e22"/><path d="M8 40h68v10H8Z" fill="#b79cf2"/><path d="M24 56h28v20H24Z" fill="#cfe9ff" stroke-width="3"/>'
    '<path d="M86 34q-4-10 4-14t2-12" fill="none" stroke="#d6d0e0" stroke-width="5"/>'
    + "".join(f'<circle cx="{x}" cy="102" r="10" fill="#6b5a8e"/>' for x in (28, 56, 96)))
pictures[B + "truck"] = svg(
    '<path d="M8 36h70v58H8Z" fill="#8cc8f2"/><path d="M78 54h22l18 20v20H78Z" fill="#ffd45e"/><path d="M84 60h14l12 14H84Z" fill="#cfe9ff" stroke-width="3"/>'
    + "".join(f'<circle cx="{x}" cy="98" r="11" fill="#6b5a8e"/><circle cx="{x}" cy="98" r="4" fill="#ffffff" stroke-width="2"/>' for x in (28, 94)))
pictures[B + "trap"] = svg(
    '<defs><clipPath id="net"><path d="M64 40Q22 56 28 90q6 28 36 28t36-28q6-34-36-50Z"/></clipPath></defs>'
    + limb("M-4 16q40 8 72 0t64 4", "#c98a55", 14)
    + '<path d="M100 18q8-14 20-12-4 14-20 12ZM20 20q-6 14 4 22 6-10-4-22Z" fill="#8fe3a8" stroke-width="3"/>'
    '<path d="M64 20v20" stroke-width="3"/>'
    '<path d="M64 40Q22 56 28 90q6 28 36 28t36-28q6-34-36-50Z" fill="#fff6e0"/>'
    '<ellipse cx="57" cy="66" rx="5" ry="12" fill="#ffffff"/><ellipse cx="71" cy="66" rx="5" ry="12" fill="#ffffff"/>'
    '<ellipse cx="57" cy="66" rx="2" ry="7" fill="#ffb3c6" stroke="none"/><ellipse cx="71" cy="66" rx="2" ry="7" fill="#ffb3c6" stroke="none"/>'
    '<ellipse cx="64" cy="106" rx="20" ry="11" fill="#ffffff"/><circle cx="64" cy="86" r="15" fill="#ffffff"/>'
    + eye(58, 84, .8) + eye(70, 84, .8) + cheek(53, 91, .7) + cheek(75, 91, .7)
    + '<ellipse cx="64" cy="93" rx="2.5" ry="3" fill="#4b2e22" stroke="none"/>'
    '<g clip-path="url(#net)" stroke="#a46a3c" stroke-width="2">'
    + "".join(f'<path d="M{c} 30L{c - 90} 120M{c - 90} 30L{c} 120"/>' for c in range(-62, 200, 18)) + '</g>'
    '<path d="M64 40Q22 56 28 90q6 28 36 28t36-28q6-34-36-50Z" fill="none"/>'
    '<circle cx="64" cy="40" r="4" fill="#c98a55" stroke-width="3"/>')
pictures[B + "street"] = svg(
    '<path d="M44 4h40l40 120H4Z" fill="#9db4cc"/><path d="M64 14v14M64 44v18M64 80v22M64 114v10" stroke="#ffffff" stroke-width="6"/>'
    '<path d="M0 50h22l-18 74H0ZM128 50h-22l18 74h4Z" fill="#8fe3a8" stroke-width="3"/>')
pictures[B + "stretch"] = svg(
    kid(64, 46, 1.0, arms=[[(-11, 17), (-19, -2), (-27, -24)], [(11, 17), (19, -2), (27, -24)]], shirt="#8cc8f2", eyes="closed")
    + burst(37, 22, 9, 15, (-160, -120)) + burst(91, 22, 9, 15, (-60, -20)))
pictures[B + "throw"] = svg(
    kid(50, 48, 1.0, arms=[[(-11, 17), (-22, 26), (-26, 38)], [(11, 17), (24, 6), (34, -8)]],
        legs=[[(-6, 42), (-15, 63)], [(6, 42), (12, 64)]], shirt="#ff8fa3", facing=1)
    + '<path d="M90 34q8-14 14-18" fill="none" stroke-width="2.5" stroke-dasharray="3 6"/>'
    '<circle cx="110" cy="16" r="10" fill="#8cc8f2"/><path d="M101 12q9 6 18 0" fill="none" stroke="#ffffff" stroke-width="3"/>')
pictures[B + "through"] = svg(
    '<path d="M4 114h120V40q-20-30-60-30T4 40Z" fill="#c9b6f5"/><path d="M28 114V60q0-30 36-30t36 30v54Z" fill="#5b4a72"/>'
    '<path d="M44 114 60 60h8l16 54" fill="none" stroke="#d6d0e0" stroke-width="3"/><circle cx="64" cy="54" r="5" fill="#ffd45e" stroke-width="2.5"/>'
    '<path d="M16 50h8M104 50h8M20 30h8M100 30h8" stroke="#b39ef0" stroke-width="3"/>')
pictures[B + "shrimp"] = svg(
    '<path d="M96 30q-60-12-74 34-6 30 20 42 16 6 22-8-20 2-24-14-4-24 26-30 16-4 30 0Z" fill="#ffa587"/>'
    '<path d="M44 52l10 10M38 66l14 6M38 82l14 2" stroke="#ff7f60" stroke-width="3"/>'
    '<path d="M96 30q14-8 24-2M96 32q10 6 20 14" fill="none" stroke-width="2.5"/><path d="M64 106l-6 12 12-4Z" fill="#ffa587" stroke-width="3"/>' + eye(86, 36, 0.9))
pictures[B + "shred"] = svg(
    '<path d="M24 14h80v26H24Z" fill="#ffffff"/><path d="M14 40h100v28H14Z" fill="#8cc8f2"/>'
    + "".join(f'<path d="M{x} 68l{d} 46h8l{-d} -46" fill="#ffffff" stroke-width="3"/>' for x, d in [(28, -2), (46, 2), (64, -2), (82, 2), (100, -2)])
    + '<path d="M34 24h40" stroke="#d6d0e0" stroke-width="3"/>')
pictures[B + "shrug"] = svg(
    kid(64, 34, 1.1, arms=[[(-11, 17), (-22, 30), (-32, 18)], [(11, 17), (22, 30), (32, 18)]], shirt="#b79cf2")
    .replace(smile(0, 7.5, 5), '<path d="M-4 8q2-2 4 0t4 0" fill="none" stroke-width="2.2"/>'
             '<path d="M-9-5q3-3 6-1M3-6q3-2 6 1" fill="none" stroke-width="2"/>')
    + "".join(f'<text x="{qx}" y="34" text-anchor="middle" font-family="Fredoka,Arial Rounded MT Bold,Arial,sans-serif" font-size="22" font-weight="700" fill="#b79cf2" stroke="none">?</text>' for qx in (24, 104)))


# ---------- R & L Blends: scr, spr and L blends ----------
pictures[B + "scratch"] = svg(
    '<rect x="8" y="8" width="112" height="112" rx="10" fill="#e8c39e"/>'
    '<path d="M8 36q30-6 56 0t56 0M8 66q30 6 56 0t56 0" fill="none" stroke="#c98a55" stroke-width="2.5"/>'
    + "".join(f'<path d="M{x - 6} 14Q{x + 12} 40 {x + 4} 68Q{x - 6} 42 {x - 6} 14Z" fill="#8b5a3c" stroke-width="2.5"/>' for x in (40, 58, 76))
    + '<path d="M44 128V104h38v24Z" fill="#ffb86b"/>'
    + "".join(f'<path d="M{cx - 3} 84q0-10 3-14 3 4 3 14Z" fill="#ffffff" stroke-width="2.5"/>' for cx in (44, 62, 80))
    + '<ellipse cx="62" cy="104" rx="26" ry="15" fill="#ffb86b"/>'
    + "".join(f'<circle cx="{cx}" cy="{cy}" r="9" fill="#ffb86b"/>' for cx, cy in ((44, 92), (62, 89), (80, 92))))
pictures[B + "scrub"] = svg(
    '<path d="M16 90h96v22H16Z" fill="#cfe9ff"/><path d="M34 52h60q8 0 8 8v24H26V60q0-8 8-8Z" fill="#ffe27a"/>'
    '<path d="M26 74h76v12H26Z" fill="#8fe3a8"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#ffffff" stroke-width="2.5"/>' for x, y, r in [(30, 40, 8), (52, 34, 6), (86, 36, 9), (104, 46, 6), (70, 24, 5)]))
# A spray bottle squirting a fine mist.
pictures[B + "spray"] = svg(
    '<path d="M84 30L126 4v54Z" fill="#e6f4fc" stroke="none"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#8cc8f2" stroke="none"/>' for x, y, r in [
        (90, 28, 2), (96, 24, 2.5), (98, 34, 2), (104, 18, 2.5), (106, 30, 3), (104, 40, 2), (112, 14, 2), (114, 24, 2.5),
        (112, 36, 3), (114, 46, 2), (120, 10, 2.5), (122, 20, 2), (121, 31, 2.5), (122, 42, 2), (120, 52, 2.5)])
    + '<path d="M24 62q0-8 8-8h22q8 0 8 8v50q0 8-8 8H32q-8 0-8-8Z" fill="#cfe9ff"/>'
    '<path d="M27 82h32v30q0 5-5 5H32q-5 0-5-5Z" fill="#8cc8f2" stroke="none"/>'
    '<path d="M24 62q0-8 8-8h22q8 0 8 8v50q0 8-8 8H32q-8 0-8-8Z" fill="none"/>'
    '<rect x="32" y="88" width="22" height="16" rx="3" fill="#ffffff" stroke-width="3"/>'
    '<path d="M34 40h18v14H34Z" fill="#ffffff"/>'
    '<path d="M54 40q12 4 10 22-6 2-10-6Z" fill="#ff8fa3"/>'
    '<rect x="22" y="20" width="54" height="22" rx="7" fill="#ff8fa3"/><path d="M74 26h10v10H74Z" fill="#ff8fa3"/>'
    + burst(84, 31, 6, 10, (-60, 60), 2.5))
pictures[B + "sprout"] = svg(
    '<path d="M14 98q8-20 50-20t50 20v20H14Z" fill="#b9814f"/>'
    '<path d="M64 80V48" stroke="#4fb893" stroke-width="5"/><path d="M64 56q-24 2-30-20 22-4 30 18M64 52q24-4 28-26-22 0-28 22" fill="#8fe3a8" stroke-width="3"/>')
pictures[B + "blow"] = svg(
    person(36, 66, 1.0, "#8b5a3c", "#8cc8f2", "short").replace(smile(0, 11, 6), '<circle cx="6" cy="11" r="3" fill="#ff8fae" stroke-width="2"/>')
    + '<path d="M54 62q20-6 30 4t28-2M54 78q24 2 34 12t26 4" fill="none" stroke="#8cc8f2" stroke-width="4"/>'
    '<path d="M102 46q8-4 12 2-6 4-12-2Z" fill="#8fe3a8" stroke-width="2.5"/>')
pictures[B + "blink"] = svg(
    person(64, 62, 1.35, "#a46a3c", "#ffb3d1", "long").replace(eye(8, 2), '<path d="M4 3q4-4 8 0" fill="none" stroke-width="3"/>')
    + sparkle(104, 34, 8))

def clap_hand():
    """A right hand seen from the back, fingers up and thumb on the left, its wrist at (0, 0)."""
    return (limb([(-13, -12), (-21, -24)], SKIN, 13)
            + "".join(f'<rect x="{fx}" y="{top}" width="8" height="{-20 - top}" rx="4" fill="{SKIN}"/>' for fx, top in ((-16, -54), (-8, -58), (0, -56), (8, -50)))
            + f'<path d="M-16-4V-32h32V-4q0 6-16 6t-16-6Z" fill="{SKIN}"/>'
            '<rect x="-17" y="-2" width="34" height="16" rx="3" fill="#8cc8f2"/>')


# Two hands clapping, with little lines where they meet.
pictures[B + "clap"] = svg(
    f'<g transform="translate(104 112) scale(1.2) rotate(-16)">{clap_hand()}</g>'
    f'<g transform="translate(24 112) scale(-1.2 1.2) rotate(-16)">{clap_hand()}</g>'
    + burst(64, 40, 8, 16, (-150, -90, -30)) + burst(64, 64, 34, 42, (-170, -10)))

pictures[B + "clown"] = svg(
    '<path d="M36 30 64 4l28 26Z" fill="#8fe3a8"/><circle cx="64" cy="4" r="5" fill="#ffd45e" stroke-width="2.5"/>'
    '<circle cx="28" cy="52" r="16" fill="#ff8fa3"/><circle cx="100" cy="52" r="16" fill="#ff8fa3"/>'
    f'<circle cx="64" cy="58" r="30" fill="#ffffff"/>' + eye(52, 54) + eye(76, 54)
    + '<circle cx="64" cy="66" r="7" fill="#ff4f6f" stroke-width="2.5"/><path d="M50 76q14 12 28 0" fill="none" stroke="#ff4f6f" stroke-width="4"/>'
    '<path d="M44 92l20 10 20-10-20-8Z" fill="#8cc8f2"/><path d="M30 120q4-24 34-24t34 24Z" fill="#ffd45e"/>')
pictures[B + "climb"] = svg(
    "".join(f'<path d="M38 {ry}h52" stroke-width="8"/><path d="M38 {ry}h52" stroke="#e0b07a" stroke-width="3"/>' for ry in range(10, 123, 16))
    + '<path d="M38 0v128M90 0v128" stroke-width="10"/><path d="M38 0v128M90 0v128" stroke="#c98a55" stroke-width="5"/>'
    + kid(64, 34, 1.0, arms=[[(-11, 17), (-20, 2), (-16, -24)], [(11, 17), (22, 4), (18, -8)]],
          legs=[[(-6, 42), (-8, 64)], [(6, 42), (16, 44), (13, 50)]], shirt="#ffd45e", back=True))
pictures[B + "flag"] = svg(
    '<path d="M30 118V10" stroke-width="6"/><path d="M30 14q20-8 40 0t40 0v50q-20 8-40 0t-40 0Z" fill="#ff6f6f"/>'
    '<path d="M50 30l6 12 12 2-9 8 2 12-11-6-11 6 2-12-9-8 12-2Z" fill="#ffffff" stroke-width="2.5"/><path d="M20 118h20" stroke-width="5"/>')
pictures[B + "flower"] = svg(
    '<path d="M64 118V62" stroke="#4fb893" stroke-width="6"/><path d="M64 96q-20-2-26-18 18-2 26 14M64 88q20-4 26-20-18 0-26 16" fill="#8fe3a8" stroke-width="3"/>'
    + "".join(f'<ellipse cx="{64 + 18 * math.cos(a):.1f}" cy="{44 + 18 * math.sin(a):.1f}" rx="13" ry="13" fill="#ff8fb7"/>' for a in [i * math.pi * 2 / 5 - math.pi / 2 for i in range(5)])
    + '<circle cx="64" cy="44" r="12" fill="#ffd45e"/>')
pictures[B + "fly"] = svg(
    '<ellipse cx="44" cy="44" rx="22" ry="14" fill="#d8f0ff" fill-opacity=".8" transform="rotate(-30 44 44)"/><ellipse cx="84" cy="44" rx="22" ry="14" fill="#d8f0ff" fill-opacity=".8" transform="rotate(30 84 44)"/>'
    '<ellipse cx="64" cy="78" rx="20" ry="26" fill="#5b6b8c"/><path d="M46 72h36M46 86h36" stroke="#8b9bbc" stroke-width="4"/>'
    '<circle cx="64" cy="50" r="14" fill="#5b6b8c"/><circle cx="56" cy="48" r="6" fill="#ff6f6f" stroke-width="2.5"/><circle cx="72" cy="48" r="6" fill="#ff6f6f" stroke-width="2.5"/>'
    '<path d="M46 90l-12 10M46 78l-14 2M82 90l12 10M82 78l14 2" stroke-width="3"/>')
pictures[B + "glove"] = svg(
    '<path d="M36 112V58l-10-18q-4-10 6-12 8-2 12 8l4 10V24q0-8 8-8t8 8v26-30q0-8 8-8t8 8v30-24q0-8 8-8t8 8v28-14q0-8 8-8t8 8v44q0 20-20 30H36Z" fill="#ff8fa3"/>'
    '<path d="M36 96h64v16H36Z" fill="#ffb3d1"/><path d="M42 104h52" stroke="#ffffff" stroke-width="3" stroke-dasharray="4 4"/>')
pictures[B + "globe"] = svg(
    '<path d="M28 118h72M64 118v-12" stroke-width="6"/><circle cx="64" cy="58" r="44" fill="#8cc8f2"/>'
    '<path d="M38 30q14 0 16 12t14 10-4 16-18 6-12-14Q30 46 38 30ZM78 64q12-4 18 6t-4 16-14 2Z M80 22q10 4 14 12" fill="#8fe3a8" stroke-width="3"/>'
    '<path d="M18 58a46 46 0 0 0 92 0" fill="none" stroke="#c98a55" stroke-width="5"/>')
pictures[B + "glow"] = svg(
    '<circle cx="64" cy="64" r="48" fill="#fff6c8" stroke="none" opacity=".8"/><circle cx="64" cy="64" r="34" fill="#ffeaa0" stroke="none"/>'
    '<path d="M64 26l11 24 26 3-19 18 5 26-23-13-23 13 5-26-19-18 26-3Z" fill="#ffd45e"/>'
    + "".join(f'<path d="M{64 + 50 * math.cos(a):.1f} {64 + 50 * math.sin(a):.1f}L{64 + 60 * math.cos(a):.1f} {64 + 60 * math.sin(a):.1f}" stroke="#f2b632" stroke-width="4"/>' for a in [i * math.pi / 4 for i in range(8)]))
pictures[B + "plane"] = svg(
    '<path d="M10 70q0-10 14-10h70l24-24h8l-10 30q6 10-6 14H24q-14 0-14-10Z" fill="#ffffff"/>'
    '<path d="M48 64 70 30h14L74 64ZM52 80l18 26h12l-8-26Z" fill="#8cc8f2"/>'
    '<circle cx="34" cy="70" r="4" fill="#cfe9ff" stroke-width="2"/><circle cx="48" cy="70" r="4" fill="#cfe9ff" stroke-width="2"/><circle cx="62" cy="70" r="4" fill="#cfe9ff" stroke-width="2"/>'
    '<path d="M110 66q6 0 10-6" fill="none" stroke-width="3"/>')
pictures[B + "plant"] = svg(
    '<path d="M34 80h60l-8 38H42Z" fill="#ff8f6f"/><path d="M28 72h72v12H28Z" fill="#ff8f6f"/>'
    '<path d="M64 74V36" stroke="#4fb893" stroke-width="5"/>'
    '<path d="M64 60q-30 4-36-20 24-6 36 16M64 46q26-2 32-26-24-4-32 22M64 36q-4-18 6-28 8 14-6 28" fill="#8fe3a8" stroke-width="3"/>')

# A child playing with toy blocks.
pictures[B + "play"] = svg(
    "".join(f'<rect x="{bx}" y="{by}" width="26" height="24" rx="3" fill="{fill}"/>'
            f'<text x="{bx + 13}" y="{by + 19}" text-anchor="middle" font-family="Fredoka,Arial Rounded MT Bold,Arial,sans-serif" font-size="18" font-weight="700" fill="{INK}" stroke="none">{letter}</text>'
            for bx, by, fill, letter in ((80, 98, "#ffd45e", "A"), (84, 74, "#8cc8f2", "B"), (80, 30, "#ffb3d1", "C")))
    + kid(42, 40, 1.0, arms=[[(-11, 17), (-18, 36)], [(11, 17), (26, 10), (36, 4)]], shirt="#8fe3a8"))

pictures[B + "plug"] = svg(
    '<path d="M40 50h48v30q0 18-24 18T40 80Z" fill="#ffffff"/><path d="M50 50V22M78 50V22" stroke-width="8"/><path d="M50 50V22M78 50V22" stroke="#d6d0e0" stroke-width="3"/>'
    '<path d="M64 98v12q0 10 14 10h40" fill="none" stroke-width="8"/><path d="M64 98v12q0 10 14 10h40" fill="none" stroke="#b79cf2" stroke-width="3"/>' + sparkle(100, 30, 8))
pictures[B + "slide"] = svg(
    '<path d="M28 118V30M48 118V30" stroke-width="5"/>'
    + "".join(f'<path d="M28 {y}h20" stroke-width="4"/>' for y in range(44, 118, 14))
    + '<path d="M22 24h32v10H22Z" fill="#b79cf2"/><path d="M52 30q34 10 50 70l20 12h-16L92 104Q78 52 50 44Z" fill="#ffd45e"/>')
pictures[B + "sled"] = svg(
    '<path d="M4 110q20-10 60-6t60-6v28H4Z" fill="#ffffff"/>'
    '<path d="M18 72h88v14H18Z" fill="#ff6f6f"/><path d="M30 86v12M94 86v12" stroke-width="4"/>'
    '<path d="M10 98h96q14 0 16-14" fill="none" stroke-width="5"/>'
    + sparkle(30, 30, 7, "#cfe9ff") + sparkle(90, 22, 9, "#cfe9ff") + sparkle(60, 50, 6, "#cfe9ff"))
pictures[B + "slow"] = svg(
    '<path d="M30 92q-6-40 34-46 40 6 34 46Z" fill="#8fe3a8"/>'
    '<path d="M46 60l18 10 18-10M40 80h48M64 70v22" fill="none" stroke="#4fb893" stroke-width="3"/>'
    '<path d="M98 82q16-6 20 6 2 10-12 10H96Z" fill="#cdeec0"/><path d="M36 92l-4 14h12l2-12M84 92l2 12h12l-4-14" fill="#cdeec0" stroke-width="3"/>'
    + eye(108, 84, 0.8) + '<path d="M22 70q-8 0-12 6" fill="none" stroke-width="3"/>')
# A foot in a fluffy slipper, the heel showing at the open back.
pictures[B + "slipper"] = svg(
    f'<path d="M30 30h28l2 36q2 8 14 10l30 6q12 4 10 14l-86 2q-10 0-8-12l10-20Z" fill="{SKIN}"/>'
    '<path d="M20 -4h44l-2 38H24Z" fill="#b79cf2"/><path d="M24 26h38" stroke="#ffffff" stroke-width="3"/>'
    '<path d="M32 4v18M44 4v18M56 4v18" stroke="#d6c8fa" stroke-width="3"/>'
    '<path d="M50 98Q50 64 82 64q32 0 36 34Z" fill="#ffb3d1"/>'
    + "".join(f'<circle cx="{(1 - t) ** 2 * 50 + 2 * t * (1 - t) * 50 + t * t * 82:.1f}" cy="{(1 - t) ** 2 * 98 + 2 * t * (1 - t) * 64 + t * t * 64:.1f}" r="6" fill="#ffffff" stroke-width="3"/>' for t in (0.1, 0.3, 0.5, 0.7, 0.9))
    + '<path d="M12 98h108q6 0 6 6 0 8-8 8H18q-8 0-8-8 0-6 2-6Z" fill="#c9b6f5"/>')
# A child falling into the water: arms up, mouth open, a big splash all round.
pictures[B + "splash"] = svg(
    '<g transform="rotate(-14 64 70)">'
    + kid(64, 38, 1.0, arms=[[(-11, 17), (-24, 2), (-30, -16)], [(11, 17), (24, 2), (28, -18)]], shirt="#ffd45e")
    .replace(smile(0, 7.5, 5), f'<ellipse cx="0" cy="8.5" rx="2.6" ry="3.2" fill="{INK}" stroke="none"/>') + '</g>'
    '<path d="M-4 86q17-8 34 0t34 0 34 0 34 0v46H-4Z" fill="#8cc8f2"/>'
    '<path d="M34 90q-14-10-26-8 12-6 22 0-8-14-8-26 12 8 16 26 2-12 10-18-2 12-2 26Z" fill="#cfe9ff"/>'
    '<path d="M94 90q14-10 26-8-12-6-22 0 8-14 8-26-12 8-16 26-2-12-10-18 2 12 2 26Z" fill="#cfe9ff"/>'
    + "".join(f'<path d="M{x} {y}q-5 8 0 10 5-2 0-10Z" fill="#cfe9ff" stroke-width="2.5"/>' for x, y in [(14, 44), (114, 40), (24, 66), (106, 62)])
    + '<path d="M18 106q12-6 24 0M70 112q12-6 24 0" fill="none" stroke="#ffffff" stroke-width="3"/>')
pictures[B + "split"] = svg(
    '<path d="M4 92h120v24H4Z" fill="#c98a55"/><path d="M18 60h38v32H18Z" fill="#d9a066"/><path d="M72 60h38v32H72Z" fill="#d9a066"/>'
    '<ellipse cx="56" cy="76" rx="5" ry="15" fill="#f3d38c"/><ellipse cx="72" cy="76" rx="5" ry="15" fill="#f3d38c"/>'
    '<path d="M64 52 86 14" stroke-width="7"/><path d="M64 52 86 14" stroke="#c98a55" stroke-width="3"/><path d="M52 50l16-12 8 14-14 10Z" fill="#d6d0e0"/>'
    '<path d="M40 50l-6-8M90 50l6-8" stroke-width="3"/>')


# ---------- 量詞配對 (measure words) ----------
M = "measure-words/"
pictures[M + "letter"] = svg(
    '<path d="M12 34h104v66H12Z" fill="#ffffff"/><path d="M12 34l52 40 52-40" fill="#fff2bf"/>'
    '<path d="M12 100l40-34M116 100 76 66" fill="none" stroke-width="3"/><path d="M90 42h16v16H90Z" fill="#ff8fa3" stroke-width="2.5"/>')
pictures[M + "bouquet"] = svg(
    '<path d="M44 76 64 118l20-42Z" fill="#c9b6f5"/><path d="M52 86h24" stroke="#ffffff" stroke-width="4"/>'
    '<path d="M50 70 40 40M64 70V30M78 70l10-30" stroke="#4fb893" stroke-width="4"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="12" fill="{c}"/><circle cx="{x}" cy="{y}" r="4" fill="#ffd45e" stroke-width="2"/>' for x, y, c in [(40, 36, "#ff8fa3"), (64, 24, "#ffd45e"), (88, 36, "#8cc8f2"), (52, 56, "#ffb86b"), (76, 56, "#ff8fb7")]))
pictures[M + "pencil"] = svg(
    '<path d="M24 88 92 20l16 16-68 68Z" fill="#ffd45e"/><path d="M92 20l8-8q6-4 10 0l6 6q4 4 0 10l-8 8Z" fill="#ff8fa3"/>'
    '<path d="M24 88 40 104 14 114Z" fill="#f3d38c"/><path d="M14 114l5-12 7 7Z" fill="#4b2e22"/><path d="M34 82 86 30" stroke="#f2c94c" stroke-width="3"/>')
pictures[M + "paper"] = svg(
    '<path d="M26 12h56l20 20v84H26Z" fill="#ffffff"/><path d="M82 12v20h20" fill="#e6dcf5"/>'
    '<path d="M38 50h52M38 64h52M38 78h52M38 92h34" stroke="#cfe9ff" stroke-width="4"/>')
pictures[M + "book"] = svg(
    '<path d="M64 30q-20-14-50-10v80q30-4 50 10Z" fill="#ffffff"/><path d="M64 30q20-14 50-10v80q-30-4-50 10Z" fill="#ffffff"/>'
    '<path d="M64 30v80" stroke-width="3"/><path d="M24 40q16-2 30 4M24 54q16-2 30 4M74 44q14-6 30-4M74 58q14-6 30-4" stroke="#cfe9ff" stroke-width="4"/>'
    '<path d="M14 100q30-4 50 10 20-14 50-10v8q-30-2-50 10-20-12-50-10Z" fill="#8cc8f2"/>')
pictures[M + "umbrella"] = svg(
    '<path d="M64 60v44q0 12-10 12t-10-10" fill="none" stroke-width="5"/>'
    '<path d="M10 62q4-46 54-46t54 46q-8-8-18 0-8-8-18 0-8-8-18 0-8-8-18 0-8-8-18 0-8-8-18 0Z" fill="#ff8fa3"/>'
    '<path d="M64 16q-20 18-18 46M64 16q20 18 18 46" fill="none" stroke-width="3"/><path d="M64 16V8" stroke-width="4"/>')
pictures[M + "chopsticks"] = svg(
    '<path d="M30 116 70 12M50 116 92 14" stroke-width="9"/><path d="M30 116 70 12M50 116 92 14" stroke="#e8b46b" stroke-width="5"/>'
    '<path d="M62 32l14 4M84 34l12 4" stroke="#ff6f6f" stroke-width="5"/>')
pictures[M + "leaf"] = svg(
    '<path d="M18 110Q20 30 110 18q-6 88-92 92Z" fill="#8fe3a8"/><path d="M18 110 92 36" stroke="#4fb893" stroke-width="4"/>'
    '<path d="M42 86l-4-22M58 70l-2-24M74 54l-2-18M42 86l22 2M58 70l22 2M74 54l18 2" stroke="#4fb893" stroke-width="3"/>')
pictures[M + "mountain"] = svg(
    '<path d="M4 112 46 36l26 40 16-22 36 58Z" fill="#9fb5d9"/>'
    '<path d="M46 36 34 58l8-4 6 6 6-6 6 4Z" fill="#ffffff"/><path d="M88 54l-8 12 6-2 4 4 4-4 4 2Z" fill="#ffffff"/>'
    '<path d="M4 112h120" stroke="#8fe3a8" stroke-width="6"/>')
pictures[M + "bridge"] = svg(
    '<path d="M4 100q15-6 30 0t30 0 30 0 30 0v24H4Z" fill="#8cc8f2"/>'
    '<path d="M4 70h120v12H4Z" fill="#ff8f6f"/><path d="M20 82v28M108 82v28" stroke-width="8"/>'
    '<path d="M8 70q56-56 112 0" fill="none" stroke-width="5"/>'
    + "".join(f'<path d="M{x} 70V{70 - (36 - abs(64 - x) * 36 / 56):.0f}" stroke-width="2.5"/>' for x in range(24, 108, 12)))
pictures[M + "seeds"] = svg(
    '<path d="M14 90q8-14 50-14t50 14v26H14Z" fill="#b9814f"/>'
    + "".join(f'<ellipse cx="{x}" cy="{y}" rx="8" ry="11" fill="#e8b46b" transform="rotate({r} {x} {y})"/>' for x, y, r in [(36, 40, -20), (60, 30, 10), (86, 42, 30), (48, 62, 40), (76, 64, -30)])
    + '<path d="M60 22q4-8 10-6" fill="none" stroke="#4fb893" stroke-width="3"/>')


# ---------- Mochi and Tofu's activities ----------
DR = "dragon/"
pictures[DR + "chilli"] = svg(
    '<path d="M86 30q20 6 14 30-8 34-50 52-24 10-34 2 30-8 46-40 10-22 8-42Z" fill="#ff4f4f"/>'
    '<path d="M86 30q-4-12 6-20 6-4 12 0-10 4-10 12" fill="#6fcf8f" stroke-width="3"/><path d="M90 46q4 16-4 30" fill="none" stroke="#ff9a9a" stroke-width="4"/>')
pictures[DR + "salad"] = svg(
    '<path d="M10 62h108q0 48-54 48T10 62Z" fill="#ffffff"/>'
    '<circle cx="34" cy="54" r="14" fill="#8fe3a8"/><circle cx="56" cy="46" r="14" fill="#6fcf8f"/><circle cx="80" cy="50" r="14" fill="#8fe3a8"/><circle cx="98" cy="58" r="10" fill="#6fcf8f"/>'
    '<circle cx="46" cy="60" r="7" fill="#ff6f6f" stroke-width="3"/><circle cx="72" cy="60" r="7" fill="#ff6f6f" stroke-width="3"/><path d="M84 56l10 6" stroke="#ffa552" stroke-width="5"/>'
    '<path d="M10 62h108" stroke-width="4"/><path d="M28 74q36 10 72 0" fill="none" stroke="#8cc8f2" stroke-width="5"/>')
pictures[DR + "comb"] = svg(
    '<path d="M14 44h100v22H14Z" fill="#f7a8c8"/>'
    + "".join(f'<path d="M{x} 66v36" stroke-width="6"/><path d="M{x} 66v36" stroke="#f7a8c8" stroke-width="2"/>' for x in range(22, 112, 11))
    + sparkle(110, 24, 8))
pictures[DR + "palette"] = svg(
    '<path d="M64 14C30 14 10 40 12 66c2 28 26 48 52 48 12 0 14-8 10-16-4-10 2-18 14-18h14c12 0 18-8 18-22C120 34 96 14 64 14Z" fill="#fff2d6"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="9" fill="{c}" stroke-width="3"/>' for x, y, c in [(40, 42, "#ff6f6f"), (64, 30, "#ffd45e"), (88, 40, "#8fe3a8"), (32, 68, "#8cc8f2"), (44, 92, "#b79cf2")])
    + '<path d="M120 10 84 70" stroke-width="7"/><path d="M120 10 84 70" stroke="#c98a55" stroke-width="3"/><path d="M86 64l-6 14 10-8Z" fill="#ff8fa3" stroke-width="3"/>')

# A ballerina on her toes, arms in a circle over her head.
pictures[DR + "ballet"] = svg(
    kid(64, 40, 1.0, arms=[[(-11, 17), (-24, 0), (-7, -22)], [(11, 17), (24, 0), (7, -22)]],
        legs=[[(-6, 42), (-6, 66)], [(6, 42), (20, 52), (2, 56)]], hair="#a46a3c", shirt="#ff8fb7", shorts="#ffd3e6", eyes="closed")
    + '<circle cx="64" cy="25" r="6" fill="#a46a3c"/>'
    + '<path d="M30 82Q64 66 98 82' + "q-5.67 9-11.33 0" * 6 + 'Z" fill="#ffb3d1"/>'
    + sparkle(104, 30, 8) + sparkle(22, 44, 6, "#ffb3d9"))

# Tofu's baking: a banana muffin with banana slices on top, and a banana beside it.
pictures[DR + "banana-muffin"] = svg(
    '<path d="M30 70h68l-9 46H39Z" fill="#ffb3d1"/>'
    '<path d="M46 74l3 40M64 74v40M82 74l-3 40" stroke="#ff8fb7" stroke-width="3"/>'
    '<path d="M26 72q-6-38 38-40 44 2 38 40-8 6-15 1-8 6-15 0-8 6-16 0-8 6-15 0-8 5-15-1Z" fill="#d99a52"/>'
    '<path d="M40 52q6-10 18-12" fill="none" stroke="#ecb878" stroke-width="4"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="8" fill="#fff2bf"/><circle cx="{x}" cy="{y}" r="2" fill="#c9a24e" stroke="none"/>' for x, y in ((52, 40), (70, 36), (84, 48)))
    + '<path d="M84 114q22 2 34-18 6 2 4 8-12 22-38 16Z" fill="#ffe27a"/><path d="M120 96l3-6" stroke-width="3"/>')
pictures[DR + "meditation"] = svg(
    '<path d="M64 108Q30 104 20 80q24-2 44 28 20-30 44-28-10 24-44 28Z" fill="#ffb3d1"/>'
    '<path d="M64 108Q44 70 64 40q20 30 0 68Z" fill="#ff8fb7"/><path d="M64 108Q36 86 34 54q24 12 30 54M64 108q28-22 30-54-24 12-30 54Z" fill="#ffd3e6"/>'
    '<path d="M14 116q25-8 50 0t50 0" fill="none" stroke="#8cc8f2" stroke-width="5"/>' + sparkle(100, 24, 8))
pictures[DR + "sandcastle"] = svg(
    '<path d="M4 110q30-10 60-6t60 6v14H4Z" fill="#ffe7b0"/>'
    '<path d="M30 104V62h68v42Z" fill="#f3d38c"/><path d="M30 62v-8h10v8h10v-8h10v8h8v-8h10v8h10v-8h10v8" fill="#f3d38c"/>'
    '<path d="M46 62V34h36v28" fill="#f3d38c"/><path d="M46 34v-8h9v8h9v-8h9v8h9v-8" fill="#f3d38c"/>'
    '<path d="M58 104V88q6-8 12 0v16Z" fill="#c9a060"/><path d="M64 26V8" stroke-width="3"/><path d="M64 8l14 5-14 5Z" fill="#ff8fae" stroke-width="2.5"/>')
pictures[DR + "science"] = svg(
    '<path d="M50 14h28M54 14v34L24 104q-6 12 8 12h64q14 0 8-12L74 48V14" fill="#ffffff"/>'
    '<path d="M34 86h60l10 18q4 8-8 8H32q-12 0-8-8Z" fill="#b79cf2" stroke="none"/><path d="M50 14h28M54 14v34L24 104q-6 12 8 12h64q14 0 8-12L74 48V14" fill="none"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#cfe9ff" stroke-width="2.5"/>' for x, y, r in [(56, 96, 4), (70, 92, 5), (64, 70, 3), (84, 30, 6), (98, 18, 8)]))

# Counting with eyes covered.
pictures[DR + "hide-and-seek"] = svg(
    person(64, 60, 1.35, "#8b5a3c", "#8fe3a8", "short")
    + limb([(30, 130), (38, 94), (50, 66)], SKIN, 13) + limb([(98, 130), (90, 94), (78, 66)], SKIN, 13)
    + f'<ellipse cx="51" cy="60" rx="13" ry="10" fill="{SKIN}"/><ellipse cx="77" cy="60" rx="13" ry="10" fill="{SKIN}"/>'
    '<path d="M42 56h10M41 62h11M86 56H76M87 62H76" stroke-width="2"/>'
    f'<text x="104" y="18" text-anchor="middle" font-family="Fredoka,Arial Rounded MT Bold,Arial,sans-serif" font-size="14" font-weight="700" fill="#b79cf2" stroke="none">1, 2, 3…</text>')

pictures[DR + "bubbles"] = svg(
    '<path d="M18 114 54 58" stroke-width="6"/><path d="M18 114 54 58" stroke="#ff8fae" stroke-width="2.5"/>'
    '<circle cx="62" cy="46" r="14" fill="none" stroke-width="6"/><circle cx="62" cy="46" r="14" fill="none" stroke="#b79cf2" stroke-width="2.5"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#e6f6ff" fill-opacity=".85" stroke="#8cc8f2" stroke-width="3"/><path d="M{x - r * .4:.0f} {y - r * .4:.0f}q{r * .3:.0f} -{r * .3:.0f} {r * .6:.0f} -{r * .2:.0f}" fill="none" stroke="#ffffff" stroke-width="3"/>'
              for x, y, r in [(96, 30, 18), (100, 78, 12), (82, 104, 8), (114, 54, 7)]))
pictures[DR + "scooter"] = svg(
    '<path d="M86 16v84" stroke-width="7"/><path d="M86 16v84" stroke="#d6d0e0" stroke-width="3"/><path d="M72 16h28" stroke-width="7"/>'
    '<path d="M70 16h-4M102 16h4" stroke="#ff8fae" stroke-width="7"/>'
    '<path d="M22 96h70v10H22Z" fill="#8cc8f2"/><circle cx="28" cy="110" r="9" fill="#6b5a8e"/><circle cx="92" cy="110" r="9" fill="#6b5a8e"/>')

# ---------- Interface icons ----------
UI = "../icons/ui-"
pictures[UI + "shuffle"] = svg(
    '<path d="M12 40h22q20 0 30 24t30 24h14M12 88h22q20 0 30-24t30-24h14" fill="none" stroke-width="10"/>'
    '<path d="M12 40h22q20 0 30 24t30 24h14M12 88h22q20 0 30-24t30-24h14" fill="none" stroke="#b79cf2" stroke-width="5"/>'
    '<path d="M104 28l16 12-16 12ZM104 76l16 12-16 12Z" fill="#b79cf2"/>')
pictures[UI + "sparkle"] = svg(sparkle(56, 64, 38) + sparkle(102, 30, 16, "#ffb3d9") + sparkle(100, 98, 12, "#8cc8f2"))
pictures[UI + "treats"] = svg(
    '<path d="M64 36c-30-10-50 12-46 40 4 30 26 44 46 36 20 8 42-6 46-36 4-28-16-50-46-40Z" fill="#ff6f6f"/>'
    '<path d="M64 36q2-16 12-24" fill="none" stroke-width="4"/><path d="M70 22q16-12 28-2-14 10-28 2Z" fill="#8fe3a8" stroke-width="3"/>'
    '<path d="M38 58q6-10 16-12" fill="none" stroke="#ffffff" stroke-width="5"/>')


for name, body in pictures.items():
    path = os.path.normpath(os.path.join(IMAGES, name + ".svg"))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(body)
print(len(pictures), "pictures")
