import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../.github/workflows/ci-pages.yml', import.meta.url), 'utf8');

test('every static app DOM reference is present in HTML', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const referenced = [...app.matchAll(/\$\('([^']+)'\)/g)].map(match => match[1]);
  for (const id of referenced) {
    assert.ok(ids.includes(id), `UI requires missing element #${id}`);
  }
  for (const control of ['seed', 'flower', 'density', 'curvature', 'hatching', 'page']) {
    assert.ok(ids.includes(control), `missing option #${control}`);
  }
});

test('site runs without remote assets and includes accessible SVG export', () => {
  assert.match(html, /type="module" src="src\/app.js"/);
  assert.match(html, /id="export"/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.doesNotMatch(html, /<script[^>]+https?:\/\//);
});

test('README launch button points at GitHub Pages and workflow tests before deployment', () => {
  assert.match(readme, /\[!\[Launch Nouveau Line Studio\]/);
  assert.match(readme, /https:\/\/gwb2025.github.io\/nouveau-line-studio\//);
  assert.match(workflow, /npm run check/);
  assert.match(workflow, /needs: test/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});
