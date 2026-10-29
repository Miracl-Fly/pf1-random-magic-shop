import { ShopGeneratorApp } from "./shop-app.js";
import { registerSettings } from "./settings.js";
import { openShop } from "./item-piles-bridge.js";

Hooks.once("init", () => {
  console.log("PF1 Random Magic Shop | 初始化");
  registerSettings();
});

Hooks.on("getSceneControlButtons", (controls) => {
  // Foundry v13：controls 是对象，工具也是对象
  const tokenControls = controls.tokens || controls.token;
  if (!tokenControls) {
    console.warn("PF1 Random Magic Shop | 找不到 token 控制组");
    return;
  }

  tokenControls.tools["pf1-random-magic-shop"] = {
    name: "pf1-random-magic-shop",
    title: "魔法商店生成器",
    icon: "fas fa-store",
    button: true,
    onClick: () => new ShopGeneratorApp().render(true),
  };
});

// 生成结果里每条商店后面挂了一个 🛒（data-actor-id），点开就是 item-piles 的商店界面。
// v13 用 renderChatMessageHTML，旧版本用 renderChatMessage；两个都挂，谁先到算谁。
function bindShopButtons(html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root || typeof root.querySelectorAll !== "function") return;
  for (const link of root.querySelectorAll("a.pf1-shop-open")) {
    if (link.dataset.pf1ShopBound) continue;
    link.dataset.pf1ShopBound = "1";
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      const actor = game.actors.get(link.dataset.actorId);
      if (!actor) {
        ui.notifications.warn("找不到这个商店 Actor（可能已经被删了），重新生成一次吧");
        return;
      }
      await openShop(actor);
    });
  }
}

Hooks.on("renderChatMessageHTML", (_message, html) => bindShopButtons(html));
Hooks.on("renderChatMessage", (_message, html) => bindShopButtons(html));
