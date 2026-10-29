// 店铺归属逻辑的单测：不启动 Foundry，直接跑 node。
//
//   node test/shop-logic.test.mjs
//
// 钉死两件事：
//   1. 只在「目标文件夹」里找同名店铺——别的文件夹（玩家改过名的）一律不认；
//   2. 肖像只补给还挂着默认占位图的店铺，玩家手动换过的不覆盖。
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

let failures = 0;
const ok = async (label, fn) => {
  try { await fn(); console.log(`  ✅ ${label}`); }
  catch (error) { failures++; console.log(`  ❌ ${label} → ${error.message}`); }
};

const MODULE_DIR = 'C:\\FVTT-V13-ALL\\FVTT-V13-DATA1\\Data\\modules\\pf1-random-magic-shop';
const logic = await import(pathToFileURL(path.join(MODULE_DIR, 'scripts', 'shop-logic.js')).href);

const { findShopActorInFolder, isDefaultPortrait, pickPortraitUpdate, DEFAULT_PORTRAIT } = logic;

// 模拟一份 actor 列表：小城镇文件夹里有一套，玩家改名成「沙尖镇」的文件夹里也有一套
const SHOP = '武器铺';
const actors = [
  { id: 'a1', name: SHOP, folder: { id: 'folder-largetown' }, img: DEFAULT_PORTRAIT },
  { id: 'a2', name: SHOP, folder: { id: 'folder-shajian' },   img: 'worlds/sandpoint/smith.png' },
  { id: 'a3', name: '护甲铺', folder: { id: 'folder-shajian' }, img: DEFAULT_PORTRAIT },
  { id: 'a4', name: '综合商店', folder: null,                   img: DEFAULT_PORTRAIT },
];

// ── 1. 文件夹作用域 ────────────────────────────────────────────────────
console.log('\n[1] findShopActorInFolder');

await ok('目标文件夹里找得到', () => {
  const found = findShopActorInFolder(actors, 'folder-largetown', SHOP);
  assert.equal(found?.id, 'a1');
});

await ok('别的文件夹里的同名店铺不认（核心修复）', () => {
  const found = findShopActorInFolder(actors, 'folder-largetown', SHOP);
  assert.notEqual(found?.id, 'a2', '不能把沙尖镇里的武器铺当成自己的');
});

await ok('目标文件夹里没有 → 返回 null（触发新建）', () => {
  assert.equal(findShopActorInFolder(actors, 'folder-brandnew', SHOP), null);
});

await ok('不在任何文件夹里的 Actor 不匹配', () => {
  assert.equal(findShopActorInFolder(actors, 'folder-largetown', '综合商店'), null);
});

await ok('folderId 为空时不乱认', () => {
  assert.equal(findShopActorInFolder(actors, '', SHOP), null);
  assert.equal(findShopActorInFolder(actors, null, SHOP), null);
});

await ok('actors 传 Collection 也能用', () => {
  const collection = { [Symbol.iterator]: () => actors[Symbol.iterator]() };
  assert.equal(findShopActorInFolder(collection, 'folder-shajian', SHOP)?.id, 'a2');
});

// ── 2. 肖像 ────────────────────────────────────────────────────────────
console.log('\n[2] isDefaultPortrait');

await ok('undefined / 空串 / mystery-man 算默认', () => {
  assert.equal(isDefaultPortrait(undefined), true);
  assert.equal(isDefaultPortrait(''), true);
  assert.equal(isDefaultPortrait(DEFAULT_PORTRAIT), true);
});

await ok('自定义肖像不算默认', () => {
  assert.equal(isDefaultPortrait('worlds/sandpoint/smith.png'), false);
});

console.log('\n[3] pickPortraitUpdate');

const PORTRAIT = 'systems/pf1/icons/items/weapons/broken-back-seax.png';

await ok('还挂着占位图的老店铺补肖像', () => {
  assert.equal(pickPortraitUpdate({ img: DEFAULT_PORTRAIT }, PORTRAIT), PORTRAIT);
  assert.equal(pickPortraitUpdate({}, PORTRAIT), PORTRAIT);
});

await ok('玩家手动换过的肖像不覆盖', () => {
  assert.equal(pickPortraitUpdate({ img: 'worlds/sandpoint/smith.png' }, PORTRAIT), null);
});

await ok('没给目标肖像就什么都不做', () => {
  assert.equal(pickPortraitUpdate({ img: DEFAULT_PORTRAIT }, ''), null);
  assert.equal(pickPortraitUpdate({ img: DEFAULT_PORTRAIT }, undefined), null);
});

// ── 4. 回归：改名文件夹后的完整场景 ────────────────────────────────────
console.log('\n[4] 场景回归：把文件夹改名成「沙尖镇」后再生成小城镇');

await ok('沙尖镇里的店铺原封不动，小城镇那边另起一套', () => {
  const renamedFolderId = 'folder-shajian';
  const targetFolderId = 'folder-largetown';

  // 生成器在目标文件夹里找不到 → 会新建
  assert.equal(findShopActorInFolder(actors, 'folder-newlargetown', SHOP), null);
  // 沙尖镇那套仍然属于它自己的文件夹
  assert.equal(findShopActorInFolder(actors, renamedFolderId, SHOP)?.id, 'a2');
  assert.equal(findShopActorInFolder(actors, renamedFolderId, '护甲铺')?.id, 'a3');
  // 已有的小城镇那套继续复用
  assert.equal(findShopActorInFolder(actors, targetFolderId, SHOP)?.id, 'a1');
});

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
