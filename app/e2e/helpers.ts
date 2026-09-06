import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export type Name = 'Leo' | 'Sara' | 'Omar' | 'Mía';

/**
 * Press start and get past the opening cinematic.
 *
 * Headless Chromium ships without the H.264 decoder, so the clip errors out and
 * the screen steps aside on its own — which is the fallback working. Either way
 * what matters is arriving at the alert, so this skips only if there is still
 * something to skip.
 */
export async function beginRun(page: Page) {
  await page.getByRole('button', { name: 'Comenzar' }).click();

  // Skip if the button is still there when the click lands. Checking first and
  // then clicking races the clip ending underneath us, so the click is allowed
  // to miss: either way what has to be true is that the alert comes up.
  await page
    .getByRole('button', { name: 'Saltar' })
    .click({ timeout: 3000 })
    .catch(() => undefined);

  await expect(page.getByRole('button', { name: /Abrir el mensaje/ })).toBeVisible({
    timeout: 20_000,
  });
}

/** Title screen through to the first office floor. */
export async function reachOffice(page: Page) {
  await beginRun(page);
  await gatherAndInvestigate(page);
}

/** From the day's alert: open the message, close the briefing, head to the desks. */
export async function gatherAndInvestigate(page: Page) {
  await page.getByRole('button', { name: /Abrir el mensaje/ }).click();
  await page.getByRole('button', { name: 'Reunir al equipo' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cerrar' }).click();
  await page.getByRole('button', { name: 'Investigar', exact: true }).click();
  await expect(page.getByText('para investigarlo')).toBeVisible();
}

/** Open a workstation, ask the follow-up, come back to the floor. */
export async function investigate(page: Page, name: Name) {
  await page.getByRole('button', { name: new RegExp(`^${name}\\.`) }).click();
  await page.getByRole('button', { name: `Interrogar a ${name}` }).click();
  await page.getByRole('button', { name: 'Volver' }).click();
  await expect(page.getByText('para investigarlo')).toBeVisible();
}

/** Accuse someone and confirm, waiting out the "fired" beat. */
export async function fire(page: Page, name: Name) {
  await page.getByRole('button', { name: 'Acusar', exact: true }).click();
  await page.getByRole('button', { name: `Creo que el infiltrado es ${name}` }).click();
  await page.getByRole('button', { name: 'Sí, despedir' }).click();
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.getByRole('status')).toBeHidden({ timeout: 6000 });
}

/** One whole day: alert -> meeting -> office -> investigate -> accuse. */
export async function playDay(page: Page, look: Name, accuse: Name = look) {
  await gatherAndInvestigate(page);
  await investigate(page, look);
  await fire(page, accuse);
}
