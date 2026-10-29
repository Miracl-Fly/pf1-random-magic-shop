import { SETTLEMENTS } from "./shop-app.js";
import { convertShopToItemPile, isItemPilesAvailable, placeShopToken } from "./item-piles-bridge.js";

// ==================== 表定义 ====================

// 表 5-16：魔法武器增强加值
const WEAPON_ENH_TABLE = {
  minor:  [[1,70,1],[71,85,2],[86,90,"special"],[91,100,"special+reroll"]],
  medium: [[1,10,1],[11,29,2],[30,58,3],[59,62,4],[63,68,"special"],[69,100,"special+reroll"]],
  major:  [[1,20,3],[21,38,4],[39,49,5],[50,63,"special"],[64,100,"special+reroll"]],
};

// 表 5-8：魔法护甲/盾牌增强加值
const ARMOR_ENH_TABLE = {
  minor:  [[1,80,1],[81,87,2],[88,89,"special"],[90,91,"special-shield"],[92,100,"special+reroll"]],
  medium: [[1,10,1],[11,30,2],[31,50,3],[51,57,4],[58,60,"special"],[61,63,"special-shield"],[64,100,"special+reroll"]],
  major:  [[1,16,3],[17,38,4],[39,57,5],[58,60,"special"],[61,63,"special-shield"],[64,100,"special+reroll"]],
};

// 表 15-11：特定武器
const SPECIFIC_WEAPONS = {
  minor: [
    [1,15,"Sleep Arrow",132],[16,25,"Screaming Bolt",267],[26,45,"Silver Dagger, Masterwork",322],
    [46,65,"Cold iron longsword, masterwork",330],[66,75,"Javelin of Lightning",1500],
    [76,80,"Slaying Arrow",2282],[81,90,"Adamantine Dagger",3002],[91,100,"Adamantine Battleaxe",3010],
  ],
  medium: [
    [1,9,"Javelin of Lightning",1500],[10,15,"Slaying Arrow",2282],[16,24,"Adamantine Dagger",3002],
    [25,33,"Adamantine Battleaxe",3010],[34,37,"Slaying Arrow (greater)",4057],
    [38,40,"Shatterspike",4315],[41,46,"Dagger of Venom",8302],[47,51,"Trident of Warning",10115],
    [52,57,"Assassin's Dagger",10302],[58,62,"Shifter's Sorrow",12780],[63,66,"Trident of Fish Command",18650],
    [67,74,"Flame Tongue",20715],[75,79,"Luck Blade (0 wishes)",22060],[80,86,"Sword of Subtlety",22310],
    [87,91,"Sword of the Planes",22315],[92,95,"Nine Lives Stealer",23057],[96,98,"Oathbow",25600],
    [99,100,"Sword of Life Stealing",25775],
  ],
  major: [
    [1,42,"Sword of Life Stealing",25775],[43,46,"Mace of Terror",38552],
    [47,51,"Life-drinker",40320],[52,57,"Sylvan Scimitar",47315],
    [58,62,"Rapier of Puncturing",50320],[63,67,"Sun Blade",50335],
    [68,73,"Frost Brand",54475],[74,79,"Dwarven Thrower",60312],
    [80,84,"Luck Blade (1 wish)",62360],[85,91,"Mace of Smiting",75312],
    [92,95,"Luck Blade (2 wishes)",102660],[96,97,"Holy Avenger",120630],
    [98,99,"Luck Blade (3 wishes)",142960],[100,100,"重掷",0],
  ],
};

// 表 15-6：特定护甲
const SPECIFIC_ARMORS = {
  minor: [
    [1,50,"Mithral Shirt",1100],[51,80,"Dragonhide Plate",3300],[81,100,"Elven Chain",5150],
  ],
  medium: [
    [1,25,"Mithral Shirt",1100],[26,45,"Dragonhide Plate",3300],[46,57,"Elven Chain",5150],
    [58,67,"Rhino Hide",5165],[68,82,"Adamantine Breastplate",10200],
    [83,97,"Dwarven Plate",16500],[98,100,"Banded Mail of Luck",18900],
  ],
  major: [
    [1,10,"Adamantine Breastplate",10200],[11,20,"Dwarven Plate",16500],
    [21,32,"Banded Mail of Luck",18900],[33,50,"Celestial Armor",22400],
    [51,60,"Plate Armor of the Deep",24650],[61,75,"Breastplate of Command",25400],
    [76,90,"Mithral Full Plate of Speed",26500],[91,100,"Demon Armor",52260],
  ],
};

// 表 5-17：近战武器特殊能力
const MELEE_ABILITIES = {
  minor: [
    [1,10,"破敌",1],[11,17,"护体",1],[18,27,"炽焰",1],[28,37,"冻寒",1],
    [38,47,"电击",1],[48,56,"幽冥",1],[57,67,"锐锋",1],[68,71,"真气",1],
    [72,75,"慈悯",1],[76,82,"狂斩",1],[83,87,"储法",1],[88,91,"投掷",1],
    [92,95,"雷鸣",1],[96,99,"反噬",1],[100,100,"重掷",0],
  ],
  medium: [
    [1,6,"破敌",1],[7,12,"护体",1],[13,19,"炽焰",1],[20,26,"冻寒",1],
    [27,33,"电击",1],[34,38,"幽冥",1],[39,44,"锐锋",1],[45,48,"真气",1],
    [49,50,"慈悯",1],[51,54,"狂斩",1],[55,59,"储法",1],[60,63,"投掷",1],
    [64,65,"雷鸣",1],[66,69,"反噬",1],[70,72,"混沌",2],[73,75,"公理",2],
    [76,78,"瓦解",2],[79,81,"焰爆",2],[82,84,"冰爆",2],[85,87,"神圣",2],
    [88,90,"电爆",2],[91,93,"邪恶",2],[94,95,"血光",2],[96,100,"重掷",0],
  ],
  major: [
    [1,3,"破敌",1],[4,6,"护体",1],[7,9,"炽焰",1],[10,12,"冻寒",1],
    [13,15,"电击",1],[16,19,"幽冥",1],[20,21,"锐锋",1],[22,24,"真气",1],
    [25,28,"投掷",1],[29,32,"雷鸣",1],[33,36,"反噬",1],[37,41,"混沌",2],
    [42,46,"公理",2],[47,49,"瓦解",2],[50,54,"焰爆",2],[55,59,"冰爆",2],
    [60,64,"神圣",2],[65,69,"电爆",2],[70,74,"邪恶",2],[75,78,"血光",2],
    [79,83,"追击",3],[84,86,"光能",4],[87,88,"舞空",4],[89,90,"斩首",5],
    [91,100,"重掷",0],
  ],
};

// 表 5-9：魔法护甲特殊能力
const ARMOR_ABILITIES = {
  minor: [
    [1,25,"无相",0,2700],[26,32,"次等护命",1],[33,52,"滑溜",0,3750],
    [53,92,"暗影",0,3750],[93,96,"抗法(13)",2],[97,97,"强化滑溜",0,15000],
    [98,99,"强化暗影",0,15000],[100,100,"重掷",0],
  ],
  medium: [
    [1,5,"无相",0,2700],[6,8,"次等护命",1],[9,11,"滑溜",0,3750],
    [12,17,"暗影",0,3750],[18,19,"抗法(13)",2],[20,29,"强化滑溜",0,15000],
    [30,49,"强化暗影",0,15000],[50,74,"抗能",0,18000],[75,79,"幽冥",3],
    [80,84,"坚韧",3],[85,89,"中等护命",3],[90,94,"抗法(15)",3],
    [95,99,"野性",3],[100,100,"重掷",0],
  ],
  major: [
    [1,3,"无相",0,2700],[4,8,"次等护命",1],[9,11,"滑溜",0,3750],
    [12,17,"暗影",0,3750],[18,19,"抗法(13)",2],[20,29,"强化滑溜",0,15000],
    [30,49,"强化暗影",0,15000],[50,74,"抗能",0,18000],[75,79,"幽冥",3],
    [80,84,"坚韧",3],[85,89,"中等护命",3],[90,94,"抗法(15)",3],
    [95,99,"野性",3],[100,100,"重掷",0],
  ],
};

// 表 5-10：魔法盾牌特殊能力
const SHIELD_ABILITIES = {
  minor: [
    [1,20,"吸矢",1],[21,40,"猛击",1],[41,50,"目盲",1],[51,75,"次等护命",1],
    [76,92,"辟矢",2],[93,97,"活化",2],[98,99,"抗法(13)",2],[100,100,"重掷",0],
  ],
  medium: [
    [1,10,"吸矢",1],[11,20,"猛击",1],[21,25,"目盲",1],[26,40,"次等护命",1],
    [41,50,"辟矢",2],[51,57,"活化",2],[58,59,"抗法(13)",2],[60,79,"抗能",0,18000],
    [80,85,"幽冥",3],[86,95,"中等护命",3],[96,98,"抗法(15)",3],[99,99,"野性",3],
    [100,100,"重掷",0],
  ],
  major: [
    [1,5,"吸矢",1],[6,8,"猛击",1],[9,10,"目盲",1],[11,15,"次等护命",1],
    [16,20,"辟矢",2],[21,25,"活化",2],[26,41,"抗能",0,18000],
    [42,46,"幽冥",3],[47,56,"中等护命",3],[57,58,"抗法(15)",3],[59,59,"野性",3],
    [60,84,"强化抗能",0,42000],[85,86,"抗法(17)",4],[87,87,"操灵",0,49000],
    [88,91,"高等护命",5],[92,93,"镜反",5],[94,94,"抗法(19)",5],[95,99,"高等抗能",0,66000],
    [100,100,"重掷",0],
  ],
};

// 图 3：随机魔法物品类别表
const RANDOM_ITEM_TABLE = {
  minor: [
    [1,4,"armor"],[5,9,"weapon"],[10,44,"potion"],[45,46,"ring"],
    [47,81,"scroll"],[82,91,"wand"],[92,100,"wondrous"],
  ],
  medium: [
    [1,10,"armor"],[11,20,"weapon"],[21,30,"potion"],[31,40,"ring"],
    [41,50,"rod"],[51,65,"scroll"],[66,68,"staff"],[69,83,"wand"],[84,100,"wondrous"],
  ],
  major: [
    [1,10,"armor"],[11,20,"weapon"],[21,25,"potion"],[26,35,"ring"],
    [36,45,"rod"],[46,55,"scroll"],[56,75,"staff"],[76,80,"wand"],[81,100,"wondrous"],
  ],
};

// 消耗品配置
const MAX_LEVEL = { potion: 3, scroll: 9, wand: 4 };
const HIGH_CL_BONUS_MAX = 5;
const POTION_CANDIDATE_LIMIT = 15;
const ALLOW_NO_SOURCE = true;
const SPELL_PACK_ID = "pf1.spells";
const ITEM_PACK_ID = "pf1.items";

// 备用包列表
const FALLBACK_PACKS = [
  "pf-content.pf-magic-items",
  "pf1.weapons-and-ammo",
  "pf1.armors-and-shields",
  "pf1.items",
];

const SHOP_TYPES = [
  { key: "general",  name: "综合商店" },
  { key: "weapon",   name: "武器铺" },
  { key: "armor",    name: "护甲铺" },
  { key: "potion",   name: "药剂铺" },
  { key: "scroll",   name: "卷轴铺" },
  { key: "wand",     name: "魔杖铺" },
  { key: "wondrous", name: "奇物铺" },
];

// ==================== 工具函数 ====================
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rollDice(formula) {
  if (!formula) return 0;
  const match = formula.match(/^(\d+)d(\d+)$/);
  if (!match) return parseInt(formula) || 0;
  const [, count, faces] = match.map(Number);
  let total = 0;
  for (let i = 0; i < count; i++) total += Math.floor(Math.random() * faces) + 1;
  return total;
}
function rollD100() { return Math.floor(Math.random() * 100) + 1; }
function lookupTable(table, roll) {
  for (const row of table) if (roll >= row[0] && roll <= row[1]) return row;
  return null;
}

// 多包查找
async function findItemAcrossPacks(name) {
  const lower = name.toLowerCase();
  for (const packId of FALLBACK_PACKS) {
    const pack = game.packs.get(packId);
    if (!pack) continue;
    const index = await pack.getIndex({ fields: ["type", "system.subType", "system.price"] });
    let entry = index.find(i => i.name.toLowerCase() === lower);
    if (!entry) entry = index.find(i => i.name.toLowerCase().includes(lower));
    if (entry) return { pack, entry };
  }
  return null;
}

// 按名字查找并创建物品数据，用表里的价格覆盖
async function makeSpecificItem(name, price) {
  const found = await findItemAcrossPacks(name);
  if (!found) return null;
  const doc = await found.pack.getDocument(found.entry._id);
  const itemData = doc.toObject();
  itemData.system.price = price;
  return itemData;
}

// ==================== 武器 / 护甲生成 ====================
async function makeMagicWeapon(baseEntry, rarity, pack) {
  const doc = await pack.getDocument(baseEntry._id);
  const itemData = doc.toObject();
  const basePrice = baseEntry.system?.price ?? 0;

  let enhRoll = rollD100();
  let row = lookupTable(WEAPON_ENH_TABLE[rarity], enhRoll);
  let enhancement = 0;
  let specialRolls = [];

  while (row && typeof row[2] === "string") {
    if (row[2] === "special") {
      const specRoll = rollD100();
      const specRow = lookupTable(SPECIFIC_WEAPONS[rarity], specRoll);
      if (specRow && specRow[2] !== "重掷") {
        const specificItem = await makeSpecificItem(specRow[2], specRow[3]);
        if (specificItem) return specificItem;
      }
      specialRolls.push(rollD100());
      break;
    }
    if (row[2] === "special+reroll") {
      const specRoll = rollD100();
      const specRow = lookupTable(SPECIFIC_WEAPONS[rarity], specRoll);
      if (specRow && specRow[2] !== "重掷") {
        const specificItem = await makeSpecificItem(specRow[2], specRow[3]);
        if (specificItem) return specificItem;
      }
      enhRoll = rollD100();
      row = lookupTable(WEAPON_ENH_TABLE[rarity], enhRoll);
    } else break;
  }
  if (row && typeof row[2] === "number") enhancement = row[2];

  const abilities = [];
  let usedBonus = 0;
  for (const sr of specialRolls) {
    const abRow = lookupTable(MELEE_ABILITIES[rarity], sr);
    if (abRow && abRow[2] !== "重掷" && usedBonus + abRow[3] <= 10 - enhancement) {
      abilities.push({ name: abRow[2], bonus: abRow[3] });
      usedBonus += abRow[3];
    }
  }

  if (abilities.length > 0 && enhancement < 1) enhancement = 1;
  while (enhancement + usedBonus > 10 && abilities.length > 0) {
    const removed = abilities.pop();
    usedBonus -= removed.bonus;
  }

  const totalBonus = enhancement + usedBonus;
  const magicPrice = totalBonus * totalBonus * 2000;
  const totalPrice = magicPrice + 300 + basePrice;

  itemData.name = `+${enhancement} ${abilities.map(a => a.name).join(" ")} ${itemData.name}`.trim();
  itemData.system.enh = enhancement;
  itemData.system.masterwork = true;
  itemData.system.price = totalPrice;
  itemData.system.cl = enhancement * 3;
  if (!itemData.system.aura) itemData.system.aura = {};
  itemData.system.aura.school = abilities.length > 0 ? "evo" : "uni";
  itemData.system.aura.custom = false;
  return itemData;
}

async function makeMagicArmor(baseEntry, rarity, pack, isShield = false) {
  const doc = await pack.getDocument(baseEntry._id);
  const itemData = doc.toObject();
  const basePrice = baseEntry.system?.price ?? 0;

  let enhRoll = rollD100();
  let row = lookupTable(ARMOR_ENH_TABLE[rarity], enhRoll);
  let enhancement = 0;
  let specialRolls = [];

  while (row && typeof row[2] === "string") {
    if (row[2] === "special" || row[2] === "special-shield") {
      const specRoll = rollD100();
      const specRow = lookupTable(SPECIFIC_ARMORS[rarity], specRoll);
      if (specRow && specRow[2] !== "重掷") {
        const specificItem = await makeSpecificItem(specRow[2], specRow[3]);
        if (specificItem) return specificItem;
      }
      specialRolls.push(rollD100());
      break;
    }
    if (row[2] === "special+reroll") {
      const specRoll = rollD100();
      const specRow = lookupTable(SPECIFIC_ARMORS[rarity], specRoll);
      if (specRow && specRow[2] !== "重掷") {
        const specificItem = await makeSpecificItem(specRow[2], specRow[3]);
        if (specificItem) return specificItem;
      }
      enhRoll = rollD100();
      row = lookupTable(ARMOR_ENH_TABLE[rarity], enhRoll);
    } else break;
  }
  if (row && typeof row[2] === "number") enhancement = row[2];

  const abilities = [];
  let usedBonus = 0;
  const abilityTable = isShield ? SHIELD_ABILITIES[rarity] : ARMOR_ABILITIES[rarity];
  for (const sr of specialRolls) {
    const abRow = lookupTable(abilityTable, sr);
    if (abRow && abRow[2] !== "重掷") {
      const bonus = abRow[3] || 0;
      if (usedBonus + bonus <= 10 - enhancement) {
        abilities.push({ name: abRow[2], bonus });
        usedBonus += bonus;
      }
    }
  }

  if (abilities.length > 0 && enhancement < 1) enhancement = 1;
  while (enhancement + usedBonus > 10 && abilities.length > 0) {
    const removed = abilities.pop();
    usedBonus -= removed.bonus;
  }

  const totalBonus = enhancement + usedBonus;
  const magicPrice = totalBonus * totalBonus * 1000;
  const totalPrice = magicPrice + 150 + basePrice;

  itemData.name = `+${enhancement} ${abilities.map(a => a.name).join(" ")} ${itemData.name}`.trim();
  itemData.system.masterwork = true;
  itemData.system.price = totalPrice;
  itemData.system.cl = enhancement * 3;
  if (!itemData.system.armor) itemData.system.armor = {};
  itemData.system.armor.enh = enhancement;
  itemData.system.enh = enhancement;
  if (!itemData.system.aura) itemData.system.aura = {};
  itemData.system.aura.school = abilities.length > 0 ? "abj" : "uni";
  itemData.system.aura.custom = false;
  return itemData;
}

// ==================== 消耗品生成 ====================
async function makeConsumable(spellEntry, spellData, itemType, templates, highClChance) {
  const spellLevel = spellEntry.system.level;
  const spellSchool = spellEntry.system.school || "uni";
  const minCL = Math.max(1, spellLevel * 2 - 1);
  let casterLevel = minCL;
  if (Math.random() < highClChance) casterLevel = minCL + randomInt(1, HIGH_CL_BONUS_MAX);

  let price;
  if (itemType === "potion") price = 50 * spellLevel * casterLevel;
  else if (itemType === "scroll") price = 25 * spellLevel * casterLevel;
  else price = 15 * spellLevel * casterLevel * 50;

  const cleanName = spellEntry.name.replace(/\s*\(.*?\)\s*/g, "").trim();
  const label = { potion: "药水", scroll: "卷轴", wand: "魔杖" }[itemType];
  const itemName = `${cleanName} ${label}`;

  let itemData;
  if (templates[itemType]) {
    itemData = foundry.utils.deepClone(templates[itemType]);
  } else {
    itemData = {
      name: itemName, type: "consumable",
      img: { potion: "systems/pf1/icons/items/potions/minor-blue.jpg", scroll: "systems/pf1/icons/items/inventory/scroll-magic.jpg", wand: "systems/pf1/icons/items/inventory/wand-star.jpg" }[itemType],
      system: {
        description: { value: "", instructions: "", unidentified: "" },
        tags: [], quantity: 1, weight: { value: 0 }, equipped: true, carried: true,
        price, size: "med", identified: true,
        unidentified: { price: 0, name: "" },
        cl: casterLevel, aura: { custom: false, school: spellSchool },
        hp: { value: 1, max: 1 }, broken: false, hardness: 1,
        uses: { value: null, per: "single", autoDeductChargesCost: "", maxFormula: "", rechargeFormula: "", pricePerUse: 0 },
        actions: [], attackNotes: [], effectNotes: [], links: { children: [], charges: [] },
        tag: "", flags: { boolean: {}, dictionary: {} }, scriptCalls: [],
        subType: itemType, showInQuickbar: false, spellType: "",
      },
      effects: [], flags: {},
    };
  }

  itemData.name = itemName;
  itemData.system.price = price;
  itemData.system.cl = casterLevel;
  itemData.system.subType = itemType;
  if (!itemData.system.aura) itemData.system.aura = {};
  itemData.system.aura.school = spellSchool;
  itemData.system.description = {
    value: spellData.system?.description?.value || "",
    instructions: spellData.system?.description?.instructions || "",
    unidentified: spellData.system?.description?.unidentified || "",
  };
  if (spellData.system?.actions) itemData.system.actions = foundry.utils.deepClone(spellData.system.actions);
  if (spellData.system?.spellType) itemData.system.spellType = spellData.system.spellType;
  if (spellData.system?.sources) itemData.system.sources = foundry.utils.deepClone(spellData.system.sources);

  if (itemType === "wand") {
    itemData.system.uses = { value: 50, per: "charges", autoDeductChargesCost: "", maxFormula: "50", rechargeFormula: "", pricePerUse: "", max: 50 };
    itemData.system.hp = { value: 5, max: 5 };
    itemData.system.hardness = 5;
  }
  return itemData;
}

async function loadSpellPool(packId, allowedSources, allowNoSource) {
  const pack = game.packs.get(packId);
  if (!pack) return [];
  const index = await pack.getIndex({ fields: ["type", "system.level", "system.school", "system.sources"] });
  return index.filter(i => 
    i.type === "spell" &&
    typeof i.system?.level === "number" &&
    i.system.level >= 0 && i.system.level <= 9 &&
    (() => {
      const srcs = i.system?.sources;
      if (!Array.isArray(srcs) || srcs.length === 0) return allowNoSource;
      return srcs.some(s => allowedSources.includes(s.id));
    })()
  );
}

function isPotionLegal(spellData) {
  const actions = spellData.system?.actions;
  if (!Array.isArray(actions) || actions.length === 0) return true;
  for (const a of actions) {
    const range = a.range?.units?.toLowerCase() ?? "";
    const target = a.target?.value?.toLowerCase() ?? "";
    if (range === "personal") return false;
    if (/personal|self|you|your/i.test(target)) return false;
  }
  return true;
}

// ==================== 主入口 ====================
export async function generateShops(settlementChoice, onProgress) {
  const onLog = (msg) => {
    console.log("PF1 Random Magic Shop |", msg);
    onProgress?.(msg);
  };

  const settlement = SETTLEMENTS[settlementChoice];
  if (!settlement) throw new Error("无效的定居点");

  // ★ 从设置读规则书白名单（数组）
  let ALLOWED_SOURCES = game.settings.get("pf1-random-magic-shop", "allowedSources");
  if (!Array.isArray(ALLOWED_SOURCES) || ALLOWED_SOURCES.length === 0) {
    ALLOWED_SOURCES = ["PZO1110"];
    ui.notifications.warn("未勾选任何规则书来源，已默认使用核心规则书");
  }

  const HIGH_CL_CHANCE = game.settings.get("pf1-random-magic-shop", "highClChance");

  onLog("正在准备文件夹...");

  const folderName = `${settlementChoice} - 商店`;
  let folder = game.folders.find(f => f.name === folderName && f.type === "Actor");
  if (!folder) {
    folder = await Folder.create({ name: folderName, type: "Actor", color: "#7a5c2e" });
  }

  onLog("正在创建店铺 Actor...");

  const shopActors = {};
  for (const shop of SHOP_TYPES) {
    let actor = game.actors.getName(shop.name);
    if (!actor) {
      actor = await Actor.create({ name: shop.name, type: "npc", img: "icons/svg/mystery-man.svg", folder: folder.id });
    } else if (actor.folder?.id !== folder.id) {
      await actor.update({ folder: folder.id });
    }
    shopActors[shop.key] = actor;
  }

  onLog("正在预加载物品池...");

  // 物品包
  const itemPack = game.packs.get(ITEM_PACK_ID);
  const itemIndex = itemPack ? await itemPack.getIndex({ fields: ["type", "system.subType", "system.price"] }) : [];
  const templates = {};
  if (itemPack) {
    for (const sub of ["potion", "scroll", "wand"]) {
      const tpl = itemIndex.find(i => i.type === "consumable" && i.system?.subType === sub);
      if (tpl) templates[sub] = (await itemPack.getDocument(tpl._id)).toObject();
    }
  }

  // 法术池
  const spellPool = await loadSpellPool(SPELL_PACK_ID, ALLOWED_SOURCES, ALLOW_NO_SOURCE);
  const spellPack = game.packs.get(SPELL_PACK_ID);

  // 武器池
  const weaponPack = game.packs.get("pf1.weapons-and-ammo");
  const weaponIndex = weaponPack ? await weaponPack.getIndex({ fields: ["type", "system.subType", "system.price"] }) : [];
  const weaponPool = weaponIndex.filter(i => ["simple","martial","exotic"].includes(i.system?.subType) && i.system?.price > 0);

  // 护甲池
  const armorPack = game.packs.get("pf1.armors-and-shields");
  const armorIndex = armorPack ? await armorPack.getIndex({ fields: ["type", "system.subType", "system.price"] }) : [];
  const armorPool = armorIndex.filter(i => i.system?.subType === "armor" && i.system?.price > 0);
  const shieldPool = armorIndex.filter(i => i.system?.subType === "shield" && i.system?.price > 0);

  // 法杖池
  const magicPack = game.packs.get("pf-content.pf-magic-items");
  const magicIndex = magicPack ? await magicPack.getIndex({ fields: ["type", "system.subType", "system.price"] }) : [];
  let staffPool = magicIndex.filter(i => /staff/i.test(i.name) && i.system?.price > 0);
  let staffSourcePack = magicPack;

  // 戒指/权杖池
  const wondrousPack = game.packs.get("pf-content.pf-wondrous");
  const wondrousIndex = wondrousPack ? await wondrousPack.getIndex({ fields: ["type", "system.subType", "system.price"] }) : [];
  let ringPool = wondrousIndex.filter(i => /ring/i.test(i.name) && i.system?.price > 0);
  let rodPool = wondrousIndex.filter(i => /rod/i.test(i.name) && i.system?.price > 0);
  let wondrousSourcePack = wondrousPack;

  // 兜底：pf-content 缺失时从 pf1.items 补充
  if (staffPool.length === 0 && itemPack) {
    staffPool = itemIndex.filter(i => /staff/i.test(i.name) && i.system?.price > 0);
    staffSourcePack = itemPack;
  }
  if (ringPool.length === 0 && itemPack) {
    ringPool = itemIndex.filter(i => /ring/i.test(i.name) && i.system?.price > 0);
    wondrousSourcePack = itemPack;
  }
  if (rodPool.length === 0 && itemPack) {
    rodPool = itemIndex.filter(i => /rod/i.test(i.name) && i.system?.price > 0);
    wondrousSourcePack = itemPack;
  }

  console.log("PF1 Random Magic Shop | 物品池大小：", {
    weapon: weaponPool.length,
    armor: armorPool.length,
    shield: shieldPool.length,
    staff: staffPool.length,
    ring: ringPool.length,
    rod: rodPool.length,
    spell: spellPool.length,
    wondrous: itemIndex.filter(i => i.system?.subType === "wondrous").length,
  });

  const results = [];

  for (const shop of SHOP_TYPES) {
    onLog(`正在生成${shop.name}...`);

    const actor = shopActors[shop.key];
    if (!actor) continue;

    if (actor.items.size > 0) {
      await actor.deleteEmbeddedDocuments("Item", actor.items.map(i => i.id));
    }

    const counts = {
      minor: rollDice(settlement.minor),
      medium: rollDice(settlement.medium),
      major: rollDice(settlement.major),
    };
    const totalCount = counts.minor + counts.medium + counts.major;
    if (totalCount === 0) continue;

    const itemsToAdd = [];
    const rarityList = [];
    for (const r of ["minor", "medium", "major"]) {
      for (let i = 0; i < counts[r]; i++) rarityList.push(r);
    }

    if (shop.key === "weapon" || shop.key === "armor" || shop.key === "general") {
      for (const rarity of rarityList) {
        let item = null;
        if (shop.key === "weapon") {
          if (weaponPool.length > 0) item = await makeMagicWeapon(pickRandom(weaponPool), rarity, weaponPack);
        } else if (shop.key === "armor") {
          const pool = Math.random() < 0.7 ? armorPool : shieldPool;
          if (pool.length > 0) item = await makeMagicArmor(pickRandom(pool), rarity, armorPack, pool === shieldPool);
        } else {
          if (Math.random() < 0.5 && weaponPool.length > 0) {
            item = await makeMagicWeapon(pickRandom(weaponPool), rarity, weaponPack);
          } else {
            const pool = Math.random() < 0.7 ? armorPool : shieldPool;
            if (pool.length > 0) item = await makeMagicArmor(pickRandom(pool), rarity, armorPack, pool === shieldPool);
          }
        }
        if (item) itemsToAdd.push(item);
      }
    } else if (shop.key === "potion" || shop.key === "scroll" || shop.key === "wand") {
      const maxLv = MAX_LEVEL[shop.key];
      const legal = spellPool.filter(s => s.system.level <= maxLv);
      if (legal.length === 0) continue;
      for (const rarity of rarityList) {
        let picked = null;
        const shuffled = [...legal].sort(() => Math.random() - 0.5).slice(0, POTION_CANDIDATE_LIMIT);
        for (const s of shuffled) {
          const doc = await spellPack.getDocument(s._id);
          const data = doc.toObject();
          if (shop.key !== "potion" || isPotionLegal(data)) {
            picked = { entry: s, data };
            break;
          }
        }
        if (picked) {
          const itemData = await makeConsumable(picked.entry, picked.data, shop.key, templates, HIGH_CL_CHANCE);
          itemsToAdd.push(itemData);
        }
      }
    } else if (shop.key === "wondrous") {
      for (const rarity of rarityList) {
        const roll = rollD100();
        const row = lookupTable(RANDOM_ITEM_TABLE[rarity], roll);
        if (!row) continue;
        const category = row[2];
        let item = null;

        if (category === "armor") {
          const pool = Math.random() < 0.7 ? armorPool : shieldPool;
          if (pool.length > 0) item = await makeMagicArmor(pickRandom(pool), rarity, armorPack, pool === shieldPool);
        } else if (category === "weapon") {
          if (weaponPool.length > 0) item = await makeMagicWeapon(pickRandom(weaponPool), rarity, weaponPack);
        } else if (category === "potion" || category === "scroll" || category === "wand") {
          const maxLv = MAX_LEVEL[category];
          const legal = spellPool.filter(s => s.system.level <= maxLv);
          if (legal.length > 0) {
            let picked = null;
            const shuffled = [...legal].sort(() => Math.random() - 0.5).slice(0, POTION_CANDIDATE_LIMIT);
            for (const s of shuffled) {
              const doc = await spellPack.getDocument(s._id);
              const data = doc.toObject();
              if (category !== "potion" || isPotionLegal(data)) {
                picked = { entry: s, data };
                break;
              }
            }
            if (picked) item = await makeConsumable(picked.entry, picked.data, category, templates, HIGH_CL_CHANCE);
          }
        } else if (category === "staff") {
          if (staffPool.length > 0 && staffSourcePack) {
            const entry = pickRandom(staffPool);
            const doc = await staffSourcePack.getDocument(entry._id);
            item = doc.toObject();
          }
        } else if (category === "ring") {
          if (ringPool.length > 0 && wondrousSourcePack) {
            const entry = pickRandom(ringPool);
            const doc = await wondrousSourcePack.getDocument(entry._id);
            item = doc.toObject();
          }
        } else if (category === "rod") {
          if (rodPool.length > 0 && wondrousSourcePack) {
            const entry = pickRandom(rodPool);
            const doc = await wondrousSourcePack.getDocument(entry._id);
            item = doc.toObject();
          }
        } else if (category === "wondrous") {
          if (itemPack) {
            const pool = itemIndex.filter(i => i.system?.subType === "wondrous" && i.system?.price > 0);
            if (pool.length > 0) {
              const entry = pickRandom(pool);
              const doc = await itemPack.getDocument(entry._id);
              item = doc.toObject();
            }
          }
        }

        if (item) itemsToAdd.push(item);
      }
    }

    if (itemsToAdd.length > 0) {
      await actor.createEmbeddedDocuments("Item", itemsToAdd);
      results.push({ shop: shop.name, counts, total: itemsToAdd.length, actor });
    }
  }

  // ── 把店铺转成 item-piles 的商店 ────────────────────────────────
  // item-piles 的商店不是一个特殊的 Actor 类型，而是 Actor 上的 flags.item-piles.data；
  // 所以这里不用重建 Actor，也不会影响刚生成的物品。
  const wantPile = game.settings.get("pf1-random-magic-shop", "itemPilesMerchant");
  const wantToken = game.settings.get("pf1-random-magic-shop", "itemPilesPlaceToken");
  let pileReady = false;

  if (wantPile && isItemPilesAvailable()) {
    onLog("正在把店铺转成 item-piles 商人...");
    for (const r of results) {
      if (!r.actor) continue;
      try {
        const ok = await convertShopToItemPile(r.actor);
        if (!ok) continue;
        r.isPile = true;
        pileReady = true;
        if (wantToken) {
          await placeShopToken(r.actor);
        }
      } catch (error) {
        console.error("PF1 Random Magic Shop | 转商店失败", r.shop, error);
      }
    }
    if (!pileReady) ui.notifications.warn("item-piles 转商店没成功，看看控制台");
  } else if (wantPile) {
    ui.notifications.warn("没有检测到 item-piles（或它还没就绪），这次只生成了普通 Actor");
  }

  const summary = results.map(r => 
    `<li><strong>${r.shop}</strong>：次级 ${r.counts.minor}、中级 ${r.counts.medium}、高级 ${r.counts.major}，共 ${r.total} 件` +
      (r.isPile ? `　<a class="pf1-shop-open" data-actor-id="${r.actor.id}" title="打开 item-piles 商店界面">🛒 打开商店</a>` : "") +
      `</li>`
  ).join("");

  ChatMessage.create({
    speaker: { alias: "魔法商店生成器" },
    content: `
      <div style="border:1px solid #7a5c2e; border-radius:6px; padding:8px; background:#fdf6e3;">
        <h3 style="margin:0 0 6px 0; color:#7a5c2e;">🏪 ${settlementChoice} 商店已生成${pileReady ? "（已接入 item-piles）" : ""}</h3>
        <ul>${summary}</ul>
      </div>
    `,
  });

  onLog(`已按 ${settlementChoice} 生成 ${results.length} 家店铺`);
}