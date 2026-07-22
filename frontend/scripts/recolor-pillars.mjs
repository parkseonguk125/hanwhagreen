import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../public/img/pillars");

const GREEN = "#8FBC9A"; // 연한 초록 (Storyset 보라 #BA68C8 대체)
const replacements = [
  [/#BA68C8/gi, GREEN],
  [/#9C27B0/gi, "#7CB88A"],
  [/#AB47BC/gi, GREEN],
  [/#CE93D8/gi, "#A8D4B2"],
  [/#E1BEE7/gi, "#C8E6CF"],
];

for (const name of ["odor", "sludge", "chem", "cycle"]) {
  const file = path.join(dir, `${name}.svg`);
  let text = fs.readFileSync(file, "utf8");
  for (const [from, to] of replacements) {
    text = text.replace(from, to);
  }
  fs.writeFileSync(file, text);
  console.log("recolored", name);
}
