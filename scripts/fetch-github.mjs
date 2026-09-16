import { mkdir, writeFile } from 'node:fs/promises';

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'pranav-portfolio-research' };
const requestedAt = new Date().toISOString();
const sources = [
  ['profile', 'https://api.github.com/users/pranav256'],
  ['repositories', 'https://api.github.com/users/pranav256/repos?per_page=100&sort=full_name'],
  ['profile-readme', 'https://api.github.com/repos/pranav256/pranav256/readme'],
  ['hooky-readme', 'https://api.github.com/repos/pranav256/Hooky/readme'],
  ['vault-readme', 'https://api.github.com/repos/pranav256/Password-Manager/readme'],
  ['news-readme', 'https://api.github.com/repos/pranav256/news-api/readme'],
];

await mkdir('research/github-live', { recursive: true });
const results = await Promise.all(sources.map(async ([name, url]) => {
  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (name === 'profile') {
      const fields = ['login', 'name', 'html_url', 'avatar_url', 'bio', 'blog', 'location', 'company', 'public_repos', 'created_at'];
      const profile = Object.fromEntries(fields.map(field => [field, data[field]]));
      await writeFile('research/github-profile.json', JSON.stringify(profile, null, 2) + '\n');
    } else if (name === 'repositories') {
      const fields = ['name', 'full_name', 'description', 'html_url', 'homepage', 'language', 'fork', 'archived', 'created_at', 'pushed_at', 'topics'];
      const repositories = data.map(repo => Object.fromEntries(fields.map(field => [field, repo[field]])));
      await writeFile('research/github-repositories.json', JSON.stringify(repositories, null, 2) + '\n');
    } else {
      await writeFile(`research/github-live/${name}.md`, Buffer.from(data.content, 'base64').toString('utf8'));
    }
    console.log(`${name}: retrieved`);
    return { name, url, requestedAt, status: 'retrieved', httpStatus: response.status };
  } catch (error) {
    console.log(`${name}: ${error.message}`);
    return { name, url, requestedAt, status: 'unavailable', error: error.message };
  }
}));
await writeFile('research/github-live/manifest.json', JSON.stringify({ requestedAt, results }, null, 2) + '\n');
