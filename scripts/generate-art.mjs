// Gera as ilustrações vetoriais originais usadas nas campanhas e nos produtos
// de demonstração. Rode com: npm run art
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "art");
mkdirSync(OUT, { recursive: true });

const FONT = "'Inter','SF Pro Display',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";

const svg = (w, h, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none"><defs>${defs}</defs>${body}</svg>\n`;

const linear = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
    .map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ""}/>`)
    .join("")}</linearGradient>`;

const radial = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
    .map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ""}/>`)
    .join("")}</radialGradient>`;

const blur = (id, std) =>
  `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${std}"/></filter>`;

const groundShadow = (cx, cy, rx, ry, opacity = 0.28) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity="${opacity}" filter="url(#groundBlur)"/>`;

// Paletas de acabamento: [claro, base, escuro, borda clara, borda escura, placa da câmera]
const FINISHES = {
  natural: ["#dcd6ca", "#bfb8aa", "#98917f", "#efeadf", "#8b8574", "#cdc6b8"],
  graphite: ["#55565b", "#2f3035", "#1b1b1f", "#7a7b81", "#141417", "#3b3c42"],
  ocean: ["#50698a", "#2f4561", "#1b2a3f", "#7d93ae", "#172435", "#3c5470"],
  pearl: ["#fbfaf7", "#ebe9e3", "#d3d0c8", "#ffffff", "#bcb9b1", "#f2f0ea"],
  copper: ["#d98a57", "#b86435", "#8c4620", "#efb48d", "#7a3b1a", "#c87444"],
  sage: ["#bcc9ba", "#99aa97", "#778876", "#dbe4d9", "#68786a", "#a9b9a7"],
};

// Papéis de parede abstratos, próprios da marca
const WALLPAPERS = {
  aurora: { base: "#07151a", blobs: [["#0f8f7a", 0.2, 0.25, 0.55], ["#f0a463", 0.85, 0.75, 0.5], ["#284fc0", 0.8, 0.15, 0.45], ["#d94f70", 0.2, 0.9, 0.4]] },
  dawn: { base: "#1a1020", blobs: [["#ff9a5a", 0.75, 0.85, 0.6], ["#e0497a", 0.2, 0.65, 0.5], ["#4b3bb8", 0.35, 0.1, 0.6], ["#ffd98a", 0.95, 0.5, 0.3]] },
  tide: { base: "#051622", blobs: [["#1fb6a6", 0.8, 0.3, 0.55], ["#1d4ed8", 0.15, 0.4, 0.6], ["#9be7d0", 0.65, 0.95, 0.4], ["#0a3a5e", 0.5, 0.7, 0.5]] },
};

function wallpaper(id, name, x, y, w, h, r) {
  const wp = WALLPAPERS[name];
  const blobs = wp.blobs
    .map(([c, cx, cy, s]) => {
      const size = Math.max(w, h) * s * 0.62;
      return `<circle cx="${x + w * cx}" cy="${y + h * cy}" r="${size}" fill="${c}" opacity="0.92"/>`;
    })
    .join("");
  const std = Math.max(w, h) * 0.085;
  return {
    defs: `<clipPath id="${id}Clip"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath><filter id="${id}Blur" filterUnits="userSpaceOnUse" x="${x - w}" y="${y - h}" width="${w * 3}" height="${h * 3}"><feGaussianBlur stdDeviation="${std}"/></filter>`,
    body: `<g clip-path="url(#${id}Clip)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${wp.base}"/><g filter="url(#${id}Blur)">${blobs}</g></g>`,
  };
}

function lens(cx, cy, r, ring = "#6b6b70") {
  return `
  <circle cx="${cx}" cy="${cy}" r="${r + 7}" fill="#000" opacity=".22"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#lensRing)"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 1.5}" stroke="${ring}" stroke-width="1.5" opacity=".6"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.8}" fill="url(#lensGlass)"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.52}" fill="url(#lensCore)"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="#050508"/>
  <ellipse cx="${cx - r * 0.28}" cy="${cy - r * 0.34}" rx="${r * 0.2}" ry="${r * 0.13}" fill="#fff" opacity=".5" transform="rotate(-35 ${cx - r * 0.28} ${cy - r * 0.34})"/>
  <circle cx="${cx + r * 0.3}" cy="${cy + r * 0.32}" r="${r * 0.07}" fill="#8db4ff" opacity=".55"/>`;
}

const lensDefs = () =>
  linear("lensRing", [[0, "#55555a"], [0.5, "#1c1c20"], [1, "#3b3b40"]], 0, 0, 1, 1) +
  radial("lensGlass", [[0, "#1a2130"], [0.7, "#0b0d14"], [1, "#020204"]]) +
  radial("lensCore", [[0, "#26365a"], [0.55, "#121a30"], [1, "#05060c"]], 0.42, 0.4, 0.6);

function phoneBack(name, finish, { android = false } = {}) {
  const [light, base, dark, edgeL, edgeD, plate] = FINISHES[finish];
  const W = 640, H = 1120;
  const x = 100, y = 60, w = 440, h = 908, r = android ? 52 : 74;
  const defs =
    blur("groundBlur", 26) +
    lensDefs() +
    linear("edge", [[0, edgeD], [0.03, edgeL], [0.09, base], [0.5, dark], [0.91, base], [0.97, edgeL], [1, edgeD]], 0, 0, 1, 0) +
    linear("glass", [[0, light], [0.48, base], [1, dark]], 0.1, 0, 0.9, 1) +
    linear("sheen", [[0, "#fff", 0.28], [0.32, "#fff", 0.03], [0.6, "#fff", 0], [1, "#000", 0.14]], 0, 0, 1, 1) +
    linear("plate", [[0, "#fff", 0.2], [1, "#000", 0.12]], 0, 0, 1, 1) +
    linear("button", [[0, edgeL], [1, edgeD]]);
  const buttons = `
  <rect x="${x - 4}" y="${y + 180}" width="6" height="46" rx="3" fill="url(#button)"/>
  <rect x="${x - 4}" y="${y + 250}" width="6" height="84" rx="3" fill="url(#button)"/>
  <rect x="${x - 4}" y="${y + 350}" width="6" height="84" rx="3" fill="url(#button)"/>
  <rect x="${x + w - 2}" y="${y + 280}" width="6" height="128" rx="3" fill="url(#button)"/>`;
  const shell = `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#edge)"/>
  <rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="${r - 6}" fill="url(#glass)"/>
  <rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="${r - 6}" fill="url(#sheen)"/>`;
  let camera;
  if (android) {
    const cx = x + 96;
    camera = `
    <rect x="${cx - 54}" y="${y + 56}" width="108" height="330" rx="54" fill="${plate}" opacity=".55"/>
    <rect x="${cx - 54}" y="${y + 56}" width="108" height="330" rx="54" fill="url(#plate)"/>
    ${lens(cx, y + 112, 40)}${lens(cx, y + 221, 40)}${lens(cx, y + 330, 40)}
    <circle cx="${cx + 104}" cy="${y + 112}" r="13" fill="#f5eccf"/><circle cx="${cx + 104}" cy="${y + 112}" r="13" stroke="#000" stroke-opacity=".25" stroke-width="2"/>
    <circle cx="${cx + 104}" cy="${y + 172}" r="10" fill="#15151a"/>`;
  } else {
    const px = x + 26, py = y + 26;
    camera = `
    <rect x="${px - 2}" y="${py + 6}" width="238" height="252" rx="62" fill="#000" opacity=".16" filter="url(#plateBlur)"/>
    <rect x="${px}" y="${py}" width="234" height="248" rx="60" fill="${plate}"/>
    <rect x="${px}" y="${py}" width="234" height="248" rx="60" fill="url(#plate)"/>
    <rect x="${px + 1}" y="${py + 1}" width="232" height="246" rx="59" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>
    ${lens(px + 72, py + 70, 50)}${lens(px + 72, py + 180, 50)}${lens(px + 170, py + 124, 50)}
    <circle cx="${px + 174}" cy="${py + 38}" r="17" fill="#f7efd6"/><circle cx="${px + 174}" cy="${py + 38}" r="17" stroke="#000" stroke-opacity=".2" stroke-width="2"/>
    <circle cx="${px + 174}" cy="${py + 211}" r="13" fill="#17171c"/>`;
  }
  const extra = android ? "" : blur("plateBlur", 8);
  writeFileSync(join(OUT, `${name}.svg`), svg(W, H, defs + extra, groundShadow(320, 1000, 220, 18) + buttons + shell + camera));
}

function phoneFront(name, finish, wp, { android = false, time = "09:41" } = {}) {
  const [, base, dark, edgeL, edgeD] = FINISHES[finish];
  const W = 640, H = 1120;
  const x = 100, y = 60, w = 440, h = 908, r = android ? 52 : 74;
  const sx = x + 15, sy = y + 15, sw = w - 30, sh = h - 30, sr = r - 14;
  const paper = wallpaper("wp", wp, sx, sy, sw, sh, sr);
  const defs =
    blur("groundBlur", 26) +
    paper.defs +
    linear("edge", [[0, edgeD], [0.03, edgeL], [0.1, base], [0.5, dark], [0.9, base], [0.97, edgeL], [1, edgeD]], 0, 0, 1, 0) +
    linear("reflect", [[0, "#fff", 0.1], [0.3, "#fff", 0.01], [0.31, "#fff", 0]], 0, 0, 1, 1) +
    linear("button", [[0, edgeL], [1, edgeD]]);
  const island = android
    ? `<circle cx="320" cy="${sy + 36}" r="13" fill="#000"/><circle cx="320" cy="${sy + 36}" r="5" fill="#141a2c"/>`
    : `<rect x="${320 - 62}" y="${sy + 22}" width="124" height="36" rx="18" fill="#000"/><circle cx="${320 + 40}" cy="${sy + 40}" r="7" fill="#101420"/>`;
  const body = `
  ${groundShadow(320, 1000, 220, 18)}
  <rect x="${x - 4}" y="${y + 180}" width="6" height="46" rx="3" fill="url(#button)"/>
  <rect x="${x - 4}" y="${y + 250}" width="6" height="84" rx="3" fill="url(#button)"/>
  <rect x="${x - 4}" y="${y + 350}" width="6" height="84" rx="3" fill="url(#button)"/>
  <rect x="${x + w - 2}" y="${y + 280}" width="6" height="128" rx="3" fill="url(#button)"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#edge)"/>
  <rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="${r - 5}" fill="#040405"/>
  ${paper.body}
  ${island}
  <text x="320" y="${y + 214}" text-anchor="middle" font-family="${FONT}" font-size="104" font-weight="300" fill="#fff" fill-opacity=".94" letter-spacing="-3">${time}</text>
  <rect x="${320 - 70}" y="${y + h - 38}" width="140" height="5" rx="2.5" fill="#fff" fill-opacity=".85"/>
  <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="${sr}" fill="url(#reflect)"/>`;
  writeFileSync(join(OUT, `${name}.svg`), svg(W, H, defs, body));
}

function laptop(name = "laptop", wp = "aurora") {
  const W = 1600, H = 1040;
  const lx = 210, ly = 60, lw = 1180, lh = 770;
  const sx = lx + 24, sy = ly + 24, sw = lw - 48, sh = lh - 62;
  const paper = wallpaper("wp", wp, sx, sy, sw, sh, 10);
  const defs =
    blur("groundBlur", 22) +
    paper.defs +
    linear("lid", [[0, "#8f9095"], [0.01, "#2a2a2d"], [1, "#0b0b0d"]]) +
    linear("base", [[0, "#e6e6e8"], [0.16, "#d3d3d6"], [0.72, "#b2b2b6"], [1, "#6f6f74"]]) +
    linear("baseSide", [[0, "#7c7c80"], [0.08, "#d8d8db"], [0.5, "#ececee"], [0.92, "#d8d8db"], [1, "#7c7c80"]], 0, 0, 1, 0) +
    linear("reflect", [[0, "#fff", 0.09], [0.4, "#fff", 0.01], [0.41, "#fff", 0]], 0, 0, 1, 1);
  const body = `
  ${groundShadow(800, 918, 720, 16, 0.32)}
  <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="30" fill="url(#lid)"/>
  <rect x="${lx + 3}" y="${ly + 3}" width="${lw - 6}" height="${lh - 6}" rx="28" fill="#050506"/>
  ${paper.body}
  <path d="M${800 - 76} ${sy}h152v18a12 12 0 0 1-12 12h-128a12 12 0 0 1-12-12z" fill="#050506"/>
  <circle cx="800" cy="${sy + 14}" r="4" fill="#121824"/>
  <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="10" fill="url(#reflect)"/>
  <text x="800" y="${sy + sh / 2 + 10}" text-anchor="middle" font-family="${FONT}" font-size="84" font-weight="600" fill="#fff" fill-opacity=".95" letter-spacing="-2">Imports Original</text>
  <rect x="${lx}" y="${ly + lh - 4}" width="${lw}" height="8" fill="#1a1a1c"/>
  <path d="M112 ${ly + lh + 4}H1488V${ly + lh + 30}c0 22-30 36-70 36H182c-40 0-70-14-70-36z" fill="url(#base)"/>
  <path d="M112 ${ly + lh + 4}H1488V${ly + lh + 11}H112z" fill="url(#baseSide)"/>
  <path d="M${800 - 130} ${ly + lh + 4}h260v6c0 10-10 16-22 16H${800 - 108}c-12 0-22-6-22-16z" fill="#9e9ea3"/>`;
  writeFileSync(join(OUT, `${name}.svg`), svg(W, H, defs, body));
}

function tablet(name = "tablet", wp = "dawn") {
  const W = 1000, H = 1320;
  const x = 90, y = 50, w = 820, h = 1140;
  const sx = x + 36, sy = y + 36, sw = w - 72, sh = h - 72;
  const paper = wallpaper("wp", wp, sx, sy, sw, sh, 22);
  const defs =
    blur("groundBlur", 24) +
    paper.defs +
    linear("edge", [[0, "#6d6d72"], [0.012, "#d7d7da"], [0.05, "#a4a4a8"], [0.95, "#a4a4a8"], [0.988, "#d7d7da"], [1, "#6d6d72"]], 0, 0, 1, 0) +
    linear("reflect", [[0, "#fff", 0.11], [0.35, "#fff", 0.01], [0.36, "#fff", 0]], 0, 0, 1, 1);
  const tile = (tx, ty, tw, th, content) =>
    `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="30" fill="#fff" fill-opacity=".16"/><rect x="${tx + 1}" y="${ty + 1}" width="${tw - 2}" height="${th - 2}" rx="29" stroke="#fff" stroke-opacity=".22" stroke-width="2"/>${content}`;
  const body = `
  ${groundShadow(500, 1216, 410, 18, 0.3)}
  <rect x="${x + w - 200}" y="${y - 4}" width="110" height="8" rx="4" fill="#8d8d91"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="58" fill="url(#edge)"/>
  <rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="53" fill="#050506"/>
  ${paper.body}
  <circle cx="500" cy="${y + 18}" r="4.5" fill="#141a26"/>
  <text x="500" y="${sy + 230}" text-anchor="middle" font-family="${FONT}" font-size="150" font-weight="300" fill="#fff" fill-opacity=".95" letter-spacing="-5">14:30</text>
  ${tile(sx + 60, sy + sh - 330, 290, 250, `<circle cx="${sx + 205}" cy="${sy + sh - 205}" r="76" stroke="#fff" stroke-opacity=".28" stroke-width="20"/><path d="M${sx + 205} ${sy + sh - 281}a76 76 0 1 1-66 114" stroke="#fff" stroke-width="20" stroke-linecap="round"/>`)}
  ${tile(sx + sw - 350, sy + sh - 330, 290, 250, `<path d="M${sx + sw - 310} ${sy + sh - 150}c40-90 70-20 105-70s60-40 90-60" stroke="#fff" stroke-width="12" stroke-linecap="round"/><rect x="${sx + sw - 310}" y="${sy + sh - 290}" width="120" height="16" rx="8" fill="#fff" fill-opacity=".85"/>`)}
  <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="22" fill="url(#reflect)"/>`;
  writeFileSync(join(OUT, `${name}.svg`), svg(W, H, defs, body));
}

function watch(name = "watch", band = ["#34403c", "#1f2825", "#111715"], caseTone = "silver") {
  const W = 640, H = 1120;
  const x = 150, y = 340, w = 340, h = 400;
  const metal = caseTone === "silver"
    ? ["#f3f3f4", "#b9b9bd", "#7e7e83"]
    : ["#6e6e73", "#37373b", "#17171a"];
  const ring = (cx, cy, r, c, pct, sw = 20) => {
    const circ = 2 * Math.PI * r;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${c}" stroke-opacity=".22" stroke-width="${sw}"/><circle cx="${cx}" cy="${cy}" r="${r}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${circ * pct} ${circ}" transform="rotate(-90 ${cx} ${cy})"/>`;
  };
  const defs =
    blur("groundBlur", 22) +
    linear("band", [[0, band[1]], [0.14, band[0]], [0.5, band[1]], [0.86, band[0]], [1, band[2]]], 0, 0, 1, 0) +
    linear("bandTop", [[0, "#000", 0.28], [0.85, "#000", 0], [1, "#000", 0]]) +
    linear("bandBot", [[0, "#000", 0], [0.15, "#000", 0], [1, "#000", 0.28]]) +
    linear("metal", [[0, metal[0]], [0.5, metal[1]], [1, metal[2]]], 0, 0, 1, 1) +
    linear("crown", [[0, metal[2]], [0.5, metal[0]], [1, metal[2]]]) +
    linear("reflect", [[0, "#fff", 0.1], [0.34, "#fff", 0.01], [0.35, "#fff", 0]], 0, 0, 1, 1);
  const body = `
  ${groundShadow(320, 1076, 150, 12, 0.22)}
  <path d="M196 60h248l14 300H182z" fill="url(#band)"/><path d="M196 60h248l14 300H182z" fill="url(#bandTop)"/>
  <path d="M182 720h276l-14 340H196z" fill="url(#band)"/><path d="M182 720h276l-14 340H196z" fill="url(#bandBot)"/>
  ${[820, 880, 940, 1000].map((py) => `<ellipse cx="320" cy="${py}" rx="10" ry="6" fill="#000" fill-opacity=".45"/>`).join("")}
  <rect x="${x + w - 4}" y="${y + 104}" width="26" height="72" rx="10" fill="url(#crown)"/>
  <rect x="${x + w - 2}" y="${y + 216}" width="12" height="96" rx="6" fill="url(#crown)"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="92" fill="url(#metal)"/>
  <rect x="${x + 9}" y="${y + 9}" width="${w - 18}" height="${h - 18}" rx="84" fill="#040405"/>
  <text x="${x + w / 2}" y="${y + 158}" text-anchor="middle" font-family="${FONT}" font-size="104" font-weight="500" fill="#fff" letter-spacing="-3">10:09</text>
  ${ring(x + w / 2, y + 268, 66, "#f0a463", 0.72, 18)}
  ${ring(x + w / 2, y + 268, 42, "#3fd3bb", 0.58, 18)}
  <rect x="${x + 9}" y="${y + 9}" width="${w - 18}" height="${h - 18}" rx="84" fill="url(#reflect)"/>`;
  writeFileSync(join(OUT, `${name}.svg`), svg(W, H, defs, body));
}

function earbuds(name = "earbuds") {
  const W = 1000, H = 900;
  const bud = (tx, ty, rot, flip = 1) => `
  <g transform="translate(${tx} ${ty}) rotate(${rot}) scale(${flip} 1)">
    <rect x="-27" y="50" width="54" height="250" rx="26" fill="url(#stem)"/>
    <rect x="-27" y="272" width="54" height="28" rx="14" fill="#c8c8cc"/>
    <ellipse cx="-3" cy="10" rx="74" ry="84" fill="url(#head)"/>
    <ellipse cx="-30" cy="4" rx="34" ry="44" fill="#242428"/>
    <ellipse cx="-30" cy="4" rx="26" ry="35" fill="#3a3a40"/>
    <ellipse cx="22" cy="-30" rx="28" ry="20" fill="#fff" opacity=".9" filter="url(#softBlur)"/>
  </g>`;
  const defs =
    blur("groundBlur", 24) +
    blur("softBlur", 8) +
    linear("case", [[0, "#ffffff"], [0.55, "#f2f2f0"], [1, "#cfcfcc"]], 0.1, 0, 0.9, 1) +
    linear("lid", [[0, "#ffffff"], [1, "#e7e7e4"]], 0.1, 0, 0.9, 1) +
    linear("head", [[0, "#ffffff"], [0.6, "#f1f1ef"], [1, "#c4c4c1"]], 0.2, 0, 0.8, 1) +
    linear("stem", [[0, "#d2d2cf"], [0.28, "#ffffff"], [0.8, "#ecebe8"], [1, "#bdbdba"]], 0, 0, 1, 0);
  const body = `
  ${groundShadow(420, 800, 280, 18, 0.2)}
  ${groundShadow(800, 720, 110, 12, 0.16)}
  <rect x="150" y="310" width="540" height="480" rx="136" fill="url(#case)"/>
  <path d="M150 446c0-75 61-136 136-136h268c75 0 136 61 136 136v42H150z" fill="url(#lid)"/>
  <rect x="150" y="487" width="540" height="3" fill="#000" opacity=".16"/>
  <rect x="150" y="490" width="540" height="2" fill="#fff" opacity=".8"/>
  <circle cx="420" cy="590" r="8" fill="#3fd38b"/>
  <circle cx="420" cy="590" r="16" fill="#3fd38b" opacity=".18"/>
  ${bud(760, 330, 12)}
  ${bud(330, 130, -68, -1)}`;
  writeFileSync(join(OUT, `${name}.svg`), svg(W, H, defs, body));
}

function headphones(name = "headphones", tone = ["#3c3d42", "#1f2024", "#0f0f12"]) {
  const W = 1000, H = 1040;
  const cup = (cx, flip) => `
  <g transform="translate(${cx} 640) scale(${flip} 1)">
    <rect x="-16" y="-236" width="32" height="110" rx="14" fill="url(#yoke)"/>
    <rect x="62" y="-150" width="84" height="300" rx="40" fill="url(#cushion)"/>
    <rect x="-102" y="-170" width="192" height="340" rx="94" fill="url(#cup)"/>
    <rect x="-102" y="-170" width="192" height="340" rx="94" fill="url(#cupSheen)"/>
    <circle cx="-30" cy="108" r="6" fill="#000" opacity=".45"/>
  </g>`;
  const defs =
    blur("groundBlur", 24) +
    linear("band", [[0, tone[0]], [0.5, tone[1]], [1, tone[0]]], 0, 0, 1, 0) +
    linear("bandInner", [[0, "#6d6e74"], [1, "#2b2c30"]], 0, 0, 1, 0) +
    linear("yoke", [[0, "#d8d8db"], [1, "#77777c"]]) +
    linear("cup", [[0, tone[0]], [0.55, tone[1]], [1, tone[2]]], 0.1, 0, 0.9, 1) +
    linear("cupSheen", [[0, "#fff", 0.2], [0.34, "#fff", 0.01], [0.6, "#fff", 0]], 0, 0, 1, 1) +
    linear("cushion", [[0, "#050506"], [0.5, "#2c2d31"], [1, "#0c0c0e"]], 0, 0, 1, 0);
  const body = `
  ${groundShadow(500, 856, 330, 14, 0.2)}
  <path d="M190 400C190 170 340 70 500 70s310 100 310 330" stroke="url(#band)" stroke-width="60" stroke-linecap="round"/>
  <path d="M214 400C214 195 350 104 500 104s286 91 286 296" stroke="url(#bandInner)" stroke-width="9" stroke-linecap="round" opacity=".55"/>
  ${cup(190, 1)}
  ${cup(810, -1)}`;
  writeFileSync(join(OUT, `${name}.svg`), svg(W, H, defs, body));
}

function charger(name = "charger") {
  const W = 1000, H = 1000;
  const defs =
    blur("groundBlur", 22) +
    blur("softBlur", 10) +
    linear("brick", [[0, "#ffffff"], [0.6, "#f3f3f1"], [1, "#d3d3d0"]], 0.1, 0, 0.9, 1) +
    linear("side", [[0, "#e4e4e1"], [1, "#bcbcb9"]]) +
    linear("cable", [[0, "#ffffff"], [1, "#dcdcd9"]], 0, 0, 1, 1) +
    linear("plug", [[0, "#a9a9ad"], [0.5, "#f0f0f2"], [1, "#8d8d91"]]);
  const body = `
  ${groundShadow(420, 835, 270, 18, 0.2)}
  <path d="M640 590C820 590 880 690 830 780S610 900 520 840 480 690 610 680 800 760 760 840 610 930 520 900" stroke="#000" stroke-opacity=".06" stroke-width="26" fill="none" transform="translate(4 8)"/>
  <path d="M640 590C820 590 880 690 830 780S610 900 520 840 480 690 610 680 800 760 760 840 610 930 520 900" stroke="url(#cable)" stroke-width="22" stroke-linecap="round" fill="none"/>
  <path d="M640 590C820 590 880 690 830 780S610 900 520 840 480 690 610 680 800 760 760 840 610 930 520 900" stroke="#b7b7b4" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".6"/>
  <rect x="470" y="880" width="74" height="40" rx="11" fill="#f5f5f3" transform="rotate(14 520 900)"/>
  <rect x="418" y="884" width="56" height="26" rx="7" fill="url(#plug)" transform="rotate(14 520 900)"/>
  <rect x="300" y="130" width="28" height="100" rx="8" fill="url(#plug)"/>
  <rect x="492" y="130" width="28" height="100" rx="8" fill="url(#plug)"/>
  <rect x="150" y="210" width="520" height="620" rx="84" fill="url(#side)"/>
  <rect x="150" y="205" width="520" height="600" rx="84" fill="url(#brick)"/>
  <ellipse cx="300" cy="300" rx="110" ry="50" fill="#fff" opacity=".9" filter="url(#softBlur)"/>
  <rect x="340" y="480" width="140" height="44" rx="22" fill="#26262a"/>
  <rect x="352" y="491" width="116" height="22" rx="11" fill="#0b0b0d"/>
  <rect x="372" y="499" width="76" height="6" rx="3" fill="#c7a86a"/>`;
  writeFileSync(join(OUT, `${name}.svg`), svg(W, H, defs, body));
}

function phoneCase(name, c) {
  const W = 640, H = 1120;
  const x = 94, y = 54, w = 452, h = 920, r = 82;
  const px = x + 30, py = y + 30;
  const defs =
    blur("groundBlur", 26) +
    lensDefs() +
    linear("body", [[0, c[0]], [0.55, c[1]], [1, c[2]]], 0.1, 0, 0.9, 1) +
    linear("rim", [[0, c[2]], [0.04, c[0]], [0.5, c[1]], [0.96, c[0]], [1, c[2]]], 0, 0, 1, 0) +
    linear("sheen", [[0, "#fff", 0.22], [0.4, "#fff", 0.02], [1, "#000", 0.1]], 0, 0, 1, 1);
  const body = `
  ${groundShadow(320, 1004, 226, 18)}
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#rim)"/>
  <rect x="${x + 9}" y="${y + 9}" width="${w - 18}" height="${h - 18}" rx="${r - 9}" fill="url(#body)"/>
  <rect x="${x + 9}" y="${y + 9}" width="${w - 18}" height="${h - 18}" rx="${r - 9}" fill="url(#sheen)"/>
  <rect x="${px - 8}" y="${py - 8}" width="250" height="264" rx="66" fill="#000" opacity=".3"/>
  <rect x="${px}" y="${py}" width="234" height="248" rx="60" fill="#2b2c30"/>
  ${lens(px + 72, py + 70, 50)}${lens(px + 72, py + 180, 50)}${lens(px + 170, py + 124, 50)}
  <circle cx="${px + 174}" cy="${py + 38}" r="17" fill="#f7efd6"/>
  <circle cx="320" cy="660" r="118" stroke="#fff" stroke-opacity=".14" stroke-width="11"/>
  <rect x="${x + w - 3}" y="${y + 300}" width="9" height="130" rx="4" fill="${c[2]}"/>`;
  writeFileSync(join(OUT, `${name}.svg`), svg(W, H, defs, body));
}

function speaker(name = "speaker") {
  const W = 1000, H = 1000;
  const defs =
    blur("groundBlur", 24) +
    linear("shell", [[0, "#1e2a28"], [0.5, "#334340"], [1, "#141c1a"]]) +
    linear("shade", [[0, "#000", 0.42], [0.32, "#000", 0], [0.68, "#000", 0], [1, "#000", 0.55]]) +
    linear("top", [[0, "#3e4f4b"], [1, "#25312e"]], 0, 0, 1, 0) +
    `<pattern id="mesh" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.2" fill="#000" opacity=".42"/><circle cx="11" cy="11" r="2.2" fill="#000" opacity=".42"/></pattern>`;
  const body = `
  ${groundShadow(500, 862, 262, 22, 0.3)}
  <path d="M258 240V760c0 60 108 104 242 104s242-44 242-104V240z" fill="url(#shell)"/>
  <path d="M258 240V760c0 60 108 104 242 104s242-44 242-104V240z" fill="url(#mesh)"/>
  <path d="M258 240V760c0 60 108 104 242 104s242-44 242-104V240z" fill="url(#shade)"/>
  <ellipse cx="500" cy="240" rx="242" ry="96" fill="url(#top)"/>
  <ellipse cx="500" cy="240" rx="240" ry="94" stroke="#fff" stroke-opacity=".12" stroke-width="3"/>
  <ellipse cx="500" cy="238" rx="150" ry="56" fill="#000" opacity=".36"/>
  <ellipse cx="500" cy="238" rx="72" ry="26" stroke="#f0a463" stroke-width="5" opacity=".95"/>
  <path d="M470 238h60M500 226v24" stroke="#fff" stroke-opacity=".7" stroke-width="4" stroke-linecap="round"/>`;
  writeFileSync(join(OUT, `${name}.svg`), svg(W, H, defs, body));
}

phoneBack("phone-back-natural", "natural");
phoneBack("phone-back-graphite", "graphite");
phoneBack("phone-back-ocean", "ocean");
phoneBack("phone-back-pearl", "pearl");
phoneBack("phone-back-copper", "copper");
phoneBack("android-back-graphite", "graphite", { android: true });
phoneBack("android-back-sage", "sage", { android: true });
phoneFront("phone-front-aurora", "natural", "aurora");
phoneFront("phone-front-dawn", "graphite", "dawn", { time: "07:30" });
phoneFront("phone-front-tide", "ocean", "tide", { time: "18:05" });
phoneFront("android-front", "graphite", "tide", { android: true, time: "12:20" });
laptop();
tablet();
watch();
watch("watch-dark", ["#c8a97c", "#a38656", "#7a6340"], "dark");
earbuds();
headphones();
headphones("headphones-pearl", ["#f4f3ef", "#d9d7d1", "#a9a7a1"]);
charger();
phoneCase("case-sage", ["#a9bba7", "#88a086", "#65796a"]);
phoneCase("case-copper", ["#d28a5e", "#b4683c", "#874a26"]);
speaker();

console.log("Ilustrações geradas em public/art");
