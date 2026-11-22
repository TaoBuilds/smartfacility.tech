/* global hexo */

'use strict';

const path = require('node:path');

hexo.extend.injector.register('head_end', '<link rel="stylesheet" href="/css/editorial.css">');

hexo.extend.filter.register('after_generate', () => {
  const editorial = hexo.locals.get('data').editorial;
  const posts = hexo.locals.get('posts').sort('-date').toArray().map(post => {
    const categories = post.categories.toArray().map(category => category.name);
    const tags = post.tags.toArray().map(tag => tag.name);
    return {
      title: post.title,
      url: '/' + post.path,
      date: post.date.format('YYYY-MM-DD'),
      category: categories[0],
      search: [post.title, ...categories, ...tags].join(' '),
    };
  });
  const html = hexo.render.renderSync(
    {path: path.join(hexo.base_dir, 'templates/editorial-home.ejs')},
    {editorial, posts, canonical: new URL('/', hexo.config.url).href},
  );
  // Replace just the first index page. Hexo still owns archive and pagination routes.
  hexo.route.set('index.html', html);
});
