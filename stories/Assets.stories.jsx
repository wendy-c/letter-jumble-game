// Every picture in public/images, found automatically, grouped by folder. Click a picture to copy
// its path (as used in the code, e.g. "/images/icons/animals.svg").
const files = Object.keys(import.meta.glob("../public/**/*.{svg,png,jpg,jpeg,webp,gif,ico}", { query: "?url" }))
  .map((file) => file.replace("../public", ""))
  .sort();

function folderOf(path) {
  return path.slice(0, path.lastIndexOf("/")) || "/";
}

function Gallery({ prefix, wide = false }) {
  const matching = files.filter((path) => path.startsWith(prefix));
  const folders = [...new Set(matching.map(folderOf))];
  return (
    <div style={{ fontFamily: "Fredoka, sans-serif", color: "#3d2b63" }}>
      <p style={{ margin: "0 0 16px", color: "#8a80a6" }}>{matching.length} pictures</p>
      {folders.map((folder) => (
        <section key={folder} style={{ marginBottom: 28 }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>{folder}</h2>
          <ul style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${wide ? 220 : 120}px, 1fr))`, gap: 12, margin: 0, padding: 0, listStyle: "none" }}>
            {matching.filter((path) => folderOf(path) === folder).map((path) => (
              <li key={path}>
                <button
                  type="button"
                  title={`Copy ${path}`}
                  onClick={() => navigator.clipboard?.writeText(path)}
                  style={{ display: "flex", width: "100%", flexDirection: "column", alignItems: "center", gap: 6, border: "2px solid #e8ddfa", borderRadius: 16, background: "#fff", padding: 10, cursor: "copy", font: "inherit" }}
                >
                  <img src={path} alt="" style={{ width: "100%", height: wide ? 120 : 84, objectFit: "contain" }} loading="lazy" />
                  <span style={{ maxWidth: "100%", overflow: "hidden", fontSize: 11, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{path.slice(folder.length + 1)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default {
  title: "Assets",
  component: Gallery,
  parameters: { layout: "padded" },
};

export const Logos = { args: { prefix: "/images/logo", wide: true } };
export const AppIcons = { args: { prefix: "/images/icons" } };
export const Mochi = { args: { prefix: "/images/mochi" } };
export const RainbowCoin = { args: { prefix: "/images/rainbow-coin" } };
export const Badges = { args: { prefix: "/images/badges" } };
export const GameAssets = { args: { prefix: "/images/game-asset" } };
export const ChinesePictures = { args: { prefix: "/images/chinese" } };
export const IdiomPictures = { args: { prefix: "/images/idioms", wide: true } };
export const DragonRooms = { args: { prefix: "/images/dragon", wide: true } };
export const RainbowVillage = { args: { prefix: "/images/village", wide: true } };
export const Everything = { args: { prefix: "/" } };
