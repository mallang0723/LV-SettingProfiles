// @bun
// src/i18n.ts
var messages = {
  ko: {
    title: "\uC124\uC815 \uD504\uB85C\uD544",
    shortName: "\uC138\uD305",
    fieldError: "{label}: {error}",
    profileKeyword: "profile",
    profiles: "\uD504\uB85C\uD544",
    description: "\uBAA8\uB378\uBCC4 \uC0D8\uD50C\uB7EC\xB7\uD504\uB86C\uD504\uD2B8 \uBCC0\uC218\xB7\uC5F0\uACB0 \uD504\uB85C\uD544",
    perModel: "\uBAA8\uB378\uBCC4",
    sampler: "\uC0D8\uD50C\uB7EC",
    variables: "\uD504\uB86C\uD504\uD2B8 \uBCC0\uC218",
    sampler_enabled: "\uC0D8\uD50C\uB7EC \uAC12 \uC0AC\uC6A9",
    sampler_maxTokens: "\uCD5C\uB300 \uD1A0\uD070 (maxTokens)",
    sampler_contextSize: "\uCEE8\uD14D\uC2A4\uD2B8 \uD06C\uAE30",
    sampler_temperature: "\uC628\uB3C4 (temperature)",
    sampler_topP: "Top P",
    sampler_minP: "Min P",
    sampler_topK: "Top K",
    sampler_frequencyPenalty: "Frequency \uD398\uB110\uD2F0",
    sampler_presencePenalty: "Presence \uD398\uB110\uD2F0",
    sampler_repetitionPenalty: "Repetition \uD398\uB110\uD2F0",
    sampler_streaming: "\uC2A4\uD2B8\uB9AC\uBC0D",
    notNumber: "\uC22B\uC790\uAC00 \uC544\uB2D9\uB2C8\uB2E4",
    rangeShape: "[\uCD5C\uC18C, \uCD5C\uB300] \uC22B\uC790 \uB450 \uAC1C\uC5EC\uC57C \uD569\uB2C8\uB2E4 (\uC608: [1, 5])",
    rangeOrder: "\uCD5C\uC18C\uAC00 \uCD5C\uB300\uBCF4\uB2E4 \uD074 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4",
    multiselectShape: '\uC120\uD0DD\uC9C0 id\uC758 \uBC30\uC5F4\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4 (\uC608: ["a","b"])',
    editorClosed: "\uD3B8\uC9D1\uAE30\uAC00 \uC774 \uD504\uB9AC\uC14B\uC744 \uB354 \uC774\uC0C1 \uC5F4\uACE0 \uC788\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
    editorRejected: "\uD3B8\uC9D1\uAE30\uAC00 \uAC12\uC744 \uBC1B\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
    unknown: "(\uC54C \uC218 \uC5C6\uC74C)",
    empty: "\uBE44\uC5B4 \uC788\uC74C",
    nameRequired: "\uD504\uB85C\uD544 \uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694.",
    editProfile: "\uD504\uB85C\uD544 \uD3B8\uC9D1",
    newProfile: "\uD604\uC7AC \uAC12\uC73C\uB85C \uC0C8 \uD504\uB85C\uD544",
    name: "\uC774\uB984",
    namePlaceholder: "\uC608: \uBAA8\uB378 A",
    fieldsHint: '\uCCB4\uD06C\uD55C \uD56D\uBAA9\uB9CC \uC801\uC6A9\uB429\uB2C8\uB2E4. \uCC98\uC74C\uC5D0\uB294 \uAE30\uBCF8\uAC12\uACFC \uB2E4\uB978 \uAC12\uB9CC \uCCB4\uD06C\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uCCB4\uD06C\uD558\uC9C0 \uC54A\uC740 \uAC12\uC740 \uAC74\uB4DC\uB9AC\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC22B\uC790 \uCE78\uC744 \uBE44\uC6B0\uBA74 "\uBE44\uC6C0"\uC73C\uB85C \uC801\uC6A9\uB429\uB2C8\uB2E4.',
    samplerFormWarning: '\uC774 \uD504\uB9AC\uC14B\uC740 \uC0D8\uD50C\uB7EC \uC0AC\uC6A9\uC774 \uAEBC\uC838 \uC788\uC2B5\uB2C8\uB2E4. \uC544\uB798 "\uC0D8\uD50C\uB7EC \uAC12 \uC0AC\uC6A9 = \uCF2C"\uC744 \uD568\uAED8 \uB123\uC9C0 \uC54A\uC73C\uBA74 \uC801\uC6A9\uD574\uB3C4 \uC0DD\uC131\uC5D0 \uBC18\uC601\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.',
    on: "\uCF2C",
    off: "\uB054",
    clear: "\uBE44\uC6C0",
    noVariables: "\uC774 \uD504\uB9AC\uC14B\uC5D0\uB294 \uD504\uB86C\uD504\uD2B8 \uBCC0\uC218\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    emptyValue: "(\uBE48 \uAC12)",
    jsonHint: 'JSON \uD615\uC2DD\uC73C\uB85C \uC785\uB825 (\uC608: ["a","b"])',
    blockDisabled: "(\uC774 \uBE14\uB85D\uC740 \uC9C0\uAE08 \uAEBC\uC838 \uC788\uC74C)",
    optionalConnection: "\uC5F0\uACB0 (\uC120\uD0DD)",
    switchPermission: "`generation` \uAD8C\uD55C\uC774 \uD5C8\uC6A9\uB418\uC9C0 \uC54A\uC544 \uC5F0\uACB0 \uC804\uD658\uC744 \uC4F8 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
    switchUnsupported: "\uC774 Lumiverse \uBC84\uC804\uC5D0\uC11C\uB294 \uC5F0\uACB0 \uC804\uD658 \uAE30\uB2A5\uC744 \uC4F8 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
    keepConnection: "\uBC14\uAFB8\uC9C0 \uC54A\uC74C",
    switchOnApply: "\uC801\uC6A9\uD560 \uB54C \uC774 \uC5F0\uACB0\uB85C \uC804\uD658",
    reasoningHint: "\uCD94\uB860(API Reasoning\xB7effort)\uC740 \uC5F0\uACB0\uC5D0 \uBB36\uC778 \uC124\uC815\uC744 \uB530\uB985\uB2C8\uB2E4. \uC5F0\uACB0 \uC124\uC815\uC5D0\uC11C \uD55C \uBC88 \uBB36\uC5B4 \uB450\uC138\uC694.",
    autoConnections: '\uC774 \uC5F0\uACB0\uC744 \uACE0\uB974\uBA74 \uC790\uB3D9 \uC801\uC6A9 (\uC544\uB798 "\uC635\uC158"\uC758 \uC790\uB3D9 \uC801\uC6A9\uC774 \uCF1C\uC838 \uC788\uC744 \uB54C)',
    save: "\uC800\uC7A5",
    cancel: "\uCDE8\uC18C",
    loading: "\uBD88\uB7EC\uC624\uB294 \uC911\u2026",
    targetPreset: "\uB300\uC0C1 \uD504\uB9AC\uC14B",
    scopeHint: "\uD504\uB9AC\uC14B\uC758 \uBE14\uB85D\uACFC \uC815\uADDC\uC2DD\uC740 \uBC14\uAFB8\uC9C0 \uC54A\uACE0, \uC0D8\uD50C\uB7EC \uAC12\uACFC \uD504\uB86C\uD504\uD2B8 \uBCC0\uC218 \uAC12\uB9CC \uBC14\uAFC9\uB2C8\uB2E4.",
    saveCurrent: "\uD604\uC7AC \uAC12\uC73C\uB85C \uC800\uC7A5",
    noProfiles: "\uC774 \uD504\uB9AC\uC14B\uC5D0 \uC800\uC7A5\uB41C \uD504\uB85C\uD544\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    apply: "\uC801\uC6A9",
    edit: "\uD3B8\uC9D1",
    delete: "\uC0AD\uC81C",
    options: "\uC635\uC158",
    autoApply: "\uC5F0\uACB0\uC744 \uBC14\uAFB8\uBA74 \uADF8 \uC5F0\uACB0\uC5D0 \uBB36\uC778 \uD504\uB85C\uD544 \uC790\uB3D9 \uC801\uC6A9",
    autoPermission: "`generation` \uAD8C\uD55C\uC774 \uD5C8\uC6A9\uB418\uC9C0 \uC54A\uC544 \uC5F0\uACB0 \uC804\uD658\uACFC \uC790\uB3D9 \uC801\uC6A9\uC744 \uC4F8 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uD655\uC7A5 \uC124\uC815\uC5D0\uC11C \uAD8C\uD55C\uC744 \uD5C8\uC6A9\uD558\uC138\uC694.",
    autoUnsupported: "\uC774 Lumiverse \uBC84\uC804\uC740 \uC5F0\uACB0 \uBCC0\uACBD \uC54C\uB9BC\uC744 \uC8FC\uC9C0 \uC54A\uC544 \uC790\uB3D9 \uC801\uC6A9\uC744 \uC4F8 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
    activeUnknown: '\uC774 Lumiverse\uC5D0\uC11C\uB294 \uD604\uC7AC \uD504\uB9AC\uC14B\uC744 \uC54C \uC218 \uC5C6\uC5B4 \uC790\uB3D9 \uC801\uC6A9\uC744 \uC4F8 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uD504\uB85C\uD544\uC758 "\uC801\uC6A9" \uBC84\uD2BC\uC744 \uC4F0\uC138\uC694.',
    fileTooLarge: "\uD30C\uC77C\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4 (2MB \uCD08\uACFC).",
    export: "\uB0B4\uBCF4\uB0B4\uAE30 (JSON)",
    import: "\uAC00\uC838\uC624\uAE30",
    refresh: "\uC0C8\uB85C \uACE0\uCE68",
    presetReadFailed: "\uD504\uB9AC\uC14B\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    source_chat: "\uCC44\uD305",
    source_persona: "\uD398\uB974\uC18C\uB098",
    source_character: "\uCE90\uB9AD\uD130",
    source_connection: "\uC5F0\uACB0",
    source_defaults: "\uAE30\uBCF8\uAC12",
    editorSessionMissing: "\uD3B8\uC9D1\uAE30\uB97C \uAC00\uC9C4 \uD654\uBA74\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
    editorTimeout: "\uD3B8\uC9D1\uAE30\uAC00 \uC2DC\uAC04 \uC548\uC5D0 \uC751\uB2F5\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
    presetMissing: "\uB300\uC0C1 \uD504\uB9AC\uC14B\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC0AD\uC81C\uB418\uC5C8\uAC70\uB098 \uB2E4\uB978 \uACC4\uC815\uC758 \uD504\uB9AC\uC14B\uC77C \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    conflict: "\uB2E4\uB978 \uACF3\uC5D0\uC11C \uD504\uB9AC\uC14B\uC774 \uBC14\uB00C\uC5B4 \uC801\uC6A9\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.",
    profileFieldsRequired: "\uC774\uB984\uACFC \uB300\uC0C1 \uD504\uB9AC\uC14B\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
    profileMissing: "\uD504\uB85C\uD544\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
    autoActiveUnknown: '\uC124\uC815 \uD504\uB85C\uD544 \uC790\uB3D9 \uC801\uC6A9\uC744 \uAC74\uB108\uB6F0\uC5C8\uC2B5\uB2C8\uB2E4: \uC774 Lumiverse\uC5D0\uC11C\uB294 \uD604\uC7AC \uD504\uB9AC\uC14B\uC744 \uC54C \uC218 \uC5C6\uC5B4 \uC790\uB3D9 \uC801\uC6A9\uC744 \uC4F8 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uD504\uB85C\uD544\uC758 "\uC801\uC6A9" \uBC84\uD2BC\uC744 \uC4F0\uC138\uC694.',
    undoRefused: "\uB418\uB3CC\uB9AC\uAE30\uB97C \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4: \uD504\uB9AC\uC14B \uD3B8\uC9D1\uAE30\uAC00 \uC774 \uD504\uB9AC\uC14B\uC744 \uC5F4\uC5B4 \uB450\uACE0 \uC788\uB294\uB370 \uC774 Lumiverse\uB294 \uD3B8\uC9D1\uAE30\uB97C \uD1B5\uD55C \uC801\uC6A9\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. Loom \uD0ED\uC5D0\uC11C \uB2E4\uB978 \uD504\uB9AC\uC14B\uC744 \uACE0\uB974\uAC70\uB098 \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C \uACE0\uCE5C \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.",
    undoAction: "\uB418\uB3CC\uB9BC",
    noBackup: "\uB418\uB3CC\uB9B4 \uBC31\uC5C5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    editorReplyFailed: "\uD3B8\uC9D1\uAE30\uAC00 \uAC12\uC744 \uBC1B\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    importEmpty: "\uAC00\uC838\uC628 \uD504\uB85C\uD544\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    samplerDisabled: '\uC774 \uD504\uB9AC\uC14B\uC740 \uC0D8\uD50C\uB7EC \uC0AC\uC6A9\uC774 \uAEBC\uC838 \uC788\uC5B4, \uC801\uC6A9\uD55C \uC0D8\uD50C\uB7EC \uAC12\uC774 \uC0DD\uC131\uC5D0 \uBC18\uC601\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uD504\uB9AC\uC14B \uD3B8\uC9D1\uAE30\uC5D0\uC11C \uC0D8\uD50C\uB7EC\uB97C \uCF1C\uAC70\uB098, \uD504\uB85C\uD544\uC5D0 "\uC0D8\uD50C\uB7EC \uAC12 \uC0AC\uC6A9 = \uCF2C"\uC744 \uB123\uC73C\uC138\uC694.',
    editorVariablesNote: "\uD3B8\uC9D1\uAE30\uAC00 \uC774 \uD504\uB9AC\uC14B\uC744 \uC5F4\uC5B4 \uB450\uACE0 \uC788\uC5B4, \uD504\uB86C\uD504\uD2B8 \uBCC0\uC218 \uAC12\uC740 \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C \uACE0\uCE58\uAC70\uB098 Loom\uC5D0\uC11C \uB2E4\uB978 \uD504\uB9AC\uC14B\uC744 \uACE8\uB790\uB2E4\uAC00 \uB3CC\uC544\uC62C \uB54C\uAE4C\uC9C0 \uD654\uBA74\uC5D0 \uC61B \uAC12\uC73C\uB85C \uBCF4\uC77C \uC218 \uC788\uC2B5\uB2C8\uB2E4(\uC800\uC7A5\uB41C \uAC12\uC740 \uBC14\uB00C\uC5C8\uACE0 \uD3B8\uC9D1\uAE30\uC5D0\uC11C \uB2E4\uB978 \uAC12\uC744 \uACE0\uCCD0\uB3C4 \uB418\uB3CC\uB824\uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4). \uADF8 \uC804\uC5D0 \uD3B8\uC9D1\uAE30\uC758 '\uBCC0\uC218 \uC124\uC815' \uCC3D\uC5D0\uC11C \uC800\uC7A5\uD558\uBA74, \uC801\uC6A9\uD55C \uBCC0\uC218 \uAC12\uC774 \uC61B \uAC12\uC73C\uB85C \uB418\uB3CC\uC544\uAC11\uB2C8\uB2E4.",
    fallbackStaleNote: "\uC774 \uACBD\uC6B0 \uD3B8\uC9D1\uAE30\uC5D0\uB294 \uC61B \uC0D8\uD50C\uB7EC \uAC12\uC774 \uB0A8\uC544 \uC788\uC2B5\uB2C8\uB2E4. \uC0C8\uB85C \uACE0\uCE58\uAE30 \uC804\uC5D0 \uD3B8\uC9D1\uAE30\uC5D0\uC11C \uC0D8\uD50C\uB7EC \uAC12\uC744 \uACE0\uCCD0 \uC800\uC7A5\uD558\uBA74, \uD3B8\uC9D1\uAE30\uAC00 \uC0D8\uD50C\uB7EC \uBB36\uC74C \uC804\uCCB4\uB97C \uC790\uAE30\uAC00 \uAC00\uC9C4 \uC61B \uAC12\uC73C\uB85C \uC368\uC11C \uBC29\uAE08 \uC801\uC6A9\uD55C \uC0D8\uD50C\uB7EC \uAC12\uC774 \uB418\uB3CC\uC544\uAC11\uB2C8\uB2E4(\uD3B8\uC9D1\uAE30\uB294 \uACE0\uCE5C \uD56D\uBAA9 \uBB36\uC74C\uB9CC \uC800\uC7A5\uD558\uBBC0\uB85C \uBE14\uB85D \uB4F1 \uB2E4\uB978 \uD56D\uBAA9\uB9CC \uACE0\uCE58\uBA74 \uC601\uD5A5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4).",
    fallbackBlocks: "\uD3B8\uC9D1\uAE30\uAC00 \uC774 \uD504\uB9AC\uC14B\uC758 \uBE14\uB85D \uD615\uC2DD\uC744 \uBC1B\uC9C0 \uC54A\uC544(\uD504\uB9AC\uC14B \uB370\uC774\uD130 \uBB38\uC81C) \uC11C\uBC84\uC5D0 \uC9C1\uC811 \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4.",
    invalidJson: "JSON\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    invalidExport: "\uC774 \uD655\uC7A5\uC5D0\uC11C \uB0B4\uBCF4\uB0B8 \uD30C\uC77C\uC774 \uC544\uB2D9\uB2C8\uB2E4.",
    importSkipped: "\uC774\uB984\uC774\uB098 \uB300\uC0C1 \uD504\uB9AC\uC14B\uC774 \uC5C6\uB294 \uD56D\uBAA9\uC744 \uAC74\uB108\uB6F0\uC5C8\uC2B5\uB2C8\uB2E4.",
    language: "\uC5B8\uC5B4 / Language",
    languageAuto: "Auto",
    languageKo: "\uD55C\uAD6D\uC5B4",
    languageEn: "English",
    unexpectedError: "\uC791\uC5C5\uC744 \uC644\uB8CC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.",
    invalidVariableJson: "\uC62C\uBC14\uB978 JSON \uAC12\uC744 \uC785\uB825\uD558\uC138\uC694.",
    missingOptions: "\uC5C6\uB294 \uC120\uD0DD\uC9C0: {options}",
    switchFailed: "\uC5F0\uACB0\uC744 \uBC14\uAFB8\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {error}",
    samplerCount: "\uC0D8\uD50C\uB7EC {count}",
    variableCount: "\uBCC0\uC218 {count}",
    connectionSummary: "\uC5F0\uACB0: {name}",
    autoCount: "\uC790\uB3D9 {count}",
    searchVariables: "\uBCC0\uC218 \uAC80\uC0C9 ({count}\uAC1C)",
    orphanVariables: "\uD504\uB9AC\uC14B\uC5D0 \uC5C6\uB294 \uBCC0\uC218 {count}\uAC1C\uB294 \uADF8\uB300\uB85C \uBCF4\uC874\uB418\uBA70 \uC801\uC6A9 \uB54C \uAC74\uB108\uB701\uB2C8\uB2E4.",
    currentPreset: "{name} (\uD604\uC7AC)",
    undoLabel: "\uB418\uB3CC\uB9AC\uAE30 ({name})",
    profileCount: "\uD504\uB85C\uD544 {count}\uAC1C",
    deleteConfirm: "'{name}' \uD504\uB85C\uD544\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?",
    otherProfiles: "\uB2E4\uB978 \uD504\uB9AC\uC14B\uC758 \uD504\uB85C\uD544 {count}\uAC1C\uB294 \uC704 \uBAA9\uB85D\uC5D0\uC11C \uD574\uB2F9 \uD504\uB9AC\uC14B\uC744 \uACE0\uB974\uBA74 \uBCF4\uC785\uB2C8\uB2E4.",
    skippedVariables: " (\uD504\uB9AC\uC14B\uC5D0 \uC5C6\uB294 \uBCC0\uC218 {count}\uAC1C\uB294 \uAC74\uB108\uB700)",
    appliedResult: "{action}\uD588\uC2B5\uB2C8\uB2E4.{skip}",
    noopResult: "{action}: \uC774\uBBF8 \uAC19\uC740 \uAC12\uC774\uB77C \uBC14\uAFC0 \uAC83\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    autoRefused: "'{name}' \uC790\uB3D9 \uC801\uC6A9\uC744 \uAC74\uB108\uB6F0\uC5C8\uC2B5\uB2C8\uB2E4: \uC774 Lumiverse\uC758 \uD504\uB9AC\uC14B \uD3B8\uC9D1\uAE30\uB294 \uD655\uC7A5\uC774 \uAC12\uC744 \uB123\uC744 \uC218 \uC5C6\uC5B4, \uC5F4\uC5B4 \uB454 \uD504\uB9AC\uC14B\uC5D0\uB294 \uC801\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. Loom \uD0ED\uC5D0\uC11C \uB2E4\uB978 \uD504\uB9AC\uC14B\uC744 \uACE0\uB974\uAC70\uB098 \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C \uACE0\uCE5C \uB4A4 \uC9C1\uC811 \uC801\uC6A9\uD558\uC138\uC694.",
    applyRefused: "'{name}' \uC801\uC6A9\uC744 \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4: \uD504\uB9AC\uC14B \uD3B8\uC9D1\uAE30\uAC00 \uC774 \uD504\uB9AC\uC14B\uC744 \uC5F4\uC5B4 \uB450\uACE0 \uC788\uB294\uB370 \uC774 Lumiverse\uB294 \uD3B8\uC9D1\uAE30\uB97C \uD1B5\uD55C \uC801\uC6A9\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC544, \uC801\uC6A9\uAC12\uC774 \uD3B8\uC9D1\uAE30\uC758 \uC61B \uAC12\uC5D0 \uB36E\uC77C \uC218 \uC788\uC2B5\uB2C8\uB2E4. Loom \uD0ED\uC5D0\uC11C \uB2E4\uB978 \uD504\uB9AC\uC14B\uC744 \uACE0\uB974\uAC70\uB098 \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C \uACE0\uCE5C \uB4A4 \uB2E4\uC2DC \uC801\uC6A9\uD558\uC138\uC694.",
    applyFailed: "'{name}' \uC801\uC6A9\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4: {error}",
    autoApplyFailed: "'{name}' \uC790\uB3D9 \uC801\uC6A9\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4: {error}",
    applyAction: "'{name}' \uC801\uC6A9",
    autoApplyAction: "'{name}' \uC790\uB3D9 \uC801\uC6A9",
    bindingWarning: `
\uC774 \uCC44\uD305\uC5D0\uB294 \uD504\uB9AC\uC14B \uD504\uB85C\uD544 \uBC14\uC778\uB529({source})\uC774 \uC788\uC5B4, \uD504\uB86C\uD504\uD2B8 \uBCC0\uC218 \uAC12\uC774 \uADF8 \uBC14\uC778\uB529 \uAC12\uC5D0 \uAC00\uB824\uC9C8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`,
    profileSaved: "'{name}' \uD504\uB85C\uD544\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4.",
    undoFailed: "\uB418\uB3CC\uB9AC\uAE30\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4: {error}",
    undoSuccess: "\uC9C1\uC804 \uAC12\uC73C\uB85C \uB418\uB3CC\uB838\uC2B5\uB2C8\uB2E4.{note}",
    importCount: "{count}\uAC1C\uB97C \uAC00\uC838\uC654\uC2B5\uB2C8\uB2E4.",
    fallbackReason: "\uD3B8\uC9D1\uAE30\uB97C \uD1B5\uD55C \uC801\uC6A9\uC774 \uB418\uC9C0 \uC54A\uC544({reason}) \uC11C\uBC84\uC5D0 \uC9C1\uC811 \uC801\uC6A9\uD588\uC2B5\uB2C8\uB2E4.",
    fallbackNote: `{lead} \uD3B8\uC9D1\uAE30 \uD654\uBA74\uC740 \uC0C8\uB85C \uACE0\uCE58\uBA74 \uB9DE\uCDB0\uC9D1\uB2C8\uB2E4.
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
    samplerFormWarning: "Samplers are off for this Preset. Include \u2018Use sampler values = On\u2019 below for these values to affect generation.",
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
    reasoningHint: "Reasoning (API Reasoning / effort) follows the Connection\u2019s bindings. Configure it in Connection settings.",
    autoConnections: "Auto-apply when selecting these Connections (enable auto-apply under Options below)",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading\u2026",
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
    activeUnknown: "Auto-apply is unavailable: this Lumiverse version cannot identify the active Preset. Use the profile\u2019s Apply button.",
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
    autoActiveUnknown: "Setting Profiles skipped auto-apply: this Lumiverse version cannot identify the active Preset. Use the profile\u2019s Apply button.",
    undoRefused: "Undo cancelled: this Preset is open in the editor, but this Lumiverse version cannot apply changes through it. Select another Preset in Loom or reload the page, then try again.",
    undoAction: "Undo",
    noBackup: "No backup to undo.",
    editorReplyFailed: "The editor could not accept the values.",
    importEmpty: "No profiles imported.",
    samplerDisabled: "Samplers are off for this Preset, so the applied values will not affect generation. Enable samplers in the Preset editor or include \u2018Use sampler values = On\u2019 in the profile.",
    editorVariablesNote: "This Preset is open in the editor. Prompt Variables may display old values until you reload or select another Preset in Loom and return. The saved values have changed; editing other fields will not revert them. Saving the editor\u2019s Prompt Variables dialog before refreshing will restore the old variable values.",
    fallbackStaleNote: "The editor still has old Sampler values. Reload before editing and saving samplers, or the editor will overwrite the entire Sampler group with its old values. Editing other groups, such as blocks, does not affect samplers.",
    fallbackBlocks: "Applied directly to the server because the editor rejected this Preset\u2019s block format (a Preset data issue).",
    invalidJson: "Could not read the JSON.",
    invalidExport: "This file was not exported by this extension.",
    importSkipped: "Skipped an entry without a name or target Preset.",
    language: "\uC5B8\uC5B4 / Language",
    languageAuto: "Auto",
    languageKo: "\uD55C\uAD6D\uC5B4",
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
    deleteConfirm: "Delete profile \u2018{name}\u2019?",
    otherProfiles: "{count} profiles belong to other Presets. Select their Preset above to view them.",
    skippedVariables: " (Skipped {count} variables missing from the Preset)",
    appliedResult: "{action} completed.{skip}",
    noopResult: "{action}: values already match; no changes needed.",
    autoRefused: "Skipped auto-apply for \u2018{name}\u2019: this Lumiverse editor cannot accept extension updates while the Preset is open. Select another Preset in Loom or reload the page, then apply manually.",
    applyRefused: "Cancelled applying \u2018{name}\u2019: this Preset is open in the editor, but this Lumiverse version cannot apply through it. Old editor values could overwrite the update. Select another Preset in Loom or reload the page, then apply again.",
    applyFailed: "Could not apply \u2018{name}\u2019: {error}",
    autoApplyFailed: "Could not auto-apply \u2018{name}\u2019: {error}",
    applyAction: "Apply \u2018{name}\u2019",
    autoApplyAction: "Auto-apply \u2018{name}\u2019",
    bindingWarning: `
This chat has a Preset profile binding ({source}) that may override the Prompt Variables values.`,
    profileSaved: "Saved profile \u2018{name}\u2019.",
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
function translate(language, key, params = {}) {
  return messages[language][key].replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(params, name) ? String(params[name]) : match);
}
var translator = (language) => (key, params) => translate(language, key, params);
var message = (key, params) => ({ key, params });
var joinMessages = (parts, separator = "") => ({ parts, separator });
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
var counter = 0;
function newId(prefix) {
  counter = (counter + 1) % 1e6;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
function emptyStore() {
  return { version: 1, profiles: [], backups: {}, settings: { autoApply: false, language: "auto" } };
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
  return { version: 1, profiles, backups, settings: { autoApply: s.autoApply === true, language: normalizeLanguage(s.language) } };
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
function samplerDisabledWarning(preset, profile, language = "ko") {
  const t = translator(language);
  if (!Object.keys(profile.sampler).some((k) => k !== "enabled"))
    return null;
  const so = preset.parameters?.samplerOverrides;
  if (isObj(so) && so.enabled === true)
    return null;
  return t("samplerDisabled");
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
var EDITOR_VAR_NOTE = translate("ko", "editorVariablesNote");
function fallbackMessage(f, varsChanged) {
  const lead = f.detected || /^Invalid Loom/.test(f.reason) ? message("fallbackBlocks") : message("fallbackReason", { reason: f.reasonMessage ?? f.reason.slice(0, 120) });
  return message("fallbackNote", {
    lead,
    stale: message("fallbackStaleNote"),
    variables: varsChanged ? joinMessages([`
`, message("editorVariablesNote")]) : ""
  });
}
async function applyProfileViaEditor(host, store, profile, conn, editor, skipReason) {
  let fallback = skipReason ? { reason: skipReason, detected: true } : undefined;
  let ed = { changed: false, prev: {} };
  if (!fallback) {
    try {
      ed = await editor({ set: profile.sampler, remove: [] });
    } catch (e) {
      fallback = { reason: e instanceof Error ? e.message : String(e), detected: false, ...e instanceof LocalizedError ? { reasonMessage: e.localizedMessage } : {} };
    }
  }
  if (fallback)
    return { ...await applyProfile(host, store, profile, conn), fallback };
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
async function undoBackupViaEditor(host, store, presetId, editor, skipReason) {
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
  let fallback = skipReason ? { reason: skipReason, detected: true } : undefined;
  let ed = { changed: false, prev: {} };
  if (!fallback) {
    try {
      ed = await editor(patch);
    } catch (e) {
      fallback = { reason: e instanceof Error ? e.message : String(e), detected: false, ...e instanceof LocalizedError ? { reasonMessage: e.localizedMessage } : {} };
    }
  }
  if (fallback)
    return { ...await undoBackup(host, store, presetId), fallback };
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
function importProfiles(store, text, now = Date.now(), language = "ko") {
  const result = (added, keys) => ({
    added,
    errors: keys.map((key) => translate(language, key)),
    errorMessages: keys.map((key) => message(key))
  });
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return result(0, ["invalidJson"]);
  }
  if (!isObj(raw) || raw.format !== EXPORT_FORMAT || !Array.isArray(raw.profiles)) {
    return result(0, ["invalidExport"]);
  }
  let added = 0;
  const errors = [];
  for (const item of raw.profiles.slice(0, 200)) {
    const p = normalizeProfile({ ...isObj(item) ? item : {}, id: undefined, createdAt: now, updatedAt: now }, now);
    if (!p) {
      errors.push("importSkipped");
      continue;
    }
    p.name = uniqueName(store, p.presetId, p.name);
    store.profiles.push(p);
    added++;
  }
  return result(added, errors);
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
var SOURCE_KEYS = {
  chat: "source_chat",
  persona: "source_persona",
  character: "source_character",
  connection: "source_connection",
  defaults: "source_defaults"
};
function send(payload, userId, sessionId) {
  spindle.sendToFrontend(payload, userId, sessionId ? { frontendSessionId: sessionId } : undefined);
}
function localizedSender(language) {
  return (payload, userId, sessionId) => {
    if (payload.type === "result")
      send({ ...payload, message: payload.text, text: renderMessage(language, payload.text) }, userId, sessionId);
    else
      send(payload, userId, sessionId);
  };
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
function askEditor(userId, sessionId, presetId, language) {
  const t = message;
  return (patch) => new Promise((resolve, reject) => {
    if (!sessionId) {
      reject(new LocalizedError(t("editorSessionMissing"), language));
      return;
    }
    const reqId = newId("ed");
    const timer = setTimeout(() => {
      editorWaits.delete(reqId);
      reject(new LocalizedError(t("editorTimeout"), language));
    }, 15000);
    editorWaits.set(reqId, { resolve, reject, timer });
    send({ type: "editor_patch", reqId, presetId, set: patch.set, remove: patch.remove }, userId, sessionId);
  });
}
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
  const t = message;
  switch (r.status) {
    case "applied": {
      const skip = r.skipped.length ? t("skippedVariables", { count: r.skipped.length }) : "";
      return { level: r.skipped.length ? "warning" : "info", text: t("appliedResult", { action: what, skip }) };
    }
    case "noop":
      return { level: "info", text: t("noopResult", { action: what }) };
    case "missing":
      return { level: "error", text: t("presetMissing") };
    case "conflict":
      return { level: "error", text: t("conflict") };
  }
}
async function doApply(userId, sessionId, store, profile, chatId, activeConnectionId, switched, auto, ed = {}, activeHint, language = "ko") {
  const t = message;
  const send = localizedSender(language);
  const route = writeRoute(ed, profile.presetId, !!sessionId);
  const editorOpen = route === "editor";
  if (route === "refuse") {
    const text = auto ? t("autoRefused", { name: profile.name }) : t("applyRefused", { name: profile.name });
    if (auto)
      spindle.toast.warning(renderMessage(language, text), { userId });
    send({ type: "result", level: "warning", text, presetId: profile.presetId }, userId, auto ? undefined : sessionId);
    return;
  }
  const target = switched ? profile.connectionId : null;
  let r;
  try {
    r = editorOpen ? await applyProfileViaEditor(hostFor(userId), store, profile, { before: activeConnectionId, switchedTo: target }, askEditor(userId, sessionId, profile.presetId, language), ed.editorBlocksReject) : await applyProfile(hostFor(userId), store, profile, { before: activeConnectionId, switchedTo: target });
  } catch (e) {
    const text = t(auto ? "autoApplyFailed" : "applyFailed", { name: profile.name, error: t("unexpectedError") });
    if (auto)
      spindle.toast.error(renderMessage(language, text).slice(0, 500), { userId });
    send({ type: "result", level: "error", text, presetId: profile.presetId }, userId, auto ? undefined : sessionId);
    return;
  }
  await saveStore(userId, store);
  const d = describeResult(r, t(auto ? "autoApplyAction" : "applyAction", { name: profile.name }));
  let text = d.text;
  let level = d.level;
  if (r.status === "applied" || r.status === "noop") {
    const w = samplerDisabledWarning(r.preset, profile, language);
    if (w) {
      text = joinMessages([text, message("samplerDisabled")], `
`);
      level = "warning";
    }
  }
  if (r.fallback) {
    if (r.status === "applied") {
      text = joinMessages([text, fallbackMessage(r.fallback, Object.keys(profile.variables).length > 0)], `
`);
      level = "warning";
    }
  } else if (editorOpen && r.status === "applied" && Object.keys(profile.variables).length)
    text = joinMessages([text, t("editorVariablesNote")], `
`);
  if ((r.status === "applied" || r.status === "noop") && Object.keys(profile.variables).length) {
    const act = await active(userId, chatId, activeHint);
    if (act.source && act.source !== "none") {
      text = joinMessages([text, t("bindingWarning", { source: SOURCE_KEYS[act.source] ? t(SOURCE_KEYS[act.source]) : act.source })]);
      level = "warning";
    }
  }
  if (auto && (r.status !== "noop" || level === "warning"))
    spindle.toast[level](renderMessage(language, text).slice(0, 500), { userId });
  send({ type: "result", level, text, presetId: profile.presetId, switchConnection: r.status === "applied" || r.status === "noop" ? target : undefined }, userId, auto ? undefined : sessionId);
  send(await stateMsg(userId, chatId, store, false, activeHint), userId, sessionId);
}
async function handle(msg, userId, sessionId) {
  const language = msg.language === "en" ? "en" : "ko";
  const t = message;
  const send = localizedSender(language);
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
          send({ type: "result", level: "error", text: t("profileFieldsRequired") }, userId, sessionId);
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
        send({ type: "result", level: "info", text: t("profileSaved", { name: incoming.name }) }, userId, sessionId);
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
          send({ type: "result", level: "error", text: t("profileMissing") }, userId, sessionId);
          return;
        }
        await doApply(userId, sessionId, store, profile, msg.chatId, msg.activeConnectionId, msg.switched, false, msg, undefined, language);
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
            spindle.toast.warning(renderMessage(language, t("autoActiveUnknown")), { userId });
          }
          return;
        }
        if (!act.id)
          return;
        const profile = store.profiles.find((p) => p.presetId === act.id && p.autoConnectionIds.includes(msg.connectionId));
        if (!profile)
          return;
        await doApply(userId, sessionId, store, profile, msg.chatId, msg.connectionId, false, true, msg, msg.activePresetId, language);
      });
      return;
    case "undo":
      await serial(userId, async () => {
        const store = await loadStore(userId);
        const backup = store.backups[msg.presetId];
        const route = writeRoute(msg, msg.presetId, !!sessionId);
        const editorOpen = route === "editor";
        if (route === "refuse") {
          send({ type: "result", level: "warning", text: t("undoRefused"), presetId: msg.presetId }, userId, sessionId);
          return;
        }
        let r;
        try {
          r = editorOpen ? await undoBackupViaEditor(hostFor(userId), store, msg.presetId, askEditor(userId, sessionId, msg.presetId, language), msg.editorBlocksReject) : await undoBackup(hostFor(userId), store, msg.presetId);
        } catch (e) {
          send({ type: "result", level: "error", text: t("undoFailed", { error: t("unexpectedError") }), presetId: msg.presetId }, userId, sessionId);
          return;
        }
        await saveStore(userId, store);
        const d = describeResult(r, t("undoAction"));
        const hasVars = !!backup && Object.keys(backup.variables).length > 0;
        const text = r.status === "applied" ? t("undoSuccess", { note: r.fallback ? joinMessages([`
`, fallbackMessage(r.fallback, hasVars)]) : editorOpen && hasVars ? joinMessages([`
`, t("editorVariablesNote")]) : "" }) : r.status === "missing" && !backup ? t("noBackup") : d.text;
        const ok = r.status === "applied" || r.status === "noop";
        send({ type: "result", level: r.fallback && r.status === "applied" ? "warning" : d.level, text, presetId: msg.presetId, switchConnection: ok && backup?.connectionSwitchedTo ? backup.connectionBefore : undefined }, userId, sessionId);
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
        w.reject(msg.errorMessage ? new LocalizedError(msg.errorMessage, language) : msg.error ? new Error(msg.error) : new LocalizedError(t("editorReplyFailed"), language));
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
        const r = importProfiles(store, msg.text, Date.now(), language);
        if (r.added)
          await saveStore(userId, store);
        const text = r.added ? t("importCount", { count: r.added }) : t("importEmpty");
        send({ type: "result", level: r.errors.length ? "warning" : "info", text: joinMessages([text, ...r.errorMessages], `
`) }, userId, sessionId);
        send(await stateMsg(userId, null, store), userId, sessionId);
      });
      return;
    case "set_settings":
      await serial(userId, async () => {
        const store = await loadStore(userId);
        if (typeof msg.settings.autoApply === "boolean")
          store.settings.autoApply = msg.settings.autoApply;
        if (msg.settings.language === "auto" || msg.settings.language === "ko" || msg.settings.language === "en")
          store.settings.language = msg.settings.language;
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
    const language = payload.language === "en" ? "en" : "ko";
    const t = message;
    const send = localizedSender(language);
    const text = t("unexpectedError");
    spindle.toast.error(renderMessage(language, text), { userId });
    send({ type: "result", level: "error", text, refresh: false }, userId, frontendSessionId);
  });
});
