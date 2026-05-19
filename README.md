# Vue 3 + TypeScript + Vite

Các thư viện cần cài để render từ md sang html
`npm i unified remark-parse remark-gfm remark-rehype rehype-stringify rehype-slug rehype-autolink-headings rehype-sanitize gray-matter`

- unified : pipeline engine
- remark-parse : parse markdown
- remark-gfm: table/task list
- remark-rehype : convert markdown AST → HTML AST
- rehype-autolink-headings : auto anchor heading
- rehype-sanitize : chống XSS
- rehype-slug : tạo heading id
- rehype-stringify : HTML stringify

Sơ đồ đầy đủ
┌────────────────┐
│ markdown file  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ parse meta     │
└───────┬────────┘
        │
        ├─────────────► meta
        │
        ▼
┌────────────────┐
│ markdown body  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ remark-parse   │
│ markdown AST   │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ custom plugin  │
│ extract TOC    │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ remark-rehype  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ rehype-slug    │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ rehype-stringify
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ HTML string    │
└────────────────┘