import path from 'path';
import { defineConfig, devices } from '@playwright/test';

const raizProjeto = path.resolve(__dirname, '..');

/**
 * Configuração do Playwright para os testes E2E do SOS-Cidade.
 *
 * Pré-requisito: a aplicação precisa estar rodando localmente antes
 * de executar os testes (ver README.md desta pasta para o passo a passo).
 * baseURL aponta para o frontend Next.js, que por sua vez fala com o
 * backend em http://localhost:8000 (conforme docker-compose.yml do projeto).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // os testes compartilham o mesmo backend/banco, então rodam em série
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  // junit: resultado em XML para a pipeline (artefato e métricas).
  // Contrato: resultados/e2e.xml na raiz do repositório.
  reporter: [
    [
      'html',
      {
        open: 'never',
        outputFolder: process.env.PLAYWRIGHT_HTML_REPORT
          ? path.resolve(raizProjeto, process.env.PLAYWRIGHT_HTML_REPORT)
          : path.resolve(__dirname, 'playwright-report'),
      },
    ],
    ['list'],
    [
      'junit',
      {
        outputFile: path.resolve(
          raizProjeto,
          process.env.E2E_JUNIT_FILE || 'resultados/e2e.xml',
        ),
      },
    ],
    ['./reporters/flaky-reporter.ts'],
  ],
  timeout: 30_000,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
