import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

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

const postsDirectory = path.join(process.cwd(), 'posts');

export async function getAllPosts(): Promise<Post[]> {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = await Promise.all(
    fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(async fileName => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        const { data, content } = matter(fileContents);
        const htmlContent = await marked(content);

        return {
          ...data,
          slug,
          content,
          htmlContent
        } as Post;
      })
  );

  return allPosts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const { data, content } = matter(fileContents);
    const htmlContent = await marked(content);

    return {
      ...data,
      slug,
      content,
      htmlContent
    } as Post;
  } catch (error) {
    console.error(`Error reading post with slug "${slug}":`, error);
    return null;
  }
}

export async function parseMarkdown(markdownContent: string): Promise<{ meta: PostMeta; htmlContent: string }> {
  const { data, content } = matter(markdownContent);
  const htmlContent = await marked(content);

  return {
    meta: data as PostMeta,
    htmlContent
  };
}

export function getPostSlugs(): string[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => fileName.replace(/\.md$/, ''));
}