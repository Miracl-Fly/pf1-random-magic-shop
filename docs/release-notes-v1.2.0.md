# Release v1.2.0 — Shop portraits & safe renamed folders

> 本文件可直接粘贴到 GitHub Release 的说明框（Description）里。
> This file can be pasted straight into the GitHub Release description.

---

## English

### Highlights

**Two quality-of-life fixes that matter once you start building an actual town.**

- **Every shop now has a portrait.** Instead of seven identical `mystery-man` placeholders,
  each shop type gets a PF1 item icon — a broken back seax for the weapon smith, a dwarven
  war shield for the armoury, a blue potion for the apothecary, a druid scroll for the
  scroll shop, a star wand for the wand stall, a blue collar for the wonderous dealer and a
  coin badge for the general store.

- **Renamed folders are no longer eaten.** If you rename `<settlement> - Shops` to your own
  town name — say `沙尖镇` — the generator used to find those shops by name, drag them back
  into a freshly created folder and wipe their inventory. It now searches **inside the
  settlement folder only**: the renamed batch keeps its contents, its portraits and its
  folder, and each new run creates a separate set under the original settlement name.

### Upgrade notes

- No migration needed. Shops still wearing the default `mystery-man` portrait are upgraded
  to their type icon the next time you run the generator; shops whose portrait you set
  manually are left alone.
- Shops you renamed the folder of are **not** retroactively touched — they simply stop
  being managed by the generator.

### Installation

Manifest URL:

```
https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop/releases/latest/download/module.json
```

Or download `pf1-random-magic-shop-1.2.0.zip` below and extract it into `Data/modules/`.

### Full changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## 中文

### 重点

**两个「开始正经建城镇」之后才会痛的毛病的修复。**

- **每家店都有肖像了。** 不再是七个一模一样的 `mystery-man` 占位图：武器铺用弯刀、护甲铺用矮人战盾、
  药剂铺用蓝色药水、卷轴铺用德鲁伊卷轴、魔杖铺用星形魔杖、奇物铺用蓝色项圈、综合商店用金币徽章。

- **改过名的文件夹不会被吃掉了。** 以前把 `<定居点> - 商店` 改成自己的城镇名（比如 `沙尖镇`），
  生成器会按名字找到那批店、把它们拖回新建的文件夹、再把库存清空重掷。现在它**只在定居点文件夹里**
  找店铺：改名的那批库存、肖像、文件夹全部原样保留，每次生成都在原档位下另起一套。

### 升级说明

- 不需要迁移。还挂着 `mystery-man` 占位图的老店铺，下次生成时会自动换上对应肖像；
  你手动改过肖像的店铺不会被覆盖。
- 已经改过文件夹名的那批**不会**被回溯处理——它们只是不再受生成器管。

### 安装

Manifest 地址：

```
https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop/releases/latest/download/module.json
```

或者下载下面的 `pf1-random-magic-shop-1.2.0.zip`，解压到 `Data/modules/`。

### 完整更新日志

见 [CHANGELOG.md](CHANGELOG.md)。
