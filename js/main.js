// ==========================================
// 1. 無限場景生成：The Backrooms Level 0
// ==========================================
const scene = new THREE.Scene();
const fogColor = new THREE.Color(0xa39045);
scene.background = fogColor;
scene.fog = new THREE.FogExp2(fogColor, 0.035);

const ambientLight = new THREE.AmbientLight(0xfffae6, 0.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xfff0cc, 0.4);
dirLight.position.set(10, 50, 10);
scene.add(dirLight);

// 動態生成材質
function createCarpetTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    for (let i = 0; i < 256; i += 2) {
        for (let j = 0; j < 256; j += 2) {
            const noise = Math.random() * 30;
            ctx.fillStyle = `rgb(${140 + noise}, ${120 + noise}, ${50 + noise / 2})`;
            ctx.fillRect(i, j, 2, 2);
        }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1500, 1500);
    return tex;
}

function createWallpaperTexture() {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#d1c073'; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#b8a65a'; ctx.lineWidth = 2;
    for (let i = 0; i <= 128; i += 16) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 128); ctx.stroke();
    }
    for (let i = 0; i < 15; i++) {
        ctx.fillStyle = `rgba(100, 80, 30, ${Math.random() * 0.1})`;
        ctx.beginPath();
        ctx.arc(Math.random() * 128, Math.random() * 128, Math.random() * 20 + 5, 0, Math.PI * 2);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function createCeilingTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#e0dbcc'; ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#a09b8c'; ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 256, 256);
    if (Math.random() > 0.75) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, 20, 216, 216);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(500, 500);
    return tex;
}

const floorMat = new THREE.MeshStandardMaterial({ map: createCarpetTexture(), roughness: 1.0 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(15000, 15000), floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const ceilingMat = new THREE.MeshStandardMaterial({ map: createCeilingTexture(), roughness: 0.9, emissive: 0x222211 });
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(15000, 15000), ceilingMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 15;
scene.add(ceiling);

const colliders = [];
const generatedChunks = new Set();
const chunkSize = 40;
const wallGeo = new THREE.BoxGeometry(10, 15, 10);
const wallpaperMat = new THREE.MeshStandardMaterial({ map: createWallpaperTexture(), roughness: 0.8 });

function addWall(x, z, scaleX = 1, scaleZ = 1) {
    const mesh = new THREE.Mesh(wallGeo, wallpaperMat);
    mesh.position.set(x, 7.5, z);
    mesh.scale.set(scaleX, 1, scaleZ);

    const tex = wallpaperMat.map.clone();
    tex.repeat.set(scaleX * 2, 1);
    tex.needsUpdate = true;
    mesh.material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
    scene.add(mesh);
    if (Math.random() < 0.28) addWallGraffiti(x, z, scaleX, scaleZ);

    mesh.updateMatrixWorld();
    const box = new THREE.Box3().setFromObject(mesh);
    colliders.push({ box: box, center: new THREE.Vector3(x, 7.5, z) });
}

// ── 後室塗鴉 ──
const GRAFFITI_MSGS = [
    '別往前走', '← 出口', 'Level 0', '你聽到了嗎?',
    'IT CAN HEAR YOU', '不要跑  牠更快', 'no escape',
    '已有人嘗試過了', 'Turn Back', '牠知道你在這',
    'H E L P', '別開燈', '往右走 →', "you're already dead",
    '怎麼辦', 'FIND THE EXIT', '別回頭', 'LEVEL 0',
    '嗯 是我 我在這', 'smells like mold', 'RUN',
];
function addWallGraffiti(wx, wz, sx, sz) {
    const msg = GRAFFITI_MSGS[Math.floor(Math.random() * GRAFFITI_MSGS.length)];
    const c = document.createElement('canvas');
    c.width = 256; c.height = 80;
    const gctx = c.getContext('2d');
    const colors = ['#cc3333', '#33cc55', '#cccc33', '#cc8833', '#aaaaaa'];
    gctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    const fs = 16 + Math.floor(Math.random() * 14);
    gctx.font = `bold ${fs}px monospace`;
    gctx.textAlign = 'center';
    if (Math.random() < 0.4) {   // 刮痕
        gctx.strokeStyle = gctx.fillStyle;
        gctx.globalAlpha = 0.45;
        gctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            gctx.beginPath();
            gctx.moveTo(Math.random()*256, Math.random()*80);
            gctx.lineTo(Math.random()*256, Math.random()*80);
            gctx.stroke();
        }
        gctx.globalAlpha = 1.0;
    }
    gctx.fillText(msg, 128, 50);
    const face = Math.floor(Math.random() * 4);
    const gy   = 3 + Math.random() * 6;
    let gx = wx, gz = wz, rotY = 0, gw = 4;
    if      (face === 0) { gz = wz + sz * 5 + 0.08; rotY = 0;           gw = Math.min(sx * 7, 5); }
    else if (face === 1) { gz = wz - sz * 5 - 0.08; rotY = Math.PI;     gw = Math.min(sx * 7, 5); }
    else if (face === 2) { gx = wx + sx * 5 + 0.08; rotY = -Math.PI/2;  gw = Math.min(sz * 7, 5); }
    else                 { gx = wx - sx * 5 - 0.08; rotY =  Math.PI/2;  gw = Math.min(sz * 7, 5); }
    const gm = new THREE.Mesh(
        new THREE.PlaneGeometry(gw, 1.8),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true,
            side: THREE.DoubleSide, depthWrite: false, opacity: 0.88 })
    );
    gm.position.set(gx, gy, gz);
    gm.rotation.y = rotY;
    scene.add(gm);
}

// ==========================================
// 後室生物 (Entity) 系統：盯著玩家並在靠近時消失
// ==========================================
// 定義生物 Mesh（黑影圓柱體，加上發光眼睛）
const entities = [];
const entityGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 8); // 瘦長圓柱體
const entityMatBase = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 1.0,
    transparent: true, // 啟用透明度以供消失動畫
    opacity: 1.0
});

function createEntity(pos) {
    // 複製材質，使每個生物能獨立控制透明度
    const mat = entityMatBase.clone();
    const mesh = new THREE.Mesh(entityGeo, mat);
    mesh.position.set(pos.x, 4, pos.z); // 在地毯上，高度中等
    scene.add(mesh);

    // 添加發光眼睛（廣告牌效果的關鍵）
    const eyeGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.2, 3.5, 0.4); // 眼睛位置
    rightEye.position.set(0.2, 3.5, 0.4);
    mesh.add(leftEye, rightEye);

    return {
        mesh: mesh,
        state: 'idle',
        opacity: 1.0,
        proximityThreshold: 40.0 // 距離 40公尺時消失
    };
}

// 確定性亂數：根據 chunk 座標與方向產生固定的通道位置
function chunkRand(a, b, d) {
    let n = a * 127.1 + b * 311.7 + d * 74.3;
    return Math.abs(Math.sin(n) * 43758.5453) % 1;
}

function generateChunk(cx, cz) {
    const key = `${cx},${cz}`;
    if (generatedChunks.has(key)) return;
    generatedChunks.add(key);

    const ox = cx * chunkSize;   // chunk 中心 X
    const oz = cz * chunkSize;   // chunk 中心 Z
    const half = chunkSize / 2;  // 20
    const PW = 9;                // 通道寬度（玩家直徑 ~2.4，留足空間）
    const WT = 0.22;             // 牆壁厚度 scale（實際 2.2 units）

    // 沿 X 方向放水平牆（固定 Z），在 [startX, endX] 範圍留一個通道缺口
    function placeHWall(startX, endX, wallZ, seed) {
        const range = (endX - startX) - PW * 2;
        if (range <= 0) return;
        const gapStart = startX + PW + seed * range;
        const gapEnd = gapStart + PW;
        // 左段
        const leftLen = (gapStart - startX) / 10;
        if (leftLen > 0.05) addWall((startX + gapStart) / 2, wallZ, leftLen, WT);
        // 右段
        const rightLen = (endX - gapEnd) / 10;
        if (rightLen > 0.05) addWall((gapEnd + endX) / 2, wallZ, rightLen, WT);
    }

    // 沿 Z 方向放垂直牆（固定 X），在 [startZ, endZ] 範圍留一個通道缺口
    function placeVWall(startZ, endZ, wallX, seed) {
        const range = (endZ - startZ) - PW * 2;
        if (range <= 0) return;
        const gapStart = startZ + PW + seed * range;
        const gapEnd = gapStart + PW;
        // 上段
        const topLen = (gapStart - startZ) / 10;
        if (topLen > 0.05) addWall(wallX, (startZ + gapStart) / 2, WT, topLen);
        // 下段
        const botLen = (endZ - gapEnd) / 10;
        if (botLen > 0.05) addWall(wallX, (gapEnd + endZ) / 2, WT, botLen);
    }

    // 每個 chunk 只放自己的「南邊界」和「東邊界」
    // 北邊界由 (cx, cz-1) 的南邊界負責；西邊界由 (cx-1, cz) 的東邊界負責
    // 這樣每條邊界只被放置一次，通道位置兩側一致。

    // 南邊界：z = oz + half，沿 X 方向
    placeHWall(ox - half, ox + half, oz + half, chunkRand(cx, cz, 2));

    // 東邊界：x = ox + half，沿 Z 方向
    placeVWall(oz - half, oz + half, ox + half, chunkRand(cx, cz, 1));

    // 內部裝飾牆（1~2 道短牆，不跨越邊界）
    const numInt = Math.floor(chunkRand(cx, cz, 3) * 3);
    for (let i = 0; i < numInt; i++) {
        const wx = ox + (chunkRand(cx, cz, 10 + i) - 0.5) * (chunkSize * 0.55);
        const wz = oz + (chunkRand(cx, cz, 20 + i) - 0.5) * (chunkSize * 0.55);
        if (Math.hypot(wx, wz) < 12) continue; // 保留出生點空曠
        const isH = chunkRand(cx, cz, 30 + i) > 0.5;
        const len = chunkRand(cx, cz, 40 + i) * 0.8 + 0.5;
        addWall(wx, wz, isH ? len : WT, isH ? WT : len);
    }

    // 生物生成
    if (chunkRand(cx, cz, 5) < 0.85) {
        const ex = ox + (chunkRand(cx, cz, 6) - 0.5) * (chunkSize - 8);
        const ez = oz + (chunkRand(cx, cz, 7) - 0.5) * (chunkSize - 8);
        if (Math.hypot(ex, ez) > 10) {
            entities.push(createEntity({ x: ex, z: ez }));
        }
    }
}

function updateInfiniteMaze() {
    const cx = Math.floor(camera.position.x / chunkSize);
    const cz = Math.floor(camera.position.z / chunkSize);
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            generateChunk(cx + i, cz + j);
        }
    }
}

// ==========================================
// 2. 攝影機與控制邏輯
// ==========================================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 5, 0); scene.add(camera);

let currentMode = 1;
const SENS = 0.0022;

let targetYaw = 0, targetPitch = 0;
const PITCH_899 = 89.9 * Math.PI / 180;
const PITCH_90 = 90.0 * Math.PI / 180;
const PITCH_FOLD = 179 * Math.PI / 180;
const EULER_PITCH_LIMIT = Math.PI / 2;

let alg = 'euler';
let limited = true;

let inX = 0, inY = 0;
let e2 = { roll: 0, pitch: 0, yaw: 0 };
let q3 = new THREE.Quaternion();
let q3yaw = 0, q3pitch = 0;

let velocityY = 0;
let isGrounded = true;

const blocker = document.getElementById('blocker');
const startMsg = document.getElementById('start-msg');
document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === document.body) {
        blocker.style.backgroundColor = 'transparent';
        blocker.style.pointerEvents = 'none';
        startMsg.parentElement.style.opacity = '0';
    } else {
        blocker.style.backgroundColor = 'rgba(10, 8, 0, 0.85)';
        blocker.style.pointerEvents = 'auto';
        startMsg.parentElement.style.opacity = '1';
    }
});

const keys = { w: false, a: false, s: false, d: false, space: false, shift: false, q: false };
let sprintToggle = false; // Q 切換衝刺（toggle）

// ── Konami Code 無敵模式 ──
let godMode = false;
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;

document.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    // Konami 輸入偵測
    if (e.key === KONAMI[konamiIdx]) {
        konamiIdx++;
        if (konamiIdx === KONAMI.length) {
            konamiIdx = 0;
            godMode = !godMode;
            showPickupMsg(godMode ? '👾 GOD MODE ON — 無限體力 & 無限血量' : '👾 GOD MODE OFF');
        }
    } else {
        konamiIdx = e.key === KONAMI[0] ? 1 : 0;
    }
    if (k === 'w') keys.w = true;
    if (k === 'a') keys.a = true;
    if (k === 's') keys.s = true;
    if (k === 'd') keys.d = true;
    if (k === ' ') keys.space = true;
    if (e.key === 'Shift') keys.shift = true;
    if (k === 'q') { sprintToggle = !sprintToggle; keys.q = sprintToggle; }

    if (k === 'p') {
        camera.position.set(0, 5, 0);
        velocityY = 0;
        isGrounded = true;
        targetYaw = 0; targetPitch = 0; inX = 0; inY = 0;
        e2 = { roll: 0, pitch: 0, yaw: 0 };
        q3yaw = 0; q3pitch = 0; q3.identity();
        camera.rotation.set(0, 0, 0); camera.quaternion.identity();
        yawData.fill(null); pitchData.fill(null); rollData.fill(null); lastY = null;
    }
});
document.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();
    if (k === 'w') keys.w = false;
    if (k === 'a') keys.a = false;
    if (k === 's') keys.s = false;
    if (k === 'd') keys.d = false;
    if (k === ' ') keys.space = false;
    if (e.key === 'Shift') keys.shift = false;
    // Q 是 toggle，keyup 不重置
});

function setAlg(a) {
    alg = a;
    document.getElementById('btn-euler').classList.toggle('active', a === 'euler');
    document.getElementById('btn-quat').classList.toggle('active', a === 'quat');
    applyConfig();
}
function setLimit(on) {
    limited = on;
    applyConfig();
}

function applyConfig() {
    if (alg === 'euler') currentMode = limited ? 1 : 2;
    else currentMode = 3;

    targetYaw = 0; targetPitch = 0; inX = 0; inY = 0;
    e2 = { roll: 0, pitch: 0, yaw: 0 };
    q3.identity(); q3yaw = 0; q3pitch = 0;
    camera.rotation.set(0, 0, 0); camera.quaternion.identity();
    yawData.fill(null); pitchData.fill(null); rollData.fill(null); lastY = null;

    const lText = document.getElementById('limit-text');
    const pTitle = document.getElementById('p-mode-title');
    const pDesc = document.getElementById('p-mode-desc');
    const sAlg = document.getElementById('s-alg');
    const sLim = document.getElementById('s-limit');

    if (currentMode === 1) {
        lText.innerText = '開啟 (±89.9°)'; lText.style.color = '#ccc';
        pTitle.innerText = '模式：尤拉角 (Euler)'; pTitle.style.color = 'var(--primary)';
        pDesc.innerHTML = '尤拉角模式：<br>開啟角度限制，最高只到 89.9 度，避開數學奇異點，這是一般 FPS 遊戲的做法。';
        sAlg.innerText = '尤拉角 (安全)'; sLim.innerText = '開啟 (±89.9°)';
    } else if (currentMode === 2) {
        lText.innerText = '關閉 (允許 90°)'; lText.style.color = '#ff4444';
        pTitle.innerText = '模式：尤拉角 (解除限制)'; pTitle.style.color = '#ff4444';
        pDesc.innerHTML = '<b style="color:#ff4444">警告：純數學極限</b><br>導入尤拉角運動學公式。當視角逼近 90 度，Yaw 會因「除以 Cos(90)」引發除以零錯誤，數值瞬間發散，畫面崩潰。';
        sAlg.innerText = '尤拉角 (發散)'; sLim.innerText = '關閉 (至 ±90°)';
    } else {
        lText.innerText = limited ? '開啟 (±90°)' : '關閉 (無限制)'; lText.style.color = '#ccc';
        pTitle.innerText = '模式：四元數 (Quaternion)'; pTitle.style.color = 'var(--primary)';
        pDesc.innerHTML = limited
            ? '四元數模式：<br>不會產生萬向節鎖 (Gimbal Lock)，數學運算永遠穩定。'
            : '四元數模式 (無限制)：<br>可自由旋轉越過頭頂看後方，完全沒有數學死角。';
        sAlg.innerText = '四元數'; sLim.innerText = limited ? '開啟 (±90°)' : '關閉 (無限制)';
    }
}

document.addEventListener('mousemove', e => {
    if (document.pointerLockElement !== document.body) return;
    if (currentMode === 1) {
        targetYaw -= e.movementX * SENS;
        targetPitch -= e.movementY * SENS;
        while (targetYaw > Math.PI) targetYaw -= 2 * Math.PI;
        while (targetYaw <= -Math.PI) targetYaw += 2 * Math.PI;
        targetPitch = Math.max(-PITCH_899, Math.min(PITCH_899, targetPitch));
        camera.rotation.set(targetPitch, targetYaw, 0, 'YXZ');
    } else {
        inX -= e.movementY * SENS;
        inY -= e.movementX * SENS;
    }
});

function checkCollision(pos, height) {
    const playerRadius = 1.2;
    const playerBox = new THREE.Box3(
        new THREE.Vector3(pos.x - playerRadius, pos.y - height + 0.5, pos.z - playerRadius),
        new THREE.Vector3(pos.x + playerRadius, pos.y + 0.2, pos.z + playerRadius)
    );

    for (let i = 0; i < colliders.length; i++) {
        const col = colliders[i];
        if (Math.abs(col.center.x - pos.x) < 20 && Math.abs(col.center.z - pos.z) < 20) {
            if (playerBox.intersectsBox(col.box)) {
                return true;
            }
        }
    }
    return false;
}

// 怪物碰撞檢查（半徑 2.0）
function checkMonsterCollision(pos) {
    const r = 2.0;
    const box = new THREE.Box3(
        new THREE.Vector3(pos.x - r, 0, pos.z - r),
        new THREE.Vector3(pos.x + r, 14, pos.z + r)
    );
    for (const col of colliders) {
        if (Math.abs(col.center.x - pos.x) < 25 && Math.abs(col.center.z - pos.z) < 25) {
            if (box.intersectsBox(col.box)) return true;
        }
    }
    return false;
}

// 怪物沿地形追玩家：先嘗試直線，若碰牆則滑行或轉向繞過
function moveMonsterWithWallAvoid(sprite, targetPos, speed) {
    const pos = sprite.position;
    const dx = targetPos.x - pos.x;
    const dz = targetPos.z - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.5) return;
    const ndx = dx / dist;
    const ndz = dz / dist;

    // 直線
    if (!checkMonsterCollision(new THREE.Vector3(pos.x + ndx * speed, pos.y, pos.z + ndz * speed))) {
        pos.x += ndx * speed; pos.z += ndz * speed; return;
    }
    // X 軸滑行
    if (!checkMonsterCollision(new THREE.Vector3(pos.x + ndx * speed, pos.y, pos.z))) {
        pos.x += ndx * speed; return;
    }
    // Z 軸滑行
    if (!checkMonsterCollision(new THREE.Vector3(pos.x, pos.y, pos.z + ndz * speed))) {
        pos.z += ndz * speed; return;
    }
    // 旋轉繞過障礙（±45°、±90°、±135°）
    for (const deg of [45, -45, 90, -90, 135, -135]) {
        const rad = deg * Math.PI / 180;
        const c = Math.cos(rad), s = Math.sin(rad);
        const rx = ndx * c - ndz * s;
        const rz = ndx * s + ndz * c;
        if (!checkMonsterCollision(new THREE.Vector3(pos.x + rx * speed, pos.y, pos.z + rz * speed))) {
            pos.x += rx * speed; pos.z += rz * speed; return;
        }
    }
    // 完全卡住，不移動
}

function applyMovement() {
    if (document.pointerLockElement !== document.body) return;

    // 玩家步行速度至少與怪物相同，確保玩家跑得贏
    const BASE_WALK   = Math.max(0.22, AVATAR_SPEED);
    const BASE_SPRINT = Math.max(0.48, AVATAR_SPEED * 1.6);
    let baseSpeed = BASE_WALK;
    let targetHeight = 5.0;

    if (keys.shift) {
        targetHeight = 2.5;
        baseSpeed = Math.min(0.10, BASE_WALK);
        // 蹲下時強制取消衝刺
        if (sprintToggle) { sprintToggle = false; keys.q = false; }
    } else if (keys.q) {
        baseSpeed = BASE_SPRINT; // 衝刺速度永遠比怪物快
    }

    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    fwd.y = 0; fwd.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0; right.normalize();

    const moveDir = new THREE.Vector3(0, 0, 0);
    if (keys.w) moveDir.addScaledVector(fwd, baseSpeed);
    if (keys.s) moveDir.addScaledVector(fwd, -baseSpeed);
    if (keys.a) moveDir.addScaledVector(right, -baseSpeed);
    if (keys.d) moveDir.addScaledVector(right, baseSpeed);

    if (moveDir.x !== 0) {
        camera.position.x += moveDir.x;
        if (checkCollision(camera.position, targetHeight)) {
            camera.position.x -= moveDir.x;
        }
    }
    if (moveDir.z !== 0) {
        camera.position.z += moveDir.z;
        if (checkCollision(camera.position, targetHeight)) {
            camera.position.z -= moveDir.z;
        }
    }

    // 跳躍：衝刺時跳得更遠
    if (keys.space && isGrounded) {
        velocityY = keys.q ? 0.65 : 0.52;
        isGrounded = false;
    }

    velocityY -= 0.032;
    camera.position.y += velocityY;

    if (camera.position.y <= targetHeight) {
        camera.position.y = targetHeight;
        velocityY = 0;
        isGrounded = true;
    }

    // 擊退速度衰減（加牆壁碰撞檢查，不能穿牆）
    if (knockbackVel.lengthSq() > 0.0001) {
        camera.position.x += knockbackVel.x;
        if (checkCollision(camera.position, targetHeight)) {
            camera.position.x -= knockbackVel.x;
            knockbackVel.x *= -0.3; // 反彈衰減
        }
        camera.position.z += knockbackVel.z;
        if (checkCollision(camera.position, targetHeight)) {
            camera.position.z -= knockbackVel.z;
            knockbackVel.z *= -0.3;
        }
        knockbackVel.multiplyScalar(0.75);
    }

    // ── 耐力：衝刺消耗，不動/走路回復 ──
    const isActuallyMoving = moveDir.lengthSq() > 0;
    if (keys.q && isActuallyMoving && !godMode) {
        stamina = Math.max(0, stamina - STAMINA_DRAIN);
        if (stamina <= 0) { sprintToggle = false; keys.q = false; }
    } else {
        stamina = Math.min(STAMINA_MAX, stamina + STAMINA_REGEN);
    }
    const _stBar = document.getElementById('stamina-bar');
    const _stNum = document.getElementById('stamina-num');
    if (_stBar) _stBar.style.width = (stamina / STAMINA_MAX * 100) + '%';
    if (_stNum) _stNum.textContent = Math.ceil(stamina) + '/100';

    // ── 腳步聲 ──
    if (isActuallyMoving && isGrounded && audioCtx) {
        footstepTimer--;
        if (footstepTimer <= 0) {
            footstepTimer = keys.q ? 11 : 20;
            playFootstep(keys.q);
        }
    }
}

function physicalRoll(cam) {
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    if (Math.abs(fwd.y) > 0.9995) return 0;
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
    const expectRight = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    let roll = expectRight.angleTo(right);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
    if (up.dot(expectRight) > 0) roll = -roll;
    return THREE.MathUtils.radToDeg(roll);
}

// ===== CHART =====
let angleChart;
const N = 200;
let yawData = Array(N).fill(null), pitchData = Array(N).fill(null), rollData = Array(N).fill(null);
let lastY = null;

function initChart() {
    const ctx = document.getElementById('angleChart').getContext('2d');
    angleChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: N }, (_, i) => i),
            datasets: [
                { label: 'Yaw', data: yawData, borderColor: '#aaccff', borderWidth: 1.5, pointRadius: 0, tension: 0.1, spanGaps: false },
                { label: 'Pitch', data: pitchData, borderColor: '#d4b553', borderWidth: 1.5, pointRadius: 0, tension: 0.1, spanGaps: false },
                { label: 'Roll', data: rollData, borderColor: '#ff4444', borderWidth: 2, pointRadius: 0, tension: 0.1, spanGaps: false },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { min: -180, max: 180, ticks: { color: '#887755', stepSize: 90 }, grid: { color: '#332211' } },
                x: { display: false }
            },
            plugins: { legend: { labels: { color: '#ccbb99', boxWidth: 12, font: { size: 11 } } } },
            animation: false
        }
    });
}

function updateChart() {
    let yDeg, pDeg, rDeg;
    if (currentMode === 1) {
        yDeg = THREE.MathUtils.radToDeg(targetYaw);
        pDeg = THREE.MathUtils.radToDeg(targetPitch);
        rDeg = physicalRoll(camera);
    } else if (currentMode === 2) {
        yDeg = THREE.MathUtils.radToDeg(e2.yaw);
        pDeg = THREE.MathUtils.radToDeg(e2.pitch);
        rDeg = THREE.MathUtils.radToDeg(e2.roll);
        yDeg = ((yDeg + 180) % 360 + 360) % 360 - 180;
        rDeg = ((rDeg + 180) % 360 + 360) % 360 - 180;
    } else {
        const ang = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
        yDeg = THREE.MathUtils.radToDeg(ang.y);
        pDeg = THREE.MathUtils.radToDeg(q3pitch);
        rDeg = physicalRoll(camera);
    }

    if (lastY !== null && Math.abs(yDeg - lastY) > 180) {
        yawData.push(null); pitchData.push(null); rollData.push(null);
        yawData.shift(); pitchData.shift(); rollData.shift();
    }
    yawData.push(yDeg); pitchData.push(pDeg); rollData.push(rDeg);
    yawData.shift(); pitchData.shift(); rollData.shift();
    lastY = yDeg;
    angleChart.update('none');

    document.getElementById('s-pitch').innerText = pDeg.toFixed(2) + '°';
    document.getElementById('s-yaw').innerText = yDeg.toFixed(2) + '°';
    const rollEl = document.getElementById('s-roll');
    rollEl.innerText = rDeg.toFixed(2) + '°';
    rollEl.style.color = Math.abs(rDeg) > 5 ? '#ff4444' : '#ffcc00';

    const warn = document.getElementById('gl-warn');
    const isAtPole = Math.abs(pDeg) >= 89.9;
    const yawJump = yawData[199] !== null && yawData[198] !== null ? Math.abs(yawData[199] - yawData[198]) : 0;
    const isBroken = isAtPole && yawJump > 45;

    if (currentMode === 2 && isBroken) {
        warn.classList.add('show');
    } else {
        warn.classList.remove('show');
    }
}

addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
});

// ===== 核心微積分 =====
function integrateOrientation() {
    if (currentMode === 1) return;

    const q = inX;
    const r = inY;
    inX = 0; inY = 0;

    if (currentMode === 2) {
        e2.pitch += q;
        e2.pitch = Math.max(-EULER_PITCH_LIMIT, Math.min(EULER_PITCH_LIMIT, e2.pitch));

        const cos_pitch = Math.cos(e2.pitch);
        e2.yaw += r / cos_pitch;
        e2.roll = 0;

        camera.rotation.set(e2.pitch, e2.yaw, e2.roll, 'YXZ');
    } else if (currentMode === 3) {
        q3yaw += r;
        q3pitch += q;
        const lim = limited ? PITCH_90 : PITCH_FOLD;
        q3pitch = Math.max(-lim, Math.min(lim, q3pitch));
        const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), q3yaw);
        const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), q3pitch);
        q3.copy(qy).multiply(qx);
        camera.quaternion.copy(q3);
    }
}

let frameCount = 0;

function animate() {
    frameCount++;
    requestAnimationFrame(animate);
    updateInfiniteMaze();

    // ==========================================
    // 後室生物 (Entity) 行為：盯著玩家並臨近消失
    // ==========================================
    const playerPos = camera.position;
    for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];
        // 盯著玩家（BillboardBehavior）
        entity.mesh.lookAt(playerPos);

        // 計算與玩家的距離
        const distToPlayer = playerPos.distanceTo(entity.mesh.position);

        // 消失邏輯
        if (entity.state === 'idle' && distToPlayer < entity.proximityThreshold) {
            entity.state = 'disappearing';
        }

        if (entity.state === 'disappearing') {
            // 逐漸變得透明
            entity.opacity -= 0.05; // 消失速度
            entity.mesh.material.opacity = entity.opacity;
            if (entity.opacity <= 0) {
                // 從場景移除
                scene.remove(entity.mesh);
                entities.splice(i, 1); // 從陣列移除
            }
        }
    }

    integrateOrientation();
    applyMovement();
    updateAvatarSystem();
    updateAlmondWaters();
    updateCrawlers();
    updateFlicker();
    updateBreathing();
    updateChart();
    renderer.render(scene, camera);
}

// ==========================================
// 怪物系統（由 MOB_REGISTRY 動態生成）
// ==========================================
const PLAYER_MAX_HP = 100;
let playerHP = PLAYER_MAX_HP;
let playerAlive = true;
let playerDamageCooldown = 0;
const knockbackVel = new THREE.Vector3(0, 0, 0);
const STAMINA_MAX   = 100;
let   stamina       = STAMINA_MAX;
const STAMINA_DRAIN = 0.7;   // 每幀衝刺消耗
const STAMINA_REGEN = 0.22;  // 每幀回復
const AVATAR_ATTACK_RANGE    = 2.8;
const AVATAR_HIT_RADIUS      = 2.5;
const CHASE_MAX_DIST         = 100;
const BULLET_SPEED           = 2.5;
const BULLET_DAMAGE          = 5;

let gameStarted = false;

// 為每個 registry mob 建立執行時物件
const mobs = MOB_REGISTRY.map(def => {
    // 3D sprite
    const tex  = new THREE.TextureLoader().load(def.image);
    const geo  = new THREE.PlaneGeometry(10, 16);
    const mat  = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const sprite = new THREE.Mesh(geo, mat);
    sprite.position.set(0, 8, -999); // 先放在場外

    // 名字標籤
    const nc = document.createElement('canvas');
    nc.width = 256; nc.height = 64;
    const nctx = nc.getContext('2d');
    nctx.fillStyle = '#fff'; nctx.font = 'bold 28px sans-serif'; nctx.textAlign = 'center';
    nctx.fillText(def.name, 128, 36);
    const nTag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(nc), transparent: true }));
    nTag.scale.set(3, 0.8, 1);
    nTag.position.set(0, 9.5, 0);
    sprite.add(nTag);

    // 音效
    const audio = new Audio(def.audio);
    audio.loop = true;
    audio.volume = 0;

    // HP 條 HTML（動態插入）
    const hpSection = document.createElement('div');
    hpSection.className = 'hp-section';
    hpSection.id = `mob-hp-section-${def.id}`;
    hpSection.style.display = 'none';
    hpSection.innerHTML = `
        <div class="hp-label">👾 ${def.name} HP</div>
        <div class="hp-bar-container">
            <div id="mob-hp-bar-${def.id}" class="hp-bar enemy-bar" style="width:100%"></div>
        </div>
        <span id="mob-hp-num-${def.id}" class="hp-num">${def.hp}/${def.hp}</span>`;
    document.getElementById('hp-overlay').appendChild(hpSection);

    // 死亡訊息 HTML
    const deadMsg = document.createElement('div');
    deadMsg.id = `mob-dead-${def.id}`;
    deadMsg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#44ff44;font-size:28px;font-weight:bold;text-shadow:0 0 15px #00ff00;pointer-events:none;z-index:20;opacity:0;transition:opacity 0.5s;';
    deadMsg.textContent = `💀 ${def.name} 已消滅！`;
    document.body.appendChild(deadMsg);

    return {
        def,
        sprite, mat,
        audio,
        hp: def.hp,
        alive: false,   // 由 queue 控制何時激活
        audioStarted: false,
        damageCooldown: 0,
        hpSectionEl: hpSection,
    };
});

// ── 怪物佇列（隨機不重複）──
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
let monsterQueue = shuffleArray(mobs.map((_, i) => i));
let queueIdx     = 0;

function updateHPBars() {
    document.getElementById('player-hp-bar').style.width = Math.max(0, playerHP / PLAYER_MAX_HP * 100) + '%';
    document.getElementById('player-hp-num').innerText   = Math.ceil(playerHP) + '/100';
    mobs.forEach(m => {
        const pct = Math.max(0, m.hp / m.def.hp * 100);
        const bar = document.getElementById(`mob-hp-bar-${m.def.id}`);
        const num = document.getElementById(`mob-hp-num-${m.def.id}`);
        if (bar) bar.style.width = pct + '%';
        if (num) num.textContent = `${Math.ceil(m.hp)}/${m.def.hp}`;
    });
}

function showOnlyMobHP(idx) {
    mobs.forEach((m, i) => {
        m.hpSectionEl.style.display = (i === idx) ? '' : 'none';
    });
}

// 在玩家周圍找一個不在牆內的出生點（同時適用於怪物和未來用途）
function safeSpawnPosition(originX, originZ, minDist, maxDist, maxAttempts = 40) {
    const _t = new THREE.Vector3();
    for (let i = 0; i < maxAttempts; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist  = minDist + Math.random() * (maxDist - minDist);
        _t.set(originX + Math.cos(angle) * dist, 8, originZ + Math.sin(angle) * dist);
        if (!checkMonsterCollision(_t)) return _t.clone();
    }
    // 如果試了 maxAttempts 次都在牆內，擴大範圍再試一輪
    for (let i = 0; i < maxAttempts; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist  = maxDist + Math.random() * maxDist;
        _t.set(originX + Math.cos(angle) * dist, 8, originZ + Math.sin(angle) * dist);
        if (!checkMonsterCollision(_t)) return _t.clone();
    }
    // 最終保底：直接用原始方向但距離再推遠
    const angle = Math.random() * Math.PI * 2;
    return new THREE.Vector3(originX + Math.cos(angle) * (maxDist * 2), 8, originZ + Math.sin(angle) * (maxDist * 2));
}

function activateMob(idx) {
    // 全部從場景移除 + 靜音
    mobs.forEach(m => { scene.remove(m.sprite); m.audio.volume = 0; m.alive = false; });

    const m = mobs[monsterQueue[idx]];
    const spawnPos = safeSpawnPosition(camera.position.x, camera.position.z, 40, 60);
    m.sprite.position.copy(spawnPos);
    m.hp    = m.def.hp;
    m.alive = true;
    m.sprite.userData.pathTimer = 0;
    m.sprite.userData.nextWP    = null;
    m.sprite.userData.kbVel     = new THREE.Vector3(0, 0, 0);
    scene.add(m.sprite);
    showOnlyMobHP(monsterQueue[idx]);
    updateHPBars();
}

function advanceMobQueue() {
    queueIdx++;
    if (queueIdx >= monsterQueue.length) {
        monsterQueue = shuffleArray(mobs.map((_, i) => i));
        queueIdx = 0;
    }
    setTimeout(() => { if (playerAlive) activateMob(queueIdx); }, 3000);
}

function killCurrentMob() {
    const m = mobs[monsterQueue[queueIdx]];
    m.alive = false;
    scene.remove(m.sprite);
    m.audio.volume = 0;
    m.hp = 0;
    updateHPBars();
    const msg = document.getElementById(`mob-dead-${m.def.id}`);
    if (msg) { msg.style.opacity = '1'; setTimeout(() => { msg.style.opacity = '0'; }, 2500); }
    advanceMobQueue();
}

// ── Reusable static objects for A* ──
const _mcBox = new THREE.Box3();

// A* pathfinding
const AStarNav = (() => {
    const CELL = 4, GRID_R = 28, MAX_ITER = 900;
    const tv = new THREE.Vector3(0, 4, 0);
    const DIRS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    return {
        findPath(sx, sz, gx, gz) {
            const S = (w) => Math.round(w / CELL);
            const ox = S(sx), oz = S(sz), tx = S(gx), tz = S(gz);
            if (ox===tx && oz===tz) return null;
            const enc = (x,z) => `${x},${z}`;
            const walk = (x,z) => { tv.x=x*CELL; tv.z=z*CELL; return !checkMonsterCollision(tv); };
            const open=[ {x:ox,z:oz,f:0,g:0} ];
            const came=new Map(), gC=new Map([[enc(ox,oz),0]]), closed=new Set();
            let it=0;
            while (open.length && it++<MAX_ITER) {
                let bi=0;
                for (let i=1;i<open.length;i++) if(open[i].f<open[bi].f) bi=i;
                const cur=open.splice(bi,1)[0];
                const ce=enc(cur.x,cur.z);
                if (closed.has(ce)) continue;
                closed.add(ce);
                if (cur.x===tx && cur.z===tz) {
                    let e=ce, first=null;
                    while (came.has(e)) { first=e; e=came.get(e); }
                    if (!first) return null;
                    const [fx,fz]=first.split(',').map(Number);
                    return {x:fx*CELL, z:fz*CELL};
                }
                const cg=gC.get(ce);
                for (const [dx,dz] of DIRS) {
                    const nx=cur.x+dx, nz=cur.z+dz;
                    if (Math.abs(nx-ox)>GRID_R || Math.abs(nz-oz)>GRID_R) continue;
                    const ne=enc(nx,nz);
                    if (closed.has(ne)||!walk(nx,nz)) continue;
                    const ng=cg+(dx&&dz?1.414:1);
                    if (ng<(gC.get(ne)??Infinity)) {
                        came.set(ne,ce); gC.set(ne,ng);
                        open.push({x:nx,z:nz,f:ng+Math.abs(nx-tx)+Math.abs(nz-tz),g:ng});
                    }
                }
            }
            return null;
        }
    };
})();

let AVATAR_SPEED  = 0.11;
let monsterEnabled = true;
function setMonsterEnabled(on) {
    monsterEnabled = on;
    document.getElementById('monster-toggle-text').innerText = on ? '開啟' : '關閉';
    if (!on) mobs.forEach(m => { m.audio.volume = 0; });
}
function setMonsterSpeed(val) {
    const mult = (val/6).toFixed(1);
    AVATAR_SPEED = 0.055 * (val/6);
    document.getElementById('monster-speed-val').innerText = '×'+mult;
}

const bullets = [];
let shootCooldown = 0;
const muzzleFlash = document.getElementById('muzzle-flash');
let muzzleTimer = 0;
const fireAudio = new Audio('fire.mp3');
fireAudio.volume = 0.6;

function shoot() {
    if (!gameStarted || !playerAlive) return;
    const s = fireAudio.cloneNode();
    s.volume = 0.6;
    s.play().catch(() => {});
    const bulletGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffee00 });
    const bullet = new THREE.Mesh(bulletGeo, bulletMat);
    bullet.position.copy(camera.position);
    const forward = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
    bullet.position.addScaledVector(forward, 1.0);
    bullet.userData.vel  = forward.clone().multiplyScalar(BULLET_SPEED);
    bullet.userData.life = 80;
    scene.add(bullet);
    bullets.push(bullet);
    muzzleFlash.classList.add('show');
    muzzleTimer = 3;
}

document.addEventListener('mousedown', e => {
    if (document.pointerLockElement !== document.body) return;
    if (e.button === 0 && shootCooldown <= 0) { shoot(); shootCooldown = 8; }
});

const damageFlash = document.getElementById('damage-flash');
let damageFlashTimer = 0;

function hurtPlayer(dmg, attackerPos) {
    if (!playerAlive || godMode) return;
    playerHP -= dmg;
    updateHPBars();
    damageFlash.classList.add('show');
    damageFlashTimer = 6;
    if (attackerPos) {
        const kbDir = new THREE.Vector3(
            camera.position.x - attackerPos.x, 0,
            camera.position.z - attackerPos.z).normalize();
        knockbackVel.copy(kbDir.multiplyScalar(3.5));
    }
    if (playerHP <= 0) {
        playerHP = 0; updateHPBars();
        playerAlive = false;
        document.getElementById('game-over').style.display = 'flex';
        if (document.pointerLockElement) document.exitPointerLock();
        mobs.forEach(m => m.audio.pause());
    }
}

function updateAvatarSystem() {
    const activeMobIdx = monsterQueue[queueIdx];
    const activeMob    = mobs[activeMobIdx];

    // ── 子彈更新 ──
    for (let i = bullets.length-1; i >= 0; i--) {
        const b = bullets[i];
        b.position.add(b.userData.vel);
        b.userData.life--;
        let remove = b.userData.life <= 0;

        if (!remove && activeMob.alive) {
            const sp = activeMob.sprite;
            const bx = b.position.x - sp.position.x;
            const bz = b.position.z - sp.position.z;
            if (Math.sqrt(bx*bx + bz*bz) < activeMob.def.hitRadius) {
                // 子彈飛行方向 = 擊退方向
                const kbDir = b.userData.vel.clone().setY(0).normalize();
                if (!sp.userData.kbVel) sp.userData.kbVel = new THREE.Vector3();
                sp.userData.kbVel.copy(kbDir.multiplyScalar(4.5));

                activeMob.hp -= BULLET_DAMAGE;
                remove = true;
                if (activeMob.hp <= 0) {
                    activeMob.hp = 0;
                    killCurrentMob();
                } else {
                    updateHPBars();
                    activeMob.mat.color.setHex(0xff4444);
                    setTimeout(() => activeMob.mat.color.setHex(0xffffff), 150);
                }
            }
        }
        // 子彈打中爬行生物
        if (!remove) {
            for (const cr of crawlers) {
                if (!cr.alive) continue;
                const cbx = b.position.x - cr.mesh.position.x;
                const cbz = b.position.z - cr.mesh.position.z;
                const cby = b.position.y - cr.mesh.position.y;
                if (Math.sqrt(cbx*cbx + cbz*cbz) < CRAWLER_HIT_R && Math.abs(cby) < 3) {
                    cr.hp -= BULLET_DAMAGE;
                    remove = true;
                    if (cr.hp <= 0) {
                        cr.alive = false;
                        scene.remove(cr.mesh);
                        showPickupMsg('🕷 爬行者已消滅！');
                    } else {
                        cr.mat.color.setHex(0xff4444);
                        setTimeout(() => { if (cr.alive) cr.mat.color.setHex(0xffffff); }, 150);
                    }
                    break;
                }
            }
        }

        if (remove) { scene.remove(b); bullets.splice(i,1); }
    }

    // ── Cooldown timers ──
    if (shootCooldown > 0) shootCooldown--;
    if (muzzleTimer > 0) { muzzleTimer--; if (muzzleTimer<=0) muzzleFlash.classList.remove('show'); }
    if (damageFlashTimer > 0) { damageFlashTimer--; if (damageFlashTimer<=0) damageFlash.classList.remove('show'); }

    const paused = document.pointerLockElement !== document.body;
    if (!activeMob.alive || !playerAlive || !monsterEnabled || !gameStarted || paused) return;

    const sp        = activeMob.sprite;
    const playerPos = camera.position;
    const dx = playerPos.x - sp.position.x;
    const dz = playerPos.z - sp.position.z;
    const dist = Math.sqrt(dx*dx + dz*dz);

    sp.lookAt(playerPos);

    // ── 怪物立體聲：左右耳方向感 ──
    if (activeMob.panner) {
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        right.y = 0; right.normalize();
        const toMob = new THREE.Vector3(sp.position.x - playerPos.x, 0, sp.position.z - playerPos.z);
        if (toMob.lengthSq() > 0.01) {
            toMob.normalize();
            activeMob.panner.pan.value = Math.max(-1, Math.min(1, right.dot(toMob)));
        }
    }

    // ── A* 尋路（遠時更頻繁重算追上玩家）──
    if (!sp.userData.pathTimer) sp.userData.pathTimer = 0;
    sp.userData.pathTimer--;
    const pathInterval = dist > 50 ? 18 : 40;
    if (sp.userData.pathTimer <= 0) {
        sp.userData.pathTimer = pathInterval;
        sp.userData.nextWP = AStarNav.findPath(sp.position.x, sp.position.z, playerPos.x, playerPos.z);
    }

    // ── 卡住偵測：連續 150 幀位移 < 0.15 → 強制重生到玩家附近 ──
    if (!sp.userData.lastPos)    sp.userData.lastPos    = sp.position.clone();
    if (!sp.userData.stuckFrames) sp.userData.stuckFrames = 0;
    if (sp.position.distanceTo(sp.userData.lastPos) < 0.15) {
        sp.userData.stuckFrames++;
        if (sp.userData.stuckFrames >= 150) {
            const newPos = safeSpawnPosition(playerPos.x, playerPos.z, 22, 38);
            sp.position.copy(newPos);
            sp.userData.stuckFrames = 0;
            sp.userData.nextWP = null;
            sp.userData.pathTimer = 0;
        }
    } else {
        sp.userData.stuckFrames = 0;
    }
    sp.userData.lastPos.copy(sp.position);

    // ── 指數追趕加速（dist > 25 開始，每單位距離乘 1.028，上限 6 倍）──
    const catchupMult = Math.min(6.0, Math.pow(1.028, Math.max(0, dist - 25)));
    const mobSpeed    = AVATAR_SPEED * catchupMult;

    // ── 距離過遠計時：dist > 100 持續 220 幀（≈3.6s）→ 強制瞬移到玩家附近 ──
    if (!sp.userData.farFrames) sp.userData.farFrames = 0;
    if (dist > 100) {
        sp.userData.farFrames++;
        if (sp.userData.farFrames >= 220) {
            const newPos = safeSpawnPosition(playerPos.x, playerPos.z, 18, 30);
            sp.position.copy(newPos);
            sp.userData.farFrames   = 0;
            sp.userData.stuckFrames = 0;
            sp.userData.nextWP      = null;
            sp.userData.pathTimer   = 0;
        }
    } else {
        sp.userData.farFrames = 0;
    }

    // ── 移動（擊退優先，否則沿路徑）──
    const kb = sp.userData.kbVel;
    if (kb && kb.lengthSq() > 0.001) {
        const testX = new THREE.Vector3(sp.position.x + kb.x, sp.position.y, sp.position.z);
        if (!checkMonsterCollision(testX)) sp.position.x += kb.x; else kb.x = 0;
        const testZ = new THREE.Vector3(sp.position.x, sp.position.y, sp.position.z + kb.z);
        if (!checkMonsterCollision(testZ)) sp.position.z += kb.z; else kb.z = 0;
        kb.multiplyScalar(0.7);
    } else {
        const wp = sp.userData.nextWP;
        const target = wp
            ? new THREE.Vector3(wp.x, sp.position.y, wp.z)
            : playerPos;
        if (wp && Math.hypot(sp.position.x - wp.x, sp.position.z - wp.z) < mobSpeed * 3) {
            sp.userData.nextWP = null;
            sp.userData.pathTimer = 0;
        }
        moveMonsterWithWallAvoid(sp, target, mobSpeed);
    }
    sp.position.y = 8;

    // ── 距離感音效 ──
    if (activeMob.audioStarted) {
        const vol = Math.pow(Math.max(0, 1 - dist/CHASE_MAX_DIST), 1.5);
        activeMob.audio.volume = Math.min(1, vol * 0.95);
    }

    // ── 攻擊玩家 ──
    if (activeMob.damageCooldown > 0) {
        activeMob.damageCooldown--;
    } else if (dist < activeMob.def.attackRange) {
        hurtPlayer(activeMob.def.attackDmg, sp.position);
        activeMob.damageCooldown = activeMob.def.attackCooldown;
    }
}

// ==========================================
// 杏仁水補給品系統
// ==========================================
const ALMOND_HEAL       = 30;
const ALMOND_MAX        = 6;
const ALMOND_PICKUP_R   = 2.5;
const almondWaters      = [];

function createAlmondWaterMesh() {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 192;
    const ctx = c.getContext('2d');
    // 罐身
    const grad = ctx.createLinearGradient(20, 0, 108, 0);
    grad.addColorStop(0, '#c8a830');
    grad.addColorStop(0.4, '#ffe88a');
    grad.addColorStop(1, '#b09020');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(24, 30, 80, 120, 8);
    ctx.fill();
    // 上蓋/下底
    ctx.fillStyle = '#8a7010';
    ctx.fillRect(24, 24, 80, 12);
    ctx.fillRect(24, 148, 80, 12);
    // 標籤區
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(28, 60, 72, 70);
    // 中文字
    ctx.fillStyle = '#3a2000';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('杏仁水', 64, 95);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#7a5010';
    ctx.fillText('Almond Drink', 64, 115);
    // 發光暈
    ctx.shadowColor = '#ffe066';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(24, 30, 80, 120, 8);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(c);
    const geo = new THREE.PlaneGeometry(1.5, 2.2);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
    return new THREE.Mesh(geo, mat);
}

// 拾取提示元素
const pickupMsgEl = (() => {
    const el = document.createElement('div');
    el.style.cssText = [
        'position:fixed', 'top:38%', 'left:50%',
        'transform:translateX(-50%)',
        'color:#ffe066', 'font-size:22px', 'font-weight:bold',
        'text-shadow:0 0 12px #ffaa00,0 0 24px #ff8800',
        'pointer-events:none', 'z-index:25',
        'opacity:0', 'transition:opacity 0.3s',
        'white-space:nowrap',
    ].join(';');
    document.body.appendChild(el);
    return el;
})();
let pickupMsgTimer = 0;
function showPickupMsg(text) {
    pickupMsgEl.textContent = text;
    pickupMsgEl.style.opacity = '1';
    pickupMsgTimer = 150;
}

function spawnAlmondWater() {
    if (!gameStarted || almondWaters.length >= ALMOND_MAX) return;
    const pos = safeSpawnPosition(camera.position.x, camera.position.z, 15, 55);
    pos.y = 1.1;
    const mesh = createAlmondWaterMesh();
    mesh.position.copy(pos);
    mesh.userData.bobPhase = Math.random() * Math.PI * 2;
    scene.add(mesh);
    almondWaters.push({ mesh, collected: false });
}

const ALMOND_DESPAWN_DIST = 80; // 超過這個距離就移除並讓新的在附近生成

function updateAlmondWaters() {
    const pPos = camera.position;

    // 移除距離玩家太遠的杏仁水（跑太遠找不到時釋放名額）
    for (let i = almondWaters.length - 1; i >= 0; i--) {
        const aw = almondWaters[i];
        const dx = pPos.x - aw.mesh.position.x;
        const dz = pPos.z - aw.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) > ALMOND_DESPAWN_DIST) {
            scene.remove(aw.mesh);
            almondWaters.splice(i, 1);
        }
    }

    // 只在玩家受傷（非滿血）時才補充杏仁水
    const playerInjured = playerHP < PLAYER_MAX_HP;
    if (gameStarted && playerAlive && playerInjured && almondWaters.length < ALMOND_MAX && Math.random() < 0.004) {
        spawnAlmondWater();
    }

    // 拾取提示淡出
    if (pickupMsgTimer > 0) {
        pickupMsgTimer--;
        if (pickupMsgTimer <= 0) pickupMsgEl.style.opacity = '0';
    }

    for (let i = almondWaters.length - 1; i >= 0; i--) {
        const aw = almondWaters[i];
        // 上下浮動 + 面向玩家
        aw.mesh.position.y = 1.1 + Math.sin(frameCount * 0.06 + aw.mesh.userData.bobPhase) * 0.25;
        aw.mesh.lookAt(pPos);
        aw.mesh.rotation.z = Math.sin(frameCount * 0.03 + aw.mesh.userData.bobPhase) * 0.08;

        const dx = pPos.x - aw.mesh.position.x;
        const dz = pPos.z - aw.mesh.position.z;
        if (Math.sqrt(dx*dx + dz*dz) < ALMOND_PICKUP_R && playerAlive) {
            scene.remove(aw.mesh);
            almondWaters.splice(i, 1);
            const healed = Math.min(ALMOND_HEAL, PLAYER_MAX_HP - playerHP);
            playerHP = Math.min(PLAYER_MAX_HP, playerHP + ALMOND_HEAL);
            updateHPBars();
            showPickupMsg(`🥛 杏仁水 +${healed} HP`);
        }
    }
}

// ==========================================
// 天花板 / 地板爬行生物系統
// ==========================================
const CRAWLER_MAX            = 10;
const CRAWLER_ATTACK_RANGE   = 9;
const CRAWLER_ATTACK_DMG     = 6;
const CRAWLER_COOLDOWN_BASE  = 160;  // 幀
const CRAWLER_HIT_R          = 2.2;
const crawlers               = [];

function createCrawlerMesh() {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    // 身體
    const bgrad = ctx.createRadialGradient(64, 64, 4, 64, 64, 38);
    bgrad.addColorStop(0, '#4a3020');
    bgrad.addColorStop(1, '#1a0a04');
    ctx.fillStyle = bgrad;
    ctx.beginPath();
    ctx.ellipse(64, 64, 36, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    // 腳（6條）
    ctx.strokeStyle = '#2a1508';
    ctx.lineWidth = 3;
    const legAngles = [-0.6, 0, 0.6];
    for (const ang of legAngles) {
        // 左腳
        ctx.beginPath();
        ctx.moveTo(34, 64 + ang * 10);
        ctx.quadraticCurveTo(14, 64 + ang * 20, 8, 80 + ang * 12);
        ctx.stroke();
        // 右腳
        ctx.beginPath();
        ctx.moveTo(94, 64 + ang * 10);
        ctx.quadraticCurveTo(114, 64 + ang * 20, 120, 80 + ang * 12);
        ctx.stroke();
    }
    // 眼睛
    ctx.fillStyle = '#ff2200';
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(50, 54, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(78, 54, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff8800';
    ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(50, 54, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(78, 54, 2.5, 0, Math.PI * 2); ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    const geo = new THREE.PlaneGeometry(4.5, 4.5);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    return { mesh: new THREE.Mesh(geo, mat), mat };
}

// 攻擊特效：從爬行者到玩家的短暫光束
function crawlerStrikeEffect(fromPos) {
    const toPos = camera.position;
    const dir = new THREE.Vector3().subVectors(toPos, fromPos).normalize();
    const len = fromPos.distanceTo(toPos);
    const beamGeo = new THREE.PlaneGeometry(0.25, len);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    const mid = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5);
    beam.position.copy(mid);
    beam.lookAt(toPos);
    beam.rotateX(Math.PI / 2);
    scene.add(beam);
    let life = 12;
    const decay = () => {
        life--;
        beamMat.opacity *= 0.75;
        if (life > 0) requestAnimationFrame(decay);
        else scene.remove(beam);
    };
    requestAnimationFrame(decay);
}

function spawnCrawler() {
    if (!gameStarted || crawlers.length >= CRAWLER_MAX) return;
    const onCeiling = Math.random() < 0.5;
    const pos = safeSpawnPosition(camera.position.x, camera.position.z, 20, 60);
    pos.y = onCeiling ? 14.0 : 0.8;

    // HP = 隨機 1~4 槍 × BULLET_DAMAGE
    const shots = Math.floor(Math.random() * 4) + 1;
    const maxHP = shots * BULLET_DAMAGE;

    const { mesh, mat } = createCrawlerMesh();
    mesh.position.copy(pos);

    // 貼在天花板或地面（Flat rotation）
    if (onCeiling) {
        mesh.rotation.x = Math.PI / 2;
    } else {
        mesh.rotation.x = -Math.PI / 2;
    }

    scene.add(mesh);
    crawlers.push({
        mesh, mat,
        hp: maxHP, maxHP,
        onCeiling,
        attackCooldown: Math.floor(Math.random() * CRAWLER_COOLDOWN_BASE),
        alive: true,
    });
}

function updateCrawlers() {
    const crawlerActive = monsterEnabled && document.pointerLockElement === document.body;

    // 隨機補充（怪物關閉時不生成）
    if (crawlerActive && gameStarted && playerAlive && crawlers.length < CRAWLER_MAX && Math.random() < 0.006) {
        spawnCrawler();
    }

    const pPos = camera.position;
    for (let i = crawlers.length - 1; i >= 0; i--) {
        const cr = crawlers[i];
        if (!cr.alive) { crawlers.splice(i, 1); continue; }

        const dx = pPos.x - cr.mesh.position.x;
        const dz = pPos.z - cr.mesh.position.z;
        const distXZ = Math.sqrt(dx * dx + dz * dz);

        // 朝玩家轉（僅水平旋轉）
        cr.mesh.rotation.y = Math.atan2(dx, dz);

        // 攻擊判定（暫停或怪物關閉時不攻擊）
        if (crawlerActive && distXZ < CRAWLER_ATTACK_RANGE && playerAlive) {
            if (cr.attackCooldown > 0) {
                cr.attackCooldown--;
            } else {
                crawlerStrikeEffect(cr.mesh.position.clone());
                hurtPlayer(CRAWLER_ATTACK_DMG, cr.mesh.position);
                cr.attackCooldown = CRAWLER_COOLDOWN_BASE + Math.floor(Math.random() * 60);
                // 閃紅提示攻擊
                cr.mat.color.setHex(0xff2200);
                setTimeout(() => { if (cr.alive) cr.mat.color.setHex(0xffffff); }, 250);
            }
        }

        // 太遠就移除（不在此 chunk 中）
        if (distXZ > 160) {
            scene.remove(cr.mesh);
            crawlers.splice(i, 1);
        }
    }
}

// ==========================================
// 閃燈系統
// ==========================================
let flickerFrames = 0;
function updateFlicker() {
    if (flickerFrames > 0) {
        flickerFrames--;
        const v = Math.random() < 0.25 ? 0 : 0.15 + Math.random() * 0.85;
        ambientLight.intensity = 0.5 * v;
        dirLight.intensity     = 0.4 * v;
    } else {
        ambientLight.intensity = 0.5;
        dirLight.intensity     = 0.4;
        if (Math.random() < 0.0018) {
            flickerFrames = 8 + Math.floor(Math.random() * 28);
        }
    }
}

// ==========================================
// Web Audio：腳步聲、喘氣聲、心跳聲、立體聲
// ==========================================
let audioCtx       = null;
let footstepTimer  = 0;
let footSide       = 1;
let breathTimer    = 200;

function playFootstep(sprinting) {
    if (!audioCtx) return;
    const freq = sprinting ? 180 + Math.random()*60 : 90 + Math.random()*40;
    const dur  = sprinting ? 0.07 : 0.12;
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const pan  = audioCtx.createStereoPanner();
    pan.pan.value = footSide * 0.28; footSide *= -1;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.25, audioCtx.currentTime + dur);
    gain.gain.setValueAtTime(sprinting ? 0.3 : 0.22, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain); gain.connect(pan); pan.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}

function playBreath(panting) {
    if (!audioCtx) return;
    const dur = panting ? 0.28 : 0.45;
    const buf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * dur), audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src    = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    const gain   = audioCtx.createGain();
    src.buffer = buf;
    filter.type = 'bandpass';
    filter.frequency.value = panting ? 700 : 450;
    filter.Q.value = 1.8;
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(panting ? 0.26 : 0.16, audioCtx.currentTime + 0.08);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
    src.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    src.start(); src.stop(audioCtx.currentTime + dur + 0.05);
}

function playHeartbeat() {
    if (!audioCtx) return;
    const thump = (delay, f, d) => {
        const osc = audioCtx.createOscillator();
        const g   = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, audioCtx.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(f * 0.4, audioCtx.currentTime + delay + d);
        g.gain.setValueAtTime(0.55, audioCtx.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + d);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + d);
    };
    thump(0,    65, 0.11);
    thump(0.20, 52, 0.09);
}

function updateBreathing() {
    if (!gameStarted || !audioCtx) return;
    breathTimer--;
    const panting = keys.q && stamina > 5;
    if (breathTimer <= 0) {
        playBreath(panting);
        breathTimer = panting
            ? 80  + Math.floor(Math.random() * 25)
            : 200 + Math.floor(Math.random() * 80);
    }
    // 低血量心跳
    if (playerAlive && playerHP < 35) {
        const interval = Math.max(22, Math.floor(25 + (playerHP / 35) * 38));
        if (frameCount % interval === 0) playHeartbeat();
    }
}


initChart(); setAlg('euler'); animate();

// ==========================================
// 後室背景音樂系統 (無限循環歌單)
// ==========================================
const playlist = ['bgm1.mp3'];
let currentTrack = 0;
const bgm = new Audio();
bgm.volume = 0.4;
let isMusicStarted = false;

bgm.addEventListener('ended', () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    bgm.src = playlist[currentTrack];
    bgm.play();
});

document.getElementById('blocker').addEventListener('click', () => {
    document.body.requestPointerLock();

    if (!isMusicStarted) {
        bgm.src = playlist[currentTrack];
        bgm.play().catch(e => console.log("音樂播放失敗:", e));
        isMusicStarted = true;
    }

    if (!gameStarted) {
        // Web Audio API 初始化（立體聲 panner）
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            mobs.forEach(m => {
                try {
                    const src = audioCtx.createMediaElementSource(m.audio);
                    m.panner  = audioCtx.createStereoPanner();
                    src.connect(m.panner);
                    m.panner.connect(audioCtx.destination);
                } catch(e) { console.warn('panner setup failed:', e); }
            });
        }
        mobs.forEach(m => {
            m.audio.play().catch(e => console.log(`${m.def.id} audio fail:`, e));
            m.audioStarted = true;
        });
        gameStarted = true;
        activateMob(queueIdx);
    }
});
