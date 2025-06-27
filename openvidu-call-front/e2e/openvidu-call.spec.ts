import { test, expect } from '@playwright/test'
import { createTestSessionData, closeTestSessionData, OpenViduTestSessionData, doLogin } from './utils.po.spec';
import { OpenViduCallConfig } from '../playwright.config';

let sessionData: OpenViduTestSessionData;

test.beforeEach("Create new context and page", async ({browser}) => {
  sessionData = await createTestSessionData(browser);
  await doLogin(sessionData);
});

test.describe("Testing SURFACE FEATURES", () => {

	test('should show ONLY the SESSION NAME input', async () => {

		expect(await sessionData.utils.isPresent('#session-name-input')).toBeTruthy();
		expect(await sessionData.utils.isPresent('#join-btn')).toBeTruthy();
		expect(await sessionData.page.locator('#join-btn')).toBeEnabled();

	});

	test('should CHANGE the SESSION NAME', async () => {

		expect(await sessionData.utils.isPresent('#session-name-input')).toBeTruthy();

    let sessionName = await sessionData.page.locator("#session-name-input").inputValue();
		await sessionData.utils.clickOn('#session-name-generator-btn');
		expect((await sessionData.page.locator("#session-name-input").inputValue()) !== sessionName).toBeTruthy();

  });

	test('should show the PREJOIN page INSERTING the SESSION NAME', async () => {
		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
		await sessionData.utils.checkPrejoinIsPresent();
	});

});
