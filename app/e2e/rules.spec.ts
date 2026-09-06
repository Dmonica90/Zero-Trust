import { expect, test } from '@playwright/test';
import { beginRun, investigate, reachOffice } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('accusing from the meeting is blocked until something is investigated', async ({ page }) => {
  await beginRun(page);
  await page.getByRole('button', { name: /Abrir el mensaje/ }).click();
  await page.getByRole('button', { name: 'Reunir al equipo' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cerrar' }).click();

  await page.getByRole('button', { name: 'Acusar', exact: true }).click();
  await expect(page.getByRole('heading', { name: '¡Un momento!' })).toBeVisible();
});

test('the accuse button on the office floor stays disabled until then', async ({ page }) => {
  await reachOffice(page);
  await expect(page.getByRole('button', { name: 'Acusar', exact: true })).toBeDisabled();

  await investigate(page, 'Leo');
  await expect(page.getByRole('button', { name: 'Acusar', exact: true })).toBeEnabled();
});

test('cancelling an accusation leaves everyone employed', async ({ page }) => {
  await reachOffice(page);
  await investigate(page, 'Omar');

  await page.getByRole('button', { name: 'Acusar', exact: true }).click();
  await page.getByRole('button', { name: 'Creo que el infiltrado es Omar' }).click();
  await page.getByRole('button', { name: 'No, espera' }).click();

  await expect(page.getByRole('button', { name: /^Omar\./ })).toBeVisible();
  await expect(page.getByText('Día 1 de 3')).toBeVisible();
});

test('the evidence log records what was looked at and asked', async ({ page }) => {
  await reachOffice(page);
  await investigate(page, 'Sara');

  await page.getByRole('button', { name: /Bitácora de evidencias/ }).click();
  const log = page.getByRole('dialog');
  await expect(log.getByText('Sara')).toBeVisible();
  await expect(log.getByText('Interrogado')).toBeVisible();
});

test('a fired suspect is gone from the following day', async ({ page }) => {
  await reachOffice(page);
  await investigate(page, 'Leo');
  await page.getByRole('button', { name: 'Acusar', exact: true }).click();
  await page.getByRole('button', { name: 'Creo que el infiltrado es Leo' }).click();
  await page.getByRole('button', { name: 'Sí, despedir' }).click();
  await expect(page.getByRole('status')).toBeHidden({ timeout: 6000 });

  await page.getByRole('button', { name: /Abrir el mensaje/ }).click();
  await page.getByRole('button', { name: 'Reunir al equipo' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.getByRole('button', { name: /^Leo\./ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Mía\./ })).toBeVisible();
});
