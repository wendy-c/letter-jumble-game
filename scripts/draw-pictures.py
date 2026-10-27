# Hand-drawn pictures: redraws of pictures that looked broken, and the 地點 (places) topic.
# Faces only go on people and animals, never on things.
# Run from the project root: python3 scripts/draw-pictures.py
import math, os

INK = "#4b2e22"
SKIN = "#ffe2c4"
IMAGES = "public/images"


def svg(body, view="0 0 128 128"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}">\n'
            f'<g stroke="{INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">\n{body}\n</g>\n</svg>\n')


def face(x, y, s=1.0, happy=True):
    """Eyes, cheeks and a smile, for people and animals only."""
    out = (f'<g stroke="none"><ellipse cx="{x - 8 * s:.1f}" cy="{y}" rx="{2.9 * s:.1f}" ry="{3.3 * s:.1f}" fill="{INK}"/>'
           f'<ellipse cx="{x + 8 * s:.1f}" cy="{y}" rx="{2.9 * s:.1f}" ry="{3.3 * s:.1f}" fill="{INK}"/>'
           f'<circle cx="{x - 7 * s:.1f}" cy="{y - 1.2 * s:.1f}" r="{1.0 * s:.1f}" fill="#fff"/><circle cx="{x + 9 * s:.1f}" cy="{y - 1.2 * s:.1f}" r="{1.0 * s:.1f}" fill="#fff"/>'
           f'<ellipse cx="{x - 13.5 * s:.1f}" cy="{y + 7 * s:.1f}" rx="{3.6 * s:.1f}" ry="{2.2 * s:.1f}" fill="#ffb3c6"/><ellipse cx="{x + 13.5 * s:.1f}" cy="{y + 7 * s:.1f}" rx="{3.6 * s:.1f}" ry="{2.2 * s:.1f}" fill="#ffb3c6"/></g>')
    if happy:
        out += f'<path d="M{x - 3 * s:.1f} {y + 8 * s:.1f}q{3 * s:.1f} {3 * s:.1f} {6 * s:.1f} 0" fill="none" stroke-width="{2.6 * s:.1f}"/>'
    return out


def sparkle(x, y, s, fill="#ffd45e"):
    return (f'<path d="M{x} {y - s}Q{x + s * .2} {y - s * .2} {x + s} {y}Q{x + s * .2} {y + s * .2} {x} {y + s}'
            f'Q{x - s * .2} {y + s * .2} {x - s} {y}Q{x - s * .2} {y - s * .2} {x} {y - s}Z" fill="{fill}" stroke-width="2"/>')


def arm(points, sleeve, width=10):
    d = "M" + " L".join(f"{x} {y}" for x, y in points)
    return f'<path d="{d}" fill="none" stroke-width="{width}"/><path d="{d}" fill="none" stroke="{sleeve}" stroke-width="{width - 5}"/>'


def person(shirt, hair="#8b5a3c", long_hair=False, extra_back="", extra_front="", hat=""):
    """The jobs topic's person: shoulders, neck, head, hair and a smile."""
    back_hair = f'<path d="M40 50q-4 30 6 40h36q10-10 6-40Z" fill="{hair}"/>' if long_hair else ""
    return (extra_back + back_hair +
            f'<path d="M30 126q0-46 34-48t34 48Z" fill="{shirt}"/>'
            f'<path d="M57 70h14v9q-7 5-14 0Z" fill="{SKIN}" stroke-width="3"/>'
            f'<circle cx="64" cy="48" r="23" fill="{SKIN}"/>'
            f'<path d="M41 47q0-24 23-24t23 24q-6-10-13-9-10-5-20 0-7-1-13 9Z" fill="{hair}"/>'
            + face(64, 51) + hat + extra_front)


def ground(color="#9fdcbf"):
    return f'<path d="M4 116h120" stroke="{color}" stroke-width="8"/>'


def building(wall, roof, sign, door="#c9e6fb", windows=True, extra=""):
    """A little house-shaped building with a sign in its gable, like the jobs topic's buildings."""
    win = ('<rect x="34" y="62" width="14" height="12" rx="2" fill="#c9e6fb" stroke-width="3"/>'
           '<rect x="80" y="62" width="14" height="12" rx="2" fill="#c9e6fb" stroke-width="3"/>'
           '<rect x="34" y="84" width="14" height="12" rx="2" fill="#c9e6fb" stroke-width="3"/>'
           '<rect x="80" y="84" width="14" height="12" rx="2" fill="#c9e6fb" stroke-width="3"/>') if windows else ""
    return (f'<path d="M24 50h80v66H24Z" fill="{wall}"/>'
            f'<path d="M14 52L64 18l50 34Z" fill="{roof}"/>'
            + win +
            f'<path d="M54 116V98a10 10 0 0 1 20 0v18Z" fill="{door}" stroke-width="3"/>'
            f'<circle cx="64" cy="38" r="11" fill="#fff" stroke-width="3"/>' + sign + extra + ground())


pictures = {}

# ---------- Food and things: no faces ----------

def drips(x0, x1, y, lengths):
    width = (x1 - x0) / len(lengths)
    d = f"M{x0} {y - 6} A{(x1 - x0) / 2} 10 0 0 1 {x1} {y - 6} V{y}"
    x = x1
    for length in lengths:
        d += f" V{y + length} a{width / 2} {width / 2} 0 0 1 {-width} 0 V{y}"
        x -= width
    return d + "Z"


pictures["game-asset/food/cake"] = svg(
    '<ellipse cx="64" cy="104" rx="52" ry="9" fill="#ffffff"/>'
    '<path d="M24 58v38q0 10 40 10t40-10V58Z" fill="#ffe7b0"/>'
    '<path d="M24 82q40 10 80 0" fill="none" stroke="#ffffff" stroke-width="6"/>'
    '<path d="M24 82q40 10 80 0" fill="none" stroke-width="2.5" stroke-dasharray="1 10"/>'
    f'<path d="{drips(24, 104, 64, [6, 12, 4, 10, 5, 12, 6, 8])}" fill="#ffd3e6"/>'
    + "".join(f'<path d="M{x} 44q-9 0-9 9t9 9 9-9-9-9Z" fill="#ff6f86" stroke-width="3"/><path d="M{x - 4} 43l4-5 4 5" fill="#8fe3a8" stroke-width="2.5"/>'
              for x in (46, 64, 82))
    + '<g fill="#fff6c8" stroke="none"><circle cx="40" cy="96" r="2"/><circle cx="58" cy="100" r="2"/><circle cx="88" cy="96" r="2"/></g>')

pictures["game-asset/food/milk"] = svg(
    '<path d="M38 40h44l8 12v62H30V52Z" fill="#ffffff"/>'
    '<path d="M38 40l8-18h28l8 18Z" fill="#8cc8f2"/>'
    '<rect x="52" y="8" width="16" height="12" rx="3" fill="#8cc8f2" stroke-width="3"/>'
    '<path d="M30 52h60" stroke-width="3"/>'
    '<path d="M30 66h60v20H30Z" fill="#8cc8f2" stroke-width="3"/>'
    '<path d="M60 92q-12 14 0 18 12-4 0-18Z" fill="#c9e6fb" stroke-width="3"/>'
    '<path d="M38 58l6 0" stroke="#fff" stroke-width="3"/>')

pictures["game-asset/food/banana"] = svg(
    '<path d="M18 30q-2 52 46 72 34 12 52-6-30 4-52-14-26-22-34-58Z" fill="#ffe27a"/>'
    '<path d="M30 46q8 34 40 50" fill="none" stroke="#f2c14e" stroke-width="4"/>'
    '<path d="M16 22l4 10" stroke-width="7"/><path d="M16 22l4 10" stroke="#8b5a3c" stroke-width="3"/>'
    '<circle cx="114" cy="96" r="4" fill="#8b5a3c" stroke-width="2.5"/>'
    '<path d="M28 40q2 12 8 20" fill="none" stroke="#fff6c8" stroke-width="4"/>')

pictures["game-asset/home/chair"] = svg(
    '<rect x="38" y="14" width="52" height="46" rx="8" fill="#f5b971"/>'
    '<path d="M48 24v26M64 24v26M80 24v26" stroke="#d98f43" stroke-width="4"/>'
    '<path d="M30 64h68v12H30Z" fill="#e8846a"/>'
    '<path d="M38 76l-4 40M90 76l4 40M46 76l-2 28M82 76l2 28" stroke-width="6"/>'
    '<path d="M38 76l-4 40M90 76l4 40" stroke="#d98f43" stroke-width="2"/>'
    '<path d="M38 60v4M90 60v4" stroke-width="6"/>')

pictures["game-asset/home/dishes"] = svg(
    '<ellipse cx="64" cy="100" rx="52" ry="14" fill="#ffffff"/><ellipse cx="64" cy="98" rx="34" ry="8" fill="#eaf4ff" stroke="#b7dcf6" stroke-width="3"/>'
    '<ellipse cx="64" cy="84" rx="44" ry="12" fill="#ffffff"/><ellipse cx="64" cy="82" rx="28" ry="6" fill="#eaf4ff" stroke="#b7dcf6" stroke-width="3"/>'
    '<path d="M30 46h68q-2 32-34 32T30 46Z" fill="#8cc8f2"/><ellipse cx="64" cy="46" rx="34" ry="8" fill="#eaf4ff"/>'
    '<path d="M40 58q24 10 48 0" fill="none" stroke="#ffffff" stroke-width="4"/>'
    '<path d="M52 30q-6-8 0-14M64 30q-6-8 0-14M76 30q-6-8 0-14" fill="none" stroke="#c9b2f7" stroke-width="3"/>')

pictures["game-asset/home/light"] = svg(
    '<path d="M64 4v24" stroke-width="4"/>'
    '<path d="M28 64q0-36 36-36t36 36Z" fill="#b79cf2"/>'
    '<path d="M28 64h72" stroke-width="5"/>'
    '<circle cx="64" cy="74" r="12" fill="#fff6c8"/>'
    '<path d="M58 72q6-6 10 0" fill="none" stroke="#ffd45e" stroke-width="3"/>'
    + "".join(f'<path d="M{64 + math.cos(a) * 24:.1f} {74 + math.sin(a) * 24:.1f}L{64 + math.cos(a) * 34:.1f} {74 + math.sin(a) * 34:.1f}" stroke="#ffd45e" stroke-width="5"/>'
              for a in [math.radians(d) for d in (20, 55, 90, 125, 160)])
    + '<path d="M40 50q8-12 22-14" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/>')

pictures["game-asset/home/mattress"] = svg(
    '<path d="M16 58l24-20h72l-24 20Z" fill="#ffffff"/>'
    '<path d="M16 58h72v36H16Z" fill="#f4ebff"/><path d="M88 58l24-20v36L88 94Z" fill="#e3d6fb"/>'
    '<path d="M16 76h72" stroke="#c9b2f7" stroke-width="3"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="2.6" fill="#b79cf2" stroke="none"/>' for x, y in [(30, 67), (52, 67), (74, 67), (41, 85), (63, 85)])
    + "".join(f'<circle cx="{x}" cy="{y}" r="2.2" fill="#c9b2f7" stroke="none"/>' for x, y in [(40, 48), (60, 48), (80, 48), (96, 44)])
    + '<path d="M16 94v10M88 94v10M112 74v10" stroke-width="5"/>')

pictures["game-asset/home/sofa"] = svg(
    '<path d="M24 46q0-14 14-14h52q14 0 14 14v18H24Z" fill="#f7a8c8"/>'
    '<rect x="10" y="56" width="22" height="42" rx="10" fill="#f48fb8"/><rect x="96" y="56" width="22" height="42" rx="10" fill="#f48fb8"/>'
    '<path d="M30 64h68v34H30Z" fill="#f7a8c8"/>'
    '<rect x="32" y="62" width="30" height="16" rx="7" fill="#ffd3e6" stroke-width="3"/><rect x="66" y="62" width="30" height="16" rx="7" fill="#ffd3e6" stroke-width="3"/>'
    '<rect x="70" y="40" width="20" height="18" rx="6" fill="#fff6c8" stroke-width="3" transform="rotate(10 80 49)"/>'
    '<path d="M22 98v12M106 98v12" stroke-width="6"/>')

pictures["game-asset/home/wardrobe"] = svg(
    '<rect x="26" y="10" width="76" height="98" rx="6" fill="#c98a55"/>'
    '<path d="M64 10v98" stroke-width="4"/>'
    '<rect x="34" y="20" width="22" height="78" rx="3" fill="#dba371" stroke-width="3"/><rect x="72" y="20" width="22" height="78" rx="3" fill="#dba371" stroke-width="3"/>'
    '<circle cx="58" cy="60" r="3.5" fill="#ffd45e" stroke-width="2.5"/><circle cx="70" cy="60" r="3.5" fill="#ffd45e" stroke-width="2.5"/>'
    '<path d="M30 108v10M98 108v10" stroke-width="6"/>'
    '<path d="M18 118h92" stroke="#e3d6fb" stroke-width="5"/>')

# The rainbow coin (64×64): a gold coin with a rainbow and clouds.
pictures["rainbow-coin"] = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">\n'
    f'<circle cx="32" cy="33" r="27" fill="#ffc94a" stroke="{INK}" stroke-width="3"/>\n'
    '<circle cx="32" cy="33" r="20.5" fill="#ffe27a"/>\n'
    '<g fill="none" stroke-width="3.6"><path d="M18 40a14 14 0 0 1 28 0" stroke="#ff8fae"/><path d="M21.6 40a10.4 10.4 0 0 1 20.8 0" stroke="#ffb27a"/>'
    '<path d="M25.2 40a6.8 6.8 0 0 1 13.6 0" stroke="#8fd6a8"/><path d="M28.8 40a3.2 3.2 0 0 1 6.4 0" stroke="#8cc8f2"/></g>\n'
    '<g fill="#fff" stroke="#c9b2f7" stroke-width="1.5"><path d="M13 43a3.4 3.4 0 0 1 4-4.6 4 4 0 0 1 7.4 1.6 3 3 0 0 1-.4 6H16a3 3 0 0 1-3-3Z"/><path d="M40 43a3.4 3.4 0 0 1 4-4.6 4 4 0 0 1 7.4 1.6 3 3 0 0 1-.4 6H43a3 3 0 0 1-3-3Z"/></g>\n'
    '<path d="M14 25q4-10 14-13" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/>\n'
    f'<path d="m52 4 1.8 4.8 4.8 1.8-4.8 1.8-1.8 4.8-1.8-4.8-4.8-1.8 4.8-1.8Z" fill="#fff6c8" stroke="{INK}" stroke-width="1.6" stroke-linejoin="round"/>\n'
    '</svg>\n')

# ---------- Animals: faces stay ----------

pictures["game-asset/animals/cat"] = svg(
    '<defs><clipPath id="cat-head"><circle cx="64" cy="70" r="40"/></clipPath></defs>'
    '<path d="M28 52 30 14l28 26Z" fill="#ffffff"/><path d="M100 52 98 14 70 40Z" fill="#ffa552"/>'
    '<path d="M34 44l1-20 14 13Z" fill="#ffc2dc" stroke="none"/>'
    '<circle cx="64" cy="70" r="40" fill="#ffffff"/>'
    '<g clip-path="url(#cat-head)" stroke="none"><path d="M70 26q40 4 40 50-24 0-34-20Z" fill="#ffa552"/><path d="M20 70q4-20 20-24 8 16-4 30Z" fill="#5a4a48"/></g>'
    '<circle cx="64" cy="70" r="40" fill="none"/>'
    + face(64, 68, 1.2, happy=False) +
    '<path d="M60 77h8l-4 5Z" fill="#ff8fae" stroke-width="2.5"/><path d="M58 85q3 4 6 0 3 4 6 0" fill="none" stroke-width="2.6"/>'
    '<g stroke-width="2.2"><path d="M34 80l-18-2M34 86l-18 4M94 80l18-2M94 86l18 4"/></g>')

pictures["game-asset/animals/swan"] = svg(
    '<path d="M4 108q15-8 30 0t30 0 30 0 30 0v18H4Z" fill="#8cc8f2"/>'
    '<path d="M44 74q-14-18 0-36t30-4" fill="none" stroke-width="16"/><path d="M44 74q-14-18 0-36t30-4" fill="none" stroke="#ffffff" stroke-width="9"/>'
    '<circle cx="72" cy="34" r="12" fill="#ffffff"/>'
    '<path d="M82 32l14 4-14 6Z" fill="#ffa552" stroke-width="3"/><path d="M80 30q4 2 2 8" fill="none" stroke-width="4"/>'
    '<circle cx="73" cy="31" r="2.6" fill="' + INK + '" stroke="none"/><circle cx="73.8" cy="30.2" r=".9" fill="#fff" stroke="none"/>'
    '<ellipse cx="66" cy="38" rx="3" ry="2" fill="#ffb3c6" stroke="none"/>'
    '<path d="M26 92q-2-22 26-22h26q22 0 36-14 6 30-14 42-12 8-40 8-30 0-34-14Z" fill="#ffffff"/>'
    '<path d="M54 80q20-6 34 4-16 12-34 4" fill="#f4ebff" stroke-width="3"/>')

pictures["game-asset/animals/dolphin"] = svg(
    '<path d="M4 110q15-8 30 0t30 0 30 0 30 0v16H4Z" fill="#8cc8f2"/>'
    '<path d="M20 92Q28 52 70 42Q96 36 108 50L120 54L108 58Q100 66 86 64Q56 64 36 92L40 106L28 98L14 104Z" fill="#8cc8f2"/>'
    '<path d="M62 44Q66 26 80 22Q74 34 76 42Z" fill="#8cc8f2"/>'
    '<path d="M64 62q2 14-10 20 0-10-2-18Z" fill="#6fb3e6"/>'
    '<path d="M42 80Q62 62 92 62" fill="none" stroke="#e6f4fc" stroke-width="6"/>'
    '<ellipse cx="94" cy="49" rx="3" ry="3.4" fill="' + INK + '" stroke="none"/><circle cx="95" cy="48" r="1" fill="#fff" stroke="none"/>'
    '<ellipse cx="88" cy="56" rx="4" ry="2.4" fill="#ffb3c6" stroke="none"/>'
    '<path d="M104 58q4 3 8 1" fill="none" stroke-width="2.5"/>')

pictures["game-asset/animals/dragonfly"] = svg(
    '<g fill="#e6f4fc" stroke-width="3"><ellipse cx="38" cy="40" rx="28" ry="10" transform="rotate(-12 38 40)"/><ellipse cx="90" cy="40" rx="28" ry="10" transform="rotate(12 90 40)"/>'
    '<ellipse cx="40" cy="58" rx="24" ry="8" transform="rotate(10 40 58)"/><ellipse cx="88" cy="58" rx="24" ry="8" transform="rotate(-10 88 58)"/></g>'
    '<path d="M64 52v62" stroke-width="12"/><path d="M64 52v62" stroke="#6cc28a" stroke-width="6"/>'
    '<path d="M60 66h8M60 78h8M60 90h8M60 102h8" stroke-width="2.5"/>'
    '<ellipse cx="64" cy="48" rx="12" ry="10" fill="#6cc28a"/>'
    '<circle cx="64" cy="30" r="13" fill="#8fe3a8"/>'
    + face(64, 28, 0.8))

pictures["game-asset/animals/mole"] = svg(
    '<path d="M6 122q4-30 58-30t58 30Z" fill="#c98a55"/>'
    '<path d="M30 100q0-58 34-58t34 58Z" fill="#6e5a6e"/>'
    '<ellipse cx="64" cy="78" rx="12" ry="8" fill="#9a8496" stroke="none"/>'
    '<circle cx="64" cy="70" r="6" fill="#ff8fae" stroke-width="3"/>'
    '<path d="M50 60q3-3 6 0M72 60q3-3 6 0" fill="none" stroke-width="3"/>'
    '<ellipse cx="46" cy="70" rx="4" ry="2.4" fill="#ffb3c6" stroke="none"/><ellipse cx="82" cy="70" rx="4" ry="2.4" fill="#ffb3c6" stroke="none"/>'
    '<path d="M60 80q4 4 8 0" fill="none" stroke-width="2.5"/>'
    + "".join(f'<ellipse cx="{x}" cy="98" rx="13" ry="9" fill="#ffc2dc"/><path d="M{x - 8} 104v6M{x} 106v6M{x + 8} 104v6" stroke-width="3"/>' for x in (40, 88))
    + '<g fill="#a46a3c" stroke="none"><circle cx="18" cy="112" r="3"/><circle cx="108" cy="116" r="3"/><circle cx="96" cy="108" r="2"/></g>')

# ---------- Jobs: people ----------

pictures["game-asset/jobs/airport-police"] = svg(
    '<path d="M90 16l18 6 10-8 4 2-6 10 10 4-2 3-12-2-6 8-4-1 2-10-16-6Z" fill="#c9e6fb" stroke-width="2.5"/>'
    + person("#2c3e70", hair="#3d2b63",
             hat='<path d="M40 34q24-22 48 0v7H40Z" fill="#2c3e70"/><path d="M36 41h56q-4 8-28 8t-28-8Z" fill="#1b2748"/><circle cx="64" cy="31" r="4.5" fill="#ffd45e" stroke-width="2.5"/>',
             extra_front='<rect x="46" y="94" width="36" height="12" rx="3" fill="#ffd45e" stroke-width="3"/>'
                         '<path d="M78 84l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1Z" fill="#ffc94a" stroke-width="1.6"/>'))

pictures["game-asset/jobs/fashion-designer"] = svg(
    '<rect x="88" y="34" width="34" height="50" rx="4" fill="#ffffff" stroke-width="3"/>'
    '<path d="M98 44h14l4 12-6 2 4 18h-18l4-18-6-2Z" fill="#ffb3d1" stroke-width="2.5"/>'
    + person("#b79cf2", hair="#3d2b63",
             extra_front='<path d="M44 82q20 22 40 0" fill="none" stroke="#ffe27a" stroke-width="6"/>'
                         '<path d="M50 88l2-3M58 93l1-3M66 95v-3M74 93l-1-3" stroke-width="2"/>'
                         + arm([(88, 100), (98, 84)], "#b79cf2") +
                         '<path d="M98 84l6-12" stroke-width="5"/><path d="M98 84l6-12" stroke="#ffd45e" stroke-width="2"/>'))

pictures["game-asset/jobs/fashion-model"] = svg(
    '<path d="M24 126l14-28h52l14 28Z" fill="#f4ebff" stroke-width="3"/>'
    '<path d="M20 4l20 60M108 4l-20 60" stroke="#fff6c8" stroke-width="10" opacity=".9"/>'
    + person("#f06aa8", hair="#e0a050", long_hair=True,
             extra_front='<path d="M48 84h32l10 38H38Z" fill="#f06aa8"/>'
                         + "".join(f'<circle cx="{x}" cy="{y}" r="2" fill="#fff" stroke="none"/>' for x, y in [(52, 98), (66, 92), (74, 108), (58, 114)])
                         + arm([(40, 104), (34, 90), (44, 84)], "#ffe2c4", 9) + arm([(88, 104), (94, 90), (84, 84)], "#ffe2c4", 9)
                         + sparkle(22, 30, 6) + sparkle(106, 34, 6, "#ffb3d9")))

pictures["game-asset/jobs/garment-worker"] = svg(
    person("#8cc8f2", hair="#8b5a3c",
           extra_front='<path d="M10 104h108v22H10Z" fill="#dba371"/>'
                       '<path d="M30 104V82q0-8 8-8h36q8 0 8 8v8H62v14Z" fill="#ffffff"/>'
                       '<rect x="66" y="74" width="14" height="10" rx="2" fill="#f7a8c8" stroke-width="3"/>'
                       '<path d="M38 104l4-14" stroke-width="3"/>'
                       '<path d="M40 104h44l6-8H46Z" fill="#ffb3d1" stroke-width="3"/>'
                       '<circle cx="36" cy="88" r="4" fill="#ffd45e" stroke-width="2.5"/>'))

pictures["game-asset/jobs/reporter"] = svg(
    person("#ffe27a", hair="#6e432c",
           extra_front='<rect x="46" y="96" width="22" height="16" rx="3" fill="#ffffff" stroke-width="3"/>'
                       '<path d="M50 102h14M50 107h10" stroke-width="2"/>'
                       + arm([(84, 112), (96, 92)], "#ffe27a") +
                       '<path d="M98 88l10-18" stroke-width="7"/><path d="M98 88l10-18" stroke="#5b5b6e" stroke-width="3"/>'
                       '<circle cx="110" cy="64" r="9" fill="#5b5b6e"/><path d="M104 62h12M106 58h8M106 66h8" stroke="#8a8fa8" stroke-width="2"/>'))

# ---------- 地點 (places) ----------
# (Bank, cinema and library use Letter Jumble for Movers' drawings, so they aren't drawn here.)
P = "game-asset/places/"

def flag(x, y, color):
    return f'<path d="M{x} {y}v-15" stroke-width="3"/><path d="M{x} {y - 15}h14l-4 4 4 4h-14Z" fill="{color}" stroke-width="2.5"/>'

pictures[P + "school"] = svg(
    building("#fff2bf", "#ff8f8f",
             '<path d="M64 31v7l5 3" fill="none" stroke-width="3"/>',
             extra=flag(64, 18, "#8cc8f2")))

pictures[P + "music-room"] = svg(
    '<rect x="0" y="0" width="128" height="86" fill="#f4ebff" stroke="none"/><rect x="0" y="86" width="128" height="42" fill="#f8d9b3" stroke="none"/>'
    '<path d="M0 86h128" stroke-width="3"/>'
    '<path d="M18 104V56h64v48Z" fill="#5a4a48"/><rect x="22" y="60" width="56" height="12" rx="2" fill="#fff6c8" stroke-width="3"/>'
    '<path d="M22 72h56v8H22Z" fill="#ffffff" stroke-width="3"/>'
    + "".join(f'<path d="M{x} 72v5" stroke-width="2.5"/>' for x in range(28, 78, 6))
    + '<path d="M22 104v8M78 104v8" stroke-width="5"/>'
    '<ellipse cx="102" cy="100" rx="16" ry="6" fill="#ffffff"/><path d="M86 100v12q16 8 32 0v-12" fill="#ff8f8f"/><ellipse cx="102" cy="100" rx="16" ry="6" fill="#ffffff"/>'
    '<path d="M92 92l8 6M116 90l-8 8" stroke-width="3"/>'
    '<path d="M90 20v20" stroke-width="3"/><ellipse cx="86" cy="40" rx="5" ry="4" fill="#b79cf2" stroke-width="3"/>'
    '<path d="M104 14v22h12v-22Z" fill="none" stroke-width="3"/><ellipse cx="100" cy="36" rx="5" ry="4" fill="#f06aa8" stroke-width="3"/><ellipse cx="112" cy="36" rx="5" ry="4" fill="#f06aa8" stroke-width="3"/>'
    '<path d="M100 36v-22h16" fill="none" stroke-width="3"/><path d="M116 14v22" stroke-width="3"/>'
    '<path d="M30 30l6-6 6 6M30 30v12" fill="none" stroke="#ffd45e" stroke-width="3"/><ellipse cx="27" cy="42" rx="4" ry="3" fill="#ffd45e" stroke-width="2.5"/>')

pictures[P + "school-field"] = svg(
    '<rect x="4" y="22" width="120" height="100" rx="16" fill="#9fdcbf"/>'
    '<rect x="16" y="36" width="96" height="72" rx="36" fill="#ff9f7a"/>'
    '<rect x="28" y="48" width="72" height="48" rx="24" fill="#8fd6a8"/>'
    '<rect x="22" y="42" width="84" height="60" rx="30" fill="none" stroke="#ffffff" stroke-width="2.5"/>'
    '<path d="M64 48v48" stroke="#ffffff" stroke-width="3"/><circle cx="64" cy="72" r="9" fill="none" stroke="#ffffff" stroke-width="3"/>'
    + flag(108, 30, "#ffd45e")
    + '<circle cx="44" cy="80" r="6" fill="#ffffff" stroke-width="3"/><path d="M42 76l4 4-2 4" fill="none" stroke-width="2"/>')

pictures[P + "classroom"] = svg(
    '<rect x="0" y="0" width="128" height="90" fill="#fff6e0" stroke="none"/><rect x="0" y="90" width="128" height="38" fill="#f8d9b3" stroke="none"/>'
    '<path d="M0 90h128" stroke-width="3"/>'
    '<rect x="18" y="14" width="92" height="46" rx="4" fill="#4fa871"/><rect x="18" y="14" width="92" height="46" rx="4" fill="none" stroke="#c98a5a" stroke-width="5"/>'
    '<g fill="none" stroke="#ffffff" stroke-width="3"><path d="M30 28h16M30 40h26M70 26l6 10 6-10M86 36h12"/></g>'
    '<path d="M18 62h92" stroke="#c98a5a" stroke-width="4"/>'
    + "".join(f'<rect x="{x}" y="{y}" width="30" height="8" rx="2" fill="#f5b971" stroke-width="3"/><path d="M{x + 4} {y + 8}v10M{x + 26} {y + 8}v10" stroke-width="3"/>'
              for x, y in [(10, 86), (49, 86), (88, 86), (28, 106), (70, 106)]))

pictures[P + "school-hall"] = svg(
    '<rect x="0" y="0" width="128" height="128" fill="#f4ebff" stroke="none"/>'
    '<path d="M10 66h108v14H10Z" fill="#c98a55"/>'
    '<path d="M6 8h116v10H6Z" fill="#ff8f8f"/>'
    '<path d="M10 18q12 24 4 48h-4ZM118 18q-12 24-4 48h4Z" fill="#ff8f8f"/>'
    '<rect x="52" y="44" width="24" height="22" rx="3" fill="#dba371"/><path d="M64 44v-8" stroke-width="3"/><circle cx="64" cy="34" r="4" fill="#5b5b6e" stroke-width="2.5"/>'
    '<rect x="36" y="22" width="56" height="14" rx="3" fill="#fff6c8" stroke-width="3"/>'
    + "".join(f'<path d="M{x} {y}h14v-10q0-4 4-4h0" fill="none" stroke-width="3"/><rect x="{x}" y="{y - 14}" width="14" height="10" rx="3" fill="#b79cf2" stroke-width="3"/>'
              for y in (100, 120) for x in (14, 40, 66, 92)))

pictures[P + "supermarket"] = svg(
    '<path d="M8 22h88l-10 44H22Z" fill="none"/>'
    '<path d="M4 18h14l12 52h62l10-38H22" fill="none" stroke-width="5"/>'
    '<path d="M24 34h76l-8 30H30Z" fill="#c9e6fb" stroke-width="3"/>'
    '<rect x="36" y="20" width="18" height="16" rx="3" fill="#ff8f8f" stroke-width="3"/><rect x="56" y="16" width="14" height="20" rx="3" fill="#ffe27a" stroke-width="3"/>'
    '<path d="M74 22q8-8 14 0v14H74Z" fill="#8fe3a8" stroke-width="3"/>'
    '<circle cx="80" cy="16" r="5" fill="#ffb86b" stroke-width="2.5"/>'
    '<path d="M30 70l-4 14h70" fill="none" stroke-width="5"/>'
    '<circle cx="36" cy="98" r="8" fill="#5b5b6e"/><circle cx="86" cy="98" r="8" fill="#5b5b6e"/>'
    '<path d="M36 50h52M44 34l-2 30M58 34v30M72 34l2 30M86 34l-2 30" stroke="#ffffff" stroke-width="2"/>'
    + ground())

pictures[P + "playground"] = svg(
    '<path d="M12 116V40h16v76" fill="none" stroke-width="5"/><path d="M12 56h16M12 72h16M12 88h16M12 104h16" stroke-width="3"/>'
    '<path d="M20 40h-4l4-14 4 14Z" fill="#ff8f8f" stroke-width="3"/>'
    '<path d="M28 44q30 4 34 40t30 32h-12q-14-18-24-32-6-26-28-30Z" fill="#ffe27a"/>'
    '<path d="M78 30l-6 86M120 30l6 86M74 30h50" fill="none" stroke-width="5"/>'
    '<path d="M90 30v52M106 30v52" stroke-width="2.5"/>'
    '<rect x="84" y="82" width="28" height="7" rx="3" fill="#8cc8f2" stroke-width="3"/>'
    + ground("#f8d9b3"))

pictures[P + "beach"] = svg(
    '<rect x="0" y="0" width="128" height="62" fill="#cbe9ff" stroke="none"/>'
    '<circle cx="100" cy="26" r="12" fill="#ffe27a" stroke-width="3"/>'
    '<path d="M0 54h128v26H0Z" fill="#8cd3f2" stroke-width="3"/>'
    '<path d="M0 66q8-5 16 0t16 0 16 0 16 0 16 0 16 0 16 0 16 0" fill="none" stroke="#fff" stroke-width="3"/>'
    '<path d="M0 82q32-10 64 0t64 0V128H0Z" fill="#ffe7b0" stroke-width="3"/>'
    '<path d="M36 118V66" stroke-width="4"/>'
    '<path d="M8 70q28-34 56 0Z" fill="#ff8fa3"/><path d="M28 70q2-24 8-36 6 12 8 36q-8-4-16 0Z" fill="#fff6c8" stroke-width="3"/>'
    '<path d="M8 70q28-34 56 0" fill="none" stroke-width="4"/>'
    '<path d="M86 108l4-10 4 10-10-6h12Z" fill="#ffb86b" stroke-width="2.5"/>'
    '<circle cx="104" cy="100" r="9" fill="#ffffff" stroke-width="3"/><path d="M96 98q8 4 16 0" fill="none" stroke="#ff8fa3" stroke-width="3"/>')

pictures[P + "country-park"] = svg(
    '<rect x="0" y="0" width="128" height="128" rx="14" fill="#d8f0ff" stroke="none"/>'
    '<path d="M-4 84l40-50 30 36 22-24 44 38v48H-4Z" fill="#9fdcbf"/>'
    '<path d="M26 46l10-12 10 12q-10 4-20 0Z" fill="#ffffff" stroke-width="3"/>'
    '<path d="M-4 96q40-18 132 0v34H-4Z" fill="#8fd6a8"/>'
    '<path d="M54 128q-4-16 10-24t8-18" fill="none" stroke="#ffe7b0" stroke-width="10"/>'
    + "".join(f'<path d="M{x} {y}l10 18H{x - 10}Z" fill="#4fa871" stroke-width="3"/><path d="M{x} {y + 10}l12 20H{x - 12}Z" fill="#4fa871" stroke-width="3"/><path d="M{x} {y + 30}v8" stroke-width="4"/>'
              for x, y in [(22, 72), (104, 70)])
    + '<path d="M86 112v-14" stroke-width="3"/><rect x="78" y="90" width="18" height="10" rx="2" fill="#f5b971" stroke-width="2.5"/>')

pictures[P + "shopping-mall"] = svg(
    '<path d="M14 34h100v82H14Z" fill="#e3d6fb"/>'
    '<path d="M10 22h108v14H10Z" fill="#b79cf2"/>'
    + "".join(f'<rect x="{x}" y="{y}" width="20" height="16" rx="2" fill="#c9e6fb" stroke-width="3"/>' for x in (22, 54, 86) for y in (44, 68))
    + '<path d="M44 116V94h40v22" fill="#c9e6fb" stroke-width="3"/><path d="M64 94v22" stroke-width="3"/>'
    '<path d="M50 6h12l-2 14H52Z" fill="#ff8fa3" stroke-width="3"/><path d="M53 6q3-6 6 0" fill="none" stroke-width="2.5"/>'
    '<path d="M68 8h10l-2 12h-6Z" fill="#ffe27a" stroke-width="3"/><path d="M70 8q3-5 6 0" fill="none" stroke-width="2.5"/>'
    + ground())

pictures[P + "theatre"] = svg(
    '<rect x="4" y="8" width="120" height="110" rx="6" fill="#5a4a6e"/>'
    '<path d="M16 26h96v66H16Z" fill="#fff6e0" stroke-width="3"/>'
    '<path d="M8 12h112v12H8Z" fill="#ff8f8f"/>'
    '<path d="M16 24q18 30 6 68H16ZM112 24q-18 30-6 68h6Z" fill="#ff8f8f"/>'
    '<path d="M44 46q6-10 14-4 2 14-6 20-10-2-8-16Z" fill="#ffe27a" stroke-width="3"/><path d="M48 50l2 2M54 50l-2 2M48 58q3-3 6 0" fill="none" stroke-width="2"/>'
    '<path d="M84 46q-6-10-14-4-2 14 6 20 10-2 8-16Z" fill="#8cc8f2" stroke-width="3"/><path d="M74 50l2 2M80 50l-2 2M74 60q3 3 6 0" fill="none" stroke-width="2"/>'
    '<path d="M16 92h96v10H16Z" fill="#c98a55" stroke-width="3"/>')

pictures[P + "restaurant"] = svg(
    building("#fff6e0", "#ffb86b",
             '<path d="M59 31v14M56 31v5q0 3 3 3t3-3v-5M69 31q4 4 0 10v4" fill="none" stroke-width="2.5"/>',
             extra='<path d="M24 54q10 10 20 0 10 10 20 0 10 10 20 0 10 10 20 0" fill="#ffd3e6" stroke-width="3"/>'))

pictures[P + "theme-park"] = svg(
    '<circle cx="46" cy="52" r="36" fill="none" stroke-width="5"/>'
    + "".join(f'<path d="M46 52L{46 + 36 * math.cos(a):.1f} {52 + 36 * math.sin(a):.1f}" stroke-width="2.5"/>' for a in [i * math.pi / 4 for i in range(8)])
    + "".join(f'<rect x="{46 + 36 * math.cos(a) - 6:.1f}" y="{52 + 36 * math.sin(a) - 4:.1f}" width="12" height="10" rx="3" fill="{c}" stroke-width="3"/>'
              for a, c in zip([i * math.pi / 3 for i in range(6)], ["#ff8fa3", "#ffe27a", "#8fe3a8", "#8cc8f2", "#b79cf2", "#ffb86b"]))
    + '<circle cx="46" cy="52" r="6" fill="#ffd45e" stroke-width="3"/>'
    '<path d="M46 52l-18 64M46 52l18 64" stroke-width="5"/>'
    '<path d="M70 116q4-50 22-50t18 30 14 20" fill="none" stroke-width="5"/><path d="M70 116q4-50 22-50t18 30 14 20" fill="none" stroke="#ff8fa3" stroke-width="2"/>'
    '<path d="M84 76v40M100 70v46M114 108v8" stroke-width="3"/>'
    + ground())

pictures[P + "fire-station"] = svg(
    '<path d="M14 40h100v76H14Z" fill="#ff8f8f"/>'
    '<path d="M8 28h112v14H8Z" fill="#c9524f"/>'
    '<rect x="26" y="58" width="76" height="58" rx="4" fill="#ffffff"/>'
    '<path d="M26 72h76M26 86h76M26 100h76" stroke="#d6dde6" stroke-width="3"/>'
    '<rect x="38" y="84" width="52" height="28" rx="4" fill="#ff5f5f" stroke-width="3"/><rect x="44" y="88" width="16" height="10" rx="2" fill="#c9e6fb" stroke-width="2.5"/><rect x="68" y="88" width="16" height="10" rx="2" fill="#c9e6fb" stroke-width="2.5"/>'
    '<circle cx="64" cy="18" r="9" fill="#ffd45e" stroke-width="3"/><path d="M64 9v-4" stroke-width="3"/>'
    + ground())

pictures[P + "wet-market"] = svg(
    '<path d="M10 20h108v16H10Z" fill="#ffffff"/>'
    + "".join(f'<path d="M{x} 20h12v16h-12Z" fill="#8fe3a8" stroke="none"/>' for x in (10, 34, 58, 82, 106))
    + '<path d="M10 20h108v16H10Z" fill="none"/>'
    '<path d="M10 36q6 8 12 0 6 8 12 0 6 8 12 0 6 8 12 0 6 8 12 0 6 8 12 0 6 8 12 0 6 8 12 0 6 8 12 0" fill="#ffffff" stroke-width="3"/>'
    '<path d="M16 44v72M112 44v72" stroke-width="5"/>'
    '<path d="M16 74h96v42H16Z" fill="#dba371"/>'
    '<path d="M22 72q8-12 18-6 4-6 10 0l-4 8H22Z" fill="#8fe3a8" stroke-width="3"/>'
    '<g fill="#ff6f6f" stroke-width="2.5"><circle cx="60" cy="66" r="6"/><circle cx="72" cy="66" r="6"/><circle cx="66" cy="58" r="6"/></g>'
    '<path d="M86 66q10-8 18 0-8 8-18 0Z M84 66l-6-5v10Z" fill="#8cc8f2" stroke-width="2.5"/>'
    '<path d="M16 92h96" stroke="#c98a55" stroke-width="3"/>'
    '<rect x="88" y="98" width="18" height="10" rx="2" fill="#ffffff" stroke-width="2.5"/>')

# The topic icon: a little map pin over a town.
pictures["icons/chinese-places"] = svg(
    '<circle cx="64" cy="68" r="52" fill="#d8f0ff"/>'
    '<path d="M18 92h92v8H18Z" fill="#9fdcbf" stroke-width="3"/>'
    '<path d="M26 92V70l12-10 12 10v22Z" fill="#fff2bf" stroke-width="3"/><path d="M78 92V64h24v28Z" fill="#e3d6fb" stroke-width="3"/>'
    '<path d="M64 74q-22-24-22-38a22 22 0 0 1 44 0q0 14-22 38Z" fill="#ff8fa3"/><circle cx="64" cy="36" r="8" fill="#ffffff" stroke-width="3"/>')


# R and L Blends' topic icons: the blends in coloured bubbles, like Consonant Digraphs' icons.
def blend_bubbles(items):
    out = ""
    for x, y, fill, text in items:
        size = 26 if len(text) == 2 else 21
        out += (f'<circle cx="{x}" cy="{y}" r="24" fill="{fill}"/>'
                f'<text x="{x}" y="{y + size * 0.34:.0f}" text-anchor="middle" font-family="Fredoka,Arial Rounded MT Bold,Arial,sans-serif" '
                f'font-size="{size}" font-weight="700" fill="{INK}" stroke="none">{text}</text>')
    return svg(out)


pictures["icons/blends-r"] = blend_bubbles([(40, 40, "#ffb3d1", "br"), (88, 40, "#ffe27a", "cr"), (64, 88, "#8cc8f2", "tr")])
pictures["icons/blends-l"] = blend_bubbles([(40, 40, "#8cc8f2", "bl"), (88, 40, "#8fe3a8", "cl"), (64, 88, "#ffb3d1", "fl")])
pictures["icons/blends-mixed"] = blend_bubbles([(40, 40, "#ffb3d1", "br"), (88, 40, "#c9b6f5", "fl"), (64, 88, "#ffe27a", "str")])


for name, body in pictures.items():
    path = os.path.join(IMAGES, name + ".svg")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(body)
print(len(pictures), "pictures")
