/* global hexo */

'use strict';

const simplify = input => String(input || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function articleBody(html, title) {
  return String(html || '').replace(/<h1(\b[^>]*)>([\s\S]*?)<\/h1>/gi, (_, attrs, inner) => {
    if (simplify(inner) !== simplify(title)) return `<h2${attrs}>${inner}</h2>`;
    const id = attrs.match(/\sid=(?:"[^"]+"|'[^']+')/);
    return id ? `<span${id[0]}></span>` : '';
  });
}

hexo.extend.helper.register('journalBody', articleBody);

hexo.extend.helper.register('journalSummary', function (html, length, title) {
  const content = simplify(articleBody(html, title));
  return content.length > length ? content.slice(0, length).trimEnd() + '…' : content;
});

hexo.extend.helper.register('journalPath', function (path) {
  return this.url_for(path || '/').replace(/\/index\.html$/, '/');
});

hexo.extend.helper.register('journalTitle', function (page) {
  if (page.title) return page.title;
  if (page.category) return page.category;
  if (page.tag) return page.tag;
  const journal = this.site.data.editorial;
  if (page.archive && page.year) {
    const date = page.month ? `${page.year}-${String(page.month).padStart(2, '0')}` : String(page.year);
    return `${journal.articles} · ${date}`;
  }
  return journal.articles;
});

hexo.extend.generator.register('journal-404', function (locals) {
  return {path: '404.html', layout: ['404'], data: {title: locals.data.editorial.notFound}};
});
