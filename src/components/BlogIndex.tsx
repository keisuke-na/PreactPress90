import { h, FunctionalComponent } from 'preact';
import type { Post } from '../utils/posts';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';

interface BlogIndexProps {
  posts: Post[];
  baseUrl?: string;
}

export const BlogIndex: FunctionalComponent<BlogIndexProps> = ({ posts, baseUrl = '' }) => {
  return (
    <div class="blog-index">
      <div class="blog-content-wrapper">
        <Sidebar posts={posts} baseUrl={baseUrl} />

        <div class="main-content">
          <main class="posts-container">
            <h2>Latest Posts</h2>
            <div class="posts-list">
              {posts.map(post => (
                <a href={`${baseUrl}posts/${post.slug}.html`} class="post-card-link" key={post.slug}>
                  <article class="post-card">
                    <h3 class="post-title">
                      {post.title}
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
                </a>
              ))}
            </div>
          </main>

          <Footer />
        </div>
      </div>
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