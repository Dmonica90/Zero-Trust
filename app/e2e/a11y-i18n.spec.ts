import { expect, test } from '@playwright/test';
import { investigate, reachOffice } from './helpers';

test('the whole run is playable with the keyboard alone', async ({ page }) => {
  await page.goto('/');

  const matches = (text: string, label: RegExp | string) =>
    typeof label === 'string' ? text.includes(label) : label.test(text);

  const press = async (label: RegExp | string) => {
    // Wait for such a control to be on screen first: screens cross-fade, so
    // tabbing into a half-mounted one proves nothing about keyboard support.
    // `.first()` because a label can legitimately appear on more than one
    // control (a dialog and the screen behind it); tabbing then finds whichever
    // is reachable.
    await page.getByRole('button', { name: label }).first().waitFor({ state: 'visible' });

    for (let i = 0; i < 40; i += 1) {
      const text = await page.evaluate(() => {
        const el = document.activeElement;
        // Focus parks on <body> between screens; its textContent is the whole
        // page, which would match anything.
        if (!el || !el.matches('button, [href], input, select, textarea')) return '';
        return el.getAttribute('aria-label') ?? el.textContent ?? '';
      });
      if (matches(text, label)) {
        await page.keyboard.press('Enter');
        return;
      }
      await page.keyboard.press('Tab');
    }
    throw new Error(`never focused a control matching ${label}`);
  };

  await press('Comenzar');
  await press('Reunir al equipo');
  await press('Cerrar');
  await press('Investigar');
  await press(/^Mía\./);
  await press('Interrogar a Mía');
  await press('Volver');
  await press('Acusar');
  await press('Creo que el infiltrado es Mía');
  await press('Sí, despedir');

  await expect(page.getByRole('heading', { name: '¡Amenaza neutralizada!' })).toBeVisible({
    timeout: 10_000,
  });
});

test('Escape closes the accusation dialog without firing anyone', async ({ page }) => {
  await page.goto('/');
  await reachOffice(page);
  await investigate(page, 'Leo');

  await page.getByRole('button', { name: 'Acusar', exact: true }).click();
  await page.getByRole('button', { name: 'Creo que el infiltrado es Leo' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: /^Leo\./ })).toBeVisible();
});

test('the alert text is exposed in full to assistive technology while it types', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Comenzar' }).click();

  // The screen-reader copy is complete from the first frame, before the
  // character-by-character reveal has caught up.
  await expect(page.getByText(/TI acaba de detectar una fuga masiva/)).toBeVisible();
});

test('switching language mid-run keeps the game state', async ({ page }) => {
  await page.goto('/');
  await reachOffice(page);
  await investigate(page, 'Sara');

  await page.getByLabel('Idioma').selectOption('en');

  await expect(page.getByText('Day 1 of 3')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accuse', exact: true })).toBeEnabled();

  await page.getByRole('button', { name: /Evidence log/ }).click();
  await expect(page.getByRole('dialog').getByText('Questioned')).toBeVisible();
});

test('the language choice survives a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
  await expect(page).toHaveTitle(/Zero Trust/);
  expect(await page.evaluate(() => document.documentElement.lang)).toBe('en');
});

test('the browser language decides when nothing is stored', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'en-US' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
  await context.close();
});
