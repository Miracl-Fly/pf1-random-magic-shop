// 纯逻辑：不依赖 foundry 全局，方便用 node 直接单测。
//
// 这里放的都是「生成器该不该动某个 Actor」这类判断——出过一次事故：
// 早期版本用 game.actors.getName() 全局找同名店铺，结果把玩家自己改过名的文件夹
// （比如「沙尖镇」）里的店铺抢了过来，还顺手清空重掷，看起来就像旧商店被删了。
// 所以这些判断单独抽出来，用测试钉死。

/** 店铺 Actor 的默认肖像（PF1 新建 npc 时的占位图） */
export const DEFAULT_PORTRAIT = "icons/svg/mystery-man.svg";

/**
 * 只在指定文件夹里找同名店铺。
 * 不在目标文件夹里的 Actor 一律不算——哪怕名字一模一样。
 *
 * @param {Iterable<{name: string, folder?: {id?: string}|null}>} actors
 * @param {string} folderId
 * @param {string} name
 * @returns {object|null}
 */
export function findShopActorInFolder(actors, folderId, name) {
  if (!folderId || !actors) return null;
  const list = Array.isArray(actors) ? actors : Array.from(actors);
  return list.find((actor) => actor?.folder?.id === folderId && actor?.name === name) ?? null;
}

/** 这个 Actor 的肖像还是不是「没人动过」的默认占位图 */
export function isDefaultPortrait(img) {
  return !img || img === DEFAULT_PORTRAIT;
}

/**
 * 要不要给已有店铺补肖像。
 * 只补「还是默认图」的——玩家手动换过的肖像不能被生成器覆盖掉。
 *
 * @param {{img?: string}} actor
 * @param {string} portrait 目标肖像
 * @returns {string|null} 需要更新时返回新肖像，否则 null
 */
export function pickPortraitUpdate(actor, portrait) {
  if (!portrait) return null;
  return isDefaultPortrait(actor?.img) ? portrait : null;
}
