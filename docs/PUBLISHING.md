# Publishing guide / 发布流程

How to get this module from a local folder to a Foundry-installable release.
从本地文件夹到「Foundry 里能一键安装」的完整步骤。

---

## 1. Repository layout / 仓库结构

The repository root **is** the module folder — `module.json` must sit at the top level,
because that is exactly what Foundry downloads and reads.

仓库根目录**就是**模块目录，`module.json` 必须在最外层——Foundry 下载后直接读它。

```
pf1-random-magic-shop/
├── module.json              # Foundry manifest — must stay at the root
├── README.md                # English
├── README.zh-CN.md          # Chinese
├── CHANGELOG.md
├── LICENSE
├── .gitignore
├── scripts/
│   ├── main.js
│   ├── shop-app.js
│   ├── shop-generator.js
│   ├── settings.js
│   ├── shop-logic.js          # pure helpers, unit tested
│   └── item-piles-bridge.js
├── styles/
│   └── shop-app.css
├── templates/
│   ├── shop-app.hbs
│   └── sources-config.hbs
├── test/
│   ├── item-piles-bridge.test.mjs
│   └── shop-logic.test.mjs
└── docs/
    ├── PUBLISHING.md        # this file
    ├── release-notes-v1.1.0.md
    └── images/              # optional screenshots (add yours, then reference them from the READMEs)
```

Files under `test/`, `docs/` and the helper `.ps1` scripts are **development only** and
are excluded from the release zip (Foundry never needs them, and shipping them only makes
the download bigger).

`test/`、`docs/` 和辅助 `.ps1` 脚本**只用于开发**，不进发布包——Foundry 用不到，只会让下载变大。

---

## 2. One-time setup / 首次配置

### 2.1 Fill in your GitHub username / 填 GitHub 用户名

The READMEs, `CHANGELOG.md` and `module.json` ship with the placeholder
`testuser`. Replace it everywhere at once:

```powershell
pwsh -File .\setup-repo.ps1 -User your-github-name
```

Optional: change the repository name too (defaults to `pf1-random-magic-shop`):

```powershell
pwsh -File .\setup-repo.ps1 -User your-github-name -Repo my-shop-module
```

The script rewrites `module.json` (`url`, `manifest`, `download`, `readme`, `bugs`) and
every `testuser` occurrence in the Markdown files. It is idempotent — running it
twice is harmless.

这个脚本会改 `module.json` 的 `url` / `manifest` / `download` / `readme` / `bugs`，
以及所有 Markdown 里的 `testuser`。重复跑没关系。

### 2.2 Create the GitHub repository / 建仓库

Create an **empty** public repository named `pf1-random-magic-shop` (no README, no
`.gitignore` — this folder already has both). Then, from the module folder:

```powershell
git init
git add .
git commit -m "Initial commit: PF1 Random Magic Shop v1.1.0"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop.git
git push -u origin main
```

---

## 3. Build the release zip / 打包

```powershell
pwsh -File .\build-release.ps1
```

This produces `dist/pf1-random-magic-shop-1.1.0.zip` with the correct internal layout:

```
pf1-random-magic-shop/
├── module.json
├── README.md
├── README.zh-CN.md
├── CHANGELOG.md
├── LICENSE
├── scripts/…
├── styles/…
└── templates/…
```

**The top-level `pf1-random-magic-shop/` folder is not optional.** Foundry unpacks the zip
directly into `Data/modules/`; if `module.json` ends up at `Data/modules/module.json`, the
module will not load.

**最外层的 `pf1-random-magic-shop/` 文件夹不能省。** Foundry 是把 zip 直接解压到
`Data/modules/` 的；如果 `module.json` 落到了 `Data/modules/module.json`，模块加载不了。

The script excludes `dist/`, `test/`, `docs/`, `.git/`, `*.ps1`, `node_modules/` and
`*.log`.

---

## 4. Publish the release / 发 Release

1. Bump the version in **`module.json`** first — the tag and the manifest version must match.
2. Commit and tag:

   ```powershell
   git add -A
   git commit -m "Release v1.1.0"
   git tag v1.1.0
   git push origin main --tags
   ```

3. On GitHub: **Releases → Draft a new release**
   - Tag: `v1.1.0` (the `v` prefix is conventional; `module.json` keeps `1.1.0`)
   - Title: `v1.1.0 — Item Piles integration`
   - Description: paste the contents of `docs/release-notes-v1.1.0.md`
   - Attach **both** assets:
     - `pf1-random-magic-shop-1.1.0.zip`
     - `module.json` ← **required**; the `…/releases/latest/download/module.json`
       URL that users paste into Foundry resolves to this asset
4. Publish.

### Why `module.json` must be a release asset / 为什么必须传 module.json

Foundry's "Install Module" flow fetches the manifest URL, reads `download` from it, then
downloads that zip. If the manifest asset is missing, the URL 404s and users see
"Failed to install module". The manifest's `download` field must point at the *versioned*
zip, not at `latest`.

Foundry 安装模块的流程是：先拉 manifest URL → 读里面的 `download` → 下载那个 zip。
manifest 资产缺了就是 404，用户只会看到「安装失败」。`download` 字段要指向**带版本号**的
zip，不能写 `latest`。

Expected values after `setup-repo.ps1`:

```json
"url":      "https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop",
"manifest": "https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop/releases/latest/download/module.json",
"download": "https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop/releases/download/1.1.0/pf1-random-magic-shop-1.1.0.zip",
"readme":   "https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop/blob/main/README.md",
"bugs":     "https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop/issues"
```

---

## 5. Versioning rules / 版本号规则

| File | Field | Example | Notes |
|---|---|---|---|
| `module.json` | `version` | `1.1.0` | No `v` prefix. Foundry compares this for updates. |
| git tag | tag name | `v1.1.0` | `v` prefix is cosmetic. |
| Release asset | zip name | `pf1-random-magic-shop-1.1.0.zip` | Must match `download` in the manifest. |
| `CHANGELOG.md` | heading | `## [1.1.0] — 2026-10-29` | Keep newest first. |

Foundry only offers an update when the manifest's `version` is **higher** than the
installed one, so a forgotten bump means nobody sees the release.

Foundry 只在 manifest 的 `version` **高于**已安装版本时才提示更新——忘了改版本号，
就等于这个 release 没人看得见。

---

## 6. Release checklist / 发布检查清单

- [ ] `module.json` `version` bumped
- [ ] `CHANGELOG.md` has an entry for the new version
- [ ] `node test/item-piles-bridge.test.mjs` passes
- [ ] `pwsh -File .\build-release.ps1` produced a zip whose **first level** is `pf1-random-magic-shop/`
- [ ] `git tag` pushed
- [ ] Release has **both** the zip and `module.json` attached
- [ ] `module.json` `download` points at the new versioned zip
- [ ] The zip filename in `README.md` / `README.zh-CN.md` matches the new version
- [ ] Install tested once from the manifest URL in a clean Foundry instance

---

## 7. Installing from your own repo, for testing / 自测安装

Before publishing you can install straight from the repo root by pointing Foundry at a
raw manifest URL — but only after the repo is public and the manifest's URLs are filled in:

```
https://raw.githubusercontent.com/USER/pf1-random-magic-shop/main/module.json
```

This works because `download` can point at GitHub's archive endpoint. It is **not**
recommended for end users: raw manifests bypass the release flow and break whenever the
branch is force-pushed.

发布前想自测，可以让 Foundry 指向仓库里的 raw manifest（上面那个地址）。但**不要**让最终用户
这样装——绕过 release 流程，分支一改就废。

---

## 8. Optional: automate with GitHub Actions / 可选：自动化

If you would rather not build the zip by hand, a workflow can do it on tag push:

```yaml
name: Release
on:
  push:
    tags: ["v*"]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Read version
        id: v
        run: echo "version=$(jq -r .version module.json)" >> "$GITHUB_OUTPUT"
      - name: Package
        run: |
          mkdir -p build/pf1-random-magic-shop
          rsync -a --exclude dist --exclude test --exclude docs \
                --exclude '.git*' --exclude '*.ps1' \
                ./ build/pf1-random-magic-shop/
          cd build && zip -r "../pf1-random-magic-shop-${{ steps.v.outputs.version }}.zip" pf1-random-magic-shop
      - name: Publish
        uses: softprops/action-gh-release@v2
        with:
          files: |
            pf1-random-magic-shop-${{ steps.v.outputs.version }}.zip
            module.json
          body_path: docs/release-notes-v1.1.0.md
```

Update `body_path` each release, or generate it from `CHANGELOG.md`.
每次发版记得改 `body_path`，或者干脆从 `CHANGELOG.md` 生成。
