import * as child_process from "node:child_process";
import * as fs from "node:fs";

const repos = [
  "abapGit/abapGit",
  "abapGit/ADT_Frontend",
  "abaplint/abaplint",
  "abaplint/transpiler",
  "open-abap/open-abap-core",
  "SAP/abap-file-formats-tools",
  "SAP/abap-file-formats",
  "sbcgua/ajson",
];

const contributors = new Set();

let header = "";
if (process.env.GITHUB_TOKEN) {
  header = ` -H "Authorization: Bearer ${process.env.GITHUB_TOKEN}"`;
}

for (const r of repos) {
  let page = 1;
  for (;;) {
    const raw = child_process.execSync(`curl -H "Accept: application/vnd.github+json"${header} "https://api.github.com/repos/${r}/contributors?per_page=100&page=${page}"`);
    const json = JSON.parse(raw);
    for (const c of json) {
      contributors.add(JSON.stringify({
        login: c.login,
        avatar: c.avatar_url,
      }));
    }
    if (json.length < 100) break;
    page++;
  }
}

console.log(contributors.size);

let html = "";
for (const c of Array.from(contributors).sort()) {
  const json = JSON.parse(c);
  child_process.execSync(`curl --output avatars/${json.login}.png "${json.avatar}"`);
  html += `<a href="https://github.com/${json.login}"><img src="avatars/${json.login}.png" alt="${json.login}" class="avatar"></a>\n`;
}

console.log(html);