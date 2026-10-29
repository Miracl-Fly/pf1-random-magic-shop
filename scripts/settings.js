// ==================== 规则书映射表 ====================
// 你认可的规则书列表：产品代码 → 显示名称
// 按需增删。只有在这个表里的代码才会出现在设置界面
const BOOK_MAP = {
  "PZO1110": "核心规则书 (Core Rulebook)",
  "PZO1111": "怪物图鉴 (Bestiary)",
  "PZO1115": "进阶玩家手册 (Advanced Player's Guide)",
  "PZO1117": "终极魔法 (Ultimate Magic)",
  "PZO1118": "终极战斗 (Ultimate Combat)",
  "PZO1121": "进阶种族手册 (Advanced Race Guide)",
  "PZO1129": "进阶职业手册 (Advanced Class Guide)",
  "PZO1132": "异能冒险 (Occult Adventures)",
  "PZO9462": "黑市 (Black Markets)",
  "PZO9467": "其他扩展 (Shield of Shards 等)",
  // 继续添加你认可的规则书...
};

export function registerSettings() {
  game.settings.register("pf1-random-magic-shop", "allowedSources", {
    scope: "world",
    config: false,
    type: Array,
    default: ["PZO1110"],
  });

  game.settings.registerMenu("pf1-random-magic-shop", "allowedSourcesMenu", {
    name: "允许的规则书来源",
    hint: "勾选允许出现在随机商店里的规则书",
    label: "配置规则书",
    icon: "fas fa-book",
    type: AllowedSourcesConfig,
    restricted: true,
  });

  game.settings.register("pf1-random-magic-shop", "highClChance", {
    name: "高等级 CL 概率",
    hint: "生成药水/卷轴/魔杖时，出现高于最低施法者等级的概率（0 到 1）",
    scope: "world",
    config: true,
    type: Number,
    default: 0.05,
    range: { min: 0, max: 1, step: 0.01 },
  });

  // ── item-piles 集成 ──
  game.settings.register("pf1-random-magic-shop", "itemPilesMerchant", {
    name: "生成后转为 item-piles 商店",
    hint: "开着的话，生成完会把每个店铺 Actor 标记成 item-piles 商人（卖货、有限库存、钱无限）。关掉就只生成普通 Actor。",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register("pf1-random-magic-shop", "itemPilesPlaceToken", {
    name: "同时放到当前场景",
    hint: "把商店 token 直接放在当前场景中心（已放过就跳过）。想自己摆位置就关掉。",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("pf1-random-magic-shop", "lastSettlement", {
    scope: "world",
    config: false,
    type: String,
    default: "大城镇 (Large town)",
  });
}

// ==================== 自定义设置界面 ====================
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class AllowedSourcesConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "pf1-random-magic-shop-sources",
    title: "允许的规则书来源",
    tag: "form",
    position: { width: 500, height: "auto" },
    window: { resizable: true },
    actions: {
      save: AllowedSourcesConfig.#onSave,
      selectAll: AllowedSourcesConfig.#onSelectAll,
      clearAll: AllowedSourcesConfig.#onClearAll,
    },
  };

  static PARTS = {
    form: { template: "modules/pf1-random-magic-shop/templates/sources-config.hbs" },
  };

  async _prepareContext(options) {
    const selected = game.settings.get("pf1-random-magic-shop", "allowedSources");
    const sources = Object.entries(BOOK_MAP).map(([code, name]) => ({
      code,
      name,
      checked: selected.includes(code),
    }));
    return { sources };
  }

  static async #onSave(event, target) {
    const form = this.element;
    const checked = [...form.querySelectorAll("input[type=checkbox]:checked")]
      .map(el => el.value);

    await game.settings.set("pf1-random-magic-shop", "allowedSources", checked);
    ui.notifications.success(`已保存 ${checked.length} 个规则书来源`);
    this.close();
  }

  static async #onSelectAll(event, target) {
    this.element.querySelectorAll("input[type=checkbox]").forEach(el => el.checked = true);
  }

  static async #onClearAll(event, target) {
    this.element.querySelectorAll("input[type=checkbox]").forEach(el => el.checked = false);
  }
}