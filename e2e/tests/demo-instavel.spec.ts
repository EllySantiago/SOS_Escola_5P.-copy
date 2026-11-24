import { test } from '@playwright/test';

test('Demonstração de teste instável @flaky', async ({}, testInfo) => {
  test.skip(process.env.DEMO_INSTAVEL !== '1', 'Defina DEMO_INSTAVEL=1 para executar a demonstração.');

  if (testInfo.retry === 0) {
    throw new Error('Falha intencional da primeira tentativa da demonstração.');
  }
});
