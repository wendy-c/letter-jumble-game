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


# ---------- Letter Jumble for Starters: animals ----------
def face(x, y, s=1.0):
    return eye(x - 8 * s, y, s) + eye(x + 8 * s, y, s) + cheek(x - 14 * s, y + 7 * s, s) + cheek(x + 14 * s, y + 7 * s, s) + smile(x, y + 8 * s, 6 * s)


pictures[A + "bird"] = svg(
    '<path d="M22 70q0-32 34-36 30-2 40 20l16 4-14 8q-4 28-38 30-38 2-38-26Z" fill="#8cc8f2"/>'
    '<path d="M42 66q16-14 34 4-16 14-34-4Z" fill="#6fb3e6"/><path d="M100 54l14 6-14 4Z" fill="#ffb86b"/>'
    '<path d="M50 96l-4 16M66 96l4 16" stroke-width="3"/>' + eye(88, 50) + cheek(80, 58))
pictures[A + "duck"] = svg(
    '<path d="M16 76q4 30 46 30t48-26q-10 4-20 0-6-12 2-26 0-24-24-26-26 2-24 26 2 12 8 20-10 6-36 2Z" fill="#ffe27a"/>'
    '<path d="M78 46l26 2-26 10Z" fill="#ffb86b"/><path d="M38 80q16-6 30 6" fill="none" stroke="#f2c94c" stroke-width="5"/>'
    + eye(66, 40) + cheek(60, 50))
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
    '<path d="M16 70q10-18 30-14 30 6 50 0 18-4 22 10-6 10-22 10-26-2-46 8-20 10-34-14Z" fill="#8fe3a8"/>'
    '<path d="M96 66q16 10 18 34-14-4-22-20" fill="#8fe3a8"/>'
    '<path d="M34 58l-10-14M58 60l-8-16M58 76l-8 16M34 80l-8 16" stroke-width="5"/>'
    '<path d="M40 64h4M60 66h4M78 64h4" stroke="#4fb893" stroke-width="4"/>' + eye(24, 64) + cheek(20, 72))
pictures[A + "pet"] = svg(
    '<ellipse cx="64" cy="82" rx="26" ry="22" fill="#ffb3d1"/>'
    '<ellipse cx="34" cy="54" rx="10" ry="13" fill="#ffb3d1"/><ellipse cx="52" cy="36" rx="10" ry="13" fill="#ffb3d1"/>'
    '<ellipse cx="76" cy="36" rx="10" ry="13" fill="#ffb3d1"/><ellipse cx="94" cy="54" rx="10" ry="13" fill="#ffb3d1"/>'
    '<path d="M54 76q10-8 20 0-4 10-10 12-6-2-10-12Z" fill="#ff8fae" stroke="none"/>')
pictures[A + "giraffe"] = svg(
    '<path d="M44 120V62q0-10 10-10h4l8-34q2-8 10-6l8 4q6 2 8 8l2 10-10 4-8-2-8 36q20 4 20 22v36" fill="#ffd45e"/>'
    '<circle cx="62" cy="80" r="6" fill="#c98a55" stroke="none"/><circle cx="74" cy="98" r="5" fill="#c98a55" stroke="none"/><circle cx="56" cy="104" r="5" fill="#c98a55" stroke="none"/><circle cx="72" cy="40" r="4" fill="#c98a55" stroke="none"/>'
    '<path d="M78 12V2M88 16V6" stroke-width="3"/><circle cx="78" cy="2" r="3" fill="#c98a55" stroke-width="2"/><circle cx="88" cy="6" r="3" fill="#c98a55" stroke-width="2"/>'
    + eye(84, 20) + cheek(92, 26))
pictures[A + "hippo"] = svg(
    '<ellipse cx="64" cy="82" rx="46" ry="32" fill="#b9a8e0"/><ellipse cx="64" cy="52" rx="34" ry="24" fill="#b9a8e0"/>'
    '<ellipse cx="64" cy="66" rx="28" ry="16" fill="#cfc2ef"/><circle cx="56" cy="64" r="3" fill="#4b2e22" stroke="none"/><circle cx="72" cy="64" r="3" fill="#4b2e22" stroke="none"/>'
    '<circle cx="38" cy="32" r="7" fill="#b9a8e0"/><circle cx="90" cy="32" r="7" fill="#b9a8e0"/>' + eye(50, 42) + eye(78, 42) + cheek(40, 54) + cheek(88, 54))
pictures[A + "snake"] = svg(
    '<path d="M18 108q-6-20 18-22h50q20 0 20-14t-20-14H48q-20 0-20-16t20-18h40" fill="none" stroke-width="20"/>'
    '<path d="M18 108q-6-20 18-22h50q20 0 20-14t-20-14H48q-20 0-20-16t20-18h40" fill="none" stroke="#8fe3a8" stroke-width="13"/>'
    '<ellipse cx="96" cy="24" rx="14" ry="11" fill="#8fe3a8"/><path d="M110 26l8 2-6 4" fill="none" stroke="#ff6f6f" stroke-width="2.5"/>' + eye(98, 21, 0.8))
pictures[A + "crocodile"] = svg(
    '<path d="M8 80q0-14 22-14h48l36-6q8 2 6 10t-12 8H78l-48 10q-22 4-22-8Z" fill="#6fcf8f"/>'
    '<path d="M78 76h34" stroke-width="3"/><path d="M82 70l4 6 4-6 4 6 4-6 4 6" fill="#ffffff" stroke-width="2"/>'
    '<path d="M24 88l-4 14M48 86l-2 14" stroke-width="6"/><path d="M30 66l6-8 6 8 6-8 6 8" fill="#6fcf8f" stroke-width="3"/>' + eye(70, 62) + cheek(62, 70))

# ---------- Letter Jumble for Starters: food ----------
F = "food/"
pictures[F + "coconut"] = svg(
    '<circle cx="64" cy="66" r="44" fill="#a46a3c"/><path d="M28 62q36-20 72 0" fill="none" stroke="#7a4e2b" stroke-width="3"/>'
    '<path d="M44 44a26 26 0 0 0 40 0" fill="#fff6e0" stroke-width="3"/><path d="M58 34l4 6M70 34l-4 6M64 42v6" stroke="#7a4e2b" stroke-width="3"/>')
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
pictures[F + "chicken"] = svg(
    '<path d="M40 30q34-18 54 8 14 22-6 40-12 10-26 8L44 100q-6 6-12 0l-4-4q-6-6 0-12l16-16q-12-12-14-24 0-8 10-14Z" fill="#d98b4a"/>'
    '<path d="M28 96q-14 4-14-6 0-8 10-8-2-10 6-10 10 0 8 12Z" fill="#fff6e0"/>'
    '<path d="M54 42q16-8 28 4" fill="none" stroke="#f3b37a" stroke-width="5"/>')
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
SKIN = "#ffe2c4"


def person(x, y, s=1.0, hair="#8b5a3c", shirt="#8cc8f2", style="short", extra=""):
    """A head-and-shoulders person centred on (x, y) (the head's centre), `s` times the usual size."""
    k = lambda v: f"{v * s:.1f}"
    hairs = {
        "short": f'<path d="M{x - 22 * s:.1f} {y - 2 * s:.1f}q0-26 22-26 22 0 22 26-6-12-22-12-16 0-22 12Z" fill="{hair}"/>',
        "long": f'<path d="M{x - 24 * s:.1f} {y + 26 * s:.1f}q-4-30 2-40 6-14 22-14 16 0 22 14 6 10 2 40Z" fill="{hair}"/>',
        "bun": f'<circle cx="{x}" cy="{y - 26 * s:.1f}" r="{9 * s:.1f}" fill="{hair}"/><path d="M{x - 22 * s:.1f} {y}q0-24 22-24 22 0 22 24-8-12-22-12-14 0-22 12Z" fill="{hair}"/>',
        "bald": f'<path d="M{x - 22 * s:.1f} {y + 2 * s:.1f}q-2-10 4-12M{x + 22 * s:.1f} {y + 2 * s:.1f}q2-10-4-12" fill="none" stroke="{hair}" stroke-width="{5 * s:.1f}"/>',
        "baby": f'<path d="M{x} {y - 22 * s:.1f}q4-6 0-10" fill="none" stroke-width="{3 * s:.1f}"/>',
        "pigtails": f'<circle cx="{x - 24 * s:.1f}" cy="{y - 4 * s:.1f}" r="{8 * s:.1f}" fill="{hair}"/><circle cx="{x + 24 * s:.1f}" cy="{y - 4 * s:.1f}" r="{8 * s:.1f}" fill="{hair}"/><path d="M{x - 22 * s:.1f} {y}q0-24 22-24 22 0 22 24-8-12-22-12-14 0-22 12Z" fill="{hair}"/>',
    }
    back = hairs["long"] if style == "long" else ""
    return (back + f'<path d="M{x - 30 * s:.1f} {y + 56 * s:.1f}q0-26 30-26t30 26Z" fill="{shirt}"/>'
            f'<circle cx="{x}" cy="{y}" r="{22 * s:.1f}" fill="{SKIN}"/>'
            + ("" if style == "long" else hairs.get(style, ""))
            + (f'<path d="M{x - 22 * s:.1f} {y}q0-24 22-24 22 0 22 24-8-12-22-12-14 0-22 12Z" fill="{hair}"/>' if style == "long" else "")
            + eye(x - 8 * s, y + 2 * s, s) + eye(x + 8 * s, y + 2 * s, s) + cheek(x - 13 * s, y + 9 * s, s) + cheek(x + 13 * s, y + 9 * s, s)
            + smile(x, y + 11 * s, 6 * s) + extra)


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
pictures[ST + "hair"] = svg(
    f'<circle cx="64" cy="70" r="36" fill="{SKIN}"/>'
    '<path d="M20 104q-8-40 4-62 14-26 40-26t40 26q12 22 4 62-10-28-14-50-12 8-30 8t-30-8q-4 22-14 50Z" fill="#a46a3c"/>'
    '<path d="M44 26q10 10 20 8M70 22q12 6 22 22" fill="none" stroke="#c98a55" stroke-width="3"/>' + eye(52, 76) + eye(76, 76) + smile(64, 88, 8))
pictures[ST + "eye"] = svg(
    '<path d="M10 64q54-56 108 0-54 56-108 0Z" fill="#ffffff"/><circle cx="64" cy="64" r="22" fill="#8cc8f2"/><circle cx="64" cy="64" r="11" fill="#4b2e22" stroke="none"/>'
    '<circle cx="58" cy="58" r="5" fill="#ffffff" stroke="none"/><path d="M24 40l-8-10M44 28l-4-12M64 24V12M84 28l4-12M104 40l8-10" stroke-width="4"/>')
pictures[ST + "ear"] = svg(
    f'<path d="M44 30q20-24 46-8 22 16 14 46-6 20-22 30-10 6-10 18-2 12-16 10-14-2-12-18 2-14 10-22 10-10 6-20-4-8-12-4-8 4-10 12-4 8-10 4-6-4-2-14 4-24 16-34Z" fill="{SKIN}"/>'
    '<path d="M62 44q16-6 22 10 4 14-10 22" fill="none" stroke="#f2b8a0" stroke-width="5"/>')
pictures[ST + "nose"] = svg(
    f'<circle cx="64" cy="64" r="50" fill="{SKIN}" stroke="none"/><path d="M64 24q-6 30-22 48-8 12 4 20 10 6 18-2 8 8 18 2 12-8 4-20-16-18-22-48Z" fill="#ffd6b8"/>'
    '<ellipse cx="54" cy="84" rx="4" ry="3" fill="#4b2e22" stroke="none"/><ellipse cx="74" cy="84" rx="4" ry="3" fill="#4b2e22" stroke="none"/>')
pictures[ST + "mouth"] = svg(
    '<path d="M14 60q24-18 38-10 12-6 12-6t12 6q14-8 38 10-20 30-50 30T14 60Z" fill="#ff8fa3"/>'
    '<path d="M18 62q46 14 92 0" fill="none" stroke-width="3"/><path d="M34 64h60v8H34Z" fill="#ffffff" stroke-width="2.5"/>')
pictures[ST + "arm"] = svg(
    f'<path d="M20 100q-4-30 22-38l20-6q-6-20 8-34 10-10 20-2 12 10 8 24l-10 18q-4 22-26 30l-24 20q-14 4-18-12Z" fill="{SKIN}"/>'
    '<path d="M62 56q-6 12 4 20" fill="none" stroke="#f2b8a0" stroke-width="4"/>' + sparkle(108, 22, 8) + sparkle(100, 60, 6, "#ffb3d9"))
pictures[ST + "body"] = svg(
    f'<circle cx="64" cy="22" r="14" fill="{SKIN}"/><path d="M40 40h48l8 44H32Z" fill="#8cc8f2"/>'
    f'<path d="M40 44l-16 34M88 44l16 34" stroke="{INK}" stroke-width="12"/><path d="M40 44l-16 34M88 44l16 34" stroke="{SKIN}" stroke-width="6"/>'
    '<path d="M44 84h40l-4 34H48Z" fill="#5b6b8c"/><path d="M64 88v30" stroke-width="3"/>'
    + eye(59, 22, 0.7) + eye(69, 22, 0.7) + smile(64, 28, 5))
pictures[ST + "foot"] = svg(
    f'<path d="M48 40q-10 30 0 54 6 22 22 22 18 0 18-22 0-14-6-26-6-14-2-28-14-10-32 0Z" fill="{SKIN}"/>'
    + "".join(f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r * 1.2:.1f}" fill="{SKIN}"/>' for x, y, r in [(52, 26, 8), (68, 18, 7), (82, 20, 6), (92, 28, 5), (98, 38, 4.5)]))
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
pictures[ST + "clothes"] = svg(
    '<path d="M64 10v8" stroke-width="3"/><path d="M8 28h112" stroke="#c98a55" stroke-width="5"/>'
    '<path d="M18 30h32l-4 16 12 62H12l12-62Z" fill="#ff8fb7"/>'
    '<path d="M70 30h40l10 18-10 6v54H80V54l-10-6Z" fill="#8cc8f2"/><path d="M84 30q6 10 12 0" fill="none" stroke-width="3"/>')
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
pictures[ST + "dining-room"] = svg(
    '<path d="M14 64h100v10H14Z" fill="#c98a55"/><path d="M24 74v40M104 74v40" stroke-width="6"/>'
    '<ellipse cx="44" cy="60" rx="16" ry="5" fill="#ffffff"/><ellipse cx="84" cy="60" rx="16" ry="5" fill="#ffffff"/>'
    '<path d="M60 58V36M68 58V36" stroke-width="3"/><path d="M58 30q6-12 12 0Z" fill="#ffd45e" stroke-width="2.5"/>'
    '<path d="M24 22h80" stroke-width="3"/><path d="M64 22v-14" stroke-width="3"/>')
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
    '<path d="M22 76q0-46 42-46t42 46Z" fill="#8cc8f2"/><path d="M64 30v46" stroke-width="3"/>'
    '<path d="M98 72q30 2 26 18-32 4-60-8" fill="#6fb3e6"/><circle cx="64" cy="28" r="5" fill="#ffd45e" stroke-width="3"/>')
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
    f'<path d="M14 84q20-6 34 6l16 10 16-10q14-12 34-6v26H14Z" fill="{SKIN}"/>'
    '<circle cx="64" cy="48" r="24" fill="#ff8fa3"/><path d="M52 40q4-8 12-8" fill="none" stroke="#ffffff" stroke-width="4"/>'
    '<path d="M64 24q2-10 10-12" fill="none" stroke="#4fb893" stroke-width="4"/>')
pictures[C + "web"] = svg(
    "".join(f'<path d="M64 64L{64 + 56 * math.cos(a):.1f} {64 + 56 * math.sin(a):.1f}" stroke-width="2.5"/>' for a in [i * math.pi / 4 for i in range(8)])
    + "".join('<path d="' + "".join(f'{"M" if i == 0 else "L"}{64 + r * math.cos(i * math.pi / 4):.1f} {64 + r * math.sin(i * math.pi / 4):.1f}' for i in range(9)) + '" fill="none" stroke-width="2.5"/>' for r in (16, 30, 44))
    + '<circle cx="86" cy="86" r="9" fill="#4b2e22"/><path d="M78 84l-8 4M78 90l-6 6M94 84l8 4M94 90l6 6" stroke-width="2.5"/>')
pictures[C + "wet"] = svg(
    '<path d="M64 20q-34 40-34 60a34 34 0 0 0 68 0q0-20-34-60Z" fill="#8cc8f2"/>'
    '<path d="M46 80q0 14 12 20" fill="none" stroke="#ffffff" stroke-width="5"/>'
    '<path d="M22 30q-8 12 0 16 8-4 0-16ZM106 40q-8 12 0 16 8-4 0-16ZM18 96q-6 10 0 13 6-3 0-13Z" fill="#cfe9ff" stroke-width="3"/>')
pictures[C + "pin"] = svg(
    '<circle cx="76" cy="44" r="26" fill="#ff6f6f"/><path d="M64 30q6-8 14-6" fill="none" stroke="#ffffff" stroke-width="4"/>'
    '<path d="M62 60 20 108" stroke-width="5"/><path d="M62 60 20 108" stroke="#d6d0e0" stroke-width="2"/>')
pictures[C + "bin"] = svg(
    '<path d="M28 36h72l-8 78H36Z" fill="#8fe3a8"/><path d="M22 26h84v12H22Z" fill="#6fcf8f"/><path d="M52 26v-8h24v8" fill="none" stroke-width="4"/>'
    '<path d="M50 50v50M64 50v50M78 50v50" stroke="#4fb893" stroke-width="4"/>')
pictures[C + "lid"] = svg(
    '<path d="M34 64h60v50H34Z" fill="#d6d0e0"/><path d="M40 74h48v30H40Z" fill="#ffd45e" stroke-width="3"/>'
    '<ellipse cx="72" cy="36" rx="34" ry="10" fill="#b39ef0" transform="rotate(-18 72 36)"/><path d="M68 22l6-8" stroke-width="4"/>'
    '<path d="M40 50l6-8M54 46l4-8" stroke="#8cc8f2" stroke-width="3"/>')
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
    '<path d="M64 112 26 62q-4-20 38-20t38 20Z" fill="#ff8fa3"/><path d="M26 62q38 16 76 0" fill="none" stroke-width="4"/>'
    '<path d="M44 52l40 0M40 62l48 0" stroke="#ffe27a" stroke-width="5"/><path d="M64 42V14" stroke-width="8"/><path d="M64 42V14" stroke="#b79cf2" stroke-width="4"/>'
    '<path d="M18 92q-8 0-10-8M110 92q8 0 10-8" fill="none" stroke-width="3"/>')
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
pictures[D + "both"] = svg(
    f'<path d="M16 116V70l-8-24q-2-8 6-10 6-2 8 6l6 18 4-30q2-8 8-6 6 2 6 8l-2 30 8-24q2-6 8-4 6 2 4 8l-8 30v44Z" fill="{SKIN}"/>'
    f'<path d="M112 116V70l8-24q2-8-6-10-6-2-8 6l-6 18-4-30q-2-8-8-6-6 2-6 8l2 30-8-24q-2-6-8-4-6 2-4 8l8 30v44Z" fill="{SKIN}"/>'
    + sparkle(64, 20, 10))
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
pictures[D + "whisper"] = svg(
    person(40, 66, 1.0, "#8b5a3c", "#8fe3a8", "short") + person(90, 66, 1.0, "#a46a3c", "#ffb3d1", "long")
    + f'<path d="M60 70q4-6 12-6" fill="none" stroke="{SKIN}" stroke-width="8"/>'
    '<path d="M58 40q6-10 10-4M64 30q8-12 14-4" fill="none" stroke="#b79cf2" stroke-width="3"/>')
pictures[D + "lock"] = svg(
    '<path d="M40 56V40a24 24 0 0 1 48 0v16" fill="none" stroke-width="8"/><path d="M40 56V40a24 24 0 0 1 48 0v16" fill="none" stroke="#d6d0e0" stroke-width="4"/>'
    '<path d="M26 56h76v56H26Z" fill="#ffd45e"/><circle cx="64" cy="80" r="8" fill="#4b2e22"/><path d="M64 84v14" stroke-width="6"/>')
pictures[D + "kick"] = svg(
    f'<path d="M30 16h20v52q0 6 6 10l24 10q10 4 6 14-4 8-14 4l-30-14q-12-6-12-20Z" fill="{SKIN}"/><path d="M28 14h24v30H28Z" fill="#5b6b8c"/>'
    '<path d="M64 98l20 6q6 2 4 8l-24-6Z" fill="#ff8fa3"/>'
    '<circle cx="104" cy="58" r="16" fill="#ffffff"/><path d="M104 50l6 4-2 8h-8l-2-8Z" fill="#4b2e22" stroke-width="2"/>'
    '<path d="M80 44l-8-6M80 56H70M84 32l-4-8" stroke-width="3"/>')
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
    '<path d="M26 34 94 102M94 34 26 102" stroke-width="26"/><path d="M26 34 94 102M94 34 26 102" stroke="#ff6f6f" stroke-width="18"/>')
pictures[B + "drum"] = svg(
    '<path d="M18 50v44q0 16 46 16t46-16V50" fill="#ff8fa3"/><ellipse cx="64" cy="50" rx="46" ry="14" fill="#fff6e0"/>'
    '<path d="M22 60l20 46M42 64l22 46M64 64l22 46M86 64l20 40" stroke="#ffd45e" stroke-width="3"/>'
    '<path d="M36 34 8 8M92 34l28-26" stroke-width="5"/><circle cx="8" cy="8" r="5" fill="#ffd45e" stroke-width="3"/><circle cx="120" cy="8" r="5" fill="#ffd45e" stroke-width="3"/>')
pictures[B + "draw"] = svg(
    '<path d="M10 22h88v88H10Z" fill="#ffffff"/><path d="M22 92q14-30 30-10t32-30" fill="none" stroke="#8cc8f2" stroke-width="5"/>'
    '<circle cx="34" cy="44" r="9" fill="#ffd45e" stroke-width="3"/>'
    '<path d="M84 96 116 52l8 6-32 44-10 4Z" fill="#ff8fa3"/><path d="M84 96l8 6-10 4Z" fill="#4b2e22"/>')
pictures[B + "dream"] = svg(
    '<path d="M10 110q4-24 30-24 20 0 26 18H10Z" fill="#cfe9ff"/>' + person(36, 74, 0.7, "#8b5a3c", "#cfe9ff", "short").replace(eye(36 - 8 * 0.7, 74 + 2 * 0.7, 0.7) + eye(36 + 8 * 0.7, 74 + 2 * 0.7, 0.7), '<path d="M27 76q4 3 8 0M37 76q4 3 8 0" fill="none" stroke-width="2"/>')
    + '<circle cx="60" cy="56" r="4" fill="#ffffff" stroke-width="2.5"/><circle cx="68" cy="46" r="6" fill="#ffffff" stroke-width="2.5"/>'
    '<path d="M68 34q-6-22 18-22 6-10 18-6 14 0 14 14 8 8 0 16-6 8-18 4-12 6-22-2-10 2-10-4Z" fill="#ffffff"/>'
    + sparkle(92, 22, 6) + '<path d="M84 26q4-6 10-2-6 4-10 2Z" fill="#ff8fa3" stroke-width="2"/>')
pictures[B + "free"] = svg(
    '<path d="M24 70q10-30 40-26 18-22 40-16-16 10-20 22 22 8 26 26-26-6-38 4-14 14-34 6l-18 12 6-18q-10-2-2-10Z" fill="#ffffff"/>'
    '<path d="M54 52q14-14 34-14" fill="none" stroke="#cfe9ff" stroke-width="4"/>'
    '<path d="M96 66q6 2 8-4" fill="none" stroke-width="2.5"/><circle cx="96" cy="58" r="2.5" fill="#4b2e22" stroke="none"/>'
    '<path d="M106 62l10 2-8 4Z" fill="#ffb86b" stroke-width="2.5"/><path d="M24 104q6-8 16-6M100 18q4 6 12 4" fill="none" stroke="#8fe3a8" stroke-width="3"/>')
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
    '<path d="M14 92h100v20H14Z" fill="#d6d0e0"/><ellipse cx="64" cy="88" rx="30" ry="10" fill="#ff6f6f"/><path d="M34 88v-10h60v10" fill="#ff6f6f"/><ellipse cx="64" cy="78" rx="30" ry="10" fill="#ff8f8f"/>'
    f'<path d="M58 70V22q0-8 8-8t8 8v26l14 4q10 4 8 14l-4 6H58Z" fill="{SKIN}"/>')
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
    '<path d="M14 86h100v20H14Z" fill="#d9a066"/><path d="M24 86q0-40 40-40t40 40" fill="none" stroke-width="6"/>'
    '<path d="M24 86q0-40 40-40t40 40" fill="none" stroke="#d6d0e0" stroke-width="2"/><path d="M64 46v40" stroke-width="3"/>'
    '<path d="M52 82l14-18 12 18Z" fill="#ffd45e" stroke-width="3"/><circle cx="60" cy="76" r="2" fill="#f2c94c" stroke="none"/>')
pictures[B + "street"] = svg(
    '<path d="M44 4h40l40 120H4Z" fill="#9db4cc"/><path d="M64 14v14M64 44v18M64 80v22M64 114v10" stroke="#ffffff" stroke-width="6"/>'
    '<path d="M0 50h22l-18 74H0ZM128 50h-22l18 74h4Z" fill="#8fe3a8" stroke-width="3"/>')
pictures[B + "stretch"] = svg(
    f'<path d="M50 52 26 12M78 52l24-40" stroke="{INK}" stroke-width="12"/><path d="M50 52 26 12M78 52l24-40" stroke="{SKIN}" stroke-width="6"/>'
    + person(64, 62, 1.1, "#8b5a3c", "#8fe3a8", "short") + '<circle cx="26" cy="12" r="6" fill="#ffe2c4" stroke-width="3"/><circle cx="102" cy="12" r="6" fill="#ffe2c4" stroke-width="3"/>')
pictures[B + "throw"] = svg(
    f'<path d="M50 74 26 36" stroke="{INK}" stroke-width="12"/><path d="M50 74 26 36" stroke="{SKIN}" stroke-width="6"/>'
    + person(64, 80, 1.0, "#c98a55", "#ffa552", "short") + '<circle cx="26" cy="36" r="6" fill="#ffe2c4" stroke-width="3"/>'
    '<circle cx="96" cy="26" r="14" fill="#ff8fa3"/><path d="M84 22q12 8 24 0" fill="none" stroke="#ffffff" stroke-width="3"/>'
    '<path d="M44 26q20-20 36-6" fill="none" stroke-width="3" stroke-dasharray="4 6"/>')
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
    f'<path d="M30 74 12 60 6 72M98 74l18-14 6 12" fill="none" stroke="{INK}" stroke-width="12"/><path d="M30 74 12 60 6 72M98 74l18-14 6 12" fill="none" stroke="{SKIN}" stroke-width="6"/>'
    + person(64, 60, 1.15, "#a46a3c", "#b79cf2", "short").replace(smile(64, 60 + 11 * 1.15, 6 * 1.15), '<path d="M58 73h12" stroke-width="2.5"/>')
    + '<path d="M50 30l-4-10M78 30l4-10" stroke-width="3"/>')


# ---------- R & L Blends: scr, spr and L blends ----------
pictures[B + "scratch"] = svg(
    '<path d="M60 112q-30 0-30-30 0-26 30-30h12q26 2 26 30 0 30-30 30Z" fill="#ffb86b"/>'
    '<path d="M40 54 34 30l18 14M88 54l6-24-18 14" fill="#ffb86b"/>'
    + eye(54, 74) + eye(78, 74) + cheek(46, 84) + cheek(86, 84) + smile(66, 84, 8)
    + '<path d="M96 70q16-10 22 2-8 8-18 2Z" fill="#ffb86b" stroke-width="3"/>'
    '<path d="M104 30 92 48M114 34l-12 18M122 40l-10 16" stroke="#ff6f6f" stroke-width="4"/>')
pictures[B + "scrub"] = svg(
    '<path d="M16 90h96v22H16Z" fill="#cfe9ff"/><path d="M34 52h60q8 0 8 8v24H26V60q0-8 8-8Z" fill="#ffe27a"/>'
    '<path d="M26 74h76v12H26Z" fill="#8fe3a8"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#ffffff" stroke-width="2.5"/>' for x, y, r in [(30, 40, 8), (52, 34, 6), (86, 36, 9), (104, 46, 6), (70, 24, 5)]))
pictures[B + "spray"] = svg(
    '<path d="M40 52h44v60H40Z" fill="#8cc8f2"/><path d="M50 32h24v20H50Z" fill="#ffffff"/><path d="M52 32V20h28l-4 12" fill="#ff8fa3"/>'
    '<path d="M46 72h32" stroke="#ffffff" stroke-width="4"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="2.5" fill="#8cc8f2" stroke="none"/>' for x, y in [(92, 18), (100, 26), (96, 12), (106, 16), (108, 30), (114, 22)]))
pictures[B + "sprout"] = svg(
    '<path d="M14 98q8-20 50-20t50 20v20H14Z" fill="#b9814f"/>'
    '<path d="M64 80V48" stroke="#4fb893" stroke-width="5"/><path d="M64 56q-24 2-30-20 22-4 30 18M64 52q24-4 28-26-22 0-28 22" fill="#8fe3a8" stroke-width="3"/>')
pictures[B + "blow"] = svg(
    person(36, 66, 1.0, "#8b5a3c", "#8cc8f2", "short").replace(smile(36, 66 + 11, 6), '<circle cx="42" cy="77" r="3" fill="#ff8fae" stroke-width="2"/>')
    + '<path d="M54 62q20-6 30 4t28-2M54 78q24 2 34 12t26 4" fill="none" stroke="#8cc8f2" stroke-width="4"/>'
    '<path d="M102 46q8-4 12 2-6 4-12-2Z" fill="#8fe3a8" stroke-width="2.5"/>')
pictures[B + "blink"] = svg(
    person(64, 62, 1.35, "#a46a3c", "#ffb3d1", "long").replace(eye(64 + 8 * 1.35, 62 + 2 * 1.35, 1.35), '<path d="M70 66q5-5 10 0" fill="none" stroke-width="3"/>')
    + sparkle(104, 34, 8))
pictures[B + "clap"] = svg(
    f'<path d="M40 112 34 60q-2-16 12-22l10-4 6-14q4-8 10-4 6 4 2 12l-4 10 22-10q8-4 10 4 2 6-6 10l-12 6 14 4q8 2 6 10-2 6-10 4l-10-2 4 10q2 8-6 10-6 2-10-6l-4-8-6 40Z" fill="{SKIN}"/>'
    '<path d="M24 34l-10-6M28 22l-6-10M100 28l10-8" stroke-width="3"/>' + sparkle(20, 50, 6) + sparkle(110, 46, 7, "#ffb3d9"))
pictures[B + "clown"] = svg(
    '<path d="M36 30 64 4l28 26Z" fill="#8fe3a8"/><circle cx="64" cy="4" r="5" fill="#ffd45e" stroke-width="2.5"/>'
    '<circle cx="28" cy="52" r="16" fill="#ff8fa3"/><circle cx="100" cy="52" r="16" fill="#ff8fa3"/>'
    f'<circle cx="64" cy="58" r="30" fill="#ffffff"/>' + eye(52, 54) + eye(76, 54)
    + '<circle cx="64" cy="66" r="7" fill="#ff4f6f" stroke-width="2.5"/><path d="M50 76q14 12 28 0" fill="none" stroke="#ff4f6f" stroke-width="4"/>'
    '<path d="M44 92l20 10 20-10-20-8Z" fill="#8cc8f2"/><path d="M30 120q4-24 34-24t34 24Z" fill="#ffd45e"/>')
pictures[B + "climb"] = svg(
    '<path d="M76 4h48v124H76Z" fill="#c9b6f5"/>'
    + "".join(f'<circle cx="{x}" cy="{y}" r="5" fill="{c}" stroke-width="2.5"/>' for x, y, c in [(86, 20, "#ff8fa3"), (106, 42, "#8fe3a8"), (90, 66, "#ffd45e"), (110, 90, "#8cc8f2"), (88, 112, "#ff8fa3")])
    + f'<path d="M58 62l26-22M56 82l30 8" stroke="{INK}" stroke-width="10"/><path d="M58 62l26-22M56 82l30 8" stroke="{SKIN}" stroke-width="5"/>'
    + person(44, 62, 0.9, "#c98a55", "#ffa552", "short") + '<path d="M40 112l6-24M54 112l2-24" stroke="#5b6b8c" stroke-width="8"/>')
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
pictures[B + "play"] = svg(
    '<circle cx="40" cy="28" r="12" fill="#c98a55"/><circle cx="88" cy="28" r="12" fill="#c98a55"/>'
    '<circle cx="64" cy="48" r="30" fill="#d9a066"/><ellipse cx="64" cy="58" rx="12" ry="9" fill="#f3d38c"/><circle cx="64" cy="54" r="3.5" fill="#4b2e22" stroke="none"/>'
    + eye(52, 42) + eye(76, 42) + smile(64, 62, 6)
    + '<ellipse cx="64" cy="98" rx="30" ry="24" fill="#d9a066"/><ellipse cx="64" cy="100" rx="14" ry="12" fill="#f3d38c"/>'
    '<circle cx="32" cy="112" r="10" fill="#d9a066"/><circle cx="96" cy="112" r="10" fill="#d9a066"/>'
    '<path d="M52 74l12 8 12-8-12-4Z" fill="#ff8fa3" stroke-width="2.5"/>')
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
pictures[B + "slipper"] = svg(
    '<path d="M14 84q0-18 22-20h40q36 2 40 26 2 14-14 14H26q-12 0-12-20Z" fill="#ffb3d1"/>'
    '<path d="M60 64q0-22 26-22 22 0 28 28" fill="#ff8fb7"/><path d="M60 64q24 8 54 6" fill="none" stroke-width="3"/>'
    '<circle cx="86" cy="44" r="9" fill="#ffffff"/><path d="M14 100h102" stroke="#ff8fa3" stroke-width="5"/>')
pictures[B + "splash"] = svg(
    '<path d="M10 96q27-14 54-6t54 6v20H10Z" fill="#8cc8f2"/>'
    '<path d="M64 88q-4-30 -18-42M64 88q4-30 18-44M64 88V34" fill="none" stroke="#8cc8f2" stroke-width="6"/>'
    + "".join(f'<path d="M{x} {y}q-6 9 0 12 6-3 0-12Z" fill="#cfe9ff" stroke-width="2.5"/>' for x, y in [(40, 30), (88, 24), (64, 16), (24, 56), (104, 52)]))
pictures[B + "split"] = svg(
    '<path d="M4 92h120v24H4Z" fill="#c98a55"/><path d="M18 60h38v32H18Z" fill="#d9a066"/><path d="M72 60h38v32H72Z" fill="#d9a066"/>'
    '<ellipse cx="56" cy="76" rx="5" ry="15" fill="#f3d38c"/><ellipse cx="72" cy="76" rx="5" ry="15" fill="#f3d38c"/>'
    '<path d="M64 52 86 14" stroke-width="7"/><path d="M64 52 86 14" stroke="#c98a55" stroke-width="3"/><path d="M52 50l16-12 8 14-14 10Z" fill="#d6d0e0"/>'
    '<path d="M40 50l-6-8M90 50l6-8" stroke-width="3"/>')


for name, body in pictures.items():
    path = os.path.join(IMAGES, name + ".svg")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(body)
print(len(pictures), "pictures")
