import { h, FunctionalComponent } from 'preact';
import type { Post } from '../utils/posts';

interface BlogPostProps {
  post: Post;
  allPosts?: Post[];
  baseUrl?: string;
}

export const BlogPost: FunctionalComponent<BlogPostProps> = ({ post, allPosts, baseUrl = '' }) => {
  const currentIndex = allPosts?.findIndex(p => p.slug === post.slug) ?? -1;
  const prevPost = currentIndex > 0 ? allPosts?.[currentIndex - 1] : null;
  const nextPost = currentIndex !== -1 && currentIndex < (allPosts?.length ?? 0) - 1
    ? allPosts?.[currentIndex + 1]
    : null;

  return (
    <div class="blog-post">
      <header class="post-header">
        <nav class="breadcrumb">
          <a href={`${baseUrl}`}>← ブログトップへ戻る</a>
        </nav>

        <h1 class="post-title">{post.title}</h1>

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
      </header>

      <article class="post-content">
        <div dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
      </article>

      <nav class="post-navigation">
        <div class="nav-links">
          {prevPost && (
            <div class="nav-previous">
              <span class="nav-label">← 前の記事</span>
              <a href={`${baseUrl}posts/${prevPost.slug}.html`}>
                {prevPost.title}
              </a>
            </div>
          )}

          {nextPost && (
            <div class="nav-next">
              <span class="nav-label">次の記事 →</span>
              <a href={`${baseUrl}posts/${nextPost.slug}.html`}>
                {nextPost.title}
              </a>
            </div>
          )}
        </div>
      </nav>

      <footer class="post-footer">
        <div class="footer-content">
          <p>&copy; 2025 PreactPress90. Built with Preact and Vite.</p>
        </div>
      </footer>
    </div>
  );
};