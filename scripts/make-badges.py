# Draws a badge for every topic: public/images/badges/<game>/<topic>.svg (run scripts/make-badges.sh).
# Each game has its own badge shape; each topic its own colour and its icon (or letters) in the middle.
import json, math, os, re, sys

ROOT = sys.argv[1]
topics = json.load(open(sys.argv[2]))
OUT = os.path.join(ROOT, "public/images/badges")
INK = "#4b2e22"
GOLD, GOLD_DARK = "#ffd45e", "#f2b632"

COLORS = {  # light, mid, deep
    "peach": ("#fff1e8", "#ffc9ab", "#f59a6e"),
    "lilac": ("#f5f0ff", "#d7c6fb", "#a98cf2"),
    "blue": ("#eef7fd", "#b7dcf6", "#6fb3e6"),
    "green": ("#ecfaf2", "#b5e8cf", "#5cc596"),
    "yellow": ("#fff9de", "#ffe28a", "#f2b632"),
    "pink": ("#fff0f6", "#fbbfd8", "#f06aa8"),
}

CX, CY = 80, 80


def pts(points):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in points)


def polygon_path(points):
    return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in points) + "Z"


def sunburst(r):  # Phonics: a bright sun of 16 rays
    n, depth = 16, 0.12
    return polygon_path([(CX + math.cos(a) * rr, CY + math.sin(a) * rr)
                         for i in range(n * 2)
                         for a, rr in [(math.pi * i / n - math.pi / 2, r if i % 2 == 0 else r * (1 - depth))]])


def scallop(r):  # Starters: a rosette with round scallops
    n = 14
    d = ""
    for i in range(n):
        a0 = 2 * math.pi * i / n - math.pi / 2
        a1 = 2 * math.pi * (i + 1) / n - math.pi / 2
        x0, y0 = CX + math.cos(a0) * r * 0.9, CY + math.sin(a0) * r * 0.9
        x1, y1 = CX + math.cos(a1) * r * 0.9, CY + math.sin(a1) * r * 0.9
        bump = r * 0.2
        d += (f"M{x0:.1f} {y0:.1f}" if i == 0 else "") + f" A{bump:.1f} {bump:.1f} 0 0 1 {x1:.1f} {y1:.1f}"
    return d + "Z"


def shield(r):  # Movers: a knight's shield
    s = r / 70
    p = lambda x, y: f"{CX + x * s:.1f} {CY + y * s:.1f}"
    return (f"M{p(0, -70)} C{p(22, -58)} {p(46, -60)} {p(64, -62)} C{p(68, -20)} {p(62, 30)} {p(0, 74)} "
            f"C{p(-62, 30)} {p(-68, -20)} {p(-64, -62)} C{p(-46, -60)} {p(-22, -58)} {p(0, -70)}Z")


def flower(r):  # 中文認字 入門: a six-petal flower
    n = 6
    d = ""
    pr = r * 0.42
    for i in range(n):
        a = 2 * math.pi * i / n - math.pi / 2
        x, y = CX + math.cos(a) * r * 0.58, CY + math.sin(a) * r * 0.58
        d += f"M{x - pr:.1f} {y:.1f} a{pr:.1f} {pr:.1f} 0 1 0 {2 * pr:.1f} 0 a{pr:.1f} {pr:.1f} 0 1 0 {-2 * pr:.1f} 0Z "
    return d + f"M{CX - r * 0.62:.1f} {CY:.1f} a{r * 0.62:.1f} {r * 0.62:.1f} 0 1 0 {r * 1.24:.1f} 0 a{r * 0.62:.1f} {r * 0.62:.1f} 0 1 0 {-r * 1.24:.1f} 0Z"


def rounded_polygon(n, r, rot, corner=0.16):
    corners = [(CX + math.cos(rot + 2 * math.pi * i / n) * r, CY + math.sin(rot + 2 * math.pi * i / n) * r) for i in range(n)]
    d = ""
    for i in range(n):
        x, y = corners[i]
        px, py = corners[i - 1]
        nx, ny = corners[(i + 1) % n]
        a = (x + (px - x) * corner, y + (py - y) * corner)
        b = (x + (nx - x) * corner, y + (ny - y) * corner)
        d += (f"M{a[0]:.1f} {a[1]:.1f}" if i == 0 else f" L{a[0]:.1f} {a[1]:.1f}") + f" Q{x:.1f} {y:.1f} {b[0]:.1f} {b[1]:.1f}"
    return d + "Z"


def hexagon(r):  # 中文認字 進階: a gem
    return rounded_polygon(6, r, -math.pi / 2)


def octagon(r):  # 成語: a seal
    return rounded_polygon(8, r, -math.pi / 2 + math.pi / 8, 0.2)


def heart(r):  # 量詞: a heart
    s = r / 70
    p = lambda x, y: f"{CX + x * s:.1f} {CY + y * s:.1f}"
    return (f"M{p(0, 66)} C{p(-30, 44)} {p(-74, 14)} {p(-70, -22)} C{p(-66, -58)} {p(-22, -70)} {p(0, -38)} "
            f"C{p(22, -70)} {p(66, -58)} {p(70, -22)} C{p(74, 14)} {p(30, 44)} {p(0, 66)}Z")


SHAPES = {
    "cvc": sunburst, "starters": scallop, "letter-jumble": shield, "chinese": flower,
    "chinese-advanced": hexagon, "measure-words": heart, "idioms": octagon,
}
# Little extras on top of each game's badge.
CROWN = {"letter-jumble": "crown", "starters": "star", "cvc": "star", "chinese": "lantern", "chinese-advanced": "crown",
         "measure-words": "star", "idioms": "lantern"}


def sparkle(x, y, size, fill):
    s = size
    return (f'<path d="M{x} {y - s}Q{x + s * 0.18} {y - s * 0.18} {x + s} {y}Q{x + s * 0.18} {y + s * 0.18} {x} {y + s}'
            f'Q{x - s * 0.18} {y + s * 0.18} {x - s} {y}Q{x - s * 0.18} {y - s * 0.18} {x} {y - s}Z" fill="{fill}" stroke="{INK}" stroke-width="2"/>')


def topper(kind):
    if kind == "crown":
        return (f'<path d="M62 22 L66 6 L74 16 L80 2 L86 16 L94 6 L98 22Z" fill="{GOLD}" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>'
                f'<circle cx="80" cy="15" r="2.6" fill="#f06aa8"/>')
    if kind == "lantern":
        return (f'<path d="M80 2v6" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>'
                f'<rect x="70" y="7" width="20" height="18" rx="9" fill="#ff8f8f" stroke="{INK}" stroke-width="3"/>'
                f'<path d="M80 8v16M74 9q-2 7 0 14M86 9q2 7 0 14" fill="none" stroke="{INK}" stroke-width="1.6"/>')
    return sparkle(80, 12, 11, GOLD)


def inline_icon(path, x, y, size):
    svg = open(os.path.join(ROOT, "public", path.lstrip("/"))).read()
    view = re.search(r'viewBox="([^"]+)"', svg).group(1)
    inner = re.sub(r"^.*?<svg[^>]*>", "", svg, flags=re.S)
    inner = re.sub(r"</svg>\s*$", "", inner.strip())
    return f'<svg x="{x}" y="{y}" width="{size}" height="{size}" viewBox="{view}">{inner}</svg>'


def pattern_text(pattern, deep):
    # Letters or characters, with a dashed box for a missing letter.
    n = len(pattern)
    chinese = any(ord(c) > 255 for c in pattern if c)
    w = 26 if not chinese else 30
    start = CX - w * n / 2
    out = ""
    for i, ch in enumerate(pattern):
        x = start + w * i + w / 2
        if ch is None:
            out += f'<rect x="{x - 9}" y="{CY - 12}" width="18" height="24" rx="5" fill="#fff" stroke="{deep}" stroke-width="2.5" stroke-dasharray="4 3"/>'
        else:
            font = "'Kaiti TC','STKaiti','PingFang HK','Noto Sans TC',sans-serif" if chinese else "'Fredoka','Arial Rounded MT Bold','Trebuchet MS',Arial,sans-serif"
            out += (f'<text x="{x}" y="{CY + (10 if chinese else 9)}" text-anchor="middle" font-family="{font}" '
                    f'font-size="{28 if chinese else 30}" font-weight="700" fill="{INK}">{ch}</text>')
    return out


def badge(game, topic):
    light, mid, deep = COLORS[topic["color"]]
    shape = SHAPES[game]
    gid = f"g-{game}-{topic['id']}"
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 172">',
             f'<defs><linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1">'
             f'<stop offset="0" stop-color="{light}"/><stop offset="1" stop-color="{mid}"/></linearGradient></defs>']
    # Ribbon tails behind the badge.
    parts.append(f'<path d="M58 118 L40 166 L52 158 L60 170 L74 124Z" fill="#f06aa8" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>')
    parts.append(f'<path d="M102 118 L120 166 L108 158 L100 170 L86 124Z" fill="#a98cf2" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>')
    # Gold rim, then the coloured face.
    # Outlines are thick strokes drawn under the fill, so overlapping petals show only the outer edge.
    parts.append(f'<path d="{shape(72)}" fill="{INK}" stroke="{INK}" stroke-width="7" stroke-linejoin="round"/>')
    parts.append(f'<path d="{shape(72)}" fill="{GOLD_DARK}"/>')
    parts.append(f'<path d="{shape(72)}" fill="{GOLD}" transform="translate(0 -2)"/>')
    parts.append(f'<path d="{shape(60)}" fill="{INK}" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>')
    parts.append(f'<path d="{shape(60)}" fill="url(#{gid})"/>')
    # Dots around the face, like stitching.
    for i in range(18):
        a = 2 * math.pi * i / 18
        parts.append(f'<circle cx="{CX + math.cos(a) * 49:.1f}" cy="{CY + math.sin(a) * 49:.1f}" r="1.6" fill="{deep}" opacity=".55"/>')
    # The white window with the topic's picture.
    parts.append(f'<circle cx="{CX}" cy="{CY}" r="38" fill="#fff" stroke="{INK}" stroke-width="3"/>')
    parts.append(f'<path d="M54 66 A30 30 0 0 1 74 46" fill="none" stroke="{light}" stroke-width="4" stroke-linecap="round"/>')
    if topic["icon"]:
        parts.append(inline_icon(topic["icon"], CX - 28, CY - 28, 56))
    elif topic["pattern"]:
        parts.append(pattern_text(topic["pattern"], deep))
    parts.append(topper(CROWN[game]))
    parts.append(sparkle(18, 34, 9, "#fff6c8"))
    parts.append(sparkle(144, 52, 7, "#ffe0ee"))
    parts.append(sparkle(140, 126, 6, "#fff6c8"))
    parts.append("</svg>")
    return "\n".join(parts)


for game, game_topics in topics.items():
    os.makedirs(os.path.join(OUT, game), exist_ok=True)
    for topic in game_topics:
        with open(os.path.join(OUT, game, f"{topic['id']}.svg"), "w") as f:
            f.write(badge(game, topic) + "\n")
print("done", sum(len(t) for t in topics.values()))
