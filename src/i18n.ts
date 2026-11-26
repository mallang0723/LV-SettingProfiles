// All extension-owned UI and result text. Host/user content stays unchanged.
export const messages = {
  ko: {
  "title": "설정 프로필",
  "shortName": "세팅",
  "fieldError": "{label}: {error}",
  "profileKeyword": "profile",
  "profiles": "프로필",
  "description": "모델별 샘플러·프롬프트 변수·연결 프로필",
  "perModel": "모델별",
  "sampler": "샘플러",
  "variables": "프롬프트 변수",
  "sampler_enabled": "샘플러 값 사용",
  "sampler_maxTokens": "최대 토큰 (maxTokens)",
  "sampler_contextSize": "컨텍스트 크기",
  "sampler_temperature": "온도 (temperature)",
  "sampler_topP": "Top P",
  "sampler_minP": "Min P",
  "sampler_topK": "Top K",
  "sampler_frequencyPenalty": "Frequency 페널티",
  "sampler_presencePenalty": "Presence 페널티",
  "sampler_repetitionPenalty": "Repetition 페널티",
  "sampler_streaming": "스트리밍",
  "notNumber": "숫자가 아닙니다",
  "rangeShape": "[최소, 최대] 숫자 두 개여야 합니다 (예: [1, 5])",
  "rangeOrder": "최소가 최대보다 클 수 없습니다",
  "multiselectShape": "선택지 id의 배열이어야 합니다 (예: [\"a\",\"b\"])",
  "editorClosed": "편집기가 이 프리셋을 더 이상 열고 있지 않습니다.",
  "editorRejected": "편집기가 값을 받지 않았습니다.",
  "unknown": "(알 수 없음)",
  "empty": "비어 있음",
  "nameRequired": "프로필 이름을 입력하세요.",
  "editProfile": "프로필 편집",
  "newProfile": "현재 값으로 새 프로필",
  "name": "이름",
  "namePlaceholder": "예: 모델 A",
  "fieldsHint": "체크한 항목만 적용됩니다. 처음에는 기본값과 다른 값만 체크되어 있습니다. 체크하지 않은 값은 건드리지 않습니다. 숫자 칸을 비우면 \"비움\"으로 적용됩니다.",
  "samplerFormWarning": "이 프리셋은 샘플러 사용이 꺼져 있습니다. 아래 \"샘플러 값 사용 = 켬\"을 함께 넣지 않으면 적용해도 생성에 반영되지 않습니다.",
  "on": "켬",
  "off": "끔",
  "clear": "비움",
  "noVariables": "이 프리셋에는 프롬프트 변수가 없습니다.",
  "emptyValue": "(빈 값)",
  "jsonHint": "JSON 형식으로 입력 (예: [\"a\",\"b\"])",
  "blockDisabled": "(이 블록은 지금 꺼져 있음)",
  "optionalConnection": "연결 (선택)",
  "switchPermission": "`generation` 권한이 허용되지 않아 연결 전환을 쓸 수 없습니다.",
  "switchUnsupported": "이 Lumiverse 버전에서는 연결 전환 기능을 쓸 수 없습니다.",
  "keepConnection": "바꾸지 않음",
  "switchOnApply": "적용할 때 이 연결로 전환",
  "reasoningHint": "추론(API Reasoning·effort)은 연결에 묶인 설정을 따릅니다. 연결 설정에서 한 번 묶어 두세요.",
  "autoConnections": "이 연결을 고르면 자동 적용 (아래 \"옵션\"의 자동 적용이 켜져 있을 때)",
  "save": "저장",
  "cancel": "취소",
  "loading": "불러오는 중…",
  "targetPreset": "대상 프리셋",
  "scopeHint": "프리셋의 블록과 정규식은 바꾸지 않고, 샘플러 값과 프롬프트 변수 값만 바꿉니다.",
  "saveCurrent": "현재 값으로 저장",
  "noProfiles": "이 프리셋에 저장된 프로필이 없습니다.",
  "apply": "적용",
  "edit": "편집",
  "delete": "삭제",
  "options": "옵션",
  "autoApply": "연결을 바꾸면 그 연결에 묶인 프로필 자동 적용",
  "autoPermission": "`generation` 권한이 허용되지 않아 연결 전환과 자동 적용을 쓸 수 없습니다. 확장 설정에서 권한을 허용하세요.",
  "autoUnsupported": "이 Lumiverse 버전은 연결 변경 알림을 주지 않아 자동 적용을 쓸 수 없습니다.",
  "activeUnknown": "이 Lumiverse에서는 현재 프리셋을 알 수 없어 자동 적용을 쓸 수 없습니다. 프로필의 \"적용\" 버튼을 쓰세요.",
  "fileTooLarge": "파일이 너무 큽니다 (2MB 초과).",
  "export": "내보내기 (JSON)",
  "import": "가져오기",
  "refresh": "새로 고침",
  "presetReadFailed": "프리셋을 읽지 못했습니다.",
  "source_chat": "채팅",
  "source_persona": "페르소나",
  "source_character": "캐릭터",
  "source_connection": "연결",
  "source_defaults": "기본값",
  "editorSessionMissing": "편집기를 가진 화면을 찾을 수 없습니다.",
  "editorTimeout": "편집기가 시간 안에 응답하지 않았습니다.",
  "presetMissing": "대상 프리셋을 찾을 수 없습니다. 삭제되었거나 다른 계정의 프리셋일 수 있습니다.",
  "conflict": "다른 곳에서 프리셋이 바뀌어 적용하지 못했습니다. 잠시 뒤 다시 시도하세요.",
  "profileFieldsRequired": "이름과 대상 프리셋이 필요합니다.",
  "profileMissing": "프로필을 찾을 수 없습니다.",
  "autoActiveUnknown": "설정 프로필 자동 적용을 건너뛰었습니다: 이 Lumiverse에서는 현재 프리셋을 알 수 없어 자동 적용을 쓸 수 없습니다. 프로필의 \"적용\" 버튼을 쓰세요.",
  "undoRefused": "되돌리기를 취소했습니다: 프리셋 편집기가 이 프리셋을 열어 두고 있는데 이 Lumiverse는 편집기를 통한 적용을 지원하지 않습니다. Loom 탭에서 다른 프리셋을 고르거나 페이지를 새로 고친 뒤 다시 시도하세요.",
  "undoAction": "되돌림",
  "noBackup": "되돌릴 백업이 없습니다.",
  "editorReplyFailed": "편집기가 값을 받지 못했습니다.",
  "importEmpty": "가져온 프로필이 없습니다.",
  "samplerDisabled": "이 프리셋은 샘플러 사용이 꺼져 있어, 적용한 샘플러 값이 생성에 반영되지 않습니다. 프리셋 편집기에서 샘플러를 켜거나, 프로필에 \"샘플러 값 사용 = 켬\"을 넣으세요.",
  "editorVariablesNote": "편집기가 이 프리셋을 열어 두고 있어, 프롬프트 변수 값은 페이지를 새로 고치거나 Loom에서 다른 프리셋을 골랐다가 돌아올 때까지 화면에 옛 값으로 보일 수 있습니다(저장된 값은 바뀌었고 편집기에서 다른 값을 고쳐도 되돌려지지 않습니다). 그 전에 편집기의 '변수 설정' 창에서 저장하면, 적용한 변수 값이 옛 값으로 되돌아갑니다.",
  "fallbackStaleNote": "이 경우 편집기에는 옛 샘플러 값이 남아 있습니다. 새로 고치기 전에 편집기에서 샘플러 값을 고쳐 저장하면, 편집기가 샘플러 묶음 전체를 자기가 가진 옛 값으로 써서 방금 적용한 샘플러 값이 되돌아갑니다(편집기는 고친 항목 묶음만 저장하므로 블록 등 다른 항목만 고치면 영향이 없습니다).",
  "fallbackBlocks": "편집기가 이 프리셋의 블록 형식을 받지 않아(프리셋 데이터 문제) 서버에 직접 적용했습니다.",
  "invalidJson": "JSON을 읽지 못했습니다.",
  "invalidExport": "이 확장에서 내보낸 파일이 아닙니다.",
  "importSkipped": "이름이나 대상 프리셋이 없는 항목을 건너뛰었습니다.",
  "language": "언어 / Language",
  "languageAuto": "Auto",
  "languageKo": "한국어",
  "languageEn": "English",
  "unexpectedError": "작업을 완료하지 못했습니다. 잠시 뒤 다시 시도하세요.",
  "invalidVariableJson": "올바른 JSON 값을 입력하세요.",
  "missingOptions": "없는 선택지: {options}",
  "switchFailed": "연결을 바꾸지 못했습니다: {error}",
  "samplerCount": "샘플러 {count}",
  "variableCount": "변수 {count}",
  "connectionSummary": "연결: {name}",
  "autoCount": "자동 {count}",
  "searchVariables": "변수 검색 ({count}개)",
  "orphanVariables": "프리셋에 없는 변수 {count}개는 그대로 보존되며 적용 때 건너뜁니다.",
  "currentPreset": "{name} (현재)",
  "undoLabel": "되돌리기 ({name})",
  "profileCount": "프로필 {count}개",
  "deleteConfirm": "'{name}' 프로필을 삭제할까요?",
  "otherProfiles": "다른 프리셋의 프로필 {count}개는 위 목록에서 해당 프리셋을 고르면 보입니다.",
  "skippedVariables": " (프리셋에 없는 변수 {count}개는 건너뜀)",
  "appliedResult": "{action}했습니다.{skip}",
  "noopResult": "{action}: 이미 같은 값이라 바꿀 것이 없습니다.",
  "autoRefused": "'{name}' 자동 적용을 건너뛰었습니다: 이 Lumiverse의 프리셋 편집기는 확장이 값을 넣을 수 없어, 열어 둔 프리셋에는 적용할 수 없습니다. Loom 탭에서 다른 프리셋을 고르거나 페이지를 새로 고친 뒤 직접 적용하세요.",
  "applyRefused": "'{name}' 적용을 취소했습니다: 프리셋 편집기가 이 프리셋을 열어 두고 있는데 이 Lumiverse는 편집기를 통한 적용을 지원하지 않아, 적용값이 편집기의 옛 값에 덮일 수 있습니다. Loom 탭에서 다른 프리셋을 고르거나 페이지를 새로 고친 뒤 다시 적용하세요.",
  "applyFailed": "'{name}' 적용에 실패했습니다: {error}",
  "autoApplyFailed": "'{name}' 자동 적용에 실패했습니다: {error}",
  "applyAction": "'{name}' 적용",
  "autoApplyAction": "'{name}' 자동 적용",
  "bindingWarning": "\n이 채팅에는 프리셋 프로필 바인딩({source})이 있어, 프롬프트 변수 값이 그 바인딩 값에 가려질 수 있습니다.",
  "profileSaved": "'{name}' 프로필을 저장했습니다.",
  "undoFailed": "되돌리기에 실패했습니다: {error}",
  "undoSuccess": "직전 값으로 되돌렸습니다.{note}",
  "importCount": "{count}개를 가져왔습니다.",
  "fallbackReason": "편집기를 통한 적용이 되지 않아({reason}) 서버에 직접 적용했습니다.",
  "fallbackNote": "{lead} 편집기 화면은 새로 고치면 맞춰집니다.\n{stale}{variables}"
},
  en: {
  "title": "Setting Profiles",
  "shortName": "Settings P.",
  "fieldError": "{label}: {error}",
  "profileKeyword": "profile",
  "profiles": "Profiles",
  "description": "Sampler, Prompt Variables, and Connection profiles for each model",
  "perModel": "per model",
  "sampler": "Sampler",
  "variables": "Prompt Variables",
  "sampler_enabled": "Use sampler values",
  "sampler_maxTokens": "Max tokens (maxTokens)",
  "sampler_contextSize": "Context size",
  "sampler_temperature": "Temperature",
  "sampler_topP": "Top P",
  "sampler_minP": "Min P",
  "sampler_topK": "Top K",
  "sampler_frequencyPenalty": "Frequency penalty",
  "sampler_presencePenalty": "Presence penalty",
  "sampler_repetitionPenalty": "Repetition penalty",
  "sampler_streaming": "Streaming",
  "notNumber": "Enter a valid number",
  "rangeShape": "Enter two numbers as [min, max] (e.g. [1, 5])",
  "rangeOrder": "Minimum cannot exceed maximum",
  "multiselectShape": "Enter an array of option IDs (e.g. [\"a\",\"b\"])",
  "editorClosed": "The editor no longer has this Preset open.",
  "editorRejected": "The editor did not accept the values.",
  "unknown": "(unknown)",
  "empty": "Empty",
  "nameRequired": "Enter a profile name.",
  "editProfile": "Edit profile",
  "newProfile": "New profile from current values",
  "name": "Name",
  "namePlaceholder": "e.g. Model A",
  "fieldsHint": "Only checked fields apply. Values differing from defaults start checked. Unchecked fields stay unchanged. Leave a numeric field blank to clear its override.",
  "samplerFormWarning": "Samplers are off for this Preset. Include ‘Use sampler values = On’ below for these values to affect generation.",
  "on": "On",
  "off": "Off",
  "clear": "Clear",
  "noVariables": "This Preset has no Prompt Variables.",
  "emptyValue": "(empty value)",
  "jsonHint": "Enter JSON (e.g. [\"a\",\"b\"])",
  "blockDisabled": "(This block is currently disabled)",
  "optionalConnection": "Connection (optional)",
  "switchPermission": "Connection switching requires the `generation` permission.",
  "switchUnsupported": "This Lumiverse version does not support Connection switching.",
  "keepConnection": "Keep current Connection",
  "switchOnApply": "Switch to this Connection on apply",
  "reasoningHint": "Reasoning (API Reasoning / effort) follows the Connection’s bindings. Configure it in Connection settings.",
  "autoConnections": "Auto-apply when selecting these Connections (enable auto-apply under Options below)",
  "save": "Save",
  "cancel": "Cancel",
  "loading": "Loading…",
  "targetPreset": "Target Preset",
  "scopeHint": "Changes only Sampler and Prompt Variables values. Preset blocks and regex scripts stay unchanged.",
  "saveCurrent": "Save from current values",
  "noProfiles": "No profiles saved for this Preset.",
  "apply": "Apply",
  "edit": "Edit",
  "delete": "Delete",
  "options": "Options",
  "autoApply": "Auto-apply the assigned profile when switching Connections",
  "autoPermission": "Connection switching and auto-apply require the `generation` permission. Allow it in Extensions settings.",
  "autoUnsupported": "Auto-apply is unavailable: this Lumiverse version does not report Connection changes.",
  "activeUnknown": "Auto-apply is unavailable: this Lumiverse version cannot identify the active Preset. Use the profile’s Apply button.",
  "fileTooLarge": "File is too large (over 2MB).",
  "export": "Export (JSON)",
  "import": "Import",
  "refresh": "Refresh",
  "presetReadFailed": "Could not load the Preset.",
  "source_chat": "Chat",
  "source_persona": "Persona",
  "source_character": "Character",
  "source_connection": "Connection",
  "source_defaults": "Defaults",
  "editorSessionMissing": "Could not find the session with the editor.",
  "editorTimeout": "The editor did not respond in time.",
  "presetMissing": "Target Preset not found. It may have been deleted or belong to another account.",
  "conflict": "The Preset changed elsewhere, so the update could not be applied. Try again shortly.",
  "profileFieldsRequired": "A name and target Preset are required.",
  "profileMissing": "Profile not found.",
  "autoActiveUnknown": "Setting Profiles skipped auto-apply: this Lumiverse version cannot identify the active Preset. Use the profile’s Apply button.",
  "undoRefused": "Undo cancelled: this Preset is open in the editor, but this Lumiverse version cannot apply changes through it. Select another Preset in Loom or reload the page, then try again.",
  "undoAction": "Undo",
  "noBackup": "No backup to undo.",
  "editorReplyFailed": "The editor could not accept the values.",
  "importEmpty": "No profiles imported.",
  "samplerDisabled": "Samplers are off for this Preset, so the applied values will not affect generation. Enable samplers in the Preset editor or include ‘Use sampler values = On’ in the profile.",
  "editorVariablesNote": "This Preset is open in the editor. Prompt Variables may display old values until you reload or select another Preset in Loom and return. The saved values have changed; editing other fields will not revert them. Saving the editor’s Prompt Variables dialog before refreshing will restore the old variable values.",
  "fallbackStaleNote": "The editor still has old Sampler values. Reload before editing and saving samplers, or the editor will overwrite the entire Sampler group with its old values. Editing other groups, such as blocks, does not affect samplers.",
  "fallbackBlocks": "Applied directly to the server because the editor rejected this Preset’s block format (a Preset data issue).",
  "invalidJson": "Could not read the JSON.",
  "invalidExport": "This file was not exported by this extension.",
  "importSkipped": "Skipped an entry without a name or target Preset.",
  "language": "언어 / Language",
  "languageAuto": "Auto",
  "languageKo": "한국어",
  "languageEn": "English",
  "unexpectedError": "Could not complete the operation. Try again shortly.",
  "invalidVariableJson": "Enter a valid JSON value.",
  "missingOptions": "Unknown options: {options}",
  "switchFailed": "Could not switch Connection: {error}",
  "samplerCount": "Sampler: {count}",
  "variableCount": "Prompt Variables: {count}",
  "connectionSummary": "Connection: {name}",
  "autoCount": "Auto: {count}",
  "searchVariables": "Search variables ({count})",
  "orphanVariables": "{count} variables missing from the Preset are preserved and skipped on apply.",
  "currentPreset": "{name} (current)",
  "undoLabel": "Undo ({name})",
  "profileCount": "Profiles: {count}",
  "deleteConfirm": "Delete profile ‘{name}’?",
  "otherProfiles": "{count} profiles belong to other Presets. Select their Preset above to view them.",
  "skippedVariables": " (Skipped {count} variables missing from the Preset)",
  "appliedResult": "{action} completed.{skip}",
  "noopResult": "{action}: values already match; no changes needed.",
  "autoRefused": "Skipped auto-apply for ‘{name}’: this Lumiverse editor cannot accept extension updates while the Preset is open. Select another Preset in Loom or reload the page, then apply manually.",
  "applyRefused": "Cancelled applying ‘{name}’: this Preset is open in the editor, but this Lumiverse version cannot apply through it. Old editor values could overwrite the update. Select another Preset in Loom or reload the page, then apply again.",
  "applyFailed": "Could not apply ‘{name}’: {error}",
  "autoApplyFailed": "Could not auto-apply ‘{name}’: {error}",
  "applyAction": "Apply ‘{name}’",
  "autoApplyAction": "Auto-apply ‘{name}’",
  "bindingWarning": "\nThis chat has a Preset profile binding ({source}) that may override the Prompt Variables values.",
  "profileSaved": "Saved profile ‘{name}’.",
  "undoFailed": "Could not undo: {error}",
  "undoSuccess": "Restored the previous values.{note}",
  "importCount": "Imported {count} profiles.",
  "fallbackReason": "Applied directly to the server because the editor update failed ({reason}).",
  "fallbackNote": "{lead} Reload to refresh the editor.\n{stale}{variables}"
},
} as const;

export type Language = keyof typeof messages;
export type LanguageSetting = 'auto' | Language;
export type MessageKey = keyof typeof messages.ko;
export type Params = Record<string, string | number>;

export function normalizeLanguage(value: unknown): LanguageSetting {
  return value === 'ko' || value === 'en' ? value : 'auto';
}

export const HOST_LANGUAGE_KEY = 'lumiverse-ui-language';

/** Read lazily: even accessing localStorage can throw in restricted browser contexts. */
export function readHostLanguage(): string | null {
  try { return globalThis.localStorage?.getItem(HOST_LANGUAGE_KEY) ?? null; } catch { return null; }
}

/** ctx.locale maps Korean to English; the host's stored interface language is authoritative. */
export function resolveLanguage(
  setting: LanguageSetting, hostLanguage: string | null = readHostLanguage(),
  browserLanguage: string = globalThis.navigator?.language ?? '',
): Language {
  if (setting !== 'auto') return setting;
  if (hostLanguage !== null) return hostLanguage === 'ko' ? 'ko' : 'en';
  return browserLanguage.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

export function translate(language: Language, key: MessageKey, params: Params = {}): string {
  return messages[language][key].replace(/\{(\w+)\}/g, (match, name: string) => Object.hasOwn(params, name) ? String(params[name]) : match);
}

export const translator = (language: Language) => (key: MessageKey, params?: Params) => translate(language, key, params);

/** Serializable text: only keys are translated; user values remain literal. */
export type LocalizedMessage = string | {
  key: MessageKey;
  params?: Record<string, LocalizedMessage | number>;
} | { parts: LocalizedMessage[]; separator: string };

export const message = (key: MessageKey, params?: Record<string, LocalizedMessage | number>): LocalizedMessage => ({ key, params });
export const joinMessages = (parts: LocalizedMessage[], separator = ''): LocalizedMessage => ({ parts, separator });

export function renderMessage(language: Language, value: LocalizedMessage): string {
  if (typeof value === 'string') return value;
  if ('parts' in value) return value.parts.map((part) => renderMessage(language, part)).join(value.separator);
  const params = Object.fromEntries(Object.entries(value.params ?? {}).map(([key, param]) => [
    key, typeof param === 'number' ? param : renderMessage(language, param),
  ]));
  return translate(language, value.key, params);
}

/** Preserve a keyed validation/editor error through catch blocks and the worker bridge. */
export class LocalizedError extends Error {
  constructor(readonly localizedMessage: LocalizedMessage, language: Language = 'ko') {
    super(renderMessage(language, localizedMessage));
  }
}

export const errorMessage = (error: unknown): LocalizedMessage =>
  error instanceof LocalizedError ? error.localizedMessage : message('unexpectedError');
