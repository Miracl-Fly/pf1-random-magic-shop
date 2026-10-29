# PF1 Random Magic Shop（随机魔法商店）

一个 Foundry VTT 模块，按 Pathfinder 1e 规则随机生成魔法商店——武器铺、护甲铺、药剂铺、卷轴铺、魔杖铺、奇物铺、综合商店，并按定居点规模决定每家店进多少货。

生成的店铺可以选择一键接入 **[Item Piles](https://foundryvtt.com/packages/item-piles)**，变成能买能卖的商店，玩家在聊天记录里点一下就能交易。

> English documentation: [README.md](README.md)

---

## 功能

- **7 种店铺**：综合商店、武器铺、护甲铺、药剂铺、卷轴铺、魔杖铺、奇物铺。
- **8 档定居点**：村庄 → 村落 → 村镇 → 小城镇 → 大城镇 → 小城市 → 大城市 → 都会。档位决定每家店掷几次次级 / 中级 / 高级物品。
- **核心规则书宝物表**：武器与护甲增强加值、特定武器、特定护甲、近战 / 护甲 / 盾牌特殊能力、随机物品分类表。
- **符合 PF1 的价格**：魔法武器 = `(增强加值 + 特殊能力加值)² × 2000 gp + 300 gp + 基础价`；护甲盾牌 = `× 1000 gp + 150 gp + 基础价`。
- **消耗品施法者等级正确**：药水最高 3 环、卷轴 9 环、魔杖 4 环；CL 从 `max(1, 环数 × 2 − 1)` 起算，有可调概率出现更高 CL。
- **药水合法性检查**：射程为 `personal` 或目标为 `self` 的法术不会出现在药水里。
- **规则书白名单**：可以限制哪些 PF1 规则书（PZO 代码）的法术能进池子。
- **Item Piles 集成**：生成完直接把店铺变成商人，能买能卖。
- **每家店一张肖像**：武器铺用弯刀、护甲铺用战盾、药剂铺用蓝药水……一眼能从 Actor 列表里认出是哪家店。
- **改名的文件夹不会被碰**：把 `<定居点> - 商店` 改成 `沙尖镇`，这批店就归你了——生成器不会打开它、
  不会清空它的库存、也不会把里面的 Actor 搬走。

## 依赖

| | |
|---|---|
| Foundry VTT | **13**（minimum 13、verified 13） |
| Pathfinder 1e 系统（`pf1`） | 11 或更高 |
| [`pf-content`](https://foundryvtt.com/packages/pf-content) | **必需** —— 提供魔法物品 / 奇物图鉴 |
| [`item-piles`](https://foundryvtt.com/packages/item-piles) | 可选 —— 只有商店功能需要 |
| [`item-piles-pf1e`](https://foundryvtt.com/packages/item-piles-pf1e) | 可选，但用 item-piles 时强烈建议一起装 —— 它负责让 Item Piles 读懂 PF1 的价格与货币 |

## 安装

### 从 Foundry 模块管理器装（推荐）

1. 打开 **附加模块 → 安装模块**。
2. 在 *Manifest URL* 里贴：

   ```
   https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop/releases/latest/download/module.json
   ```

3. 点 **安装**。

### 手动装

到 [最新发布](../../releases/latest) 下载 `pf1-random-magic-shop-1.2.0.zip`，解压到 `Data/modules/`，确认路径是 `Data/modules/pf1-random-magic-shop/module.json`。

### 装完之后

在 **设置 → 管理模块** 里启用本模块，然后 `F5` 刷新世界。

## 使用

1. 打开 **Token 控制** 工具栏，点 🏪 **魔法商店生成器**。
2. 选一个定居点规模，点 **生成**。
3. 模块会在名为 `<定居点> - 商店` 的文件夹里，为每种店铺建一个 Actor，掷出物品塞进去，并在聊天记录里发一条汇总。

同一个定居点重复生成会**清空并重掷**已有店铺的内容，不会建重复的 Actor。

### 把一批店「固化」下来

文件夹名就是锚点。把 `小城镇 (Small town) - 商店` 改名成 `沙尖镇`，这批店就永久归你了——
生成器**只在定居点文件夹里**找店铺，所以再生成多少次都不会碰改名的那批，只会在原档位下新建一套。
想继续更新沙尖镇那批，把文件夹名改回原来的定居点名就行。

### Item Piles 商店

装了 Item Piles、且设置里 **生成后转为 item-piles 商店** 开着（默认开）时，每个有货的店铺会被标记成 Item Piles 商人：

- 卖货，**库存有限** —— 买空就没了；
- **商人钱无限** —— 玩家卖东西给他不会因为「商人没钱」失败；
- 买入 100%、卖出 50%，只按基础价；
- **卖空不删卡** —— 重新生成时还是同一个 Actor，东西补回来。

聊天记录里每行商店后面有 **🛒 打开商店**，点开就是 Item Piles 的交易界面。

## 设置

| 设置 | 默认 | 说明 |
|---|---|---|
| **高等级 CL 概率** | `0.05` | 药水 / 卷轴 / 魔杖出现高于最低施法者等级的概率（+1~5 级）。 |
| **允许的规则书来源** | 核心规则书 | 哪些 PF1 规则书的法术能进池子。点开是勾选列表。 |
| **生成后转为 item-piles 商店** | 开 | 给生成的店铺 Actor 写 Item Piles 商人 flag。关掉就只有普通 Actor。 |
| **同时放到当前场景** | 关 | 在当前场景中心放一个商店 token（已经有的店跳过）。 |

## 物品怎么掷

| 表 | 用途 |
|---|---|
| 武器增强加值表 | `+1` ~ `+5`，含特殊 / 特定武器结果与重掷 |
| 护甲与盾牌增强加值表 | `+1` ~ `+5`，含特殊 / 特定护甲结果 |
| 特定武器表 | 有固定价格的具名武器（如 *焰舌* 20,715 gp） |
| 特定护甲表 | 有固定价格的具名护甲（如 *天界铠甲* 22,400 gp） |
| 近战 / 护甲 / 盾牌特殊能力表 | 按「加值等价」掷，总和封顶 +10 |
| 随机物品分类表 | 决定奇物铺的一个格子变成护甲、武器、药水、卷轴、魔杖、法杖、戒指还是权杖 |

消耗品价格按核心规则书公式：

```
药水 = 50 gp × 法术环数 × 施法者等级
卷轴 = 25 gp × 法术环数 × 施法者等级
魔杖 = 15 gp × 法术环数 × 施法者等级 × 50 发
```

## 用到的图鉴

基础物品和法术来自这些 compendium。缺哪个都能跑，只是对应店铺出的货会变少。

| 包 ID | 用途 |
|---|---|
| `pf1.items` | 通用物品、奇物（兜底） |
| `pf1.spells` | 药水 / 卷轴 / 魔杖的法术池 |
| `pf1.weapons-and-ammo` | 基础武器 |
| `pf1.armors-and-shields` | 基础护甲与盾牌 |
| `pf-content.pf-magic-items` | 法杖与魔法物品兜底 |
| `pf-content.pf-wondrous` | 戒指与权杖 |

## 兼容性

- Foundry VTT **13**。
- Pathfinder 1e **11.11**（声明最低 11）。
- 用 `ApplicationV2` + `HandlebarsApplicationMixin`，以及 v13 的 `getSceneControlButtons` hook。
- Item Piles 集成针对 **item-piles 3.x**（`flags.item-piles.data`，`type: "merchant"`）。

## 开发

Item Piles 桥接有一份零依赖测试，直接用 Node 跑：

```bash
node test/item-piles-bridge.test.mjs
node test/shop-logic.test.mjs
```

它 stub 掉 Foundry 的全局对象，验证商人 flag 写得对——以及**Item Piles 没启用时一个字节都不写**。

打包与发布流程见 [docs/PUBLISHING.md](docs/PUBLISHING.md)。

## 已知限制

- 生成的魔法物品 `quantity` 都是 1，商人默认每件只卖一次（除非打开 `infiniteQuantity`）。
- 价格为 0 的物品在商人界面里默认隐藏（`hideItemsWithZeroCost`）。
- 不掷诅咒物品、智能物品、神器。
- 店铺是普通 `npc` Actor，所以角色卡显示的是 PF1 NPC 数据块，没有专门的商店卡面。
- 只有 GM 能跑生成器；聊天里的链接走 Item Piles 自己的权限检查。

## 致谢

- 宝物表与定价依据 Pathfinder RPG 核心规则书（PZO1110）。
- Item Piles 集成基于 [item-piles](https://github.com/fantasycalendar/FoundryVTT-ItemPiles) 3.3.4 与 [item-piles-pf1e](https://github.com/Alediran/item-piles-pf1e)。

## 许可

[MIT](LICENSE)
