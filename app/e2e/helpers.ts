import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export type Name = 'Leo' | 'Sara' | 'Omar' | 'Mía';

/** Title screen through to the first office floor. */
export async function reachOffice(page: Page) {
  await page.getByRole('button', { name: 'Comenzar' }).click();
  await gatherAndInvestigate(page);
}

/** From the day's alert: read it, close the briefing, head to the desks. */
export async function gatherAndInvestigate(page: Page) {
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
