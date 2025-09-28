import { h, FunctionalComponent } from 'preact';
import type { Post } from '../utils/posts';

interface SidebarProps {
  posts: Post[];
  baseUrl?: string;
}

export const Sidebar: FunctionalComponent<SidebarProps> = ({ posts, baseUrl = '' }) => {
  // タグの集計
  const tagCounts = posts.reduce((acc, post) => {
    if (post.tags) {
      post.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <aside class="sidebar">
      <header class="sidebar-header">
        <h1><a href={`${baseUrl}`}>PreactPress90</a></h1>
        <p class="sidebar-subtitle">Static Blog Generator</p>
      </header>

      <div class="sidebar-content">
        <section class="sidebar-section">
          <h3>About</h3>
          <div class="about-content">
            <p>PreactPress90は、Preact と Vite を使用した軽量な静的ブログジェネレーターです。</p>
            <p>Markdownで記事を書き、高速な静的サイトを生成できます。</p>
          </div>
        </section>

        <section class="sidebar-section">
          <h3>Articles</h3>
          <ul class="article-list">
            {posts.map(post => (
              <li key={post.slug}>
                <a href={`${baseUrl}posts/${post.slug}.html`}>
                  {post.title}
                  <span class="article-date">
                    {new Date(post.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {Object.keys(tagCounts).length > 0 && (
          <section class="sidebar-section">
            <h3>Tags</h3>
            <div class="language-stats">
              {Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, count]) => {
                  const maxCount = Math.max(...Object.values(tagCounts));
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={tag} class="language-item">
                      <span class="language-name">
                        <span>{tag}</span>
                        <span>{count}</span>
                      </span>
                      <div class="language-bar-container">
                        <div
                          class="language-bar"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
};