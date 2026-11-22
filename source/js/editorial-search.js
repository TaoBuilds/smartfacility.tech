'use strict';

const library = document.querySelector('[data-journal-library]');

if (library) {
  const search = library.querySelector('[data-journal-search]');
  const input = search.querySelector('input');
  const status = library.querySelector('[data-journal-status]');
  const empty = library.querySelector('[data-journal-empty]');
  const more = library.querySelector('[data-journal-more]');
  const stories = Array.from(library.querySelectorAll('[data-search]'));
  let expanded = false;

  function updateStories() {
    const words = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const activeSearch = words.length > 0;
    let matches = 0;
    stories.forEach((story, index) => {
      const text = story.dataset.search.toLowerCase();
      const visible = activeSearch ? words.every(word => text.includes(word)) : expanded || index < 6;
      story.hidden = !visible;
      if (visible) matches += 1;
    });
    status.textContent = activeSearch ? library.dataset.matches.replace('{n}', matches) : '';
    empty.hidden = !activeSearch || matches !== 0;
    if (more) {
      more.hidden = activeSearch;
      more.textContent = expanded ? more.dataset.hide : more.dataset.show;
      more.setAttribute('aria-expanded', String(expanded));
    }
  }

  search.hidden = false;
  input.addEventListener('input', updateStories);
  more?.addEventListener('click', () => {
    expanded = !expanded;
    updateStories();
  });
  updateStories();
}
