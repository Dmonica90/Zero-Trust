import { expect, test } from '@playwright/test';
import { beginRun, fire, investigate, playDay, reachOffice } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('catching Mia on day 1 earns the top rank', async ({ page }) => {
  await reachOffice(page);
  await investigate(page, 'Mía');
  await fire(page, 'Mía');

  await expect(page.getByRole('heading', { name: '¡Amenaza neutralizada!' })).toBeVisible();
  await expect(page.getByText('¡Eres un Arquitecto de Confianza Cero!')).toBeVisible();
});

test('catching Mia on day 2 neutralizes the threat without the rank', async ({ page }) => {
  await beginRun(page);
  await playDay(page, 'Leo');

  // The day-2 alert must name yesterday's mistake.
  await expect(page.getByText(/despediste a Leo/)).toBeVisible();
  await expect(page.getByText(/extracción remota de datos/)).toBeVisible();

  await playDay(page, 'Mía');
  await expect(page.getByRole('heading', { name: '¡Amenaza neutralizada!' })).toBeVisible();
  await expect(page.getByText('¡Eres un Arquitecto de Confianza Cero!')).toBeHidden();
});

test('catching Mia on day 3 still saves the system', async ({ page }) => {
  await beginRun(page);
  await playDay(page, 'Leo');
  await playDay(page, 'Sara');
  await playDay(page, 'Mía');

  await expect(
    page.getByRole('heading', { name: '¡Sistema salvado en el último segundo!' }),
  ).toBeVisible();
});

test('firing all three innocents loses the run', async ({ page }) => {
  await beginRun(page);
  await playDay(page, 'Leo');
  await playDay(page, 'Sara');
  await playDay(page, 'Omar');

  await expect(page.getByRole('heading', { name: '¡Sistema comprometido!' })).toBeVisible();

  // The debrief replays all three wrong calls.
  const decisions = page.getByText('Tus decisiones').locator('..');
  await expect(decisions.getByText('Leo')).toBeVisible();
  await expect(decisions.getByText('Sara')).toBeVisible();
  await expect(decisions.getByText('Omar')).toBeVisible();
});

test('playing again returns to a clean title screen', async ({ page }) => {
  await reachOffice(page);
  await investigate(page, 'Mía');
  await fire(page, 'Mía');

  await page.getByRole('button', { name: 'Jugar de nuevo' }).click();
  await expect(page.getByRole('button', { name: 'Comenzar' })).toBeVisible();

  // Day 1 again, with everyone back at their desk.
  await beginRun(page);
  await expect(page.getByText('DÍA 1 DE 3')).toBeHidden(); // alert screen has no HUD
  await page.getByRole('button', { name: /Abrir el mensaje/ }).click();
  await page.getByRole('button', { name: 'Reunir al equipo' }).click();
  await expect(page.getByText('Día 1 de 3')).toBeVisible();
});
