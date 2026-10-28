# Draws the games' word pictures that used to be emoji, in the app's outlined pastel style, into
# public/images/game-asset/<folder>/. People and animals get faces; things don't.
# Run from the project root: python3 scripts/draw-words.py
import math, os

INK = "#4b2e22"
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

S = "sports-and-leisure/"
pictures[S + "band"] = svg(
    '<path d="M70 50l36-36 8 8-36 36" fill="#c98a55"/><path d="M104 12l8-4 8 8-4 8Z" fill="#8b5a3c"/>'
    '<path d="M50 52c-12-12-34-6-38 10-4 16 6 26 14 30 2 12 14 24 30 22 18-2 26-18 20-32 10-4 14-14 8-22-8-10-22-14-34-8Z" fill="#ff8fa3"/>'
    '<circle cx="54" cy="76" r="10" fill="#4b2e22"/><path d="M40 92l18-18M44 96l18-18" stroke="#fff6e0" stroke-width="2"/>'
    '<path d="M76 54l-24 24" stroke="#fff6e0" stroke-width="2.5"/>')
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


for name, body in pictures.items():
    path = os.path.join(IMAGES, name + ".svg")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(body)
print(len(pictures), "pictures")
