// item-piles 桥接
//
// 目标：把 Random Magic Shop 生成的「店铺 Actor」直接变成 item-piles 的商人。
//
// item-piles 的商店本质上不是一种特殊的 Actor 类型，而是 Actor 上的一个 flag：
//   flags.item-piles.data    → 完整的堆配置（enabled / type / 价格倍率 / 库存规则…）
//   flags.item-piles.version → 模块版本，用于它自己做数据迁移
// 所以「变成商店」= 写这个 flag，不需要重建 Actor，也不会动已经生成好的物品。
//
// 为什么用 API.getActorFlagData 打底：
//   它返回「模块默认值 + 系统适配（item-piles-pf1e 注册的 ITEM_PRICE_ATTRIBUTE 等）+ 现有 flag」的合并结果，
//   直接在这份数据上覆盖几个商人字段再写回去，能保证字段齐全，不会因为漏字段导致商店打不开。
const MODULE_ID = "pf1-random-magic-shop";
const IP_ID = "item-piles";
const FLAG_PILE = "flags.item-piles.data";
const FLAG_VERSION = "flags.item-piles.version";

/** item-piles 是否可用（模块启用 + API 已就绪） */
export function isItemPilesAvailable() {
  return Boolean(game?.modules?.get(IP_ID)?.active && game?.itempiles?.API);
}

/** 商人向的默认参数：卖货、库存有限、钱无限、卖空不删店 */
export const MERCHANT_DEFAULTS = {
  type: "merchant",
  enabled: true,
  displayOne: false,
  showItemName: false,
  // 生成的货是有限的：卖完就没了（想无限卖可以在这里打开）
  infiniteQuantity: false,
  // 商人自己要有钱找零，否则玩家卖东西给他会失败
  infiniteCurrencies: true,
  // 只按物品基础价交易，避免二次加成造成价格离谱
  onlyAcceptBasePrice: true,
  buyPriceModifier: 1,
  sellPriceModifier: 0.5,
  purchaseOnly: false,
  // 商店里只显示有价格的物品（法术书之类的杂物不占地方）
  hideItemsWithZeroCost: true,
  hideNewItems: false,
  displayQuantity: "yes",
  // 卖空之后不要把 Actor 删掉，不然重新生成时会换个新 Actor
  deleteWhenEmpty: false,
  keepZeroQuantity: false,
  // 关掉「清空后自动隐藏」这类会让人以为商店消失的行为
  refreshItemsOnOpen: false,
};

/**
 * 把默认值 + 覆盖项合成一份完整的 pile 数据。
 * 抽成纯函数是为了能单测（不依赖 foundry 运行时）。
 */
export function buildMerchantData(base = {}, overrides = {}) {
  const merged = { ...base, ...MERCHANT_DEFAULTS, ...overrides };
  merged.type = "merchant";
  merged.enabled = true;
  return merged;
}

/**
 * 把一个店铺 Actor 转成 item-piles 商人。
 * @param {Actor} actor
 * @param {object} overrides 想覆盖的 pile 字段
 * @returns {Promise<boolean>} 是否真的写了 flag
 */
export async function convertShopToItemPile(actor, overrides = {}) {
  if (!isItemPilesAvailable()) return false;
  if (!actor) return false;

  const API = game.itempiles.API;
  const base = API.getActorFlagData(actor);
  const data = buildMerchantData(base, overrides);

  await actor.update({
    [FLAG_PILE]: data,
    [FLAG_VERSION]: game.modules.get(IP_ID)?.version ?? "",
  });
  return true;
}

/** 这个 Actor 是不是已经是商人 pile */
export function isMerchantPile(actor) {
  const data = actor?.getFlag?.(IP_ID, "data");
  return Boolean(data?.enabled && data?.type === "merchant");
}

/** 打开商店界面（GM 和玩家都能用；玩家侧由 item-piles 自己校验权限） */
export async function openShop(actor) {
  if (!isItemPilesAvailable()) {
    ui.notifications.warn("item-piles 没有启用，打不开商店界面");
    return;
  }
  try {
    await game.itempiles.API.renderItemPileInterface(actor);
  } catch (error) {
    console.error(`${MODULE_ID} | 打开商店失败`, error);
    ui.notifications.error(`打不开商店：${error.message}`);
  }
}

/**
 * 把商店放一份 token 到当前场景（可选功能）。
 * @param {Actor} actor
 * @param {{x?:number,y?:number}} position 不给就放在视野中心
 */
export async function placeShopToken(actor, { x, y } = {}) {
  if (!isItemPilesAvailable()) return null;
  const scene = canvas?.scene ?? game.scenes.current;
  if (!scene) return null;

  const center = canvas?.scene
    ? { x: canvas.dimensions.width / 2, y: canvas.dimensions.height / 2 }
    : { x: 0, y: 0 };

  // 已经放过就不再放（避免重复生成时场景里堆一排 token）
  const existing = scene.tokens.find((t) => t.actor?.id === actor.id);
  if (existing) return existing;

  const tokenData = await actor.getTokenDocument({
    x: x ?? center.x,
    y: y ?? center.y,
    actorLink: true,           // 商店必须 linked，否则物品不同步
    disposition: -1,             // CONST.CONST_HIDDEN；写成字面量避免不同版本常量名差异
  });

  const [tokenDoc] = await scene.createEmbeddedDocuments("Token", [tokenData.toObject()]);

  // 新建的 token 上不带 pile flag 时补一份（item-piles 认 token 上的 flag）
  if (!tokenDoc.getFlag(IP_ID, "data")) {
    await tokenDoc.update({ [FLAG_PILE]: actor.getFlag(IP_ID, "data") });
  }
  return tokenDoc;
}
