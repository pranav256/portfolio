import { mkdir, writeFile } from 'node:fs/promises';

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'pranav-portfolio' };
const sources = [
  { file: 'profile', url: 'https://api.github.com/users/pranav256', fields: ['login', 'name', 'html_url', 'avatar_url', 'bio', 'blog', 'location', 'company', 'public_repos', 'created_at'] },
  { file: 'repositories', url: 'https://api.github.com/users/pranav256/repos?per_page=100&sort=full_name', fields: ['name', 'full_name', 'description', 'html_url', 'homepage', 'language', 'fork', 'archived', 'created_at', 'pushed_at', 'topics'] },
];

const updates = await Promise.all(sources.map(async ({ file, url, fields }) => {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  const data = await response.json();
  const pick = item => Object.fromEntries(fields.map(field => [field, item[field]]));
  return { file, data: Array.isArray(data) ? data.map(pick) : pick(data) };
}));

await mkdir('data', { recursive: true });
for (const { file, data } of updates) {
  await writeFile(`data/${file}.json`, JSON.stringify(data, null, 2) + '\n');
  console.log(`Updated data/${file}.json`);
}
