import { test, expect } from '@playwright/test';
const password = 'RecruitFlowDemo123!';
async function signIn(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(
    page.getByRole('heading', {
      name: email.startsWith('recruiter')
        ? 'Recruitment overview'
        : 'Your application journey',
    }),
  ).toBeVisible();
}
test('recruiter publishes, candidate applies, recruiter reviews with demo AI', async ({
  page,
  browser,
}) => {
  const title = `E2E Developer ${Date.now()}`;
  await signIn(page, 'recruiter@recruitflow.test');
  await page.getByRole('link', { name: 'Jobs', exact: true }).last().click();
  const form = page.getByRole('form', { name: 'Create job' });
  await form.getByLabel(/^title$/i).fill(title);
  await form.getByLabel(/^location$/i).fill('Remote');
  await form.getByLabel(/^requirements$/i).fill('TypeScript and React');
  await form
    .getByLabel('Description', { exact: true })
    .fill('Synthetic opening for the automated browser workflow.');
  await form.getByLabel('Status', { exact: true }).selectOption('PUBLISHED');
  await form.getByRole('button', { name: 'Create job', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: title })).toBeVisible();
  const candidate = await browser.newContext({
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
  });
  const candidatePage = await candidate.newPage();
  await signIn(candidatePage, 'candidate@recruitflow.test');
  await candidatePage.goto('/jobs');
  await candidatePage.getByRole('link', { name: title, exact: true }).click();
  await candidatePage
    .getByRole('button', { name: 'Apply for this role' })
    .click();
  await expect(
    candidatePage.getByText('Application submitted', { exact: true }),
  ).toBeVisible();
  await candidatePage
    .getByRole('link', { name: 'Track your application' })
    .click();
  const candidateRow = candidatePage
    .getByRole('row')
    .filter({ hasText: title });
  await expect(
    candidateRow.getByText('APPLIED', { exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Applications', exact: true }).click();
  const row = page.getByRole('row').filter({ hasText: title });
  await row.getByRole('combobox').selectOption('SCREENING');
  await row.getByRole('button', { name: 'Update stage' }).click();
  await expect(row.getByText('SCREENING', { exact: true })).toBeVisible();
  await row.getByRole('button', { name: 'Generate demo analysis' }).click();
  await expect(
    page.getByRole('region', { name: 'Demo AI analysis' }),
  ).toContainText('No resume was read or analyzed');
  await expect(row.getByText('SCREENING', { exact: true })).toBeVisible();
  await candidatePage.reload();
  await expect(
    candidatePage
      .getByRole('row')
      .filter({ hasText: title })
      .getByText('SCREENING', { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: '../../docs/screenshots/applications-desktop.png',
    fullPage: true,
  });
  await candidate.close();
});
test('protected pages redirect and failed requests stay visible', async ({
  page,
}) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
  await page.route('**/api/jobs?*', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Service unavailable for test' }),
    }),
  );
  await page.goto('/jobs');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Service unavailable for test' }),
  ).toContainText('Service unavailable for test');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});
test('mobile navigation and public jobs fit a narrow viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/jobs');
  await expect(
    page.getByRole('heading', { name: 'Open opportunities' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Fullstack Developer Intern', exact: true }),
  ).toBeVisible();
  const widths = await page.evaluate(() => ({
    viewport: window.innerWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport);
  await page.screenshot({
    path: '../../docs/screenshots/jobs-mobile.png',
    fullPage: true,
  });
});
test('registration creates a candidate workspace', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Full name', { exact: true }).fill('Browser Candidate');
  await page
    .getByLabel('Email', { exact: true })
    .fill(`browser-${Date.now()}@recruitflow.test`);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Your application journey' }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'No applications yet. Browse open jobs or publish a role to get started.',
      { exact: true },
    ),
  ).toBeVisible();
});
