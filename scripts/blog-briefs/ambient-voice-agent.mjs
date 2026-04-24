/**
 * Blog brief — Ambient Voice Agent (首篇) — v2
 *
 * v2 changes:
 * - 方案 X: 故事主线贯穿（作者第一人称 + 做饭朋友场景回收）
 * - 新增 §0 Thesis 段
 * - 每段加 opensWith + transitionsToNext（强制 Gemini 写桥接）
 * - Style reference: Karpathy + Ben Thompson + DHH
 * - 做饭朋友细节升级：UX 交互设计师，用 Stitch 语音设计另一个知名 Agent App
 */

export const BRIEF = {
  slug: 'ambient-voice-agent',
  titleVariants: {
    blog: 'Stop opening ChatGPT. Start talking to your screen.',
    hn: 'Why I stopped typing commands and started talking to my Mac',
    social: 'The agent should come to you, not the other way around',
  },
  urlSlug: '/blog/ambient-voice-agent',
  metaDescription:
    "2026's AI agents all live in CLIs and browser tabs. They should live on your screen, next to what you're already doing. Here's why Cue is betting on ambient voice agents.",
  publishDate: '2026-04-21',
  author: 'Oscar Zamora, Cue',
  targetWords: 2500,

  styleReference: {
    primary: 'Andrej Karpathy',
    primaryNote: 'First-person tech observer. Specific details ("three months", "hands covered in flour"). Understated openings.',
    secondary: 'Ben Thompson (Stratechery)',
    secondaryNote: 'Market mapping and positioning. Big picture before zoom-in.',
    spice: 'DHH',
    spiceNote: 'Willing to state a position clearly. One or two declarative sentences per essay that nobody can miss.',
  },

  characterContinuity: {
    mainCharacter: 'The author (first-person "I") — a builder who discovered voice coding, then realized the implication was bigger.',
    supportingCharacter: 'A friend, UX designer at a well-known AI agent app company. She cooks dinner while designing the interaction patterns of another agent product, using Google Stitch on Mac + iPad, entirely by voice conversation.',
    characterUsage: [
      '§1: Introduce both scenes — author voice-coding, friend cooking-and-designing',
      '§4: Brief callback — "my friend in the kitchen doesn\'t open a terminal. She doesn\'t need to."',
      '§8: Full return — she finishes cooking, the App design is done, she never touched a keyboard. And the product she was designing? Another ambient voice agent. We\'re all building the same future from different directions.',
    ],
  },

  pullQuotes: [
    "Your agent doesn't need a better brain. It needs a better front door.",
    'Everyone is wrapping models. Cue wraps harder.',
    'The deeper the model goes, the stronger Cue gets.',
  ],

  thesis:
    'The best agents of 2026 are locked behind doors most users will never open. The CLI, the chat window, the browser tab. This post is about what happens when you stop asking users to walk to the agent, and instead bring the agent to where the user already is. Voice is the front door. Ambient is the form factor. Cue is the bet.',

  outline: [
    {
      id: 0,
      heading: null, // no heading, this is the thesis opener
      wordTarget: 180,
      opensWith: 'A clean thesis statement in 3-4 sentences. Ben Thompson style: frame the whole post in one breath.',
      beats: [
        'Open: "2026 has given us extraordinary AI agents. Claude Code. Manus. Genspark. OpenClaw. Hermes. They can reason, use tools, and solve problems that felt impossible a year ago."',
        'Turn: "But almost all of them live in the same three places: a command line, a chat window, or a browser tab."',
        'Thesis: "This post is about what happens when you stop making users walk to the agent, and bring the agent to the user instead. Voice is the front door. Ambient is the form. We call it an ambient voice agent, and it\'s the bet we\'re making with Cue."',
      ],
      transitionsToNext: 'Before I explain what ambient voice agent means, let me tell you where the idea came from. It started with two moments, two months apart.',
    },
    {
      id: 1,
      heading: 'Two moments that changed my mind',
      wordTarget: 350,
      opensWith: 'Karpathy style: quiet first-person, specific number ("three months ago"), no hype.',
      beats: [
        'Moment 1: Three months ago, reading an Andrej Karpathy tweet about voice coding. Curious, plugs an early Cue build into Claude Code. Starts talking instead of typing. First thing noticed was not speed, but flow state — the kind of deep focus he hadn\'t felt since his first year of programming.',
        'Specific detail: "The keyboard had always been a latency layer. Voice just... removed it."',
        'Moment 2: Two weeks later, a friend — a UX designer at a well-known agent app company — tells him she\'s been designing interaction patterns entirely by voice. She uses Google Stitch on Mac and iPad, speaking her design decisions into the AI, while cooking dinner. Hands covered in flour. Never touches a keyboard. At the end of the evening, the App screens are done.',
        'Specific detail: "She was using one voice-AI product to design another voice-AI product. Without thinking about it."',
        'The realization: "That was the moment I stopped thinking of voice as an engineer\'s shortcut. It\'s not about dictation speed. It\'s about where the agent is allowed to show up."',
      ],
      transitionsToNext: 'To understand what that means, look at where every other agent in 2026 actually lives.',
    },
    {
      id: 2,
      heading: "Where 2026's agents actually live",
      wordTarget: 300,
      opensWith: 'Ben Thompson style: quick landscape survey. No hype, just the map.',
      beats: [
        'Landscape survey: Claude Code in terminal. Cursor in IDE. Manus in browser. Genspark in browser. OpenClaw and Hermes as open-source loops you embed into your own UI.',
        'The pattern: almost all of them require the user to stop what they are doing and enter a dedicated environment.',
        'Why: CLI and browser are the native habitats of developers. But developers are not the default user anymore. They are the early case.',
        'DHH-style one-liner: "An agent that lives in a terminal is an agent for engineers. That\'s fine. But it\'s not the future of work. It\'s the history of it."',
      ],
      transitionsToNext: 'The obvious reaction is: fine, so let\'s replace the terminal with voice. But that misses the actual shift.',
    },
    {
      id: 3,
      heading: "Voice isn't the opposite of CLI. It's the opposite of a learning curve.",
      wordTarget: 280,
      opensWith: 'A sharp clarification. This section exists to prevent the obvious misread ("oh you\'re anti-CLI"). Be direct.',
      beats: [
        'Clarify: "We are not anti-CLI. We use the terminal every day. The point is not that CLI is bad. The point is that CLI has a learning curve, and voice does not."',
        'The real value: you already know how to talk. There\'s no syntax, no flags, no man page. Intent, directly.',
        'Zoom out: voice is already the default on phones (Siri), cars (CarPlay), homes (Alexa), soon cars and AR. The desktop is the last holdout, and only because engineers built the desktop for themselves.',
        'Close: "Voice is the input layer with the shortest distance between what you want and what gets done."',
      ],
      transitionsToNext: 'But voice alone is just dictation. What turns voice into an agent is what happens after the words stop.',
    },
    {
      id: 4,
      heading: 'Ambient: the agent comes to you',
      wordTarget: 380,
      opensWith: 'Definitional section. Clear, almost textbook, but with a callback to the friend in the kitchen.',
      beats: [
        'Define ambient voice agent: a voice-triggered agent that lives on your screen, not in a separate window. A floating bar. A dynamic panel that appears only when needed.',
        'Key mechanism: Cue reads five layers of context automatically — voice, selected text, screenshot, macOS AX attributes, active app. The user never describes their context. The agent sees it.',
        'Contrast: a standalone agent (Manus, Claude Code) is separate from your work. You feed it context. A symbiotic agent is already in your context.',
        'Callback: "My friend in the kitchen doesn\'t open a terminal. She doesn\'t need to. Stitch knows she\'s in a design file because the design file is what\'s on screen. Voice says what. Screen says where. The agent does the rest."',
        'Pull quote placement: "Your agent doesn\'t need a better brain. It needs a better front door."',
      ],
      transitionsToNext: 'That sounds clean in theory. In practice, ambient works or fails on one thing: whether the agent can actually see what you\'re pointing at. Let me show you with Microsoft Office.',
    },
    {
      id: 5,
      heading: 'The Office case: why describing context kills agents',
      wordTarget: 450,
      opensWith: 'Simon Willison style: concrete, technical, names real APIs and constraints.',
      beats: [
        'Scenario: user in Excel, selects a cell. Says "translate this, format it as a bullet list, and summarize it in one sentence." Multi-step task.',
        'CLI agent problem: has to ask "which cell? which file? column B row 3 of Sheet1?" This is the friction that kills voice agents. Nobody wants to talk like a spreadsheet coordinate system.',
        'Cue approach: macOS Accessibility API reads the selected text, the window title, the focused input attributes. Windows uses a narrower equivalent with clipboard fallback when AX parity is missing. In browser apps, JavaScript injection reads DOM structure. Screenshot + vision as the last resort.',
        'Engineering honesty: "To reliably identify a specific cell in Office, you sometimes need plugin-level JavaScript injection. Without that, you fall back to the clipboard, which is lossy. We built Cue to always use the highest-fidelity context channel available, and to degrade gracefully when it isn\'t."',
        'Take-away: "The agent\'s intelligence is bottlenecked by what it can see. Vision is not a feature. It\'s the substrate."',
      ],
      transitionsToNext: 'So you have two problems, not one. The input problem (voice) and the output problem (context and execution). They sit on different axes, and almost nobody solves both.',
    },
    {
      id: 6,
      heading: 'Voice is hard. Agents are hard. They are hard in different ways.',
      wordTarget: 360,
      opensWith: 'Frame the two-axis problem cleanly. Ben Thompson style.',
      beats: [
        'Input axis (voice): noise, accent, speed, accuracy. Cue stack: Deepgram Nova-2 in the cloud, Whisper locally as an option, Gemini Flash for polish (punctuation, casing, tone matching the destination app). Also experimenting with Gemma for even lower latency, eventually on-device.',
        'Output axis (agent execution): permissions, context acquisition, environment-specific quirks. Office example above. Browser sandbox. macOS TCC. Windows UIA. Each environment has its own rules.',
        'The honest observation: "These two problems are rarely mastered by the same team. That\'s why Wispr is world-class at input and almost nothing at output. It\'s why Manus is world-class at output and barely touches input. The middle, where voice turns into action across any app, is where Cue sits."',
        'Pull quote placement: "Everyone is wrapping models. Cue wraps harder."',
      ],
      transitionsToNext: 'If our value isn\'t the model, and isn\'t the voice engine, and isn\'t the agent loop — what is it?',
    },
    {
      id: 7,
      heading: 'Wrap harder: the philosophy',
      wordTarget: 400,
      opensWith: 'DHH-style thesis delivery. Declarative, unapologetic.',
      beats: [
        'Answer: "We wrap harder than anyone else. That\'s the philosophy."',
        'Three pillars of wrapping hard: (1) the deepest possible permissions on the user\'s system, (2) the richest context from the active scene, (3) the most natural, companion-like form factor.',
        'Credit to OpenClaw and Hermes: their agent loops and tool-use patterns are the right answer for the brain. Cue doesn\'t try to rebuild that. We build the last mile — the interface between that brain and the user\'s intent.',
        'Core belief: "Code, as chain-of-thought reasoning plus tool use, solves almost anything. The question is not whether the brain works. It\'s whether the user can get to it without leaving what they\'re doing."',
        'Anti-fragility: "The better the underlying models get, the more we win. Our value is not in reasoning. It\'s in the entry and exit points for reasoning. Every time Claude or Gemini ships a smarter model, Cue gets sharper without us writing a line."',
        'Memory: "And because Cue is always there, it learns. The patterns you repeat, the apps you live in, the kind of tasks you hand off. That accumulation is a unique asset. Models don\'t have it. Cue does."',
        'Pull quote placement: "The deeper the model goes, the stronger Cue gets."',
      ],
      transitionsToNext: 'Which brings me back to my friend in the kitchen.',
    },
    {
      id: 8,
      heading: 'Back to the kitchen',
      wordTarget: 200,
      opensWith: 'Story return. The friend scene closes. Short paragraphs. Emotional weight without sentimentality.',
      beats: [
        'Scene return: it\'s the end of the evening. Dinner is on the table. The App design is done. She never opened a terminal. She never touched a keyboard. She talked.',
        'The payoff: "And the App she was designing? Another ambient voice agent. A different team, a different product, the same bet. We\'re all building toward the same future from different directions. The agents that win are the ones that come to the user."',
        'Final line before signature: "That future is not built in a terminal. It\'s built on your screen, next to whatever you\'re already doing."',
        'Three-line signature (verbatim): They hear what you said. / Cue sees what you\'re doing. / And does the thing, in any app.',
        'CTA: [Try Cue free. No credit card.](https://heycue.io)',
      ],
      transitionsToNext: null,
    },
  ],

  factsToRespect: [
    'Cue 平台：macOS 13+ (Apple Silicon + Intel) 和 Windows 10 1809+ (x64 only)',
    'macOS AX API 可以读选中文字、窗口标题、输入框属性；Windows 等价功能更窄，剪贴板做 fallback',
    'Free tier: 20 agent credits/day, unlimited dictation',
    'Plus tier: $9.99/mo, unlimited',
    'Models: Gemini Flash (polish) / Claude Sonnet 4.6 (Free agent) / Claude Opus 4.7 (Plus agent) / Deepgram Nova-2 (STT) / Whisper (optional local)',
    '5 layers of context: voice + selected text + screenshot + AX attributes + app name',
    '20+ voice languages supported',
    '不要声称 v0.6 功能：Tasks/Cron, Skill 进化, Memory, 长语音, Hey Cue 都 not shipped',
    '不要说 "first"、"best"、"only" 没数据 backing',
    '不要编用户数 / 企业客户 / benchmark 数据',
    '做饭朋友是"非常知名的 Agent 应用产品"的 UX 设计师。不点名具体产品（保护隐私），可以说 "a well-known AI agent app" 或 "a widely-used agent product"',
  ],

  ceoAnswers: {
    q1: `我自己用语音+Claude Code开发，效率提升非常大，且很容易进入强心流。灵感来自 Andrej Karpathy 的推文。另一个场景：有朋友边做饭边用 Mac 和 iPad 用 Stitch 进行设计。她是一家非常知名的 Agent 应用产品的 UX 交互设计师，用纯对话语音交互完成了 App 界面设计。`,
    q2: `我们并不是没用 CLI 和浏览器，而是语音这种更自然的交互方式对用户无学习成本。且从长期来看，未来很多设备都会用这种更自然的方式。`,
    q3: `OpenClaw / Hermes 极致套壳（最极致的权限和更合适的场景上下文），基本能解决所有问题。但语音 + 输入法式的伴随形态，更利于嵌入用户真实工作流，共生式 Agent，这是 OpenClaw / Hermes 在产品心智上无法那么好办到的。例如用户在 Office 场景里要选中一段话让 Agent 做多维度任务，但 Agent 不知道是哪段话或哪个文件，用户也没法自然描述。Cue 会在当前场景以一种更自然的方式（悬浮条、动态交付面板）看到屏幕，知道选取了什么，自动评估要不要开 agent session。`,
    q4: `核心是输入输出。Voice 的难点是输入（环境、习惯、准确度、速度；我们尝试接入 Google Gemma、Whisper 加速及解决歧义，包括 polish 模型选型）。Agent 的难点是执行和输出（权限、上下文获取有环境差异。例如 Office 场景定位表格单元格、行列，有时必须用 JS，权限必须插件级，否则只能剪贴板 fallback）。`,
    q5: `大家都是套壳，但 Cue 的设计思路是最极致的套壳：语音交互，前端没有复杂交互界面，输入法式的伴随共生设计，越用越懂你，核心围绕 Hermes 设计理念。代码（思维链和工具使用）解决一切问题。模型越强，用得越久，Cue 就越强。`,
  },

  brandVoice: {
    signatureLine:
      "They hear what you said.\nCue sees what you're doing.\nAnd does the thing, in any app.",
    banned: [
      'delve', 'crucial', 'robust', 'comprehensive', 'nuanced', 'leverage',
      'seamless', 'unlock', 'transform', 'unleash', 'empower',
      'revolutionary', 'breakthrough', 'unparalleled', 'best-in-class',
      '—',
    ],
    style: [
      'American English spelling',
      'Short paragraphs (≤ 3 sentences)',
      'Direct, factual',
      'First-person founder essay (not press release)',
      'No em dashes; use commas, periods, or "and"',
      'Every section MUST open with the opensWith cue and end with the transitionsToNext bridge',
      'The two characters (author, friend in kitchen) MUST thread through the piece per characterUsage',
    ],
  },
}
