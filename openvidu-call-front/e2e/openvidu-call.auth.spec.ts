import { test, expect } from '@playwright/test'
import { createTestSessionData, closeTestSessionData, OpenViduTestSessionData, doLogin } from './utils.po.spec';
import { OpenViduCallConfig } from '../playwright.config';

let sessionData: OpenViduTestSessionData;

test.beforeEach("Create new context and page", async ({browser}) => {
  sessionData = await createTestSessionData(browser);
});

test.describe("Testing AUTHENTICATION", () => {

  test('should show the LOGIN FORM with DISABELD button', async () => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

    await sessionData.utils.waitFor("#slogan-text");
    expect((await sessionData.page.locator("#slogan-text"))).toHaveText("Videoconference rooms in one click");

    await sessionData.utils.waitFor("#form-login");

    expect (await sessionData.utils.isPresent("#form-session", {}, false)).toBeFalsy();

    await sessionData.utils.waitFor("#login-username");
    await sessionData.utils.waitFor("#login-password");
    expect(sessionData.page.locator("#join-btn")).toBeDisabled();

	});

	test('should show an error when LOGIN with WRONG CREDENTIALS', async () => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

    await sessionData.utils.waitFor("#slogan-text");
    expect((await sessionData.page.locator("#slogan-text"))).toHaveText("Videoconference rooms in one click");
    await sessionData.utils.waitFor("#form-login");

    await sessionData.utils.waitFor("#login-username input");
    await sessionData.utils.writeOn("#login-username input", "user");

    await sessionData.utils.waitFor("#login-password input");
    await sessionData.utils.writeOn("#login-password input", "user");

    await sessionData.utils.clickOn("#join-btn");

    await sessionData.utils.waitFor("#login-error");
    expect(sessionData.page.locator("#login-error")).toHaveText("Authentication failed. Try again.");

	});

	test('should show the SESSION NAME form when LOGIN with VALID CREDENTIALS', async () => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

    await sessionData.utils.waitFor("#slogan-text");
    expect(sessionData.page.locator("#slogan-text")).toHaveText("Videoconference rooms in one click");
    await sessionData.utils.waitFor("#form-login");

    await sessionData.utils.waitFor("#login-username input");
    await sessionData.utils.writeOn("#login-username input", "admin");

    await sessionData.utils.waitFor("#login-password input");
    await sessionData.utils.writeOn("#login-password input", "MY_SECRET");

    await sessionData.utils.clickOn("#join-btn");

		await sessionData.utils.waitFor('#form-session');
    expect(await sessionData.utils.isPresent("prejoin-container", {}, false)).toBeFalsy();

    expect(await sessionData.utils.isPresent("#join-btn")).toBeTruthy();

	});

	test('should do LOGOUT and show the LOGIN FORM when logout button is clicked', async () => {

		await doLogin(sessionData);

    await sessionData.utils.waitFor("#logout-content");
    expect((await sessionData.page.locator("#logout-content span:first-child").all())[0]).toHaveText("Hi admin, do you want to logout?");

    await sessionData.utils.clickOn("#logout-btn");

		await sessionData.utils.waitFor('#form-login');

    expect(await sessionData.page.locator("#login-username input")).toHaveValue("admin");
    expect(await sessionData.page.locator("#login-password input")).toHaveValue("MY_SECRET");
    expect(await sessionData.page.locator("#join-btn")).toBeEnabled();

    await sessionData.context.clearCookies();
    await sessionData.page.reload();

    await sessionData.utils.waitFor("#slogan-text");
    expect(await sessionData.utils.isPresent("#logout-btn", {}, false)).toBeFalsy();

	});

	test('should be able to JOIN with a VALID CREDENTIALS AND SESSION', async () => {

    await doLogin(sessionData);

		await sessionData.utils.waitFor('#form-session');
		await sessionData.utils.clickOn('#join-btn');
    expect(await sessionData.utils.isPresent("#prejoin-container")).toBeTruthy();

	});

	test('should REDIRECT to the ROOT PATH with SAME SESSION NAME', async () => {

    await sessionData.page.goto(`/#/testSession`);

    await sessionData.utils.waitFor("#slogan-text");
    expect(sessionData.page.locator("#slogan-text")).toHaveText("Videoconference rooms in one click");
    await sessionData.utils.waitFor("#form-login");

    expect(sessionData.page.locator("#join-btn")).toBeDisabled();

    await sessionData.utils.waitFor("#login-username input");
    await sessionData.utils.writeOn("#login-username input", "admin");

    await sessionData.utils.waitFor("#login-password input");
    await sessionData.utils.writeOn("#login-password input", "MY_SECRET");

    await sessionData.utils.clickOn("#join-btn");

    await sessionData.utils.waitFor('#form-session input');
		expect(sessionData.page.locator("#form-session input")).toHaveValue("testSession");

	});

	test('should ENTER to the PREJOIN PAGE refreshing AFTER LOGIN', async () => {

    await sessionData.page.goto(`/#/testSession`);

    await sessionData.utils.waitFor("#slogan-text");
    expect(sessionData.page.locator("#slogan-text")).toHaveText("Videoconference rooms in one click");
    await sessionData.utils.waitFor("#form-login");

    expect(sessionData.page.locator("#join-btn")).toBeDisabled();

    await sessionData.utils.waitFor("#login-username input");
    await sessionData.utils.writeOn("#login-username input", "admin");

    await sessionData.utils.waitFor("#login-password input");
    await sessionData.utils.writeOn("#login-password input", "MY_SECRET");

    await sessionData.utils.clickOn("#join-btn");

		await sessionData.utils.waitFor('#form-session');
    expect(await sessionData.utils.isPresent("prejoin-container", {}, false)).toBeFalsy();

		await sessionData.utils.clickOn('#join-btn');

		await sessionData.utils.checkPrejoinIsPresent();
    await sessionData.page.reload();
		await sessionData.utils.checkPrejoinIsPresent();

	});

});
