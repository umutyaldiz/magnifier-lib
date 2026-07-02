// Shared sample "news article" markup used across stories so every story
// magnifies realistic, text- and image-heavy content — the exact scenario
// this library targets.
export function renderSamplePage({ withAd = true } = {}) {
  const page = document.createElement('div');
  page.className = 'tw:min-h-[640px] tw:bg-slate-100 tw:font-sans tw:text-slate-900';
  page.innerHTML = `
    <header class="tw:bg-red-700 tw:text-white tw:px-6 tw:py-4">
      <h1 class="tw:text-lg tw:font-bold tw:tracking-tight">Daily Herald</h1>
      <p class="tw:text-xs tw:text-red-200">Accessibility demo — move your mouse over the page</p>
    </header>
    <main class="tw:max-w-2xl tw:mx-auto tw:px-6 tw:py-8 tw:space-y-6">
      <article class="tw:bg-white tw:rounded-xl tw:border tw:border-slate-200 tw:p-6 tw:shadow-sm">
        <div class="tw:text-xs tw:font-bold tw:text-red-700 tw:uppercase tw:tracking-wide tw:mb-2">Science</div>
        <h2 class="tw:text-2xl tw:font-bold tw:leading-tight tw:mb-2">
          Researchers publish new findings on low-vision reading aids
        </h2>
        <p class="tw:text-sm tw:text-slate-400 tw:mb-4">July 3, 2026 · 4 min read</p>
        <p class="tw:text-base tw:text-slate-700 tw:leading-relaxed tw:mb-3">
          A study released this week highlights how screen magnification tools reduce reading
          fatigue for people with low vision when the tool follows the reader's focus point
          instead of requiring manual panning. The findings reinforce long-standing accessibility
          guidance recommending pointer-driven magnification for dense text layouts.
        </p>
        <p class="tw:text-base tw:text-slate-700 tw:leading-relaxed">
          Small type sizes, low contrast, and tightly packed paragraphs remain the most common
          barriers reported by low-vision readers. A lightweight, dependency-free widget that any
          site can drop in — without a rebuild or a paid SaaS subscription — is one of the more
          practical mitigations available today.
        </p>
      </article>
      <section class="tw:bg-white tw:rounded-xl tw:border tw:border-slate-200 tw:p-6 tw:shadow-sm tw:grid tw:grid-cols-2 tw:gap-4">
        <div class="tw:border tw:border-slate-100 tw:rounded-lg tw:p-3">
          <span class="tw:text-xs tw:font-bold tw:text-red-700 tw:uppercase">Tech</span>
          <h3 class="tw:text-sm tw:font-semibold tw:mt-1 tw:leading-snug">Assistive tech adoption keeps rising among news readers</h3>
        </div>
        <div class="tw:border tw:border-slate-100 tw:rounded-lg tw:p-3">
          <span class="tw:text-xs tw:font-bold tw:text-red-700 tw:uppercase">Health</span>
          <h3 class="tw:text-sm tw:font-semibold tw:mt-1 tw:leading-snug">Eye-care specialists urge screen-break routines</h3>
        </div>
      </section>
      ${withAd ? `
      <div class="ad-slot tw:bg-slate-200 tw:border tw:border-dashed tw:border-slate-400 tw:rounded-xl tw:p-6 tw:text-center tw:text-slate-500 tw:text-sm">
        Ad slot — try <code class="tw:font-mono">excludeSelectors: ['.ad-slot']</code>, the lens should hide here
      </div>` : ''}
    </main>
  `;
  return page;
}
