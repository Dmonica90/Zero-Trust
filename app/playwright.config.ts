import { defineConfig, devices } from '@playwright/test';

/**
 * The published build is what ships, so the tests drive `vite preview` rather
 * than the dev server. Chromium is preinstalled in this environment at a fixed
 * path; `PW_CHROMIUM` lets a different machine point somewhere else.
 */
const executablePath = process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // A full three-day run sits through the day card, the typewriter and the
  // "fired" beat three times over, so the default 30s is not enough.
  timeout: 90_000,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'es-MX',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], launchOptions: { executablePath } },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
        isMobile: false, // the bundled Chromium build has no mobile emulation
        launchOptions: { executablePath },
      },
    },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
