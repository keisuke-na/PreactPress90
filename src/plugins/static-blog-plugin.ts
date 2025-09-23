import type { Plugin } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import { marked } from 'marked';
import render from 'preact-render-to-string';
import { h } from 'preact';
import { BlogIndex } from '../components/BlogIndex';
import { BlogPost } from '../components/BlogPost';

export interface PostMeta {
  title: string;
  date: string;
  slug: string;
  author: string;
  tags: string[];
}

export interface Post extends PostMeta {
  content: string;
  htmlContent: string;
}

export interface StaticBlogPluginOptions {
  postsDir?: string;
  outputDir?: string;
  baseUrl?: string;
}

async function readPost(filePath: string, slug: string): Promise<Post | null> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    const htmlContent = await marked(content);

    return {
      ...data,
      slug,
      content,
      htmlContent
    } as Post;
  } catch (error) {
    console.error(`[Static Blog] Error reading post ${filePath}:`, error);
    return null;
  }
}

async function getAllPosts(postsPath: string): Promise<Post[]> {
  try {
    const files = await fs.readdir(postsPath);
    const markdownFiles = files.filter(file => file.endsWith('.md'));

    const posts = await Promise.all(
      markdownFiles.map(async (file) => {
        const slug = file.replace(/\.md$/, '');
        const filePath = path.join(postsPath, file);
        return readPost(filePath, slug);
      })
    );

    return posts
      .filter((post): post is Post => post !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('[Static Blog] Error reading posts directory:', error);
    return [];
  }
}

async function loadCSS(rootDir: string): Promise<string> {
  try {
    const indexCSS = await fs.readFile(
      path.join(rootDir, 'src/components/BlogIndex.css'),
      'utf8'
    ).catch(() => '');

    const postCSS = await fs.readFile(
      path.join(rootDir, 'src/components/BlogPost.css'),
      'utf8'
    ).catch(() => '');

    return indexCSS + '\n' + postCSS;
  } catch (error) {
    console.error('[Static Blog] Error loading CSS files:', error);
    return '';
  }
}

function getExcerpt(content: string, maxLength: number = 160): string {
  const plainText = content
    .replace(/^#+\s+.*$/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.slice(0, maxLength).trim() + '...';
}

function createHTMLDocument(content: string, title: string, css: string, description?: string): string {
  const metaDescription = description
    ? `  <meta name="description" content="${description.replace(/"/g, '&quot;')}">\n`
    : '';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
${metaDescription}  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #f5f5f5;
    }
    ${css}
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}

async function generateIndexHTML(posts: Post[], distPath: string, css: string, baseUrl: string): Promise<void> {
  const indexComponent = h(BlogIndex, { posts, baseUrl });
  const indexHTML = render(indexComponent);
  const description = 'PreactPress90は、Preact と Vite を使用した軽量な静的ブログジェネレーターです。90年代のレトロなデザインでモダンな技術を楽しめます。';
  const fullHTML = createHTMLDocument(indexHTML, 'PreactPress90 Blog', css, description);

  await fs.writeFile(path.join(distPath, 'index.html'), fullHTML, 'utf8');
  console.log('[Static Blog] Generated: index.html');
}

async function generatePostHTML(post: Post, allPosts: Post[], distPath: string, css: string, baseUrl: string): Promise<void> {
  const postsDir = path.join(distPath, 'posts');
  await fs.mkdir(postsDir, { recursive: true });

  const postComponent = h(BlogPost, { post, allPosts, baseUrl });
  const postHTML = render(postComponent);
  const description = getExcerpt(post.content);
  const fullHTML = createHTMLDocument(
    postHTML,
    `${post.title} - PreactPress90 Blog`,
    css,
    description
  );

  const postPath = path.join(postsDir, `${post.slug}.html`);
  await fs.writeFile(postPath, fullHTML, 'utf8');
  console.log(`[Static Blog] Generated: posts/${post.slug}.html`);
}

export function staticBlogPlugin(options: StaticBlogPluginOptions = {}): Plugin {
  const {
    postsDir = 'posts',
    outputDir = 'dist',
    baseUrl = '/'
  } = options;

  let rootDir: string;
  let isDev = false;

  return {
    name: 'vite-plugin-static-blog',

    configResolved(config) {
      rootDir = config.root;
      isDev = config.command === 'serve';
    },

    buildStart() {
      if (isDev) {
        console.log('[Static Blog] Development mode - skipping static generation');
        return;
      }
      console.log('[Static Blog] Build started - preparing static generation');
    },

    async closeBundle() {
      if (isDev) {
        return;
      }

      console.log('[Static Blog] Starting static HTML generation...');

      try {
        const postsPath = path.join(rootDir, postsDir);
        const distPath = path.join(rootDir, outputDir);

        const postsExist = await fs.access(postsPath).then(() => true).catch(() => false);
        if (!postsExist) {
          console.warn(`[Static Blog] Posts directory not found: ${postsPath}`);
          return;
        }

        const distExist = await fs.access(distPath).then(() => true).catch(() => false);
        if (!distExist) {
          await fs.mkdir(distPath, { recursive: true });
        }

        console.log(`[Static Blog] Processing posts from: ${postsPath}`);

        const posts = await getAllPosts(postsPath);
        console.log(`[Static Blog] Found ${posts.length} posts`);

        const css = await loadCSS(rootDir);
        console.log('[Static Blog] CSS files loaded');

        await generateIndexHTML(posts, distPath, css, baseUrl);

        for (const post of posts) {
          await generatePostHTML(post, posts, distPath, css, baseUrl);
        }

        console.log(`[Static Blog] Output directory: ${distPath}`);
        console.log('[Static Blog] Static generation completed successfully');

      } catch (error) {
        console.error('[Static Blog] Error during static generation:', error);
        throw error;
      }
    }
  };
}