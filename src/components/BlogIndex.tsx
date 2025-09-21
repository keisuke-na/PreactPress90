import { h, FunctionalComponent } from 'preact';
import type { Post } from '../utils/posts';

interface BlogIndexProps {
  posts: Post[];
}

export const BlogIndex: FunctionalComponent<BlogIndexProps> = ({ posts }) => {
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
    <div class="blog-index">
      <header class="blog-header">
        <h1>PreactPress90 Blog</h1>
        <p class="blog-description">Preact + Viteで作られた静的ブログシステム</p>
      </header>

      <div class="blog-content-wrapper">
        <aside class="sidebar">
          <section class="sidebar-section">
            <h3>About</h3>
            <div class="about-content">
              <p>PreactPress90は、Preact と Vite を使用した軽量な静的ブログジェネレーターです。</p>
              <p>Markdownで記事を書き、高速な静的サイトを生成できます。</p>
            </div>
          </section>

          <section class="sidebar-section">
            <h3>記事一覧</h3>
            <ul class="article-list">
              {posts.map(post => (
                <li key={post.slug}>
                  <a href={`/posts/${post.slug}.html`}>
                    {post.title}
                  </a>
                  <span class="article-date">
                    {new Date(post.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section class="sidebar-section">
            <div class="language-stats">
              {Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, count]) => {
                  const maxCount = Math.max(...Object.values(tagCounts));
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={tag} class="language-item">
                      <span class="language-name">{tag}</span>
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
        </aside>

        <main class="posts-container">
          <h2>最新記事</h2>
          <div class="posts-list">
            {posts.map(post => (
              <article key={post.slug} class="post-card">
                <h3 class="post-title">
                  <a href={`/posts/${post.slug}.html`}>
                    {post.title}
                  </a>
                </h3>

                <div class="post-meta">
                  <time class="post-date" datetime={post.date}>
                    {new Date(post.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <span class="post-author">by {post.author}</span>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div class="post-tags">
                    {post.tags.map(tag => (
                      <span key={tag} class="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div class="post-excerpt">
                  {getExcerpt(post.content)}
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>

      <footer class="blog-footer">
        <p>&copy; 2025 PreactPress90. Built with Preact and Vite.</p>
      </footer>
    </div>
  );
};

function getExcerpt(content: string, maxLength: number = 150): string {
  const plainText = content
    .replace(/^#+\s+.*$/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.slice(0, maxLength).trim() + '...';
}