import { mkdir, writeFile } from 'node:fs/promises';

const fonts = [
  ['inter', 'Inter', 'normal'],
  ['fraunces', 'Fraunces', 'normal'],
  ['fraunces', 'Fraunces', 'italic'],
  ['jetbrains-mono', 'JetBrains Mono', 'normal'],
];
await mkdir('public/fonts', { recursive: true });
for (const [slug, family, style] of fonts) {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/${slug}:vf@latest/latin-wght-${style}.woff2`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${family}: HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (data.subarray(0,4).toString() !== 'wOF2') throw new Error(`${family}: not a WOFF2 font`);
  await writeFile(`public/fonts/${slug}-${style}.woff2`, data);
  console.log(`${family} ${style}: ${data.length} bytes`);
}
for (const slug of ['inter','fraunces','jetbrainsmono']) {
  const response = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${slug}/OFL.txt`, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`License ${slug}: HTTP ${response.status}`);
  await writeFile(`public/fonts/LICENSE-${slug}.txt`, await response.text());
}
