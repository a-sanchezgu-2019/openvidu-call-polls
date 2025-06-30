import { test, expect } from '@playwright/test'
import { createTestSessionData, closeTestSessionData, OpenViduTestSessionData, doLogin } from './utils.po.spec';

let sessionData: OpenViduTestSessionData;

test.beforeEach("Create new context and page", async ({browser}) => {
  sessionData = await createTestSessionData(browser);
	await doLogin(sessionData, {username: "admin", password: "MY_SECRET"});
});

/*test.afterEach("Close page and context", async () => {
  await sessionData.page.close({reason: "Test End"});
  await sessionData.context.close({reason: "Test End"});
});*/

test.describe("Testing POLL ACCESS features", () => {

  test("EVERYBODY should have access to the POLL PANEL", async ({ browser }) => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

    await sessionData.utils.clickOn("#join-button");
		await sessionData.utils.checkActionButtonsArePresent();
		await sessionData.utils.clickOn("#poll-panel-btn");
    expect(await sessionData.utils.isPresent("poll-panel")).toBeTruthy();
    expect(await sessionData.utils.isPresent("#poll-panel")).toBeTruthy();

    let partSession = await createTestSessionData(browser);

		await doLogin(partSession);

    await partSession.page.goto(`/#/${sessionData.randomSessionId}`);

    await partSession.utils.clickOn("#join-button");
		await partSession.utils.checkActionButtonsArePresent();
		await partSession.utils.clickOn("#poll-panel-btn");
    expect(await partSession.utils.isPresent("#poll-panel")).toBeTruthy();


    await partSession.page.close({reason: "Test End"});
    await partSession.context.close({reason: "Test End"});

  });

	test("MODERATOR should have access to the CREATE POLL button", async () => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

		await sessionData.utils.clickOn("#join-button");

		await sessionData.utils.checkActionButtonsArePresent();
		await sessionData.utils.clickOn("#poll-panel-btn");

		await sessionData.utils.waitFor("#poll-panel");
		expect(await sessionData.utils.isPresent("#create-poll-def-btn")).toBeTruthy();

	});

	test("PARTICIPANT should not have access to the CREATE POLL button", async ({ browser }) => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

		await sessionData.utils.clickOn("#join-button");
		await sessionData.utils.checkActionButtonsArePresent();

    let partSession = await createTestSessionData(browser);

		await doLogin(partSession);

    await partSession.page.goto(`/#/${sessionData.randomSessionId}`);

		await partSession.utils.clickOn("#join-button");

		await partSession.utils.checkActionButtonsArePresent();
		await partSession.utils.clickOn("#poll-panel-btn");

		await partSession.utils.waitFor("#poll-panel");
		expect(await partSession.utils.isPresent("#create-poll-def-btn", {}, false)).toBeFalsy();

    await closeTestSessionData(partSession);

	});

});

test.describe("Testing POLL CREATION features", () => {

	async function createBasicPoll(sessionData: OpenViduTestSessionData) {

		await sessionData.utils.clickOn("#create-poll-def-btn");

		await sessionData.utils.waitFor("#poll-creation-form");
		expect(await sessionData.utils.isPresent("#poll-creation-form")).toBeTruthy();

		await sessionData.utils.writeOn("#question-input input", "Test Question");
		await sessionData.utils.writeOn("#input_option-0", "Option A");
		await sessionData.utils.writeOn("#input_option-1", "Option B");

		await sessionData.utils.clickOn("#submit-poll-def-btn");

		expect(await sessionData.utils.isPresent("#poll-close-btn")).toBeTruthy();

	}

	test("MODERATOR should be able to add an option to a POLL DEFINITION", async () => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

		await sessionData.utils.clickOn("#join-button");

		await sessionData.utils.checkActionButtonsArePresent();
		await sessionData.utils.clickOn("#poll-panel-btn");

		await sessionData.utils.clickOn("#create-poll-def-btn");

		await sessionData.utils.waitFor("#poll-creation-form");
		expect(await sessionData.utils.isPresent("#poll-creation-form")).toBeTruthy();

		await sessionData.utils.clickOn("#add-response-btn");
		await sessionData.utils.waitFor("#input_option-2");
		expect(await sessionData.utils.isPresent("#input_option-2")).toBeTruthy();

	});

	test("MODERATOR should be able to remove an option to a POLL DEFINITION when there are more than 2", async () => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

		await sessionData.utils.clickOn("#join-button");

		await sessionData.utils.checkActionButtonsArePresent();
		await sessionData.utils.clickOn("#poll-panel-btn");

		await sessionData.utils.clickOn("#create-poll-def-btn");

		expect(await sessionData.utils.isPresent("#poll-creation-form")).toBeTruthy();

		await sessionData.utils.clickOn("#add-response-btn");
		await sessionData.utils.clickOn("#rm-btn-option-2");
		expect(await sessionData.utils.isPresent("#input_option-2", {}, false)).toBeFalsy();

	});

	test("MODERATOR should be able to create a POLL", async () => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

		await sessionData.utils.clickOn("#join-button");

		await sessionData.utils.checkActionButtonsArePresent();
		await sessionData.utils.clickOn("#poll-panel-btn");

		await createBasicPoll(sessionData);

		expect(await sessionData.utils.isPresent("#poll-close-btn")).toBeTruthy();

	});

});

test.describe("Testing POLL INTERACTION features", () => {

	async function createBasicPoll(sessionData: OpenViduTestSessionData) {

		await sessionData.utils.clickOn("#create-poll-def-btn");

		await sessionData.utils.waitFor("#poll-creation-form");
		expect(await sessionData.utils.isPresent("#poll-creation-form")).toBeTruthy();

		await sessionData.utils.writeOn("#question-input input", "Test Question");
		await sessionData.utils.writeOn("#input_option-0", "Option A");
		await sessionData.utils.writeOn("#input_option-1", "Option B");

		await sessionData.utils.clickOn("#submit-poll-def-btn");

		expect(await sessionData.utils.isPresent("#poll-close-btn")).toBeTruthy();

	}

	test("PARTICIPANT should be able to respond a POLL", async ({ browser }) => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

		await sessionData.utils.clickOn("#join-button");

		await sessionData.utils.checkActionButtonsArePresent();
		await sessionData.utils.clickOn("#poll-panel-btn");

		await createBasicPoll(sessionData);

		await sessionData.utils.waitFor("#poll-close-btn");

    let partSession = await createTestSessionData(browser);

		await doLogin(partSession);

		await partSession.page.goto(`/#/${sessionData.randomSessionId}`);

		await partSession.utils.clickOn("#join-button");

		await partSession.utils.checkActionButtonsArePresent();
		await partSession.utils.clickOn("#poll-panel-btn");

		await partSession.utils.waitFor("#poll-panel");
		expect(await partSession.utils.isPresent("#option-0")).toBeTruthy();

    await closeTestSessionData(partSession);

	});

	test("MODERATOR should be able to close a POLL", async ({browser}) => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

		await sessionData.utils.clickOn("#join-button");

		await sessionData.utils.checkActionButtonsArePresent();
		await sessionData.utils.clickOn("#poll-panel-btn");

		await createBasicPoll(sessionData);

		await sessionData.utils.waitFor("#poll-close-btn");

		await sessionData.utils.clickOn("#poll-close-btn");
		expect(await sessionData.utils.isPresent("#poll-rm-btn")).toBeTruthy();

	});

	test("MODERATOR should be able to close a POLL after a PARTICIPANT has responded", async ({browser}) => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

		await sessionData.utils.clickOn("#join-button");

		await sessionData.utils.checkActionButtonsArePresent();
		await sessionData.utils.clickOn("#poll-panel-btn");

		await createBasicPoll(sessionData);

		await sessionData.utils.waitFor("#poll-close-btn");

    let partSession = await createTestSessionData(browser);
		await doLogin(partSession);

		await partSession.page.goto(`/#/${sessionData.randomSessionId}`);

		await partSession.utils.clickOn("#join-button");

		await partSession.utils.checkActionButtonsArePresent();
		await partSession.utils.clickOn("#poll-panel-btn");
		await partSession.utils.waitFor("#poll-panel");

		await partSession.utils.waitFor("#option-0");
		await partSession.utils.clickOn("#option-0");
		await partSession.utils.waitFor("#option-0.responded");

		if(await partSession.utils.isPresent("#submit-poll-response-btn", {}, false)) {
			await partSession.utils.clickOn("#submit-poll-response-btn")
		}

		await sessionData.utils.clickOn("#poll-close-btn");
		expect(await sessionData.utils.isPresent("#poll-rm-btn")).toBeTruthy();

    await closeTestSessionData(partSession);

	});

	test("MODERATOR should be able to delete a POLL after it has been closed", async ({browser}) => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

		await sessionData.utils.clickOn("#join-button");

		await sessionData.utils.checkActionButtonsArePresent();
		await sessionData.utils.clickOn("#poll-panel-btn");

		await createBasicPoll(sessionData);

		await sessionData.utils.waitFor("#poll-close-btn");

    let partSession = await createTestSessionData(browser);
		await doLogin(partSession);

		await partSession.page.goto(`/#/${sessionData.randomSessionId}`);

		await partSession.utils.clickOn("#join-button");

		await partSession.utils.checkActionButtonsArePresent();
		await partSession.utils.clickOn("#poll-panel-btn");
		await partSession.utils.waitFor("#poll-panel");

		await partSession.utils.waitFor("#option-1");
		await partSession.utils.clickOn("#option-1");
		await partSession.utils.waitFor("#option-1.responded");

		if(await partSession.utils.isPresent("#submit-poll-response-btn", {}, false)) {
			await partSession.utils.clickOn("#submit-poll-response-btn", {}, {force: true})
		}

		await sessionData.utils.clickOn("#poll-close-btn");
		expect(await sessionData.utils.isPresent("#poll-rm-btn")).toBeTruthy();
		await sessionData.utils.clickOn("#poll-rm-btn");
		expect(await sessionData.utils.isPresent("#create-poll-def-btn")).toBeTruthy();

    await closeTestSessionData(partSession);

	});

	test("POLL option percentages should match with the responses", async ({browser}) => {

		await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

		await sessionData.utils.clickOn("#join-button");

		await sessionData.utils.checkActionButtonsArePresent();
		await sessionData.utils.clickOn("#poll-panel-btn");

		await createBasicPoll(sessionData);

		await sessionData.utils.waitFor("#poll-close-btn");

    let partSession = await createTestSessionData(browser);
		await doLogin(partSession);

		await partSession.page.goto(`/#/${sessionData.randomSessionId}`);

		await partSession.utils.clickOn("#join-button");

		await partSession.utils.checkActionButtonsArePresent();
		await partSession.utils.clickOn("#poll-panel-btn");
		await partSession.utils.waitFor("#poll-panel");

		await partSession.utils.waitFor("#option-1");
		await partSession.utils.clickOn("#option-1");
		await partSession.utils.waitFor("#option-1.responded");

		if(await partSession.utils.isPresent("#submit-poll-response-btn", {}, false)) {
			await partSession.utils.clickOn("#submit-poll-response-btn", {}, {force: true})
		}

		await expect(sessionData.page.locator("#option-1 div.response-percentage")).toHaveText("100% (1)");
		await expect(sessionData.page.locator("div.total-responses")).toHaveText("100% (1 of 1) participants responded");

    let partSession2 = await createTestSessionData(browser);
		await doLogin(partSession2);

		await partSession2.page.goto(`/#/${sessionData.randomSessionId}`);

		await partSession2.utils.clickOn("#join-button");

		await partSession2.utils.checkActionButtonsArePresent();
		await partSession2.utils.clickOn("#poll-panel-btn");
		await partSession2.utils.waitFor("#poll-panel");

		await expect(sessionData.page.locator("div.total-responses")).toHaveText("50% (1 of 2) participants responded");

		await partSession2.utils.waitFor("#option-0");
		await partSession2.utils.clickOn("#option-0");
		await partSession2.utils.waitFor("#option-0.responded");

		if(await partSession2.utils.isPresent("#submit-poll-response-btn", {}, false)) {
			await partSession2.utils.clickOn("#submit-poll-response-btn", {}, {force: true})
		}

		await expect(sessionData.page.locator("#option-0 div.response-percentage")).toHaveText("50% (1)");
		await expect(sessionData.page.locator("#option-1 div.response-percentage")).toHaveText("50% (1)");
		await expect(sessionData.page.locator("div.total-responses")).toHaveText("100% (2 of 2) participants responded");

	});

});
