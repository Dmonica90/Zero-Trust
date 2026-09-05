import { expect, test } from '@playwright/test';
import { investigate, reachOffice } from './helpers';

test('the whole run can be completed with the keyboard alone', async ({ page }) => {
  await page.goto('/');

  // Focus the control, then activate it with Enter. This is the guarantee that
  // matters: in the Storyline course most of the interaction hung off
  // onrollover, so there was nothing to focus and nothing Enter could trigger.
  const press = async (label: RegExp | string) => {
    const button = page.getByRole('button', { name: label }).first();
    await button.waitFor({ state: 'visible' });
    await button.focus();
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
  };

  // Screens cross-fade, so the outgoing one is still mounted for a moment after
  // a press. The suspect cards exist on both the meeting and the office, so the
  // test has to know which screen it is on before pressing one.
  const onOffice = () => expect(page.getByText('para investigarlo')).toBeVisible();

  await press('Comenzar');
  await press('Reunir al equipo');
  await press('Cerrar');
  await press('Investigar');

  await onOffice();
  await press(/^Mía\./);
  await press('Interrogar a Mía');
  await press('Volver');

  await onOffice();
  await press('Acusar');
  await press('Creo que el infiltrado es Mía');
  await press('Sí, despedir');

  await expect(page.getByRole('heading', { name: '¡Amenaza neutralizada!' })).toBeVisible({
    timeout: 10_000,
  });
});

test('tabbing reaches every control on the office floor', async ({ page }) => {
  await page.goto('/');
  await reachOffice(page);
  await investigate(page, 'Leo');

  // Wait for the workstation view to finish leaving: while it is still fading
  // out it is the only thing on screen holding focusable controls.
  await expect(page.getByText('para investigarlo')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Volver' })).toBeHidden();

  // Walk the tab order once and collect what it lands on, so a control that is
  // clickable but unreachable by keyboard shows up as a missing entry.
  const reached = new Set<string>();
  await page.locator('body').press('Tab');

  for (let i = 0; i < 30; i += 1) {
    const label = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || !el.matches('button, select, input, [href]')) return null;
      return el.getAttribute('aria-label') ?? el.textContent?.trim() ?? '';
    });
    if (label != null) reached.add(label);
    await page.keyboard.press('Tab');
  }

  const labels = [...reached];
  for (const name of ['Leo', 'Sara', 'Omar', 'Mía']) {
    expect(labels.filter((l) => l.startsWith(`${name}.`))).toHaveLength(1);
  }
  expect(labels).toContain('Acusar');
  expect(labels).toContain('Silenciar');
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
