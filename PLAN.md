# LovelyAlert — Kế hoạch xây dựng thư viện alert hiện đại + MCP server

## Context (Vì sao làm dự án này)

Bạn muốn xây dựng **thư viện alert / modal / toast của riêng mình** — **LovelyAlert** — một
**sản phẩm độc lập, mang bản sắc riêng**, với bộ tính năng đầy đủ và hiện đại. (SweetAlert2 —
https://sweetalert2.github.io/ — chỉ dùng làm **mốc đối chiếu tính năng** để không bỏ sót.) Yêu cầu:

1. **Layout đẹp, hiện đại**, có **dark mode / light mode / auto** (theo hệ thống).
2. **API riêng, hiện đại** — builder pattern + convenience methods, typed, tree-shakeable (không sao chép API của thư viện khác).
3. **Nhiều tính năng mới**: toast nâng cao, input phong phú, hiệu ứng & âm thanh, theme builder + wrappers + i18n.
4. **Đẩy lên MCP** (cả `stdio` qua `npx` lẫn `HTTP/SSE` hosted) để **bất kỳ AI nào cũng tham khảo / sinh code** được.
5. Trang **docs + playground** dùng **Astro + React islands**.

**Kết quả mong muốn:** một monorepo gồm thư viện lõi `lovely-alert`, các wrapper framework,
một trang docs/playground đẹp, và một MCP server — tất cả dùng chung **một catalog ví dụ duy nhất**
làm nguồn sự thật (single source of truth) để docs/MCP/test không bao giờ lệch nhau.

> **Trạng thái hiện tại:** Phase 0 (scaffold monorepo) đã xong. Thư mục dự án đã có khung pnpm workspaces, build/typecheck/lint chạy được. Sẵn sàng bắt đầu Phase 1.

---

## Mốc đối chiếu tính năng (tham chiếu SweetAlert2 v11, trích từ `sweetalert2.d.ts`)

Plan này cam kết phủ **toàn bộ** API surface dưới đây — chỉ là đổi sang cú pháp mới:

- **~90 options:** title/titleText/text/html/icon/iconColor/iconHtml/footer/template/backdrop/toast/draggable/target/width/padding/color/background/position/grow/animation/theme/showClass/hideClass/customClass/timer/timerProgressBar/heightAuto/allowOutsideClick/allowEscapeKey/allowEnterKey/stopKeydownPropagation/keydownListenerCapture/showConfirmButton/showDenyButton/showCancelButton/(confirm|deny|cancel)ButtonText/(…)Color/(…)AriaLabel/buttonsStyling/reverseButtons/focus(Confirm|Deny|Cancel)/returnFocus/showCloseButton/closeButtonHtml/closeButtonAriaLabel/loaderHtml/showLoaderOn(Confirm|Deny)/pre(Confirm|Deny)/imageUrl/imageWidth/imageHeight/imageAlt/inputLabel/inputPlaceholder/inputValue/inputOptions/inputAutoFocus/inputAutoTrim/inputAttributes/returnInputValueOnDeny/validationMessage/progressSteps/currentProgressStep/progressStepsDistance/willOpen/didOpen/didRender/willClose/didClose/didDestroy/scrollbarPadding/topLayer/input/inputValidator.
- **18 input types:** text, email, password, number, tel, search, range, textarea, select, radio, checkbox, file, url, date, datetime-local, time, week, month.
- **5 icon:** success, error, warning, info, question.
- **15 position:** top / top-(start|end|left|right) / center / center-(…) / bottom / bottom-(…).
- **~50 method:** fire, mixin, isVisible, update, close, get* (Container/Popup/Title/Icon/Buttons/Input/Footer/TimerProgressBar…), enable/disableButtons, showLoading/hideLoading/isLoading, click(Confirm|Deny|Cancel), show/resetValidationMessage, enable/disableInput, timer control (getTimerLeft/stop/resume/toggle/isTimerRunning/increaseTimer), bindClickHandler, isValidParameter, isUpdatableParameter, argsToParams.
- **6 lifecycle hook:** willOpen, didOpen, didRender, willClose, didClose, didDestroy (+ event emitter on/once/off).
- **5 dismiss reason:** cancel, backdrop, close, esc, timer.
- **Themes:** light, dark, **auto**, minimal, borderless, bootstrap-4/5(+light/dark), material-ui(+light/dark), bulma(+light/dark), embed-iframe.

---

## Kiến trúc tổng thể (3 phần + catalog dùng chung)

```
lovely-alert-mcp/                 (monorepo, pnpm workspaces)
├─ PLAN.md                        ← bản plan này (đã copy vào repo ở Phase 0)
├─ pnpm-workspace.yaml
├─ package.json                   (scripts gốc, changesets)
├─ tsconfig.base.json
├─ biome.json
├─ .github/workflows/ci.yml
├─ packages/
│  ├─ core/        → npm "lovely-alert"          (THƯ VIỆN LÕI, vanilla TS, 0 deps runtime)
│  ├─ react/       → npm "@lovely-alert/react"   (wrapper hook/component)
│  ├─ vue/         → npm "@lovely-alert/vue"      (wrapper composable/plugin)
│  └─ mcp/         → npm "lovely-alert-mcp"       (MCP server: stdio + HTTP)
├─ shared/
│  └─ catalog/     → "@lovely-alert/catalog"      (SINGLE SOURCE OF TRUTH: mọi ví dụ + metadata)
└─ apps/
   └─ docs/        (Astro + React islands: docs, playground, theme builder, gallery)
```

**Nguyên tắc cốt lõi:** docs site, MCP resources, và test **đều đọc từ `shared/catalog`**.
Mỗi ví dụ trong catalog có: `id, category, title, description, code (API mới), options, tags, demoFn`.
→ Sửa 1 chỗ, cả docs + MCP + test cùng cập nhật, không drift.

### Tech stack
- **Lõi:** TypeScript, build bằng **Vite library mode** (ESM + CJS + `.d.ts` + UMD CDN), **0 runtime deps**.
- **CSS:** thuần + **CSS custom properties (design tokens)**, không phụ thuộc framework CSS. Dark/light/auto qua `data-theme` + `prefers-color-scheme`.
- **Docs:** **Astro** (static) + **React islands** cho phần tương tác; editor playground dùng **CodeMirror 6**; preview chạy thật `lovely-alert`.
- **MCP:** `@modelcontextprotocol/sdk` (TypeScript), transport **stdio** + **Streamable HTTP**.
- **Test:** **Vitest** (unit) + **Playwright + @axe-core/playwright** (e2e & a11y).
- **Tooling:** pnpm workspaces, **Changesets** (versioning/publish), **Biome** (lint+format), GitHub Actions CI.

> **Lưu ý môi trường:** Node hiện tại 18.20.2. Astro 5 / Vite mới có thể yêu cầu Node >= 20 — cân nhắc nâng Node lên 20 LTS trước Phase 9. Vite 5 đã pin cho Phase 0–8 để chạy tốt trên Node 18.

---

## Thiết kế API mới (định hướng — chốt chi tiết ở Phase 1)

```ts
import { la } from 'lovely-alert'

// 1) Convenience methods (phủ icon success/error/warning/info/question)
await la.success('Đã lưu!', 'Thay đổi của bạn đã được lưu.')
await la.error('Lỗi', 'Có sự cố xảy ra.')
const ok = await la.confirm('Xoá mục này?', { confirmText: 'Xoá', danger: true })

// 2) Prompt (gói mọi input type + validate async)
const name = await la.prompt('Tên bạn?', { input: 'text', validate: v => !!v || 'Bắt buộc' })

// 3) Toast (vị trí, timer, stack — xem Phase 5/6)
la.toast.success('Đã sao chép', { position: 'top-end', duration: 2500 })

// 4) Low-level open() — toàn quyền, trả Promise<Result>
const r = await la.open({ title, html, icon, input, buttons, theme, timer, draggable, ... })
// r = { confirmed, denied, dismissed, value, dismissReason }

// 5) Fluent builder cho power-user (mọi option đều map được)
await la.build()
  .title('Đăng ký').icon('question')
  .input('email', { placeholder: 'you@example.com', validate: isEmail })
  .confirmButton('Đăng ký').cancelButton()
  .timerProgress(0).draggable().show()

// 6) Defaults / mixin & control runtime
const myToast = la.mixin({ toast: true, position: 'top-end', timer: 3000 })
la.theme.set('auto')                 // 'light' | 'dark' | 'auto' | <custom>
const inst = la.current(); inst.showLoading(); inst.update({...}); inst.close()
```

**Mapping đảm bảo parity:** mọi option SweetAlert2 đều có lối vào qua `open(options)` (đặt tên gọn hơn:
`buttons.confirm.text` thay `confirmButtonText`…) **và** builder. Sẽ kèm bảng mapping đầy đủ trong `docs/migration`.

---

## CÁC PHASE (chia rõ ràng, mỗi phase có Mục tiêu · Việc làm · Sản phẩm · Cách kiểm thử)

> **Các mốc milestone & điểm dừng review:**
> - **🏁 Sau Phase 5 = "v1.0 thư viện"** — thư viện chạy được, accessible, có dark/light/auto, đủ 18 input + toast, **parity 100% với SweetAlert2**. Từ Phase 6 trở đi là nâng cao/phân phối.
> - **⏸️ Điểm review đề xuất sau Phase 5:** chốt phần lõi rồi cùng bạn xem lại trước khi làm tiếp nhánh extras/wrappers/docs/MCP — tránh đi quá xa rồi mới đổi hướng.
> - **🏁 Sau Phase 9–10 = docs công khai + MCP live.**

### Phase 0 — Khởi tạo nền móng monorepo ✅ ĐÃ XONG
- **Mục tiêu:** bộ khung build/test/lint/CI chạy được, có PLAN.md trong repo.
- **Việc:** `git init`; pnpm workspaces; `tsconfig.base`; Biome; Vitest; Playwright; Changesets; GitHub Actions (lint+test+build); tạo skeleton 6 package/app; **copy bản plan này vào `./PLAN.md`** (việc đầu tiên).
- **Sản phẩm:** `pnpm install && pnpm -r build` chạy sạch (skeleton).
- **Kiểm thử:** CI xanh; `pnpm -r typecheck` pass.

### Phase 1 — Core engine + API mới + options model
- **Mục tiêu:** mở/đóng modal, vòng đời, Promise result, API mới (convenience + `open` + builder + mixin/update/close).
- **Việc:** render engine + cấu trúc DOM (container/popup/icon/title/html/actions/footer/close); `Result` object (confirmed/denied/dismissed/value/dismissReason); state machine vòng đời; map **toàn bộ ~90 option** vào model nội bộ; `mixin()` defaults; `update()`; `current()`/getters.
- **Sản phẩm:** `la.open()`, `la.success/error/...`, `la.confirm`, builder, `mixin` hoạt động.
- **Kiểm thử:** Vitest cho state machine + Promise resolution; demo HTML thủ công.

### Phase 2 — Visual, theming, dark/light, icon, animation, position
- **Mục tiêu:** "đẹp & hiện đại" + dark/light/auto.
- **Việc:** hệ **design tokens** (CSS vars); themes **light/dark/auto** + minimal/borderless (bootstrap/material/bulma để optional sau); 5 **icon SVG động**; animation `showClass/hideClass` + `grow`; **15 position**; responsive; `draggable`; `topLayer` (Popover API) + fallback; `backdrop/background/color/width/padding/customClass`.
- **Sản phẩm:** chuyển theme runtime mượt; auto theo `prefers-color-scheme`.
- **Kiểm thử:** Playwright screenshot light vs dark; kiểm tra biến CSS.

### Phase 3 — Accessibility & tương tác (PHASE RIÊNG — phần khó nhất)
- **Mục tiêu:** đạt chuẩn WAI-ARIA như SweetAlert2 (đây là 80% vô hình mà bản nhái hay fail).
- **Việc:** ARIA roles (`dialog`/`alertdialog`), **focus trap**, `returnFocus`; bàn phím ESC/Enter/Tab; `allowOutsideClick/allowEscapeKey/allowEnterKey/stopKeydownPropagation/keydownListenerCapture`; **scroll lock + scrollbarPadding**; **screen-reader live announce**; **RTL**.
- **Sản phẩm:** điều hướng full bàn phím, không "focus thoát" modal.
- **Kiểm thử:** **Playwright + axe** 0 vi phạm; test tab-order & ESC/backdrop dismiss reasons.

### Phase 4 — Inputs & validation
- **Mục tiêu:** đủ **18 input type** + validate + loader.
- **Việc:** render 18 input; `inputOptions` (select/radio), `inputValue/inputPlaceholder/inputLabel/inputAttributes/inputAutoFocus/inputAutoTrim`; `validate`/`inputValidator` (sync+async); `preConfirm/preDeny` + `showLoaderOnConfirm/Deny`; `showValidationMessage/reset`; `returnInputValueOnDeny`.
- **Sản phẩm:** `la.prompt()` + form trong modal hoạt động, validate async + loading.
- **Kiểm thử:** Vitest/Playwright cho từng input type & nhánh validate.

### Phase 5 — Toast, timer, queue, progress steps
- **Mục tiêu:** toast + đếm giờ + chuỗi modal.
- **Việc:** chế độ `toast`; `timer` + `timerProgressBar` + control (stop/resume/toggle/increase/getTimerLeft); `progressSteps/currentProgressStep/progressStepsDistance`; queue/chaining nhiều bước.
- **Sản phẩm:** toast tự đóng có progress; wizard nhiều bước.
- **Kiểm thử:** test thời gian (fake timers) + dismissReason=`timer`.

### Phase 6 — Tính năng MỞ RỘNG (cả 4 nhóm bạn chọn)
- **6a. Toast nâng cao:** **stack** nhiều toast, **queue**, **Notification Center** (lịch sử + **undo**).
- **6b. Input phong phú:** **OTP/PIN**, **rating sao**, **color picker**, **tags input**, **date-range**.
- **6c. Hiệu ứng & âm thanh:** **confetti** khi success, **icon động (Lottie/SVG)**, **âm thanh** tuỳ chọn theo loại alert (tôn trọng `prefers-reduced-motion`).
- **6d. Theme builder (runtime):** chỉnh token trực tiếp + **export CSS variables**; lưu preset.
- **Sản phẩm:** mỗi tính năng có demo trong catalog.
- **Kiểm thử:** unit cho logic (stack order, undo, validate OTP…) + e2e demo.

### Phase 7 — Framework wrappers + i18n
- **Mục tiêu:** dùng được trong React/Vue + đa ngôn ngữ.
- **Việc:** `@lovely-alert/react` (hook `useAlert` + `<Alert/>` JSX content); `@lovely-alert/vue` (composable + plugin); **Web Component** `<lovely-alert>`; hệ **i18n** (locale pack: nút/aria/validation; sẵn vi + en).
- **Sản phẩm:** ví dụ React & Vue chạy; đổi locale runtime.
- **Kiểm thử:** test render wrapper; snapshot i18n.

### Phase 8 — Catalog ví dụ (SINGLE SOURCE OF TRUTH)
- **Mục tiêu:** gom mọi ví dụ + metadata vào `shared/catalog` để docs/MCP/test dùng chung.
- **Việc:** định nghĩa schema (`id/category/title/description/code/options/tags/demoFn`); populate **đầy đủ** ví dụ cho mọi tính năng các phase trên; export typed.
  *(Schema khai báo sớm từ Phase 1, populate dần mỗi phase, chốt ở đây.)*
- **Sản phẩm:** `@lovely-alert/catalog` build ra; test xác thực mọi `code` parse được.
- **Kiểm thử:** Vitest chạy `demoFn` của từng entry không lỗi.

### Phase 9 — Docs + Playground site (Astro + React islands)
- **Mục tiêu:** trang đẹp, hiện đại, dark/light/auto, **playground sống**.
- **Việc:** layout hiện đại + sidebar + search; nút **dark/light/auto**; **Playground island** (CodeMirror + preview chạy thật, share URL); **Gallery** sinh từ catalog; **Theme Builder island**; **API reference** auto từ `.d.ts`; trang **Migration từ SweetAlert2** (bảng mapping); copy-code.
- **Sản phẩm:** `pnpm --filter docs dev` xem được; build **tĩnh** deploy **GitHub Pages** hoặc **Cloudflare Pages** (free, vĩnh viễn — không cần server).
- **Kiểm thử:** Playwright smoke (playground render preview; theme toggle; gallery liệt kê từ catalog).

### Phase 10 — MCP server (stdio + HTTP)
- **Mục tiêu:** AI tham khảo & sinh code API mới; đọc cùng catalog.
- **Tools:** `generate_alert` (mô tả NL → code API mới), `list_features`, `get_example`, `search_examples`, `get_api_reference`, `customize_theme` (sinh CSS vars), `validate_options`.
- **Resources:** `docs://overview`, `catalog://examples`, `api://reference`, `themes://presets`.
- **Prompts:** template alert thường gặp (confirm xoá, toast, form…).
- **Transport:** **stdio** (chạy `npx lovely-alert-mcp`) là **kênh phân phối CHÍNH** ($0, không cần server) **và** **Streamable HTTP** (`--http --port`) là tùy chọn (host free trên Cloudflare Workers nếu muốn 1 URL công khai).
- **Sản phẩm:** kèm snippet cấu hình cho Claude Desktop/Code & Cursor (stdio + URL).
- **Kiểm thử:** **@modelcontextprotocol/inspector** liệt kê & gọi tool; assert output khớp catalog.

### Phase 11 — Test toàn diện & hardening
- **Mục tiêu:** chất lượng phát hành.
- **Việc:** nâng coverage unit; e2e + **axe** trên các luồng chính; cross-browser (Chromium/Firefox/WebKit); kiểm `prefers-reduced-motion`; bundle-size budget cho core; smoke test build CDN/UMD.
- **Kiểm thử:** `pnpm -r test` + `pnpm e2e` xanh trong CI.

### Phase 12 — Publish & phân phối (RIÊNG — cần bạn đồng ý + credentials)
- **Mục tiêu:** "đẩy lên" thực sự.
- **Việc:** README/LICENSE/CHANGELOG; **Changesets** version; **npm publish** `lovely-alert`, `@lovely-alert/react|vue`, `lovely-alert-mcp` (stdio qua `npx` — kênh phân phối chính, $0); deploy docs lên **GitHub Pages / Cloudflare Pages**; **submit MCP registry / Smithery**; (tùy chọn) host bản HTTP lên **Cloudflare Workers** (free).
- **Lưu ý:** **KHÔNG publish tự động.** Bước này cần token npm/host + bạn xác nhận go-ahead rõ ràng tại thời điểm chạy.

---

## Verification (cách kiểm thử end-to-end khi hoàn tất)

1. **Build all:** `pnpm install && pnpm -r build && pnpm -r typecheck` → sạch.
2. **Lib lõi:** mở `packages/core` demo, chạy `la.success/confirm/prompt/toast/open/build` — kiểm dark/light/auto, draggable, 18 input, validate async, timer.
3. **A11y:** `pnpm e2e` (Playwright+axe) → 0 vi phạm; full keyboard nav; ESC/backdrop trả đúng dismissReason.
4. **Docs/Playground:** `pnpm --filter docs dev` → sửa code trong playground thấy preview đổi; theme toggle; gallery sinh từ catalog.
5. **MCP stdio:** `npx @modelcontextprotocol/inspector npx lovely-alert-mcp` → list/call `generate_alert`, `get_example` (so khớp catalog).
6. **MCP HTTP:** chạy `lovely-alert-mcp --http --port 8787`, connect Inspector qua URL → tool hoạt động.
7. **Tích hợp Claude:** thêm cấu hình stdio/URL, hỏi "tạo confirm xoá" → AI trả code API mới chạy được.

---

## Quyết định đã chốt với bạn
- **API:** riêng & hiện đại (builder + convenience), phủ 100% chức năng SweetAlert2 (không drop-in).
- **MCP:** **stdio + npm** là chính (free, không server); **HTTP/SSE** là tùy chọn (Cloudflare Workers free).
- **Hosting (free, không cần thuê server):** docs tĩnh → GitHub Pages / Cloudflare Pages; MCP → `npx` (stdio); HTTP (nếu cần) → Cloudflare Workers.
- **Mở rộng:** đủ **4 nhóm** (toast nâng cao · input phong phú · hiệu ứng & âm thanh · theme builder + wrappers + i18n).
- **Docs:** **Astro + React islands**.

## Rủi ro & lưu ý
- **A11y là phần khó nhất** → tách Phase 3 riêng, test bằng axe, không để "làm sau".
- **Catalog dùng chung** là chìa khoá chống lệch docs/MCP → dựng schema sớm.
- **Bundle size lõi:** giữ 0 runtime deps; hiệu ứng nặng (confetti/Lottie) tách entry/optional import.
- **Node version:** cân nhắc nâng lên Node 20 LTS trước Phase 9 (Astro/Vite mới).
- **Phase 12 publish** cần credentials của bạn — sẽ hỏi lại trước khi chạy.

---

## ▶️ Tiếp tục từ đâu (cho phiên làm việc sau)

Phase 0 đã hoàn tất. Việc tiếp theo là **Phase 1 — Core engine**:
1. Định nghĩa types: `LovelyAlertOptions`, `LovelyAlertResult`, `DismissReason` trong `packages/core/src/types.ts`.
2. Dựng render engine + cấu trúc DOM trong `packages/core/src/dom/`.
3. State machine vòng đời (open/close + hooks) trong `packages/core/src/core/`.
4. Public API (`la.open/success/error/confirm/prompt/build/mixin`) trong `packages/core/src/index.ts`.
5. Viết test Vitest cho Promise result + dùng dev playground (`pnpm dev`) để thử tay.
