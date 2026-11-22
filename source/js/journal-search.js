'use strict';

const pageSearch = document.querySelector('[data-site-search]');

if (pageSearch) {
  const form = pageSearch.querySelector('form');
  const input = pageSearch.querySelector('input');
  const status = pageSearch.querySelector('[data-site-search-status]');
  const results = pageSearch.querySelector('[data-site-results]');
  let index;
  let requestNumber = 0;

  async function loadIndex() {
    if (!index) {
      index = fetch('/search.xml').then(response => {
        if (!response.ok) throw new Error('Search index unavailable');
        return response.text();
      }).then(xml => {
        const document = new DOMParser().parseFromString(xml, 'application/xml');
        if (document.querySelector('parsererror')) throw new Error('Invalid search index');
        return Array.from(document.querySelectorAll('entry'), entry => {
          const title = entry.querySelector('title')?.textContent || '';
          const path = entry.querySelector('url')?.textContent || '';
          const content = (entry.querySelector('content')?.textContent || '')
            .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const keywords = Array.from(entry.querySelectorAll('tag, category'), node => node.textContent).join(' ');
          return {title, path, content, keywords};
        });
      }).catch(error => {
        index = undefined;
        throw error;
      });
    }
    return index;
  }

  function appendResult({title, path, content}, words) {
    if (!title || !path) return;
    const url = new URL(path, location.origin);
    if (url.origin !== location.origin) return;
    const row = document.createElement('article');
    row.className = 'journal-list-row journal-search-result';
    const heading = document.createElement('h2');
    const link = document.createElement('a');
    link.href = url.pathname;
    link.textContent = title;
    heading.append(link);
    const snippet = document.createElement('p');
    const first = content.toLowerCase().indexOf(words[0]);
    const start = Math.max(0, first - 38);
    snippet.textContent = (start ? '…' : '') + content.slice(start, start + 145) +
      (start + 145 < content.length ? '…' : '');
    row.append(heading, snippet);
    results.append(row);
  }

  async function search(query) {
    const request = ++requestNumber;
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    results.replaceChildren();
    if (!words.length) {
      status.textContent = '';
      return;
    }

    status.textContent = pageSearch.dataset.searchPending;
    try {
      const articles = await loadIndex();
      if (request !== requestNumber) return;
      const matching = articles.filter(article => {
        const text = [article.title, article.keywords, article.content].join(' ').toLowerCase();
        return words.every(word => text.includes(word));
      });
      matching.forEach(article => appendResult(article, words));
      status.textContent = results.childElementCount
        ? pageSearch.dataset.searchCount.replace('{n}', results.childElementCount)
        : pageSearch.dataset.searchEmpty;
    } catch {
      if (request === requestNumber) status.textContent = pageSearch.dataset.searchError;
    }
  }

  function runSearch() {
    const url = new URL(location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim());
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    search(input.value);
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    runSearch();
  });
  input.addEventListener('input', runSearch);
  input.value = new URLSearchParams(location.search).get('q') || '';
  if (input.value) search(input.value);
}
