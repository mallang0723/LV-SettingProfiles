// @bun
// src/shared.ts
var SAMPLER_KEYS = [
  "enabled",
  "maxTokens",
  "contextSize",
  "temperature",
  "topP",
  "minP",
  "topK",
  "frequencyPenalty",
  "presencePenalty",
  "repetitionPenalty",
  "streaming"
];
var BOOLEAN_SAMPLER_KEYS = ["enabled", "streaming"];
var counter = 0;
function newId(prefix) {
  counter = (counter + 1) % 1e6;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
function emptyStore() {
  return { version: 1, profiles: [], backups: {}, settings: { autoApply: false } };
}

// src/core.ts
var BAD_KEYS = new Set(["__proto__", "constructor", "prototype"]);
var isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
var clone = (v) => v === undefined ? v : JSON.parse(JSON.stringify(v));
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function isConflict(e) {
  return !!e && typeof e === "object" && e.code === "PRESET_REVISION_CONFLICT";
}
function cleanSampler(v) {
  const out = {};
  if (!isObj(v))
    return out;
  for (const key of SAMPLER_KEYS) {
    if (!Object.hasOwn(v, key))
      continue;
    const x = v[key];
    if (BOOLEAN_SAMPLER_KEYS.includes(key)) {
      if (typeof x === "boolean")
        out[key] = x;
    } else if (x === null)
      out[key] = null;
    else if (typeof x === "number" && Number.isFinite(x))
      out[key] = x;
  }
  return out;
}
function cleanJson(v, depth = 0) {
  if (depth > 4)
    return;
  if (v === null || typeof v === "string" || typeof v === "boolean")
    return v;
  if (typeof v === "number")
    return Number.isFinite(v) ? v : undefined;
  if (Array.isArray(v)) {
    const out = [];
    for (const x of v.slice(0, 500)) {
      const c = cleanJson(x, depth + 1);
      if (c !== undefined)
        out.push(c);
    }
    return out;
  }
  return;
}
function cleanVariables(v) {
  const out = {};
  if (!isObj(v))
    return out;
  for (const [block, bucket] of Object.entries(v)) {
    if (BAD_KEYS.has(block) || !isObj(bucket))
      continue;
    const b = {};
    for (const [name, val] of Object.entries(bucket)) {
      if (BAD_KEYS.has(name))
        continue;
      const c = cleanJson(val);
      if (c !== undefined)
        b[name] = c;
    }
    if (Object.keys(b).length)
      out[block] = b;
  }
  return out;
}
function normalizeProfile(v, now = Date.now()) {
  if (!isObj(v) || typeof v.name !== "string" || !v.name.trim() || typeof v.presetId !== "string" || !v.presetId)
    return null;
  return {
    id: typeof v.id === "string" && v.id ? v.id : newId("prof"),
    name: v.name.trim().slice(0, 80),
    presetId: v.presetId,
    presetName: typeof v.presetName === "string" ? v.presetName.slice(0, 120) : "",
    sampler: cleanSampler(v.sampler),
    variables: cleanVariables(v.variables),
    connectionId: typeof v.connectionId === "string" && v.connectionId ? v.connectionId : null,
    autoConnectionIds: Array.isArray(v.autoConnectionIds) ? [...new Set(v.autoConnectionIds.filter((x) => typeof x === "string" && !!x))].slice(0, 50) : [],
    createdAt: typeof v.createdAt === "number" ? v.createdAt : now,
    updatedAt: typeof v.updatedAt === "number" ? v.updatedAt : now
  };
}
function normalizeBackup(v) {
  if (!isObj(v) || typeof v.presetId !== "string")
    return null;
  const prevMap = (m) => {
    const out = {};
    if (!isObj(m))
      return out;
    for (const [k, p] of Object.entries(m)) {
      if (BAD_KEYS.has(k) || !isObj(p))
        continue;
      const val = cleanJson(p.value);
      out[k] = p.had === true ? { had: true, value: val === undefined ? null : val } : { had: false };
    }
    return out;
  };
  const variables = {};
  if (isObj(v.variables)) {
    for (const [b, m] of Object.entries(v.variables))
      if (!BAD_KEYS.has(b))
        variables[b] = prevMap(m);
  }
  return {
    presetId: v.presetId,
    profileId: typeof v.profileId === "string" ? v.profileId : "",
    profileName: typeof v.profileName === "string" ? v.profileName : "",
    at: typeof v.at === "number" ? v.at : 0,
    sampler: prevMap(v.sampler),
    variables,
    connectionBefore: typeof v.connectionBefore === "string" ? v.connectionBefore : null,
    connectionSwitchedTo: typeof v.connectionSwitchedTo === "string" ? v.connectionSwitchedTo : null
  };
}
function normalizeStore(v) {
  if (!isObj(v))
    return emptyStore();
  const profiles = (Array.isArray(v.profiles) ? v.profiles : []).map((p) => normalizeProfile(p)).filter((p) => !!p);
  const backups = {};
  if (isObj(v.backups)) {
    for (const [k, b] of Object.entries(v.backups)) {
      const nb = BAD_KEYS.has(k) ? null : normalizeBackup(b);
      if (nb)
        backups[k] = nb;
    }
  }
  const s = isObj(v.settings) ? v.settings : {};
  return { version: 1, profiles, backups, settings: { autoApply: s.autoApply === true } };
}
function describePreset(p) {
  const so = isObj(p.parameters?.samplerOverrides) ? p.parameters.samplerOverrides : {};
  const stored = isObj(p.metadata?.promptVariables) ? p.metadata.promptVariables : {};
  const variables = [];
  for (const b of Array.isArray(p.prompt_order) ? p.prompt_order : []) {
    if (!isObj(b) || typeof b.id !== "string" || !Array.isArray(b.variables))
      continue;
    const bucket = isObj(stored[b.id]) ? stored[b.id] : {};
    for (const d of b.variables) {
      if (!isObj(d) || typeof d.name !== "string")
        continue;
      const has = Object.hasOwn(bucket, d.name);
      variables.push({
        blockId: b.id,
        blockName: typeof b.name === "string" ? b.name : b.id,
        blockEnabled: b.enabled !== false,
        name: d.name,
        label: typeof d.label === "string" ? d.label : d.name,
        type: typeof d.type === "string" ? d.type : "text",
        options: Array.isArray(d.options) ? d.options.filter(isObj).map((o) => ({ id: String(o.id), label: String(o.label ?? o.id) })) : [],
        defaultValue: cleanJson(d.defaultValue) ?? null,
        current: has ? cleanJson(bucket[d.name]) : undefined,
        hasCurrent: has
      });
    }
  }
  return {
    id: p.id,
    name: p.name,
    cacheRevision: p.cache_revision ?? 0,
    sampler: cleanSampler(so),
    variables
  };
}
function definedVariables(p) {
  const m = new Map;
  for (const b of Array.isArray(p.prompt_order) ? p.prompt_order : []) {
    if (!isObj(b) || typeof b.id !== "string" || !Array.isArray(b.variables))
      continue;
    m.set(b.id, new Set(b.variables.filter(isObj).map((d) => String(d.name))));
  }
  return m;
}
function planApply(p, profile) {
  const plan = { skipped: [], sampler: {}, variables: {} };
  if (Object.keys(profile.sampler).length) {
    const params = clone(p.parameters ?? {});
    const so = isObj(params.samplerOverrides) ? params.samplerOverrides : {};
    let changed = false;
    for (const [k, nv] of Object.entries(profile.sampler)) {
      const had = Object.hasOwn(so, k);
      if (had && deepEqual(so[k], nv))
        continue;
      plan.sampler[k] = had ? { had, value: cleanJson(so[k]) ?? null } : { had };
      so[k] = nv;
      changed = true;
    }
    if (changed) {
      params.samplerOverrides = so;
      plan.parameters = params;
    }
  }
  if (Object.keys(profile.variables).length) {
    const defs = definedVariables(p);
    const meta = clone(p.metadata ?? {});
    const pv = isObj(meta.promptVariables) ? meta.promptVariables : {};
    let changed = false;
    for (const [bid, bucket] of Object.entries(profile.variables)) {
      for (const [name, nv] of Object.entries(bucket)) {
        if (!defs.get(bid)?.has(name)) {
          plan.skipped.push(`${bid}/${name}`);
          continue;
        }
        const cur = isObj(pv[bid]) ? pv[bid] : {};
        const had = Object.hasOwn(cur, name);
        if (had && deepEqual(cur[name], nv))
          continue;
        (plan.variables[bid] ??= {})[name] = had ? { had, value: cleanJson(cur[name]) ?? null } : { had };
        cur[name] = nv;
        pv[bid] = cur;
        changed = true;
      }
    }
    if (changed) {
      meta.promptVariables = pv;
      plan.metadata = meta;
    }
  }
  return plan;
}
function planUndo(p, backup) {
  const plan = { skipped: [], sampler: {}, variables: {} };
  if (Object.keys(backup.sampler).length) {
    const params = clone(p.parameters ?? {});
    const so = isObj(params.samplerOverrides) ? params.samplerOverrides : {};
    for (const [k, prev] of Object.entries(backup.sampler)) {
      if (prev.had)
        so[k] = prev.value ?? null;
      else
        delete so[k];
    }
    params.samplerOverrides = so;
    if (!deepEqual(params, p.parameters ?? {}))
      plan.parameters = params;
  }
  if (Object.keys(backup.variables).length) {
    const meta = clone(p.metadata ?? {});
    const pv = isObj(meta.promptVariables) ? meta.promptVariables : {};
    const defs = definedVariables(p);
    for (const [bid, bucket] of Object.entries(backup.variables)) {
      const cur = isObj(pv[bid]) ? pv[bid] : {};
      for (const [name, prev] of Object.entries(bucket)) {
        if (prev.had) {
          if (defs.get(bid)?.has(name))
            cur[name] = prev.value ?? null;
          else
            plan.skipped.push(`${bid}/${name}`);
        } else
          delete cur[name];
      }
      if (Object.keys(cur).length)
        pv[bid] = cur;
      else
        delete pv[bid];
    }
    meta.promptVariables = pv;
    if (!deepEqual(meta, p.metadata ?? {}))
      plan.metadata = meta;
  }
  return plan;
}
function samplerDisabledWarning(preset, profile) {
  if (!Object.keys(profile.sampler).some((k) => k !== "enabled"))
    return null;
  const so = preset.parameters?.samplerOverrides;
  if (isObj(so) && so.enabled === true)
    return null;
  return '\uC774 \uD504\uB9AC\uC14B\uC740 \uC0D8\uD50C\uB7EC \uC0AC\uC6A9\uC774 \uAEBC\uC838 \uC788\uC5B4, \uC801\uC6A9\uD55C \uC0D8\uD50C\uB7EC \uAC12\uC774 \uC0DD\uC131\uC5D0 \uBC18\uC601\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uD504\uB9AC\uC14B \uD3B8\uC9D1\uAE30\uC5D0\uC11C \uC0D8\uD50C\uB7EC\uB97C \uCF1C\uAC70\uB098, \uD504\uB85C\uD544\uC5D0 "\uC0D8\uD50C\uB7EC \uAC12 \uC0AC\uC6A9 = \uCF2C"\uC744 \uB123\uC73C\uC138\uC694.';
}
function editorBlocks(editorPresetId, presetId) {
  return !!editorPresetId && editorPresetId === presetId;
}
function writeRoute(info, presetId, haveSession) {
  if (!editorBlocks(info.editorPresetId, presetId))
    return "direct";
  return info.editorDraft && haveSession ? "editor" : "refuse";
}
function resolveActive(hint, api, last) {
  let id = hint;
  if (id === undefined && api)
    id = api.preset_id ?? null;
  if (id === undefined)
    id = last;
  return { id: id ?? null, source: api?.source ?? null, known: id !== undefined };
}
async function commit(host, presetId, planner, onPlan) {
  for (let attempt = 0;attempt < 2; attempt++) {
    const preset = await host.get(presetId);
    if (!preset)
      return { status: "missing" };
    const plan = planner(preset);
    if (!plan.parameters && !plan.metadata) {
      onPlan?.(plan, null);
      return { status: "noop", skipped: plan.skipped, preset };
    }
    const payload = { expected_cache_revision: preset.cache_revision ?? 0 };
    if (plan.parameters)
      payload.parameters = plan.parameters;
    if (plan.metadata)
      payload.metadata = plan.metadata;
    try {
      const written = await host.update(presetId, payload);
      onPlan?.(plan, written);
      return { status: "applied", preset: written, skipped: plan.skipped };
    } catch (e) {
      if (isConflict(e) && attempt === 0)
        continue;
      if (isConflict(e))
        return { status: "conflict" };
      throw e;
    }
  }
  return { status: "conflict" };
}
async function applyProfile(host, store, profile, conn) {
  let plan = null;
  const result = await commit(host, profile.presetId, (p) => planApply(p, profile), (pl) => {
    plan = pl;
  });
  if (result.status === "applied" && plan) {
    const pl = plan;
    store.backups[profile.presetId] = {
      presetId: profile.presetId,
      profileId: profile.id,
      profileName: profile.name,
      at: Date.now(),
      sampler: pl.sampler,
      variables: pl.variables,
      connectionBefore: conn.before,
      connectionSwitchedTo: conn.switchedTo
    };
  }
  return result;
}
async function undoBackup(host, store, presetId) {
  const backup = store.backups[presetId];
  if (!backup)
    return { status: "missing" };
  const result = await commit(host, presetId, (p) => planUndo(p, backup));
  if (result.status === "applied" || result.status === "noop")
    delete store.backups[presetId];
  return result;
}
async function applyProfileViaEditor(host, store, profile, conn, editor) {
  const ed = await editor({ set: profile.sampler, remove: [] });
  let plan = null;
  const result = await commit(host, profile.presetId, (p) => planApply(p, { sampler: {}, variables: profile.variables }), (pl) => {
    plan = pl;
  });
  const varPlan = plan;
  if (ed.changed || result.status === "applied") {
    store.backups[profile.presetId] = {
      presetId: profile.presetId,
      profileId: profile.id,
      profileName: profile.name,
      at: Date.now(),
      sampler: ed.prev,
      variables: varPlan?.variables ?? {},
      connectionBefore: conn.before,
      connectionSwitchedTo: conn.switchedTo
    };
  }
  if (result.status === "noop" && ed.changed)
    return { status: "applied", preset: result.preset, skipped: result.skipped };
  return result;
}
async function undoBackupViaEditor(host, store, presetId, editor) {
  const backup = store.backups[presetId];
  if (!backup)
    return { status: "missing" };
  const patch = { set: {}, remove: [] };
  for (const [k, prev] of Object.entries(backup.sampler)) {
    if (prev.had)
      patch.set[k] = prev.value ?? null;
    else
      patch.remove.push(k);
  }
  const ed = await editor(patch);
  const result = await commit(host, presetId, (p) => planUndo(p, { ...backup, sampler: {} }));
  if (result.status === "applied" || result.status === "noop")
    delete store.backups[presetId];
  if (result.status === "noop" && ed.changed)
    return { status: "applied", preset: result.preset, skipped: result.skipped };
  return result;
}
var EXPORT_FORMAT = "setting-profiles";
function exportProfiles(store, ids) {
  const profiles = store.profiles.filter((p) => !ids || ids.includes(p.id));
  return JSON.stringify({ format: EXPORT_FORMAT, version: 1, profiles }, null, 2);
}
function importProfiles(store, text, now = Date.now()) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return { added: 0, errors: ["JSON\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."] };
  }
  if (!isObj(raw) || raw.format !== EXPORT_FORMAT || !Array.isArray(raw.profiles)) {
    return { added: 0, errors: ["\uC774 \uD655\uC7A5\uC5D0\uC11C \uB0B4\uBCF4\uB0B8 \uD30C\uC77C\uC774 \uC544\uB2D9\uB2C8\uB2E4."] };
  }
  let added = 0;
  const errors = [];
  for (const item of raw.profiles.slice(0, 200)) {
    const p = normalizeProfile({ ...isObj(item) ? item : {}, id: undefined, createdAt: now, updatedAt: now }, now);
    if (!p) {
      errors.push("\uC774\uB984\uC774\uB098 \uB300\uC0C1 \uD504\uB9AC\uC14B\uC774 \uC5C6\uB294 \uD56D\uBAA9\uC744 \uAC74\uB108\uB6F0\uC5C8\uC2B5\uB2C8\uB2E4.");
      continue;
    }
    p.name = uniqueName(store, p.presetId, p.name);
    store.profiles.push(p);
    added++;
  }
  return { added, errors };
}
function uniqueName(store, presetId, name, exceptId) {
  const taken = new Set(store.profiles.filter((p) => p.presetId === presetId && p.id !== exceptId).map((p) => p.name));
  if (!taken.has(name))
    return name;
  for (let i = 2;i < 1000; i++)
    if (!taken.has(`${name} (${i})`))
      return `${name} (${i})`;
  return `${name} (${newId("d")})`;
}

// src/backend.ts
var STORE_PATH = "profiles.json";
var SOURCE_LABEL = {
  chat: "\uCC44\uD305",
  persona: "\uD398\uB974\uC18C\uB098",
  character: "\uCE90\uB9AD\uD130",
  connection: "\uC5F0\uACB0",
  defaults: "\uAE30\uBCF8\uAC12"
};
function send(payload, userId, sessionId) {
  spindle.sendToFrontend(payload, userId, sessionId ? { frontendSessionId: sessionId } : undefined);
}
var queues = new Map;
function serial(userId, fn) {
  const prev = queues.get(userId) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  queues.set(userId, next.catch(() => {
    return;
  }));
  return next;
}
async function loadStore(userId) {
  return normalizeStore(await spindle.userStorage.getJson(STORE_PATH, { fallback: null, userId }));
}
async function saveStore(userId, store) {
  await spindle.userStorage.setJson(STORE_PATH, store, { indent: 2, userId });
}
function hostFor(userId) {
  return {
    async get(id) {
      return await spindle.presets.get(id, userId);
    },
    async update(id, input) {
      return await spindle.presets.update(id, input, userId);
    }
  };
}
var presetCache = new Map;
async function listPresets(userId, refresh) {
  const cached = presetCache.get(userId);
  if (cached && !refresh)
    return cached;
  const r = await spindle.presets.list({ limit: 200, userId });
  const out = r.data.map((p) => ({ id: p.id, name: p.name }));
  presetCache.set(userId, out);
  return out;
}
var lastHint = new Map;
async function active(userId, chatId, hint) {
  if (hint !== undefined)
    lastHint.set(userId, hint);
  let api = null;
  const getActive = spindle.presets.getActive;
  if (typeof getActive === "function") {
    try {
      api = await getActive.call(spindle.presets, chatId ?? undefined, userId);
    } catch {}
  }
  return resolveActive(hint, api, lastHint.get(userId));
}
var lastChat = new Map;
var editorWaits = new Map;
function askEditor(userId, sessionId, presetId) {
  return (patch) => new Promise((resolve, reject) => {
    if (!sessionId) {
      reject(new Error("\uD3B8\uC9D1\uAE30\uB97C \uAC00\uC9C4 \uD654\uBA74\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."));
      return;
    }
    const reqId = newId("ed");
    const timer = setTimeout(() => {
      editorWaits.delete(reqId);
      reject(new Error("\uD3B8\uC9D1\uAE30\uAC00 \uC2DC\uAC04 \uC548\uC5D0 \uC751\uB2F5\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."));
    }, 15000);
    editorWaits.set(reqId, { resolve, reject, timer });
    send({ type: "editor_patch", reqId, presetId, set: patch.set, remove: patch.remove }, userId, sessionId);
  });
}
var EDITOR_VAR_NOTE = "\uD3B8\uC9D1\uAE30\uAC00 \uC774 \uD504\uB9AC\uC14B\uC744 \uC5F4\uC5B4 \uB450\uACE0 \uC788\uC5B4, \uD504\uB86C\uD504\uD2B8 \uBCC0\uC218 \uAC12\uC740 \uD3B8\uC9D1\uAE30\uB97C \uB2E4\uC2DC \uC5F4 \uB54C\uAE4C\uC9C0 \uD654\uBA74\uC5D0 \uC61B \uAC12\uC73C\uB85C \uBCF4\uC77C \uC218 \uC788\uC2B5\uB2C8\uB2E4(\uC800\uC7A5\uB41C \uAC12\uC740 \uBC14\uB00C\uC5C8\uACE0 \uD3B8\uC9D1\uAE30\uC5D0\uC11C \uB2E4\uB978 \uAC12\uC744 \uACE0\uCCD0\uB3C4 \uB418\uB3CC\uB824\uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4).";
async function stateMsg(userId, chatIdIn, store, refreshList = false, hint) {
  if (chatIdIn)
    lastChat.set(userId, chatIdIn);
  const chatId = chatIdIn ?? lastChat.get(userId) ?? null;
  const s = store ?? await loadStore(userId);
  const [presets, act] = await Promise.all([listPresets(userId, refreshList).catch(() => presetCache.get(userId) ?? []), active(userId, chatId, hint)]);
  return {
    type: "state",
    profiles: s.profiles,
    backups: s.backups,
    settings: s.settings,
    presets,
    activePresetId: act.id,
    activeSource: act.source,
    activeAvailable: act.known
  };
}
function describeResult(r, what) {
  switch (r.status) {
    case "applied": {
      const skip = r.skipped.length ? ` (\uD504\uB9AC\uC14B\uC5D0 \uC5C6\uB294 \uBCC0\uC218 ${r.skipped.length}\uAC1C\uB294 \uAC74\uB108\uB700)` : "";
      return { level: r.skipped.length ? "warning" : "info", text: `${what}\uD588\uC2B5\uB2C8\uB2E4.${skip}` };
    }
    case "noop":
      return { level: "info", text: `${what}: \uC774\uBBF8 \uAC19\uC740 \uAC12\uC774\uB77C \uBC14\uAFC0 \uAC83\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.` };
    case "missing":
      return { level: "error", text: "\uB300\uC0C1 \uD504\uB9AC\uC14B\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC0AD\uC81C\uB418\uC5C8\uAC70\uB098 \uB2E4\uB978 \uACC4\uC815\uC758 \uD504\uB9AC\uC14B\uC77C \uC218 \uC788\uC2B5\uB2C8\uB2E4." };
    case "conflict":
      return { level: "error", text: "\uB2E4\uB978 \uACF3\uC5D0\uC11C \uD504\uB9AC\uC14B\uC774 \uBC14\uB00C\uC5B4 \uC801\uC6A9\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694." };
  }
}
async function doApply(userId, sessionId, store, profile, chatId, activeConnectionId, switched, auto, ed = {}, activeHint) {
  const route = writeRoute(ed, profile.presetId, !!sessionId);
  const editorOpen = route === "editor";
  if (route === "refuse") {
    const text = auto ? `'${profile.name}' \uC790\uB3D9 \uC801\uC6A9\uC744 \uAC74\uB108\uB6F0\uC5C8\uC2B5\uB2C8\uB2E4: \uC774 Lumiverse\uC758 \uD504\uB9AC\uC14B \uD3B8\uC9D1\uAE30\uB294 \uD655\uC7A5\uC774 \uAC12\uC744 \uB123\uC744 \uC218 \uC5C6\uC5B4, \uC5F4\uC5B4 \uB454 \uD504\uB9AC\uC14B\uC5D0\uB294 \uC801\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. Loom \uD0ED\uC5D0\uC11C \uB2E4\uB978 \uD504\uB9AC\uC14B\uC744 \uACE0\uB974\uAC70\uB098 \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C \uACE0\uCE5C \uB4A4 \uC9C1\uC811 \uC801\uC6A9\uD558\uC138\uC694.` : `'${profile.name}' \uC801\uC6A9\uC744 \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4: \uD504\uB9AC\uC14B \uD3B8\uC9D1\uAE30\uAC00 \uC774 \uD504\uB9AC\uC14B\uC744 \uC5F4\uC5B4 \uB450\uACE0 \uC788\uB294\uB370 \uC774 Lumiverse\uB294 \uD3B8\uC9D1\uAE30\uB97C \uD1B5\uD55C \uC801\uC6A9\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC544, \uC801\uC6A9\uAC12\uC774 \uD3B8\uC9D1\uAE30\uC758 \uC61B \uAC12\uC5D0 \uB36E\uC77C \uC218 \uC788\uC2B5\uB2C8\uB2E4. Loom \uD0ED\uC5D0\uC11C \uB2E4\uB978 \uD504\uB9AC\uC14B\uC744 \uACE0\uB974\uAC70\uB098 \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C \uACE0\uCE5C \uB4A4 \uB2E4\uC2DC \uC801\uC6A9\uD558\uC138\uC694.`;
    if (auto)
      spindle.toast.warning(text, { userId });
    send({ type: "result", level: "warning", text, presetId: profile.presetId }, userId, auto ? undefined : sessionId);
    return;
  }
  const target = switched ? profile.connectionId : null;
  let r;
  try {
    r = editorOpen ? await applyProfileViaEditor(hostFor(userId), store, profile, { before: activeConnectionId, switchedTo: target }, askEditor(userId, sessionId, profile.presetId)) : await applyProfile(hostFor(userId), store, profile, { before: activeConnectionId, switchedTo: target });
  } catch (e) {
    const text = `'${profile.name}' ${auto ? "\uC790\uB3D9 " : ""}\uC801\uC6A9\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4: ${e instanceof Error ? e.message : String(e)}`;
    if (auto)
      spindle.toast.error(text.slice(0, 500), { userId });
    send({ type: "result", level: "error", text, presetId: profile.presetId }, userId, auto ? undefined : sessionId);
    return;
  }
  await saveStore(userId, store);
  const d = describeResult(r, auto ? `'${profile.name}' \uC790\uB3D9 \uC801\uC6A9` : `'${profile.name}' \uC801\uC6A9`);
  let text = d.text;
  let level = d.level;
  if (r.status === "applied" || r.status === "noop") {
    const w = samplerDisabledWarning(r.preset, profile);
    if (w) {
      text += `
${w}`;
      level = "warning";
    }
  }
  if (editorOpen && r.status === "applied" && Object.keys(profile.variables).length)
    text += `
${EDITOR_VAR_NOTE}`;
  if ((r.status === "applied" || r.status === "noop") && Object.keys(profile.variables).length) {
    const act = await active(userId, chatId, activeHint);
    if (act.source && act.source !== "none") {
      text += `
\uC774 \uCC44\uD305\uC5D0\uB294 \uD504\uB9AC\uC14B \uD504\uB85C\uD544 \uBC14\uC778\uB529(${SOURCE_LABEL[act.source] ?? act.source})\uC774 \uC788\uC5B4, \uD504\uB86C\uD504\uD2B8 \uBCC0\uC218 \uAC12\uC774 \uADF8 \uBC14\uC778\uB529 \uAC12\uC5D0 \uAC00\uB824\uC9C8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`;
      level = "warning";
    }
  }
  if (auto && (r.status !== "noop" || level === "warning"))
    spindle.toast[level](text.slice(0, 500), { userId });
  send({ type: "result", level, text, presetId: profile.presetId, switchConnection: r.status === "applied" || r.status === "noop" ? target : undefined }, userId, auto ? undefined : sessionId);
  send(await stateMsg(userId, chatId, store, false, activeHint), userId, sessionId);
}
async function handle(msg, userId, sessionId) {
  switch (msg.type) {
    case "load":
      send(await stateMsg(userId, msg.chatId, undefined, true, msg.activePresetId), userId, sessionId);
      return;
    case "detail": {
      const p = await hostFor(userId).get(msg.presetId);
      send({ type: "detail", presetId: msg.presetId, detail: p ? describePreset(p) : null }, userId, sessionId);
      return;
    }
    case "save_profile": {
      await serial(userId, async () => {
        const store = await loadStore(userId);
        const incoming = normalizeProfile({ ...msg.profile, presetName: msg.profile.presetName ?? "" });
        if (!incoming) {
          send({ type: "result", level: "error", text: "\uC774\uB984\uACFC \uB300\uC0C1 \uD504\uB9AC\uC14B\uC774 \uD544\uC694\uD569\uB2C8\uB2E4." }, userId, sessionId);
          return;
        }
        const existing = msg.profile.id ? store.profiles.find((p) => p.id === msg.profile.id) : undefined;
        incoming.name = uniqueName(store, incoming.presetId, incoming.name, existing?.id);
        if (existing) {
          incoming.id = existing.id;
          incoming.createdAt = existing.createdAt;
          incoming.updatedAt = Date.now();
          store.profiles[store.profiles.indexOf(existing)] = incoming;
        } else {
          incoming.id = newId("prof");
          store.profiles.push(incoming);
        }
        await saveStore(userId, store);
        send({ type: "result", level: "info", text: `'${incoming.name}' \uD504\uB85C\uD544\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.` }, userId, sessionId);
        send(await stateMsg(userId, null, store), userId, sessionId);
      });
      return;
    }
    case "delete":
      await serial(userId, async () => {
        const store = await loadStore(userId);
        store.profiles = store.profiles.filter((p) => p.id !== msg.id);
        await saveStore(userId, store);
        send(await stateMsg(userId, null, store), userId, sessionId);
      });
      return;
    case "apply":
      await serial(userId, async () => {
        const store = await loadStore(userId);
        const profile = store.profiles.find((p) => p.id === msg.id);
        if (!profile) {
          send({ type: "result", level: "error", text: "\uD504\uB85C\uD544\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." }, userId, sessionId);
          return;
        }
        await doApply(userId, sessionId, store, profile, msg.chatId, msg.activeConnectionId, msg.switched, false, msg);
      });
      return;
    case "connection_changed":
      await serial(userId, async () => {
        const store = await loadStore(userId);
        if (!store.settings.autoApply || !msg.connectionId)
          return;
        const act = await active(userId, msg.chatId, msg.activePresetId);
        if (!act.known) {
          if (store.profiles.some((p) => p.autoConnectionIds.includes(msg.connectionId))) {
            spindle.toast.warning('\uC124\uC815 \uD504\uB85C\uD544 \uC790\uB3D9 \uC801\uC6A9\uC744 \uAC74\uB108\uB6F0\uC5C8\uC2B5\uB2C8\uB2E4: \uC774 Lumiverse\uC5D0\uC11C\uB294 \uD604\uC7AC \uD504\uB9AC\uC14B\uC744 \uC54C \uC218 \uC5C6\uC5B4 \uC790\uB3D9 \uC801\uC6A9\uC744 \uC4F8 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uD504\uB85C\uD544\uC758 "\uC801\uC6A9" \uBC84\uD2BC\uC744 \uC4F0\uC138\uC694.', { userId });
          }
          return;
        }
        if (!act.id)
          return;
        const profile = store.profiles.find((p) => p.presetId === act.id && p.autoConnectionIds.includes(msg.connectionId));
        if (!profile)
          return;
        await doApply(userId, sessionId, store, profile, msg.chatId, msg.connectionId, false, true, msg, msg.activePresetId);
      });
      return;
    case "undo":
      await serial(userId, async () => {
        const store = await loadStore(userId);
        const backup = store.backups[msg.presetId];
        const route = writeRoute(msg, msg.presetId, !!sessionId);
        const editorOpen = route === "editor";
        if (route === "refuse") {
          send({ type: "result", level: "warning", text: "\uB418\uB3CC\uB9AC\uAE30\uB97C \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4: \uD504\uB9AC\uC14B \uD3B8\uC9D1\uAE30\uAC00 \uC774 \uD504\uB9AC\uC14B\uC744 \uC5F4\uC5B4 \uB450\uACE0 \uC788\uB294\uB370 \uC774 Lumiverse\uB294 \uD3B8\uC9D1\uAE30\uB97C \uD1B5\uD55C \uC801\uC6A9\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. Loom \uD0ED\uC5D0\uC11C \uB2E4\uB978 \uD504\uB9AC\uC14B\uC744 \uACE0\uB974\uAC70\uB098 \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C \uACE0\uCE5C \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.", presetId: msg.presetId }, userId, sessionId);
          return;
        }
        let r;
        try {
          r = editorOpen ? await undoBackupViaEditor(hostFor(userId), store, msg.presetId, askEditor(userId, sessionId, msg.presetId)) : await undoBackup(hostFor(userId), store, msg.presetId);
        } catch (e) {
          send({ type: "result", level: "error", text: `\uB418\uB3CC\uB9AC\uAE30\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4: ${e instanceof Error ? e.message : String(e)}`, presetId: msg.presetId }, userId, sessionId);
          return;
        }
        await saveStore(userId, store);
        const d = describeResult(r, "\uB418\uB3CC\uB9BC");
        const text = r.status === "applied" ? `\uC9C1\uC804 \uAC12\uC73C\uB85C \uB418\uB3CC\uB838\uC2B5\uB2C8\uB2E4.${editorOpen && backup && Object.keys(backup.variables).length ? `
${EDITOR_VAR_NOTE}` : ""}` : r.status === "missing" && !backup ? "\uB418\uB3CC\uB9B4 \uBC31\uC5C5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." : d.text;
        const ok = r.status === "applied" || r.status === "noop";
        send({ type: "result", level: d.level, text, presetId: msg.presetId, switchConnection: ok && backup?.connectionSwitchedTo ? backup.connectionBefore : undefined }, userId, sessionId);
        send(await stateMsg(userId, null, store), userId, sessionId);
      });
      return;
    case "editor_reply": {
      const w = editorWaits.get(msg.reqId);
      if (!w)
        return;
      editorWaits.delete(msg.reqId);
      clearTimeout(w.timer);
      if (msg.ok)
        w.resolve({ changed: msg.changed === true, prev: msg.prev ?? {} });
      else
        w.reject(new Error(msg.error || "\uD3B8\uC9D1\uAE30\uAC00 \uAC12\uC744 \uBC1B\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4."));
      return;
    }
    case "export": {
      const store = await loadStore(userId);
      send({ type: "export", text: exportProfiles(store, msg.ids), filename: "setting-profiles.json" }, userId, sessionId);
      return;
    }
    case "import":
      await serial(userId, async () => {
        const store = await loadStore(userId);
        const r = importProfiles(store, msg.text);
        if (r.added)
          await saveStore(userId, store);
        const text = r.added ? `${r.added}\uAC1C\uB97C \uAC00\uC838\uC654\uC2B5\uB2C8\uB2E4.` : "\uAC00\uC838\uC628 \uD504\uB85C\uD544\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.";
        send({ type: "result", level: r.errors.length ? "warning" : "info", text: [text, ...r.errors].join(`
`) }, userId, sessionId);
        send(await stateMsg(userId, null, store), userId, sessionId);
      });
      return;
    case "set_settings":
      await serial(userId, async () => {
        const store = await loadStore(userId);
        if (typeof msg.settings.autoApply === "boolean")
          store.settings.autoApply = msg.settings.autoApply;
        await saveStore(userId, store);
        send(await stateMsg(userId, null, store), userId, sessionId);
      });
      return;
    case "notify":
      if (msg.kind === "info" || msg.kind === "warning" || msg.kind === "error") {
        spindle.toast[msg.kind](String(msg.text).slice(0, 500), { userId });
      }
      return;
  }
}
spindle.onFrontendMessage((payload, userId, frontendSessionId) => {
  if (!payload || typeof payload !== "object" || typeof payload.type !== "string")
    return;
  handle(payload, userId, frontendSessionId).catch((e) => {
    spindle.log.error(`[setting-profiles] ${payload.type}: ${e instanceof Error ? e.stack ?? e.message : String(e)}`);
    spindle.toast.error(e instanceof Error ? e.message : String(e), { userId });
  });
});
