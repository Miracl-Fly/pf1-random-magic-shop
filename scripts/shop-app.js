import { generateShops } from "./shop-generator.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

// ★ 定居点数据直接放在这里，不依赖 CONFIG
export const SETTLEMENTS = {
  "村庄 (Thorp)":       { minor: "1d4", medium: null,  major: null,  baseValue: 50,    limit: 500 },
  "村落 (Hamlet)":      { minor: "1d6", medium: null,  major: null,  baseValue: 200,   limit: 1000 },
  "村镇 (Village)":     { minor: "2d4", medium: "1d4", major: null,  baseValue: 500,   limit: 2500 },
  "小城镇 (Small town)":{ minor: "3d4", medium: "1d6", major: null,  baseValue: 1000,  limit: 5000 },
  "大城镇 (Large town)":{ minor: "3d4", medium: "2d4", major: "1d4", baseValue: 2000,  limit: 10000 },
  "小城市 (Small city)":{ minor: "4d4", medium: "3d4", major: "1d6", baseValue: 4000,  limit: 25000 },
  "大城市 (Large city)":{ minor: "4d4", medium: "3d4", major: "2d4", baseValue: 8000,  limit: 50000 },
  "都会 (Metropolis)":  { minor: "4d4", medium: "4d4", major: "3d4", baseValue: 16000, limit: 100000 },
};

export class ShopGeneratorApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "pf1-random-magic-shop-app",
    title: "魔法商店生成器",
    tag: "form",
    position: { width: 480, height: "auto" },
    window: { resizable: true },
    actions: {
      generate: ShopGeneratorApp.#onGenerate,
    },
  };

  static PARTS = {
    form: { template: "modules/pf1-random-magic-shop/templates/shop-app.hbs" },
  };

  async _prepareContext(options) {
    const settlements = Object.keys(SETTLEMENTS);
    const lastChoice = game.settings.get("pf1-random-magic-shop", "lastSettlement") || settlements[4];
    return {
      settlements,
      selected: lastChoice,
    };
  }

  static async #onGenerate(event, target) {
    const form = this.element;
    const settlement = form.querySelector("#settlement-select").value;
    const progress = form.querySelector("#progress");
    const button = form.querySelector('button[data-action="generate"]');

    await game.settings.set("pf1-random-magic-shop", "lastSettlement", settlement);

    button.disabled = true;
    progress.textContent = "开始生成...";

    try {
      await generateShops(settlement, (msg) => {
        progress.textContent = msg;
      });
      progress.textContent = "✅ 生成完成！";
    } catch (err) {
      console.error(err);
      progress.textContent = "❌ 生成失败：" + err.message;
    } finally {
      button.disabled = false;
    }
  }
}