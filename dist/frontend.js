// src/diagnostics.ts
function operationError(operation, error) {
  const name = error instanceof Error ? error.name : "Error";
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "Non-Error exception";
  const redact = (text) => text.replace(/\{[\s\S]*|\[(?=\s*["{])[\s\S]*/g, "[data redacted]").replace(/\b(?:https?|wss?):\/\/[^\s"'<>]+/gi, "[URL redacted]").replace(/\b(?:Bearer|Basic)\s+[^\s,;"']+/gi, "[credentials redacted]").replace(/\b(?:api[-_ ]?key|access[-_ ]?token|refresh[-_ ]?token|token|secret|password|authorization|cookie)\b\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi, "[credentials redacted]").replace(/\bsk-[a-z0-9_-]+\b/gi, "[key redacted]").replace(/\beyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+\b/gi, "[token redacted]").replace(/(?:\/home\/|\/Users\/)[^\s"']+/g, "[path redacted]").replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "[address redacted]").replace(/[\r\n\t]+/g, " ").slice(0, 500);
  return `[setting-profiles] ${operation}: ${redact(name)}: ${redact(message)}`;
}

// src/i18n.ts
var messages = {
  ko: {
    title: "설정 프로필",
    shortName: "세팅",
    fieldError: "{label}: {error}",
    profileKeyword: "profile",
    profiles: "프로필",
    description: "모델별 샘플러·프롬프트 변수·연결 프로필",
    perModel: "모델별",
    sampler: "샘플러",
    variables: "프롬프트 변수",
    sampler_enabled: "샘플러 값 사용",
    sampler_maxTokens: "최대 토큰 (maxTokens)",
    sampler_contextSize: "컨텍스트 크기",
    sampler_temperature: "온도 (temperature)",
    sampler_topP: "Top P",
    sampler_minP: "Min P",
    sampler_topK: "Top K",
    sampler_frequencyPenalty: "Frequency 페널티",
    sampler_presencePenalty: "Presence 페널티",
    sampler_repetitionPenalty: "Repetition 페널티",
    sampler_streaming: "스트리밍",
    notNumber: "숫자가 아닙니다",
    rangeShape: "[최소, 최대] 숫자 두 개여야 합니다 (예: [1, 5])",
    rangeOrder: "최소가 최대보다 클 수 없습니다",
    multiselectShape: '선택지 id의 배열이어야 합니다 (예: ["a","b"])',
    editorClosed: "편집기가 이 프리셋을 더 이상 열고 있지 않습니다.",
    editorRejected: "편집기가 값을 받지 않았습니다.",
    unknown: "(알 수 없음)",
    empty: "비어 있음",
    nameRequired: "프로필 이름을 입력하세요.",
    editProfile: "프로필 편집",
    newProfile: "현재 값으로 새 프로필",
    name: "이름",
    namePlaceholder: "예: 모델 A",
    fieldsHint: '체크한 항목만 적용됩니다. 처음에는 기본값과 다른 값만 체크되어 있습니다. 체크하지 않은 값은 건드리지 않습니다. 숫자 칸을 비우면 "비움"으로 적용됩니다.',
    samplerFormWarning: '이 프리셋은 샘플러 사용이 꺼져 있습니다. 아래 "샘플러 값 사용 = 켬"을 함께 넣지 않으면 적용해도 생성에 반영되지 않습니다.',
    on: "켬",
    off: "끔",
    clear: "비움",
    noVariables: "이 프리셋에는 프롬프트 변수가 없습니다.",
    emptyValue: "(빈 값)",
    jsonHint: 'JSON 형식으로 입력 (예: ["a","b"])',
    blockDisabled: "(이 블록은 지금 꺼져 있음)",
    optionalConnection: "연결 (선택)",
    switchPermission: "`generation` 권한이 허용되지 않아 연결 전환을 쓸 수 없습니다.",
    switchUnsupported: "이 Lumiverse 버전에서는 연결 전환 기능을 쓸 수 없습니다.",
    keepConnection: "바꾸지 않음",
    switchOnApply: "적용할 때 이 연결로 전환",
    reasoningHint: "추론(API Reasoning·effort)은 연결에 묶인 설정을 따릅니다. 연결 설정에서 한 번 묶어 두세요.",
    autoConnections: '이 연결을 고르면 자동 적용 (아래 "옵션"의 자동 적용이 켜져 있을 때)',
    save: "저장",
    cancel: "취소",
    loading: "불러오는 중…",
    targetPreset: "대상 프리셋",
    scopeHint: "프리셋의 블록과 정규식은 바꾸지 않고, 샘플러 값과 프롬프트 변수 값만 바꿉니다.",
    saveCurrent: "현재 값으로 저장",
    noProfiles: "이 프리셋에 저장된 프로필이 없습니다.",
    apply: "적용",
    edit: "편집",
    delete: "삭제",
    options: "옵션",
    autoApply: "연결을 바꾸면 그 연결에 묶인 프로필 자동 적용",
    autoPermission: "`generation` 권한이 허용되지 않아 연결 전환과 자동 적용을 쓸 수 없습니다. 확장 설정에서 권한을 허용하세요.",
    autoUnsupported: "이 Lumiverse 버전은 연결 변경 알림을 주지 않아 자동 적용을 쓸 수 없습니다.",
    activeUnknown: '이 Lumiverse에서는 현재 프리셋을 알 수 없어 자동 적용을 쓸 수 없습니다. 프로필의 "적용" 버튼을 쓰세요.',
    fileTooLarge: "파일이 너무 큽니다 (2MB 초과).",
    export: "내보내기 (JSON)",
    import: "가져오기",
    refresh: "새로 고침",
    presetReadFailed: "프리셋을 읽지 못했습니다.",
    source_chat: "채팅",
    source_persona: "페르소나",
    source_character: "캐릭터",
    source_connection: "연결",
    source_defaults: "기본값",
    editorSessionMissing: "편집기를 가진 화면을 찾을 수 없습니다.",
    editorTimeout: "편집기가 시간 안에 응답하지 않았습니다.",
    presetMissing: "대상 프리셋을 찾을 수 없습니다. 삭제되었거나 다른 계정의 프리셋일 수 있습니다.",
    conflict: "다른 곳에서 프리셋이 바뀌어 적용하지 못했습니다. 잠시 뒤 다시 시도하세요.",
    profileFieldsRequired: "이름과 대상 프리셋이 필요합니다.",
    profileMissing: "프로필을 찾을 수 없습니다.",
    autoActiveUnknown: '설정 프로필 자동 적용을 건너뛰었습니다: 이 Lumiverse에서는 현재 프리셋을 알 수 없어 자동 적용을 쓸 수 없습니다. 프로필의 "적용" 버튼을 쓰세요.',
    undoRefused: "되돌리기를 취소했습니다: 프리셋 편집기가 이 프리셋을 열어 두고 있는데 이 Lumiverse는 편집기를 통한 적용을 지원하지 않습니다. Loom 탭에서 다른 프리셋을 고르거나 페이지를 새로 고친 뒤 다시 시도하세요.",
    undoAction: "되돌림",
    noBackup: "되돌릴 백업이 없습니다.",
    editorReplyFailed: "편집기가 값을 받지 못했습니다.",
    importEmpty: "가져온 프로필이 없습니다.",
    samplerDisabled: '이 프리셋은 샘플러 사용이 꺼져 있어, 적용한 샘플러 값이 생성에 반영되지 않습니다. 프리셋 편집기에서 샘플러를 켜거나, 프로필에 "샘플러 값 사용 = 켬"을 넣으세요.',
    editorVariablesNote: "편집기가 이 프리셋을 열어 두고 있어, 프롬프트 변수 값은 페이지를 새로 고치거나 Loom에서 다른 프리셋을 골랐다가 돌아올 때까지 화면에 옛 값으로 보일 수 있습니다(저장된 값은 바뀌었고 편집기에서 다른 값을 고쳐도 되돌려지지 않습니다). 그 전에 편집기의 '변수 설정' 창에서 저장하면, 적용한 변수 값이 옛 값으로 되돌아갑니다.",
    fallbackStaleNote: "이 경우 편집기에는 옛 샘플러 값이 남아 있습니다. 새로 고치기 전에 편집기에서 샘플러 값을 고쳐 저장하면, 편집기가 샘플러 묶음 전체를 자기가 가진 옛 값으로 써서 방금 적용한 샘플러 값이 되돌아갑니다(편집기는 고친 항목 묶음만 저장하므로 블록 등 다른 항목만 고치면 영향이 없습니다).",
    fallbackBlocks: "편집기가 이 프리셋의 블록 형식을 받지 않아(프리셋 데이터 문제) 서버에 직접 적용했습니다.",
    invalidJson: "JSON을 읽지 못했습니다.",
    invalidExport: "이 확장에서 내보낸 파일이 아닙니다.",
    importSkipped: "이름이나 대상 프리셋이 없는 항목을 건너뛰었습니다.",
    language: "언어 / Language",
    languageAuto: "Auto",
    languageKo: "한국어",
    languageEn: "English",
    unexpectedError: "작업을 완료하지 못했습니다. 잠시 뒤 다시 시도하세요.",
    invalidVariableJson: "올바른 JSON 값을 입력하세요.",
    missingOptions: "없는 선택지: {options}",
    switchFailed: "연결을 바꾸지 못했습니다: {error}",
    samplerCount: "샘플러 {count}",
    variableCount: "변수 {count}",
    connectionSummary: "연결: {name}",
    autoCount: "자동 {count}",
    searchVariables: "변수 검색 ({count}개)",
    orphanVariables: "프리셋에 없는 변수 {count}개는 그대로 보존되며 적용 때 건너뜁니다.",
    currentPreset: "{name} (현재)",
    undoLabel: "되돌리기 ({name})",
    profileCount: "프로필 {count}개",
    deleteConfirm: "'{name}' 프로필을 삭제할까요?",
    otherProfiles: "다른 프리셋의 프로필 {count}개는 위 목록에서 해당 프리셋을 고르면 보입니다.",
    skippedVariables: " (프리셋에 없는 변수 {count}개는 건너뜀)",
    appliedResult: "{action}했습니다.{skip}",
    noopResult: "{action}: 이미 같은 값이라 바꿀 것이 없습니다.",
    autoRefused: "'{name}' 자동 적용을 건너뛰었습니다: 이 Lumiverse의 프리셋 편집기는 확장이 값을 넣을 수 없어, 열어 둔 프리셋에는 적용할 수 없습니다. Loom 탭에서 다른 프리셋을 고르거나 페이지를 새로 고친 뒤 직접 적용하세요.",
    applyRefused: "'{name}' 적용을 취소했습니다: 프리셋 편집기가 이 프리셋을 열어 두고 있는데 이 Lumiverse는 편집기를 통한 적용을 지원하지 않아, 적용값이 편집기의 옛 값에 덮일 수 있습니다. Loom 탭에서 다른 프리셋을 고르거나 페이지를 새로 고친 뒤 다시 적용하세요.",
    applyFailed: "'{name}' 적용에 실패했습니다: {error}",
    autoApplyFailed: "'{name}' 자동 적용에 실패했습니다: {error}",
    applyAction: "'{name}' 적용",
    autoApplyAction: "'{name}' 자동 적용",
    bindingWarning: `
이 채팅에는 프리셋 프로필 바인딩({source})이 있어, 프롬프트 변수 값이 그 바인딩 값에 가려질 수 있습니다.`,
    profileSaved: "'{name}' 프로필을 저장했습니다.",
    undoFailed: "되돌리기에 실패했습니다: {error}",
    undoSuccess: "직전 값으로 되돌렸습니다.{note}",
    importCount: "{count}개를 가져왔습니다.",
    fallbackReason: "편집기를 통한 적용이 되지 않아({reason}) 서버에 직접 적용했습니다.",
    fallbackNote: `{lead} 편집기 화면은 새로 고치면 맞춰집니다.
{stale}{variables}`
  },
  en: {
    title: "Setting Profiles",
    shortName: "Settings P.",
    fieldError: "{label}: {error}",
    profileKeyword: "profile",
    profiles: "Profiles",
    description: "Sampler, Prompt Variables, and Connection profiles for each model",
    perModel: "per model",
    sampler: "Sampler",
    variables: "Prompt Variables",
    sampler_enabled: "Use sampler values",
    sampler_maxTokens: "Max tokens (maxTokens)",
    sampler_contextSize: "Context size",
    sampler_temperature: "Temperature",
    sampler_topP: "Top P",
    sampler_minP: "Min P",
    sampler_topK: "Top K",
    sampler_frequencyPenalty: "Frequency penalty",
    sampler_presencePenalty: "Presence penalty",
    sampler_repetitionPenalty: "Repetition penalty",
    sampler_streaming: "Streaming",
    notNumber: "Enter a valid number",
    rangeShape: "Enter two numbers as [min, max] (e.g. [1, 5])",
    rangeOrder: "Minimum cannot exceed maximum",
    multiselectShape: 'Enter an array of option IDs (e.g. ["a","b"])',
    editorClosed: "The editor no longer has this Preset open.",
    editorRejected: "The editor did not accept the values.",
    unknown: "(unknown)",
    empty: "Empty",
    nameRequired: "Enter a profile name.",
    editProfile: "Edit profile",
    newProfile: "New profile from current values",
    name: "Name",
    namePlaceholder: "e.g. Model A",
    fieldsHint: "Only checked fields apply. Values differing from defaults start checked. Unchecked fields stay unchanged. Leave a numeric field blank to clear its override.",
    samplerFormWarning: "Samplers are off for this Preset. Include ‘Use sampler values = On’ below for these values to affect generation.",
    on: "On",
    off: "Off",
    clear: "Clear",
    noVariables: "This Preset has no Prompt Variables.",
    emptyValue: "(empty value)",
    jsonHint: 'Enter JSON (e.g. ["a","b"])',
    blockDisabled: "(This block is currently disabled)",
    optionalConnection: "Connection (optional)",
    switchPermission: "Connection switching requires the `generation` permission.",
    switchUnsupported: "This Lumiverse version does not support Connection switching.",
    keepConnection: "Keep current Connection",
    switchOnApply: "Switch to this Connection on apply",
    reasoningHint: "Reasoning (API Reasoning / effort) follows the Connection’s bindings. Configure it in Connection settings.",
    autoConnections: "Auto-apply when selecting these Connections (enable auto-apply under Options below)",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading…",
    targetPreset: "Target Preset",
    scopeHint: "Changes only Sampler and Prompt Variables values. Preset blocks and regex scripts stay unchanged.",
    saveCurrent: "Save from current values",
    noProfiles: "No profiles saved for this Preset.",
    apply: "Apply",
    edit: "Edit",
    delete: "Delete",
    options: "Options",
    autoApply: "Auto-apply the assigned profile when switching Connections",
    autoPermission: "Connection switching and auto-apply require the `generation` permission. Allow it in Extensions settings.",
    autoUnsupported: "Auto-apply is unavailable: this Lumiverse version does not report Connection changes.",
    activeUnknown: "Auto-apply is unavailable: this Lumiverse version cannot identify the active Preset. Use the profile’s Apply button.",
    fileTooLarge: "File is too large (over 2MB).",
    export: "Export (JSON)",
    import: "Import",
    refresh: "Refresh",
    presetReadFailed: "Could not load the Preset.",
    source_chat: "Chat",
    source_persona: "Persona",
    source_character: "Character",
    source_connection: "Connection",
    source_defaults: "Defaults",
    editorSessionMissing: "Could not find the session with the editor.",
    editorTimeout: "The editor did not respond in time.",
    presetMissing: "Target Preset not found. It may have been deleted or belong to another account.",
    conflict: "The Preset changed elsewhere, so the update could not be applied. Try again shortly.",
    profileFieldsRequired: "A name and target Preset are required.",
    profileMissing: "Profile not found.",
    autoActiveUnknown: "Setting Profiles skipped auto-apply: this Lumiverse version cannot identify the active Preset. Use the profile’s Apply button.",
    undoRefused: "Undo cancelled: this Preset is open in the editor, but this Lumiverse version cannot apply changes through it. Select another Preset in Loom or reload the page, then try again.",
    undoAction: "Undo",
    noBackup: "No backup to undo.",
    editorReplyFailed: "The editor could not accept the values.",
    importEmpty: "No profiles imported.",
    samplerDisabled: "Samplers are off for this Preset, so the applied values will not affect generation. Enable samplers in the Preset editor or include ‘Use sampler values = On’ in the profile.",
    editorVariablesNote: "This Preset is open in the editor. Prompt Variables may display old values until you reload or select another Preset in Loom and return. The saved values have changed; editing other fields will not revert them. Saving the editor’s Prompt Variables dialog before refreshing will restore the old variable values.",
    fallbackStaleNote: "The editor still has old Sampler values. Reload before editing and saving samplers, or the editor will overwrite the entire Sampler group with its old values. Editing other groups, such as blocks, does not affect samplers.",
    fallbackBlocks: "Applied directly to the server because the editor rejected this Preset’s block format (a Preset data issue).",
    invalidJson: "Could not read the JSON.",
    invalidExport: "This file was not exported by this extension.",
    importSkipped: "Skipped an entry without a name or target Preset.",
    language: "언어 / Language",
    languageAuto: "Auto",
    languageKo: "한국어",
    languageEn: "English",
    unexpectedError: "Could not complete the operation. Try again shortly.",
    invalidVariableJson: "Enter a valid JSON value.",
    missingOptions: "Unknown options: {options}",
    switchFailed: "Could not switch Connection: {error}",
    samplerCount: "Sampler: {count}",
    variableCount: "Prompt Variables: {count}",
    connectionSummary: "Connection: {name}",
    autoCount: "Auto: {count}",
    searchVariables: "Search variables ({count})",
    orphanVariables: "{count} variables missing from the Preset are preserved and skipped on apply.",
    currentPreset: "{name} (current)",
    undoLabel: "Undo ({name})",
    profileCount: "Profiles: {count}",
    deleteConfirm: "Delete profile ‘{name}’?",
    otherProfiles: "{count} profiles belong to other Presets. Select their Preset above to view them.",
    skippedVariables: " (Skipped {count} variables missing from the Preset)",
    appliedResult: "{action} completed.{skip}",
    noopResult: "{action}: values already match; no changes needed.",
    autoRefused: "Skipped auto-apply for ‘{name}’: this Lumiverse editor cannot accept extension updates while the Preset is open. Select another Preset in Loom or reload the page, then apply manually.",
    applyRefused: "Cancelled applying ‘{name}’: this Preset is open in the editor, but this Lumiverse version cannot apply through it. Old editor values could overwrite the update. Select another Preset in Loom or reload the page, then apply again.",
    applyFailed: "Could not apply ‘{name}’: {error}",
    autoApplyFailed: "Could not auto-apply ‘{name}’: {error}",
    applyAction: "Apply ‘{name}’",
    autoApplyAction: "Auto-apply ‘{name}’",
    bindingWarning: `
This chat has a Preset profile binding ({source}) that may override the Prompt Variables values.`,
    profileSaved: "Saved profile ‘{name}’.",
    undoFailed: "Could not undo: {error}",
    undoSuccess: "Restored the previous values.{note}",
    importCount: "Imported {count} profiles.",
    fallbackReason: "Applied directly to the server because the editor update failed ({reason}).",
    fallbackNote: `{lead} Reload to refresh the editor.
{stale}{variables}`
  }
};
function normalizeLanguage(value) {
  return value === "ko" || value === "en" ? value : "auto";
}
var HOST_LANGUAGE_KEY = "lumiverse-ui-language";
function readHostLanguage() {
  try {
    return globalThis.localStorage?.getItem(HOST_LANGUAGE_KEY) ?? null;
  } catch {
    return null;
  }
}
function resolveLanguage(setting, hostLanguage = readHostLanguage(), browserLanguage = globalThis.navigator?.language ?? "") {
  if (setting !== "auto")
    return setting;
  if (hostLanguage !== null)
    return hostLanguage === "ko" ? "ko" : "en";
  return browserLanguage.toLowerCase().startsWith("ko") ? "ko" : "en";
}
function translate(language, key, params = {}) {
  return messages[language][key].replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(params, name) ? String(params[name]) : match);
}
var message = (key, params) => ({ key, params });
function renderMessage(language, value) {
  if (typeof value === "string")
    return value;
  if ("parts" in value)
    return value.parts.map((part) => renderMessage(language, part)).join(value.separator);
  const params = Object.fromEntries(Object.entries(value.params ?? {}).map(([key, param]) => [
    key,
    typeof param === "number" ? param : renderMessage(language, param)
  ]));
  return translate(language, value.key, params);
}

class LocalizedError extends Error {
  localizedMessage;
  constructor(localizedMessage, language = "ko") {
    super(renderMessage(language, localizedMessage));
    this.localizedMessage = localizedMessage;
  }
}
var errorMessage = (error) => error instanceof LocalizedError ? error.localizedMessage : message("unexpectedError");

// src/language-events.ts
function watchHostLanguage(locale, update) {
  let timers = [];
  let disposed = false;
  const cancelRetries = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  const onLocale = () => {
    if (disposed)
      return;
    cancelRetries();
    const before = readHostLanguage();
    timers = [0, 150, 500].map((delay) => setTimeout(() => {
      if (disposed)
        return;
      update();
      if (readHostLanguage() !== before || delay === 500)
        cancelRetries();
    }, delay));
  };
  let offLocale;
  try {
    offLocale = locale?.subscribe?.(onLocale);
  } catch {}
  const onStorage = (event) => {
    if (event.key === HOST_LANGUAGE_KEY || event.key === null)
      update();
  };
  const onVisible = () => {
    if (document.visibilityState === "visible")
      update();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("focus", update);
  window.addEventListener("languagechange", update);
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    disposed = true;
    cancelRetries();
    offLocale?.();
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("focus", update);
    window.removeEventListener("languagechange", update);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

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
var SAMPLER_LABEL_KEYS = Object.fromEntries(SAMPLER_KEYS.map((key) => [key, `sampler_${key}`]));

// src/core.ts
var BAD_KEYS = new Set(["__proto__", "constructor", "prototype"]);
var isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
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
function samplerPatch(current, patch) {
  const next = isObj(current) ? { ...current } : {};
  const prev = {};
  let changed = false;
  for (const [k, nv] of Object.entries(patch.set)) {
    if (BAD_KEYS.has(k))
      continue;
    const had = Object.hasOwn(next, k);
    if (had && deepEqual(next[k], nv))
      continue;
    prev[k] = had ? { had, value: cleanJson(next[k]) ?? null } : { had };
    next[k] = nv;
    changed = true;
  }
  for (const k of patch.remove) {
    if (BAD_KEYS.has(k) || !Object.hasOwn(next, k))
      continue;
    prev[k] = { had: true, value: cleanJson(next[k]) ?? null };
    delete next[k];
    changed = true;
  }
  return { next, prev, changed };
}
var EDITOR_VAR_NOTE = translate("ko", "editorVariablesNote");
var LOOM_REQUIRED_BLOCK_KEYS = ["id", "name", "content", "role", "enabled", "position", "depth", "marker", "isLocked", "color", "injectionTrigger", "group"];
function loomBlocksRejection(blocks) {
  if (!Array.isArray(blocks))
    return null;
  let category = null;
  for (let i = 0;i < blocks.length; i++) {
    const b = blocks[i];
    if (!isObj(b))
      return `blocks[${i}]`;
    for (const k of LOOM_REQUIRED_BLOCK_KEYS)
      if (!Object.hasOwn(b, k))
        return `blocks[${i}].${k}`;
    if (b.marker !== null && typeof b.marker !== "string")
      return `blocks[${i}].marker`;
    if (b.color !== null && typeof b.color !== "string")
      return `blocks[${i}].color`;
    if (!Array.isArray(b.injectionTrigger) || b.injectionTrigger.some((t) => typeof t !== "string" || !t))
      return `blocks[${i}].injectionTrigger`;
    if (b.group !== null && (typeof b.group !== "string" || !b.group))
      return `blocks[${i}].group`;
    if (b.marker === "category") {
      if (b.group !== null)
        return `blocks[${i}].group`;
      category = typeof b.id === "string" ? b.id : null;
    } else if (b.group !== null) {
      if (!category || category !== b.group)
        return `blocks[${i}].group`;
    } else
      category = null;
  }
  return null;
}
function samplerPrechecked(detail, key) {
  if (BOOLEAN_SAMPLER_KEYS.includes(key) || !Object.hasOwn(detail.sampler, key))
    return false;
  const v = detail.sampler[key];
  return v !== null && v !== undefined;
}
function variablePrechecked(info) {
  return info.hasCurrent && !deepEqual(info.current, info.defaultValue);
}

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
function parseVariable(type, text, language = "ko") {
  const t = message;
  if (type === "number" || type === "slider") {
    const n = Number(text);
    if (text.trim() === "" || !Number.isFinite(n))
      throw new LocalizedError(t("notNumber"), language);
    return n;
  }
  if (type === "switch")
    return text === "1" || text === "true" ? 1 : 0;
  if (type === "select" || type === "text" || type === "textarea")
    return text;
  try {
    return JSON.parse(text);
  } catch {
    throw new LocalizedError(t("invalidVariableJson"), language);
  }
}
function checkVariableShape(type, options, v, language = "ko") {
  const t = message;
  if (type === "range") {
    if (!Array.isArray(v) || v.length !== 2 || v.some((x) => typeof x !== "number" || !Number.isFinite(x)))
      throw new LocalizedError(t("rangeShape"), language);
    if (v[0] > v[1])
      throw new LocalizedError(t("rangeOrder"), language);
  } else if (type === "multiselect") {
    if (!Array.isArray(v) || v.some((x) => typeof x !== "string"))
      throw new LocalizedError(t("multiselectShape"), language);
    const ids = new Set(options.map((o) => o.id));
    const bad = v.filter((x) => !ids.has(x));
    if (ids.size && bad.length)
      throw new LocalizedError(t("missingOptions", { options: bad.join(", ") }), language);
  }
}
function parseSampler(key, text, language = "ko") {
  const t = message;
  if (BOOLEAN_SAMPLER_KEYS.includes(key))
    return text === "true";
  if (text.trim() === "")
    return null;
  const n = Number(text);
  if (!Number.isFinite(n))
    throw new LocalizedError(t("notNumber"), language);
  return n;
}
function setup(ctx) {
  let languageSetting = "auto";
  let pendingLanguage = null;
  let language = resolveLanguage(languageSetting);
  const t = (key, params) => translate(language, key, params);
  let st = null;
  let selected = null;
  let detail = null;
  let form = null;
  let status = null;
  let statusLevel = "info";
  let conns = [];
  let suppressUntil = 0;
  let debounce = null;
  const toBackend = (m) => ctx.sendToBackend({ ...m, language });
  const removeStyle = ctx.dom.addStyle(CSS);
  const chatId = () => {
    const m = /^\/chat\/([^/?#]+)/.exec(location.pathname);
    return m ? decodeURIComponent(m[1]) : null;
  };
  const connApi = () => ctx.connections;
  let granted = null;
  const genDenied = () => granted !== null && !granted.includes("generation");
  async function loadGranted() {
    try {
      const g = await ctx.permissions?.getGranted?.();
      granted = Array.isArray(g) ? g : null;
    } catch {
      granted = null;
    }
    render();
  }
  const canAuto = () => !genDenied() && typeof connApi()?.subscribe === "function" && typeof connApi()?.getActive === "function" && activeKnown();
  const canSwitch = () => !genDenied() && (typeof connApi()?.setActiveAcknowledged === "function" || typeof connApi()?.setActive === "function");
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
      console.warn(operationError("connection_switch", e));
      show("error", message("switchFailed", { error: message("unexpectedError") }));
    }
  }
  let offSub = null;
  let lastConn = activeConn();
  if (typeof connApi()?.subscribe === "function" && typeof connApi()?.getActive === "function") {
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
        if (genDenied())
          return;
        toBackend({ type: "connection_changed", connectionId: id, chatId: chatId(), activePresetId: activeHint(), ...editorInfo() });
      }, 700);
    });
  }
  const stateApi = () => ctx.state;
  function activeHint() {
    try {
      const sa = stateApi();
      if (typeof sa?.get !== "function")
        return;
      const v = sa.get("loom.activePresetId");
      return typeof v === "string" && v ? v : null;
    } catch {
      return;
    }
  }
  const activeKnown = () => activeHint() !== undefined || !!st?.activeAvailable;
  const currentActive = () => {
    const h = activeHint();
    return h !== undefined ? h : st?.activePresetId ?? null;
  };
  let offActive = null;
  try {
    const sa = stateApi();
    if (typeof sa?.subscribe === "function")
      offActive = sa.subscribe("loom.activePresetId", () => render());
  } catch {
    offActive = null;
  }
  const editorApi = () => ctx.ui.presetEditor;
  function editorPresetId() {
    try {
      const s = editorApi()?.getState();
      return s?.open && s.presetId ? s.presetId : null;
    } catch {
      return null;
    }
  }
  function editorInfo() {
    const pe = editorApi();
    let editorBlocksReject = null;
    try {
      const st = pe?.getState();
      if (st?.open && st.preset)
        editorBlocksReject = loomBlocksRejection(st.preset.blocks);
    } catch {
      editorBlocksReject = null;
    }
    return { editorPresetId: editorPresetId(), editorDraft: typeof pe?.updatePreset === "function" && typeof pe?.flush === "function", editorBlocksReject };
  }
  async function runEditorPatch(presetId, patch) {
    const pe = editorApi();
    const s = pe?.getState();
    if (!pe?.updatePreset || !pe.flush || !s?.open || s.presetId !== presetId || !s.preset)
      throw new LocalizedError(message("editorClosed"), language);
    let out = null;
    pe.updatePreset((d) => {
      const r = samplerPatch(d.parameters?.samplerOverrides, patch);
      out = { changed: r.changed, prev: r.prev };
      if (!r.changed)
        return d;
      return { ...d, parameters: { ...d.parameters, samplerOverrides: r.next } };
    }, { immediate: true });
    if (!out)
      throw new LocalizedError(message("editorRejected"), language);
    await pe.flush();
    return out;
  }
  function show(level, text) {
    status = text;
    statusLevel = level;
    render();
  }
  const tab = ctx.ui.registerDrawerTab({
    id: "setting-profiles",
    title: t("title"),
    shortName: t("shortName"),
    description: `${translate("ko", "description")} / ${translate("en", "description")}`,
    keywords: ["ko", "en"].flatMap((lang) => ["profileKeyword", "profiles", "sampler", "variables", "perModel"].map((key) => translate(lang, key))),
    iconSvg: ICON
  });
  const panel = el("div", { class: "sp-panel" });
  tab.root.replaceChildren(panel);
  const inputAction = ctx.ui.registerInputBarAction?.({
    id: "setting-profiles",
    label: t("title"),
    subtitle: t("description"),
    iconSvg: ICON
  });
  const offInputClick = inputAction?.onClick(() => tab.activate());
  function updateLanguage() {
    const next = resolveLanguage(languageSetting);
    if (next === language)
      return;
    language = next;
    tab.setTitle(t("title"));
    tab.setShortName(t("shortName"));
    inputAction?.setLabel(t("title"));
    inputAction?.setSubtitle(t("description"));
    render();
  }
  function reload() {
    toBackend({ type: "load", chatId: chatId(), activePresetId: activeHint() });
    loadConns();
    loadGranted();
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
      parts.push(t("samplerCount", { count: sc }));
    const vc = Object.values(p.variables).reduce((n, b) => n + Object.keys(b).length, 0);
    if (vc)
      parts.push(t("variableCount", { count: vc }));
    if (p.connectionId)
      parts.push(t("connectionSummary", { name: conns.find((c) => c.id === p.connectionId)?.name ?? t("unknown") }));
    if (p.autoConnectionIds.length)
      parts.push(t("autoCount", { count: p.autoConnectionIds.length }));
    return parts.join(" · ") || t("empty");
  }
  function doApply(p) {
    toBackend({ type: "apply", id: p.id, chatId: chatId(), activeConnectionId: activeConn(), switched: !!p.connectionId && canSwitch(), ...editorInfo() });
  }
  function newForm(profile) {
    if (!detail || !selected)
      return null;
    const sampler = {};
    for (const k of SAMPLER_KEYS) {
      const inProfile = profile ? Object.hasOwn(profile.sampler, k) : false;
      const cur = detail.sampler[k];
      const val = profile ? inProfile ? profile.sampler[k] : cur : cur;
      sampler[k] = { on: profile ? inProfile : samplerPrechecked(detail, k), text: BOOLEAN_SAMPLER_KEYS.includes(k) ? String(val !== false) : valueToText(val) };
    }
    const known = new Set(detail.variables.map((v) => `${v.blockId}\x00${v.name}`));
    const vars = detail.variables.map((info) => {
      const pv = profile?.variables[info.blockId]?.[info.name];
      const inProfile = pv !== undefined;
      const base = info.hasCurrent ? info.current : info.defaultValue;
      return { info, on: profile ? inProfile : variablePrechecked(info), text: valueToText(inProfile ? pv : base) };
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
      show("error", message("nameRequired"));
      return;
    }
    try {
      const sampler = {};
      for (const k of SAMPLER_KEYS) {
        const r = f.sampler[k];
        if (r.on) {
          try {
            sampler[k] = parseSampler(k, r.text, language);
          } catch (e) {
            throw new LocalizedError(message("fieldError", { label: message(SAMPLER_LABEL_KEYS[k]), error: errorMessage(e) }), language);
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
          v = parseVariable(r.info.type, r.text, language);
          checkVariableShape(r.info.type, r.info.options, v, language);
        } catch (e) {
          throw new LocalizedError(message("fieldError", { label: r.info.label, error: errorMessage(e) }), language);
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
      status = null;
      render();
    } catch (e) {
      show("error", errorMessage(e));
    }
  }
  function renderForm(f) {
    const box = el("div", { class: "sp-card" });
    box.append(el("div", { class: "sp-title" }, [f.id ? t("editProfile") : t("newProfile")]));
    box.append(el("div", { class: "sp-field" }, [
      el("label", {}, [t("name")]),
      el("input", { type: "text", value: f.name, maxLength: 80, placeholder: t("namePlaceholder"), onInput: (e) => {
        f.name = e.target.value;
      } })
    ]));
    box.append(el("div", { class: "sp-muted" }, [t("fieldsHint")]));
    box.append(el("div", { class: "sp-h" }, [t("sampler")]));
    if (detail && detail.sampler.enabled !== true) {
      box.append(el("div", { class: "sp-status sp-warning" }, [t("samplerFormWarning")]));
    }
    for (const k of SAMPLER_KEYS) {
      const r = f.sampler[k];
      const input = BOOLEAN_SAMPLER_KEYS.includes(k) ? el("select", { onChange: (e) => {
        r.text = e.target.value;
      } }, [
        el("option", { value: "true", selected: r.text === "true" }, [t("on")]),
        el("option", { value: "false", selected: r.text !== "true" }, [t("off")])
      ]) : el("input", { type: "text", inputMode: "decimal", value: r.text, placeholder: t("clear"), onInput: (e) => {
        r.text = e.target.value;
      } });
      box.append(el("div", { class: "sp-line" }, [
        el("label", { class: "sp-check" }, [el("input", { type: "checkbox", checked: r.on, onChange: (e) => {
          r.on = e.target.checked;
        } }), t(SAMPLER_LABEL_KEYS[k])]),
        input
      ]));
    }
    box.append(el("div", { class: "sp-h" }, [t("variables")]));
    if (!f.vars.length)
      box.append(el("div", { class: "sp-muted" }, [t("noVariables")]));
    const varRows = [];
    if (f.vars.length > 8) {
      box.append(el("div", { class: "sp-field" }, [
        el("input", { type: "text", placeholder: t("searchVariables", { count: f.vars.length }), onInput: (e) => {
          const q = e.target.value.trim().toLowerCase();
          for (const v of varRows)
            v.node.style.display = !q || v.row.on || v.text.includes(q) ? "" : "none";
        } })
      ]));
    }
    for (const r of f.vars) {
      const variableType = r.info.type;
      let input;
      if (variableType === "select") {
        const opts = r.info.options.slice();
        if (!opts.some((o) => o.id === r.text))
          opts.unshift({ id: r.text, label: r.text || t("emptyValue") });
        input = el("select", { onChange: (e) => {
          r.text = e.target.value;
        } }, opts.map((o) => el("option", { value: o.id, selected: o.id === r.text }, [o.label])));
      } else if (variableType === "switch") {
        input = el("select", { onChange: (e) => {
          r.text = e.target.value;
        } }, [
          el("option", { value: "1", selected: r.text === "1" }, [t("on")]),
          el("option", { value: "0", selected: r.text !== "1" }, [t("off")])
        ]);
      } else if (variableType === "textarea") {
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
        variableType === "multiselect" || variableType === "range" ? el("div", { class: "sp-muted" }, [t("jsonHint")]) : null,
        r.info.blockEnabled ? null : el("div", { class: "sp-muted" }, [t("blockDisabled")])
      ]);
      varRows.push({ node: line, row: r, text: `${r.info.blockName} ${r.info.label} ${r.info.name}`.toLowerCase() });
      box.append(line);
    }
    const orphanCount = Object.values(f.orphans).reduce((n, b) => n + Object.keys(b).length, 0);
    if (orphanCount)
      box.append(el("div", { class: "sp-muted" }, [t("orphanVariables", { count: orphanCount })]));
    box.append(el("div", { class: "sp-h" }, [t("optionalConnection")]));
    if (!canSwitch())
      box.append(el("div", { class: "sp-muted" }, [genDenied() ? t("switchPermission") : t("switchUnsupported")]));
    const connSel = el("select", { disabled: !canSwitch(), onChange: (e) => {
      f.connectionId = e.target.value;
    } }, [el("option", { value: "", selected: !f.connectionId }, [t("keepConnection")]), ...conns.map((c) => el("option", { value: c.id, selected: c.id === f.connectionId }, [c.model ? `${c.name} (${c.model})` : c.name]))]);
    box.append(el("div", { class: "sp-field" }, [el("label", {}, [t("switchOnApply")]), connSel]));
    box.append(el("div", { class: "sp-muted" }, [t("reasoningHint")]));
    if (canAuto()) {
      box.append(el("div", { class: "sp-field" }, [el("div", {}, [t("autoConnections")])]));
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
    box.append(el("div", { class: "sp-row" }, [btn(t("save"), saveForm, "sp-primary"), btn(t("cancel"), () => {
      form = null;
      render();
    })]));
    return box;
  }
  function render() {
    panel.lang = language;
    const languageSelect = el("select", { id: "sp-language", value: languageSetting, onChange: (e) => {
      languageSetting = normalizeLanguage(e.target.value);
      pendingLanguage = languageSetting;
      updateLanguage();
      toBackend({ type: "set_settings", settings: { language: languageSetting } });
    } }, ["auto", "ko", "en"].map((value) => el("option", { value, selected: value === languageSetting }, [
      t(value === "auto" ? "languageAuto" : value === "ko" ? "languageKo" : "languageEn")
    ])));
    const languageField = el("div", { class: "sp-field" }, [el("label", { htmlFor: "sp-language" }, [t("language")]), languageSelect]);
    const kids = [languageField];
    if (!st) {
      panel.replaceChildren(languageField, el("div", { class: "sp-muted" }, [t("loading")]));
      return;
    }
    const sel = el("select", { onChange: (e) => pickPreset(e.target.value) }, st.presets.map((p) => el("option", { value: p.id, selected: p.id === selected }, [p.id === currentActive() ? t("currentPreset", { name: p.name }) : p.name])));
    kids.push(el("div", { class: "sp-field" }, [el("label", { class: "sp-h" }, [t("targetPreset")]), sel]));
    kids.push(el("div", { class: "sp-muted" }, [t("scopeHint")]));
    if (status)
      kids.push(el("div", { class: `sp-status sp-${statusLevel}` }, [renderMessage(language, status)]));
    const mine = st.profiles.filter((p) => p.presetId === selected);
    const backup = selected ? st.backups[selected] : undefined;
    kids.push(el("div", { class: "sp-row" }, [
      btn(t("saveCurrent"), () => {
        form = newForm(null);
        render();
      }, "sp-primary", !detail),
      backup ? btn(t("undoLabel", { name: backup.profileName }), () => toBackend({ type: "undo", presetId: selected, ...editorInfo() })) : null
    ]));
    if (form)
      kids.push(renderForm(form));
    kids.push(el("div", { class: "sp-h" }, [t("profileCount", { count: mine.length })]));
    if (!mine.length)
      kids.push(el("div", { class: "sp-muted" }, [t("noProfiles")]));
    for (const p of mine) {
      kids.push(el("div", { class: "sp-card" }, [
        el("div", { class: "sp-title" }, [p.name]),
        el("div", { class: "sp-muted" }, [summary(p)]),
        el("div", { class: "sp-row" }, [
          btn(t("apply"), () => void doApply(p), "sp-primary"),
          btn(t("edit"), () => {
            form = newForm(p);
            render();
          }, "", !detail),
          btn(t("delete"), () => {
            if (confirm(t("deleteConfirm", { name: p.name })))
              toBackend({ type: "delete", id: p.id });
          }, "sp-danger")
        ])
      ]));
    }
    const others = st.profiles.length - mine.length;
    if (others)
      kids.push(el("div", { class: "sp-muted" }, [t("otherProfiles", { count: others })]));
    kids.push(el("div", { class: "sp-h" }, [t("options")]));
    kids.push(el("label", { class: "sp-check" }, [
      el("input", { type: "checkbox", checked: st.settings.autoApply && canAuto(), disabled: !canAuto(), onChange: (e) => toBackend({ type: "set_settings", settings: { autoApply: e.target.checked } }) }),
      t("autoApply")
    ]));
    if (!canAuto()) {
      kids.push(el("div", { class: "sp-status sp-warning" }, [
        genDenied() ? t("autoPermission") : typeof connApi()?.subscribe !== "function" || typeof connApi()?.getActive !== "function" ? t("autoUnsupported") : t("activeUnknown")
      ]));
    }
    const file = el("input", { type: "file", accept: ".json,application/json", style: "display:none", onChange: (e) => {
      const f = e.target.files?.[0];
      if (!f)
        return;
      if (f.size > 2 * 1024 * 1024) {
        show("error", message("fileTooLarge"));
        return;
      }
      f.text().then((text) => toBackend({ type: "import", text })).catch(() => show("error", message("unexpectedError")));
    } });
    kids.push(el("div", { class: "sp-row" }, [
      btn(t("export"), () => toBackend({ type: "export" })),
      btn(t("import"), () => file.click()),
      file,
      btn(t("refresh"), reload)
    ]));
    panel.replaceChildren(...kids.filter(Boolean));
  }
  const offBackend = ctx.onBackendMessage((raw) => {
    const msg = raw;
    switch (msg?.type) {
      case "state": {
        st = msg;
        const storedLanguage = normalizeLanguage(msg.settings.language);
        if (storedLanguage === pendingLanguage)
          pendingLanguage = null;
        if (pendingLanguage === null)
          languageSetting = storedLanguage;
        updateLanguage();
        const stillThere = selected && st.presets.some((p) => p.id === selected);
        if (!stillThere) {
          const act = currentActive();
          const next = (act && st.presets.some((p) => p.id === act) ? act : st.presets[0]?.id) ?? null;
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
            status = message("presetReadFailed");
          render();
        }
        return;
      case "result":
        status = msg.message ?? msg.text;
        statusLevel = msg.level;
        if (msg.refresh !== false && (msg.presetId === selected || msg.presetId === undefined)) {
          if (selected)
            toBackend({ type: "detail", presetId: selected });
        }
        render();
        switchConn(msg.switchConnection);
        return;
      case "editor_patch":
        runEditorPatch(msg.presetId, { set: msg.set, remove: msg.remove }).then((r) => toBackend({ type: "editor_reply", reqId: msg.reqId, ok: true, changed: r.changed, prev: r.prev }), (e) => toBackend({ type: "editor_reply", reqId: msg.reqId, ok: false, error: e instanceof Error ? e.message : String(e), errorMessage: e instanceof LocalizedError ? e.localizedMessage : undefined }));
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
  const locale = ctx.locale;
  const offLanguage = watchHostLanguage(locale, updateLanguage);
  render();
  reload();
  return () => {
    offBackend();
    offActivate();
    offSub?.();
    offActive?.();
    offLanguage();
    offInputClick?.();
    inputAction?.destroy();
    if (debounce)
      clearTimeout(debounce);
    tab.destroy();
    removeStyle();
    ctx.dom.cleanup();
  };
}
export {
  checkVariableShape,
  parseSampler,
  parseVariable,
  setup,
  valueToText
};
