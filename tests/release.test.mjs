import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
// Every module URL must carry the same cache version, or browsers mix old and new files.
const root = join(dirname(new URL(import.meta.url).pathname), '..');
const files = ['index.html', 'app.js', ...readdirSync(join(root, 'src'), { recursive: true }).filter(f => f.endsWith('.js')).map(f => join('src', f))];
const versions = new Set(), seen = new Set(['app.js']);
for (const file of files) {
  const text = readFileSync(join(root, file), 'utf8');
  const refs = file.endsWith('.html')
    ? [...text.matchAll(/(?:href|src)="(\.\/[^"]+\.(?:js|css)[^"]*)"/g)].map(m => m[1])
    : [...text.matchAll(/(?:import|export)\s[^'"]*?from\s+'([^']+)'/g)].map(m => m[1]);
  for (const ref of refs) {
    const [path, query] = ref.split('?');
    assert.ok(path.startsWith('./') || path.startsWith('../'), `${file}：${ref} 必须用相对路径，适配 GitHub Pages 子目录`);
    const target = relative(root, join(root, dirname(file), path));
    assert.ok(existsSync(join(root, target)), `${file}：找不到 ${ref}`);
    const version = /^v=(\w+)$/.exec(query ?? '')?.[1];
    assert.ok(version, `${file}：${ref} 缺少 ?v= 缓存版本`);
    versions.add(version); seen.add(target);
  }
}
assert.equal(versions.size, 1, `缓存版本不一致：${[...versions].join(', ')}`);
for (const file of files.filter(f => f.endsWith('.js'))) assert.ok(seen.has(file), `${file} 没有被任何模块引用`);
console.log(`缓存版本 ${[...versions][0]} 一致，${seen.size} 个模块均可解析。`);
