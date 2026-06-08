// ==========================================
// 怪物資料庫 — 新增怪物只需在此加一筆
//
// 📁 建議目錄結構（執行 setup.sh 後生效）：
//   mobs/simion/avatar.png + chase.mp3
//   mobs/MJ/MJ.png         + MJ-chase.mp3
//   mobs/obunga/obunga.png + obunga-chase.mp3
//
// 目前 image/audio 指向根目錄（setup.sh 執行前的暫時路徑）
// ==========================================
window.MOB_REGISTRY = [
  {
    id: 'simion',
    name: 'Simion',
    image:  'mobs/simion/avatar.png',
    audio:  'mobs/simion/chase.mp3',
    hp:     100,
    speed:  0.11,
    attackDmg:      8,
    attackRange:    2.8,
    attackCooldown: 55,
    hitRadius:      2.5,
  },
  {
    id: 'MJ',
    name: 'MJ',
    image:  'mobs/MJ/MJ.png',
    audio:  'mobs/MJ/MJ-chase.mp3',
    hp:     100,
    speed:  0.13,
    attackDmg:      8,
    attackRange:    2.8,
    attackCooldown: 55,
    hitRadius:      2.5,
  },
  {
    id: 'obunga',
    name: 'Obunga',
    image:  'mobs/obunga/obunga.png',
    audio:  'mobs/obunga/obunga-chase.mp3',
    hp:     100,
    speed:  0.09,
    attackDmg:      10,
    attackRange:    2.8,
    attackCooldown: 45,
    hitRadius:      2.5,
  },
  {
    id: 'Job Application',
    name: 'Job Application',
    image:  'mobs/Job Application/Job-Application.png',
    audio:  'mobs/Job Application/JA-chase.mp3',
    hp:     100,
    speed:  0.1,
    attackDmg:      8,
    attackRange:    2.8,
    attackCooldown: 55,
    hitRadius:      2.5,
  },
  {
    id: 'iPhone',
    name: 'iPhone',
    image:  'mobs/iPhone/iPhone.png',
    audio:  'mobs/iPhone/iPhone-chase.mp3',
    hp:     100,
    speed:  0.12,
    attackDmg:      8,
    attackRange:    2.8,
    attackCooldown: 55,
    hitRadius:      2.5,
  },
  {
    id: 'samsung',
    name: 'Samsung',
    image:  'mobs/samsung/samsung.png',
    audio:  'mobs/samsung/samsung-chase.mp3',
    hp:     100,
    speed:  0.12,
    attackDmg:      8,
    attackRange:    2.8,
    attackCooldown: 55,
    hitRadius:      2.5,
  }
];
