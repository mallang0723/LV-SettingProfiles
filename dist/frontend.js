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
var SAMPLER_LABELS = {
  enabled: "샘플러 값 사용",
  maxTokens: "최대 토큰 (maxTokens)",
  contextSize: "컨텍스트 크기",
  temperature: "온도 (temperature)",
  topP: "Top P",
  minP: "Min P",
  topK: "Top K",
  frequencyPenalty: "Frequency 페널티",
  presencePenalty: "Presence 페널티",
  repetitionPenalty: "Repetition 페널티",
  streaming: "스트리밍"
};

// src/frontend.ts
var CSS = `
.sp-panel { display: flex; flex-direction: column; gap: 12px; padding: 10px; color: var(--lumiverse-text, inherit); box-sizing: border-box; max-width: 100%; }
.sp-panel * { box-sizing: border-box; }
.sp-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.sp-muted { opacity: 0.8; font-size: 0.85em; }
.sp-h { font-weight: 600; margin: 2px 0; }
.sp-card { border: 1px solid var(--lumiverse-border, rgba(127,127,127,0.3)); border-radius: var(--lumiverse-radius, 8px); padding: 8px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.sp-title { font-weight: 600; overflow-wrap: anywhere; }
.sp-btn { font: inherit; font-size: 0.9em; cursor: pointer; min-height: 34px; padding: 4px 10px; border-radius: var(--lumiverse-radius-sm, 6px); color: inherit;
  background: var(--lumiverse-fill-subtle, rgba(127,127,127,0.12)); border: 1px solid var(--lumiverse-border, rgba(127,127,127,0.3)); }
.sp-btn:hover:not(:disabled) { border-color: var(--lumiverse-primary, currentColor); }
.sp-btn:disabled { opacity: 0.5; cursor: default; }
.sp-btn.sp-primary { background: var(--lumiverse-primary-015, rgba(100,140,255,0.15)); border-color: var(--lumiverse-primary, currentColor); }
.sp-btn.sp-danger { color: var(--lumiverse-danger, #d55); border-color: var(--lumiverse-danger, #d55); }
.sp-panel input[type=text], .sp-panel input[type=number], .sp-panel textarea, .sp-panel select {
  font: inherit; color: inherit; min-width: 0; width: 100%; padding: 5px 7px; border-radius: 4px;
  background: var(--lumiverse-fill-subtle, rgba(127,127,127,0.08)); border: 1px solid var(--lumiverse-border, rgba(127,127,127,0.3)); }
.sp-panel textarea { min-height: 60px; resize: vertical; }
.sp-field { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.sp-check { display: flex; align-items: center; gap: 6px; min-height: 28px; }
.sp-check input { flex: 0 0 auto; width: 18px; height: 18px; }
.sp-line { display: grid; grid-template-columns: 1fr; gap: 3px; padding: 6px 0; border-top: 1px solid var(--lumiverse-border, rgba(127,127,127,0.2)); }
.sp-status { white-space: pre-wrap; font-size: 0.88em; overflow-wrap: anywhere; }
.sp-status.sp-error { color: var(--lumiverse-danger, #d55); }
.sp-status.sp-warning { color: var(--lumiverse-warning, #c80); }
`;
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false)
      continue;
    if (k === "class")
      node.className = String(v);
    else if (k.startsWith("on") && typeof v === "function")
      node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k in node)
      node[k] = v;
    else
      node.setAttribute(k, String(v));
  }
  for (const c of children)
    if (c !== null && c !== undefined && c !== false)
      node.append(c);
  return node;
}
var btn = (label, onClick, cls = "", disabled = false) => el("button", { type: "button", class: `sp-btn ${cls}`.trim(), onClick, disabled }, [label]);
var ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>';
var valueToText = (v) => v === undefined || v === null ? "" : typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean" ? String(v) : JSON.stringify(v);
function parseVariable(type, text) {
  if (type === "number" || type === "slider") {
    const n = Number(text);
    if (text.trim() === "" || !Number.isFinite(n))
      throw new Error("숫자가 아닙니다");
    return n;
  }
  if (type === "switch")
    return text === "1" || text === "true" ? 1 : 0;
  if (type === "select" || type === "text" || type === "textarea")
    return text;
  return JSON.parse(text);
}
function parseSampler(key, text) {
  if (BOOLEAN_SAMPLER_KEYS.includes(key))
    return text === "true";
  if (text.trim() === "")
    return null;
  const n = Number(text);
  if (!Number.isFinite(n))
    throw new Error("숫자가 아닙니다");
  return n;
}
function setup(ctx) {
  let st = null;
  let selected = null;
  let detail = null;
  let form = null;
  let status = "";
  let statusLevel = "info";
  let conns = [];
  let suppressUntil = 0;
  let debounce = null;
  const toBackend = (m) => ctx.sendToBackend(m);
  const removeStyle = ctx.dom.addStyle(CSS);
  const chatId = () => {
    const m = /^\/chat\/([^/?#]+)/.exec(location.pathname);
    return m ? decodeURIComponent(m[1]) : null;
  };
  const connApi = () => ctx.connections;
  const canAuto = () => typeof connApi()?.subscribe === "function" && typeof connApi()?.getActive === "function";
  const canSwitch = () => typeof connApi()?.setActiveAcknowledged === "function" || typeof connApi()?.setActive === "function";
  const activeConn = () => {
    try {
      return connApi()?.getActive?.().activeProfileId ?? null;
    } catch {
      return null;
    }
  };
  async function loadConns() {
    try {
      const r = await Promise.resolve(connApi()?.list?.());
      conns = Array.isArray(r) ? r.map((c) => ({ id: String(c.id), name: String(c.name ?? c.id), model: String(c.model ?? "") })) : [];
    } catch {
      conns = [];
    }
  }
  async function switchConn(id) {
    if (!id)
      return;
    const api = connApi();
    suppressUntil = Date.now() + 2500;
    try {
      if (typeof api?.setActiveAcknowledged === "function")
        await api.setActiveAcknowledged(id);
      else
        api?.setActive?.(id);
    } catch (e) {
      show("error", `연결을 바꾸지 못했습니다: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  let offSub = null;
  let lastConn = activeConn();
  if (canAuto()) {
    offSub = connApi().subscribe((v) => {
      const id = v?.activeProfileId ?? null;
      if (id === lastConn)
        return;
      lastConn = id;
      if (debounce)
        clearTimeout(debounce);
      debounce = setTimeout(() => {
        if (Date.now() < suppressUntil || !st?.settings.autoApply)
          return;
        toBackend({ type: "connection_changed", connectionId: id, chatId: chatId() });
      }, 700);
    });
  }
  async function guardEditor(presetId) {
    try {
      const pe = ctx.ui.presetEditor;
      const s = pe?.getState();
      if (s?.open && s.presetId === presetId)
        await pe.flush();
    } catch (e) {
      show("error", "열려 있는 프리셋 편집기를 저장하지 못해 적용을 취소했습니다. 편집기를 닫고 다시 시도하세요.");
      return false;
    }
    return true;
  }
  function show(level, text) {
    status = text;
    statusLevel = level;
    render();
  }
  const tab = ctx.ui.registerDrawerTab({
    id: "setting-profiles",
    title: "설정 프로필",
    shortName: "프로필",
    description: "모델별 샘플러·프롬프트 변수·연결 프로필",
    keywords: ["profile", "프로필", "샘플러", "프롬프트 변수", "모델별"],
    headerTitle: "설정 프로필",
    iconSvg: ICON
  });
  const panel = el("div", { class: "sp-panel" });
  tab.root.replaceChildren(panel);
  function reload() {
    toBackend({ type: "load", chatId: chatId() });
    loadConns();
  }
  const offActivate = tab.onActivate(reload);
  function pickPreset(id) {
    selected = id;
    detail = null;
    form = null;
    toBackend({ type: "detail", presetId: id });
    render();
  }
  function summary(p) {
    const parts = [];
    const sc = Object.keys(p.sampler).length;
    if (sc)
      parts.push(`샘플러 ${sc}`);
    const vc = Object.values(p.variables).reduce((n, b) => n + Object.keys(b).length, 0);
    if (vc)
      parts.push(`변수 ${vc}`);
    if (p.connectionId)
      parts.push(`연결: ${conns.find((c) => c.id === p.connectionId)?.name ?? "(알 수 없음)"}`);
    if (p.autoConnectionIds.length)
      parts.push(`자동 ${p.autoConnectionIds.length}`);
    return parts.join(" · ") || "비어 있음";
  }
  async function doApply(p) {
    if (!await guardEditor(p.presetId))
      return;
    toBackend({ type: "apply", id: p.id, chatId: chatId(), activeConnectionId: activeConn(), switched: !!p.connectionId && canSwitch() });
  }
  function newForm(profile) {
    if (!detail || !selected)
      return null;
    const sampler = {};
    for (const k of SAMPLER_KEYS) {
      const inProfile = profile ? Object.hasOwn(profile.sampler, k) : false;
      const cur = detail.sampler[k];
      const val = profile ? inProfile ? profile.sampler[k] : cur : cur;
      sampler[k] = { on: profile ? inProfile : Object.hasOwn(detail.sampler, k) && k !== "enabled" && k !== "streaming", text: BOOLEAN_SAMPLER_KEYS.includes(k) ? String(val !== false) : valueToText(val) };
    }
    const known = new Set(detail.variables.map((v) => `${v.blockId}\x00${v.name}`));
    const vars = detail.variables.map((info) => {
      const pv = profile?.variables[info.blockId]?.[info.name];
      const inProfile = pv !== undefined;
      const base = info.hasCurrent ? info.current : info.defaultValue;
      return { info, on: profile ? inProfile : info.hasCurrent, text: valueToText(inProfile ? pv : base) };
    });
    const orphans = {};
    for (const [b, bucket] of Object.entries(profile?.variables ?? {})) {
      for (const [n, v] of Object.entries(bucket))
        if (!known.has(`${b}\x00${n}`))
          (orphans[b] ??= {})[n] = v;
    }
    return {
      id: profile?.id ?? null,
      name: profile?.name ?? "",
      presetId: selected,
      presetName: detail.name,
      sampler,
      vars,
      orphans,
      connectionId: profile?.connectionId ?? "",
      auto: new Set(profile?.autoConnectionIds ?? [])
    };
  }
  function saveForm() {
    const f = form;
    if (!f)
      return;
    if (!f.name.trim()) {
      show("error", "프로필 이름을 입력하세요.");
      return;
    }
    try {
      const sampler = {};
      for (const k of SAMPLER_KEYS) {
        const r = f.sampler[k];
        if (r.on) {
          try {
            sampler[k] = parseSampler(k, r.text);
          } catch (e) {
            throw new Error(`${SAMPLER_LABELS[k]}: ${e.message}`);
          }
        }
      }
      const variables = {};
      for (const [b, bucket] of Object.entries(f.orphans))
        variables[b] = { ...bucket };
      for (const r of f.vars) {
        if (!r.on)
          continue;
        let v;
        try {
          v = parseVariable(r.info.type, r.text);
        } catch (e) {
          throw new Error(`${r.info.label}: ${e.message}`);
        }
        (variables[r.info.blockId] ??= {})[r.info.name] = v;
      }
      const auto = [...f.auto].filter((id) => id === f.connectionId || conns.some((c) => c.id === id));
      toBackend({
        type: "save_profile",
        profile: {
          id: f.id ?? undefined,
          name: f.name.trim(),
          presetId: f.presetId,
          presetName: f.presetName,
          sampler,
          variables,
          connectionId: f.connectionId || null,
          autoConnectionIds: auto
        }
      });
      form = null;
      status = "";
      render();
    } catch (e) {
      show("error", e instanceof Error ? e.message : String(e));
    }
  }
  function renderForm(f) {
    const box = el("div", { class: "sp-card" });
    box.append(el("div", { class: "sp-title" }, [f.id ? "프로필 편집" : "현재 값으로 새 프로필"]));
    box.append(el("div", { class: "sp-field" }, [
      el("label", {}, ["이름"]),
      el("input", { type: "text", value: f.name, maxLength: 80, placeholder: "예: 모델 A", onInput: (e) => {
        f.name = e.target.value;
      } })
    ]));
    box.append(el("div", { class: "sp-muted" }, ['체크한 항목만 적용됩니다. 체크하지 않은 값은 건드리지 않습니다. 숫자 칸을 비우면 "비움"으로 적용됩니다.']));
    box.append(el("div", { class: "sp-h" }, ["샘플러"]));
    for (const k of SAMPLER_KEYS) {
      const r = f.sampler[k];
      const input = BOOLEAN_SAMPLER_KEYS.includes(k) ? el("select", { onChange: (e) => {
        r.text = e.target.value;
      } }, [
        el("option", { value: "true", selected: r.text === "true" }, ["켬"]),
        el("option", { value: "false", selected: r.text !== "true" }, ["끔"])
      ]) : el("input", { type: "text", inputMode: "decimal", value: r.text, placeholder: "비움", onInput: (e) => {
        r.text = e.target.value;
      } });
      box.append(el("div", { class: "sp-line" }, [
        el("label", { class: "sp-check" }, [el("input", { type: "checkbox", checked: r.on, onChange: (e) => {
          r.on = e.target.checked;
        } }), SAMPLER_LABELS[k]]),
        input
      ]));
    }
    box.append(el("div", { class: "sp-h" }, ["프롬프트 변수"]));
    if (!f.vars.length)
      box.append(el("div", { class: "sp-muted" }, ["이 프리셋에는 프롬프트 변수가 없습니다."]));
    const varRows = [];
    if (f.vars.length > 8) {
      box.append(el("div", { class: "sp-field" }, [
        el("input", { type: "text", placeholder: `변수 검색 (${f.vars.length}개)`, onInput: (e) => {
          const q = e.target.value.trim().toLowerCase();
          for (const v of varRows)
            v.node.style.display = !q || v.row.on || v.text.includes(q) ? "" : "none";
        } })
      ]));
    }
    for (const r of f.vars) {
      const t = r.info.type;
      let input;
      if (t === "select") {
        const opts = r.info.options.slice();
        if (!opts.some((o) => o.id === r.text))
          opts.unshift({ id: r.text, label: r.text || "(빈 값)" });
        input = el("select", { onChange: (e) => {
          r.text = e.target.value;
        } }, opts.map((o) => el("option", { value: o.id, selected: o.id === r.text }, [o.label])));
      } else if (t === "switch") {
        input = el("select", { onChange: (e) => {
          r.text = e.target.value;
        } }, [
          el("option", { value: "1", selected: r.text === "1" }, ["켬"]),
          el("option", { value: "0", selected: r.text !== "1" }, ["끔"])
        ]);
      } else if (t === "textarea") {
        input = el("textarea", { value: r.text, onInput: (e) => {
          r.text = e.target.value;
        } });
      } else {
        input = el("input", { type: "text", value: r.text, onInput: (e) => {
          r.text = e.target.value;
        } });
      }
      const line = el("div", { class: "sp-line" }, [
        el("label", { class: "sp-check" }, [el("input", { type: "checkbox", checked: r.on, onChange: (e) => {
          r.on = e.target.checked;
        } }), `${r.info.blockName} / ${r.info.label}`]),
        input,
        t === "multiselect" || t === "range" ? el("div", { class: "sp-muted" }, ['JSON 형식으로 입력 (예: ["a","b"])']) : null,
        r.info.blockEnabled ? null : el("div", { class: "sp-muted" }, ["(이 블록은 지금 꺼져 있음)"])
      ]);
      varRows.push({ node: line, row: r, text: `${r.info.blockName} ${r.info.label} ${r.info.name}`.toLowerCase() });
      box.append(line);
    }
    const orphanCount = Object.values(f.orphans).reduce((n, b) => n + Object.keys(b).length, 0);
    if (orphanCount)
      box.append(el("div", { class: "sp-muted" }, [`프리셋에 없는 변수 ${orphanCount}개는 그대로 보존되며 적용 때 건너뜁니다.`]));
    box.append(el("div", { class: "sp-h" }, ["연결 (선택)"]));
    if (!canSwitch())
      box.append(el("div", { class: "sp-muted" }, ["이 Lumiverse 버전에서는 연결 전환 기능을 쓸 수 없습니다."]));
    const connSel = el("select", { disabled: !canSwitch(), onChange: (e) => {
      f.connectionId = e.target.value;
    } }, [el("option", { value: "", selected: !f.connectionId }, ["바꾸지 않음"]), ...conns.map((c) => el("option", { value: c.id, selected: c.id === f.connectionId }, [c.model ? `${c.name} (${c.model})` : c.name]))]);
    box.append(el("div", { class: "sp-field" }, [el("label", {}, ["적용할 때 이 연결로 전환"]), connSel]));
    box.append(el("div", { class: "sp-muted" }, ["추론(API Reasoning·effort)은 연결에 묶인 설정을 따릅니다. 연결 설정에서 한 번 묶어 두세요."]));
    if (canAuto()) {
      box.append(el("div", { class: "sp-field" }, [el("div", {}, ['이 연결을 고르면 자동 적용 (아래 "옵션"의 자동 적용이 켜져 있을 때)'])]));
      for (const c of conns) {
        box.append(el("label", { class: "sp-check" }, [
          el("input", { type: "checkbox", checked: f.auto.has(c.id), onChange: (e) => {
            if (e.target.checked)
              f.auto.add(c.id);
            else
              f.auto.delete(c.id);
          } }),
          c.name
        ]));
      }
    }
    box.append(el("div", { class: "sp-row" }, [btn("저장", saveForm, "sp-primary"), btn("취소", () => {
      form = null;
      render();
    })]));
    return box;
  }
  function render() {
    const kids = [];
    if (!st) {
      panel.replaceChildren(el("div", { class: "sp-muted" }, ["불러오는 중…"]));
      return;
    }
    const sel = el("select", { onChange: (e) => pickPreset(e.target.value) }, st.presets.map((p) => el("option", { value: p.id, selected: p.id === selected }, [p.id === st.activePresetId ? `${p.name} (현재)` : p.name])));
    kids.push(el("div", { class: "sp-field" }, [el("label", { class: "sp-h" }, ["대상 프리셋"]), sel]));
    kids.push(el("div", { class: "sp-muted" }, ["프리셋의 블록과 정규식은 바꾸지 않고, 샘플러 값과 프롬프트 변수 값만 바꿉니다."]));
    if (status)
      kids.push(el("div", { class: `sp-status sp-${statusLevel}` }, [status]));
    const mine = st.profiles.filter((p) => p.presetId === selected);
    const backup = selected ? st.backups[selected] : undefined;
    kids.push(el("div", { class: "sp-row" }, [
      btn("현재 값으로 저장", () => {
        form = newForm(null);
        render();
      }, "sp-primary", !detail),
      backup ? btn(`되돌리기 (${backup.profileName})`, () => toBackend({ type: "undo", presetId: selected })) : null
    ]));
    if (form)
      kids.push(renderForm(form));
    kids.push(el("div", { class: "sp-h" }, [`프로필 ${mine.length}개`]));
    if (!mine.length)
      kids.push(el("div", { class: "sp-muted" }, ["이 프리셋에 저장된 프로필이 없습니다."]));
    for (const p of mine) {
      kids.push(el("div", { class: "sp-card" }, [
        el("div", { class: "sp-title" }, [p.name]),
        el("div", { class: "sp-muted" }, [summary(p)]),
        el("div", { class: "sp-row" }, [
          btn("적용", () => void doApply(p), "sp-primary"),
          btn("편집", () => {
            form = newForm(p);
            render();
          }, "", !detail),
          btn("삭제", () => {
            if (confirm(`'${p.name}' 프로필을 삭제할까요?`))
              toBackend({ type: "delete", id: p.id });
          }, "sp-danger")
        ])
      ]));
    }
    const others = st.profiles.length - mine.length;
    if (others)
      kids.push(el("div", { class: "sp-muted" }, [`다른 프리셋의 프로필 ${others}개는 위 목록에서 해당 프리셋을 고르면 보입니다.`]));
    kids.push(el("div", { class: "sp-h" }, ["옵션"]));
    kids.push(el("label", { class: "sp-check" }, [
      el("input", { type: "checkbox", checked: st.settings.autoApply && canAuto(), disabled: !canAuto(), onChange: (e) => toBackend({ type: "set_settings", settings: { autoApply: e.target.checked } }) }),
      "연결을 바꾸면 그 연결에 묶인 프로필 자동 적용"
    ]));
    if (!canAuto())
      kids.push(el("div", { class: "sp-muted" }, ["이 Lumiverse 버전은 연결 변경 알림을 주지 않아 자동 적용을 쓸 수 없습니다."]));
    const file = el("input", { type: "file", accept: ".json,application/json", style: "display:none", onChange: (e) => {
      const f = e.target.files?.[0];
      if (!f)
        return;
      if (f.size > 2 * 1024 * 1024) {
        show("error", "파일이 너무 큽니다 (2MB 초과).");
        return;
      }
      f.text().then((text) => toBackend({ type: "import", text }));
    } });
    kids.push(el("div", { class: "sp-row" }, [
      btn("내보내기 (JSON)", () => toBackend({ type: "export" })),
      btn("가져오기", () => file.click()),
      file,
      btn("새로 고침", reload)
    ]));
    panel.replaceChildren(...kids.filter(Boolean));
  }
  const offBackend = ctx.onBackendMessage((raw) => {
    const msg = raw;
    switch (msg?.type) {
      case "state": {
        st = msg;
        const stillThere = selected && st.presets.some((p) => p.id === selected);
        if (!stillThere) {
          const next = (st.activePresetId && st.presets.some((p) => p.id === st.activePresetId) ? st.activePresetId : st.presets[0]?.id) ?? null;
          if (next) {
            pickPreset(next);
            return;
          }
          selected = null;
        }
        render();
        return;
      }
      case "detail":
        if (msg.presetId === selected) {
          detail = msg.detail;
          if (!msg.detail)
            status = "프리셋을 읽지 못했습니다.";
          render();
        }
        return;
      case "result":
        status = msg.text;
        statusLevel = msg.level;
        if (msg.presetId === selected || msg.presetId === undefined) {
          if (selected)
            toBackend({ type: "detail", presetId: selected });
        }
        render();
        switchConn(msg.switchConnection);
        return;
      case "export": {
        const url = URL.createObjectURL(new Blob([msg.text], { type: "application/json" }));
        const a = el("a", { href: url, download: msg.filename });
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        return;
      }
    }
  });
  render();
  reload();
  return () => {
    offBackend();
    offActivate();
    offSub?.();
    if (debounce)
      clearTimeout(debounce);
    tab.destroy();
    removeStyle();
    ctx.dom.cleanup();
  };
}
export {
  parseSampler,
  parseVariable,
  setup,
  valueToText
};
