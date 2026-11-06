import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  realpathSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { collectFiles, parseResult } from './antigravity-review.mjs';

test('packages selected source only and rejects ignored, environment, and outside files', () => {
  const parent = realpathSync(tmpdir());
  const directory = mkdtempSync(join(parent, 'recruitflow-review-test-'));
  try {
    const repository = join(directory, 'repo');
    mkdirSync(repository);
    assert.equal(
      spawnSync('git', ['init', '--quiet', repository], { windowsHide: true })
        .status,
      0,
    );
    writeFileSync(join(repository, '.gitignore'), 'private.ts\n');
    writeFileSync(
      join(repository, 'selected.ts'),
      'export const selected = true;\n',
    );
    writeFileSync(join(repository, 'unselected.ts'), 'not selected');
    writeFileSync(join(repository, 'private.ts'), 'private fixture');
    writeFileSync(join(repository, '.env'), 'fixture only');
    writeFileSync(join(directory, 'outside.ts'), 'outside fixture');
    const files = collectFiles(repository, ['selected.ts']);
    assert.deepEqual(files, [
      { path: 'selected.ts', content: 'export const selected = true;\n' },
    ]);
    assert.throws(() => collectFiles(repository, []), /Select source files/);
    assert.throws(() => collectFiles(repository, ['private.ts']), /Ignored/);
    assert.throws(() => collectFiles(repository, ['.env']), /allowed source/);
    assert.throws(
      () => collectFiles(repository, ['../outside.ts']),
      /inside the repository/,
    );
    writeFileSync(join(repository, 'large.ts'), 'x'.repeat(200_001));
    assert.throws(() => collectFiles(repository, ['large.ts']), /200 KB/);
  } finally {
    assert.equal(dirname(realpathSync(directory)), parent);
    rmSync(directory, { recursive: true, force: true });
  }
});
test('requires a successful final CLI result, not a progress event or empty response', () => {
  assert.equal(
    parseResult(
      '{"event":"init"}\n{"event":"result","result":{"status":"SUCCESS","response":"Finding"}}\n',
    ).response,
    'Finding',
  );
  assert.throws(() => parseResult('{"event":"init"}'), /successful review/);
  assert.throws(
    () =>
      parseResult(
        '{"event":"result","result":{"status":"ERROR","response":"failed"}}',
      ),
    /successful review/,
  );
  assert.throws(
    () =>
      parseResult(
        '{"event":"result","result":{"status":"SUCCESS","response":""}}',
      ),
    /successful review/,
  );
});
