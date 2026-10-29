// item-piles 桥接的单测：不启动 Foundry，用最小 stub 验证「写对了 flag」。
//
// 跑法：node test/item-piles-bridge.test.mjs
// 重点验证：
//   1. item-piles 没启用时绝不写 flag（不能把普通 Actor 弄脏）
//   2. 写进去的 type 必须是 merchant、enabled 必须为 true
//   3. 版本号跟着写，否则 item-piles 下次启动会跑迁移
//   4. 已经写过的 Actor 能被 isMerchantPile 认出来
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

let failures = 0;
const ok = async (label, fn) => {
  try { await fn(); console.log(`  ✅ ${label}`); }
  catch (error) { failures++; console.log(`  ❌ ${label} → ${error.message}`); }
};

const MODULE_DIR = 'C:\\FVTT-V13-ALL\\FVTT-V13-DATA1\\Data\\modules\\pf1-random-magic-shop';
const bridge = await import(pathToFileURL(path.join(MODULE_DIR, 'scripts', 'item-piles-bridge.js')).href);

// ── stub foundry 运行时 ────────────────────────────────────────────────
const mergeObject = (a, b, opts = {}) => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b ?? {})) {
    if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object' && !opts.overwrite) {
      out[k] = mergeObject(out[k], v, opts);
    } else {
      out[k] = v;
    }
  }
  return out;
};

globalThis.foundry = { utils: { mergeObject, deepClone: (v) => JSON.parse(JSON.stringify(v)) } };

const ipModule = { active: true, version: '3.3.4' };
const savedFlags = [];
let pileBase = { enabled: false, type: 'pile', distance: 1, canStackItems: 'yes' };

globalThis.game = {
  modules: { get: (id) => (id === 'item-piles' ? ipModule : null) },
  itempiles: {
    API: {
      getActorFlagData: () => ({ ...pileBase }),
    },
  },
};

const makeActor = () => ({
  id: 'actor1',
  name: '武器铺',
  _data: {},
  async update(changes) { this._data = mergeObject(this._data, changes); savedFlags.push(changes); },
  getFlag(scope, key) { return key === 'data' ? this._data?.['flags.item-piles.data'] : this._data?.[`flags.item-piles.${key}`]; },
});

// ── 1. 纯函数 ──────────────────────────────────────────────────────────
console.log('\n[1] buildMerchantData');
await ok('强制 type=merchant 且 enabled=true', () => {
  const d = bridge.buildMerchantData({ enabled: false, type: 'pile' });
  assert.equal(d.type, 'merchant');
  assert.equal(d.enabled, true);
});
await ok('保留 item-piles 的其它默认字段', () => {
  const d = bridge.buildMerchantData({ distance: 3, canStackItems: 'no' });
  assert.equal(d.distance, 3);
  assert.equal(d.canStackItems, 'no');
});
await ok('商人默认参数齐了（卖价 0.5、钱无限、库存有限）', () => {
  const d = bridge.buildMerchantData();
  assert.equal(d.sellPriceModifier, 0.5);
  assert.equal(d.buyPriceModifier, 1);
  assert.equal(d.infiniteCurrencies, true);
  assert.equal(d.infiniteQuantity, false);
  assert.equal(d.deleteWhenEmpty, false);
});
await ok('overrides 能盖掉默认值', () => {
  const d = bridge.buildMerchantData({}, { infiniteQuantity: true, sellPriceModifier: 0.25 });
  assert.equal(d.infiniteQuantity, true);
  assert.equal(d.sellPriceModifier, 0.25);
});

// ── 2. item-piles 不可用 ───────────────────────────────────────────────
console.log('\n[2] item-piles 不可用时不写 flag');
await ok('isItemPilesAvailable 能识别未启用', () => {
  ipModule.active = false;
  assert.equal(bridge.isItemPilesAvailable(), false);
  ipModule.active = true;
  assert.equal(bridge.isItemPilesAvailable(), true);
});
await ok('convertShopToItemPile 返回 false 且不 update', async () => {
  ipModule.active = false;
  const actor = makeActor();
  const before = savedFlags.length;
  const result = await bridge.convertShopToItemPile(actor);
  assert.equal(result, false);
  assert.equal(savedFlags.length, before);
  ipModule.active = true;
});

// ── 3. 正常转换 ────────────────────────────────────────────────────────
console.log('\n[3] 正常转换');
await ok('写了 flags.item-piles.data 且 type=merchant', async () => {
  const actor = makeActor();
  const result = await bridge.convertShopToItemPile(actor);
  assert.equal(result, true);
  const data = actor._data['flags.item-piles.data'];
  assert.equal(data.type, 'merchant');
  assert.equal(data.enabled, true);
  assert.equal(data.distance, 1, '应该继承 API.getActorFlagData 的默认值');
});
await ok('同时写了 version', async () => {
  const actor = makeActor();
  await bridge.convertShopToItemPile(actor);
  assert.equal(actor._data['flags.item-piles.version'], '3.3.4');
});
await ok('isMerchantPile 能认出来', async () => {
  const actor = makeActor();
  assert.equal(bridge.isMerchantPile(actor), false);
  await bridge.convertShopToItemPile(actor);
  assert.equal(bridge.isMerchantPile(actor), true);
});
await ok('overrides 会进 flag', async () => {
  const actor = makeActor();
  await bridge.convertShopToItemPile(actor, { infiniteQuantity: true });
  assert.equal(actor._data['flags.item-piles.data'].infiniteQuantity, true);
});

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
