import { test, expect } from '@playwright/test'
import { createTestSessionData, closeTestSessionData, OpenViduTestSessionData, doLogin } from './utils.po.spec';
import { readFile } from 'fs/promises';

let sessionData: OpenViduTestSessionData;

test.beforeEach("Create new context and page", async ({browser}) => {
  sessionData = await createTestSessionData(browser);
  await doLogin(sessionData, {username: "admin", password: "MY_SECRET"});
});

test.describe("Testing POLL IMPORT/EXPORT features", () => {

  async function ensureOpenPollPanel(session: OpenViduTestSessionData) {
    await session.utils.checkActionButtonsArePresent();
    if(!(await session.utils.isPresent("#poll-panel", {}, false))) {
      await session.utils.clickOn("#poll-panel-btn");
      await session.utils.waitFor("#poll-panel");
    }
  }

  async function joinSessionAs(session: OpenViduTestSessionData, nickname: string) {

    await session.utils.writeOn("#nickname-input-container input", nickname);
    await session.utils.clickOn("#join-button");
    await ensureOpenPollPanel(session);

  }

	async function createBasicPoll(session: OpenViduTestSessionData, anonymous: boolean = true, publish: boolean = true, type: string = "single_option") {

    await ensureOpenPollPanel(session);
		await session.utils.clickOn("#create-poll-def-btn");

		await session.utils.waitFor("#poll-creation-form");
		expect(await session.utils.isPresent("#poll-creation-form")).toBeTruthy();

    await selectPollType(session, type);

		await session.utils.writeOn("#question-input input", "Test Question");
    if(type != "lottery") {
      await session.utils.writeOn("#input_option-0", "Option A");
      await session.utils.writeOn("#input_option-1", "Option B");
    }

    if(!anonymous)
      await session.utils.clickOn("#anonymous-check label");

    if(publish) {
      await session.utils.clickOn("#submit-poll-def-btn");
      expect(await session.utils.isPresent("#poll-close-btn")).toBeTruthy();
    } else {
      await session.utils.waitFor("#submit-poll-def-btn");
    }

	}

  async function respondPollOption(session: OpenViduTestSessionData, option: number) {

    const optionId = "#option-" + option;

    await ensureOpenPollPanel(session);
    await session.utils.waitFor(optionId);
    await session.utils.clickOn(optionId);
    await session.utils.waitFor(optionId + ".responded");

    if(await session.utils.isPresent("#submit-poll-response-btn", {}, false)) {
      await session.utils.clickOn("#submit-poll-response-btn", {}, {force: true})
    }

  }

  async function selectPollType(session: OpenViduTestSessionData, type: string) {
    await session.utils.clickOn("#type-input");
    await session.utils.clickOn("mat-option[value=\"" + type + "\"]");
  }

  async function importPollDefinitionFile(session: OpenViduTestSessionData, filePath: string) {

    await ensureOpenPollPanel(session);
		await session.utils.clickOn("#create-poll-def-btn");
		await session.utils.waitFor("#poll-creation-form");
		expect(await session.utils.isPresent("#poll-creation-form")).toBeTruthy();

    let fileUploadPromise = session.page.waitForEvent("filechooser");
    await session.utils.clickOn("#import-poll-def-btn");
    await (await fileUploadPromise).setFiles(filePath);

  }

  test("Imported definition of a LOTTERY POLL should fill inputs correctly", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/test-lottery-poll-def.json");

    await expect(sessionData.page.locator("#type-input span.mat-select-value-text")).toHaveText("Lottery");
    expect(await sessionData.page.locator("#anonymous-check input").isChecked()).toBeFalsy();
    await expect(sessionData.page.locator("#question-input input")).toHaveValue("Test Lottery");

  });

  test("Imported definition of a SINGLE OPTION POLL should fill inputs correctly", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/test-so-poll-def.json");

    await expect(sessionData.page.locator("#type-input span.mat-select-value-text")).toHaveText("Single Option");
    await expect(sessionData.page.locator("#anonymous-check input")).toBeChecked();
    await expect(sessionData.page.locator("#question-input input")).toHaveValue("Test Question");
    await expect(sessionData.page.locator("#input_option-0")).toHaveValue("Option A");
    await expect(sessionData.page.locator("#input_option-1")).toHaveValue("Option B");
    await expect(sessionData.page.locator("#input_option-2")).toHaveValue("Option C");
    await expect(sessionData.page.locator("#input_option-3")).toHaveValue("Option D");

  });

  test("Imported definition of a MULTIPLE OPTION POLL should fill inputs correctly", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/test-mo-poll-def.json");

    await expect(sessionData.page.locator("#type-input span.mat-select-value-text")).toHaveText("Multiple Option");
    await expect(sessionData.page.locator("#anonymous-check input")).toBeChecked();
    await expect(sessionData.page.locator("#question-input input")).toHaveValue("Test Question");
    await expect(sessionData.page.locator("#input_option-0")).toHaveValue("Option A");
    await expect(sessionData.page.locator("#input_option-1")).toHaveValue("Option B");
    await expect(sessionData.page.locator("#input_option-2")).toHaveValue("Option C");
    await expect(sessionData.page.locator("#input_option-3")).toHaveValue("Option D");
    await expect(sessionData.page.locator("#min-options-input")).toHaveValue("2");
    await expect(sessionData.page.locator("#max-options-input")).toHaveValue("3");

  });

  test("Imported definition of a PREFERENCE ORDER POLL should fill inputs correctly", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/test-po-poll-def.json");

    await expect(sessionData.page.locator("#type-input span.mat-select-value-text")).toHaveText("Preference Order");
    expect(await sessionData.page.locator("#anonymous-check input").isChecked()).toBeFalsy();
    await expect(sessionData.page.locator("#question-input input")).toHaveValue("Test Question");
    await expect(sessionData.page.locator("#input_option-0")).toHaveValue("Option A");
    await expect(sessionData.page.locator("#input_option-1")).toHaveValue("Option B");
    await expect(sessionData.page.locator("#input_option-2")).toHaveValue("Option C");
    await expect(sessionData.page.locator("#input_option-3")).toHaveValue("Option D");
    await expect(sessionData.page.locator("#input_option-4")).toHaveValue("Option E");
    await expect(sessionData.page.locator("#min-options-input")).toHaveValue("1");
    await expect(sessionData.page.locator("#max-options-input")).toHaveValue("3");

  });

  test("Imported definition with WRONG QUESTION should give a proper ERROR", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/wrong-question-poll-def.json");

    expect(await sessionData.utils.isPresent("#creation-error")).toBeTruthy();
    await expect(sessionData.page.locator("#creation-error")).toHaveText("Error Importing: Please, enter a question");

  });

  test("Imported definition with WRONG TYPE should give a proper ERROR", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/wrong-type-poll-def.json");

    expect(await sessionData.utils.isPresent("#creation-error")).toBeTruthy();
    await expect(sessionData.page.locator("#creation-error")).toHaveText("Error Importing: Invalid poll type");

  });

  test("Imported definition with WRONG OPTIONS should give a proper ERROR", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/wrong-options-poll-def.json");

    expect(await sessionData.utils.isPresent("#creation-error")).toBeTruthy();
    await expect(sessionData.page.locator("#creation-error")).toHaveText("Error Importing: The poll needs at least 2 options");

  });

  test("Imported definition with negative MIN OPTIONS should give a proper ERROR", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/wrong-options-2-poll-def.json");

    expect(await sessionData.utils.isPresent("#creation-error")).toBeTruthy();
    await expect(sessionData.page.locator("#creation-error")).toHaveText("Error Importing: Minimum options must be a number greater than 0");

  });

  test("Imported definition with too big MAX OPTIONS should give a proper ERROR", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/wrong-options-3-poll-def.json");

    expect(await sessionData.utils.isPresent("#creation-error")).toBeTruthy();
    await expect(sessionData.page.locator("#creation-error")).toHaveText("Error Importing: Maximum options must be a number smaller or equal to the number of options");

  });

  test("Imported definition with missing MIN OPTIONS should give a proper ERROR", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/wrong-min-options-poll-def.json");

    expect(await sessionData.utils.isPresent("#creation-error")).toBeTruthy();
    await expect(sessionData.page.locator("#creation-error")).toHaveText("Error Importing: Missing minimum options");

  });

  test("Imported definition with missing MAX OPTIONS should give a proper ERROR", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/wrong-max-options-poll-def.json");

    expect(await sessionData.utils.isPresent("#creation-error")).toBeTruthy();
    await expect(sessionData.page.locator("#creation-error")).toHaveText("Error Importing: Missing maximum options");

  });

  test("Imported definition with wrong combination of MIN and MAX OPTIONS should give a proper ERROR", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/wrong-options-4-poll-def.json");

    expect(await sessionData.utils.isPresent("#creation-error")).toBeTruthy();
    await expect(sessionData.page.locator("#creation-error")).toHaveText("Error Importing: Maximum options must be greater or equal to the minimum options");

  });

  test("Imported definition with wrong POINTS type should give a proper ERROR", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/wrong-points-poll-def.json");

    expect(await sessionData.utils.isPresent("#creation-error")).toBeTruthy();
    await expect(sessionData.page.locator("#creation-error")).toHaveText("Error Importing: Points invalid type");

  });

  test("Imported definition with wrong POINTS length should give a proper ERROR", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await importPollDefinitionFile(sessionData, "e2e/data/wrong-points-2-poll-def.json");

    expect(await sessionData.utils.isPresent("#creation-error")).toBeTruthy();
    await expect(sessionData.page.locator("#creation-error")).toHaveText("Error Importing: Points invalid length");

  });

  test("Exported definition from a LOTTERY POLL should have LotteryPoll fields", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await createBasicPoll(sessionData, false, false, "lottery");

    await sessionData.utils.clickOn("#validate-poll-def-btn");
    expect(await sessionData.utils.isPresent("#export-poll-def-btn")).toBeTruthy();
    let downloadPromise = sessionData.page.waitForEvent("download");
    await sessionData.utils.clickOn("#export-poll-def-btn");
    await (await downloadPromise).saveAs("e2e/data/downloads/lottery-poll-def.json");
    let downloadedDef = (await readFile("e2e/data/downloads/lottery-poll-def.json")).toString();
    let expectedDef = (await readFile("e2e/data/expected-lot-poll-def.json")).toString();

    expect(downloadedDef === expectedDef).toBeTruthy();

  });

  test("Exported definition from a SINGLE OPTION POLL should have SingleOptionPoll fields", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await createBasicPoll(sessionData, false, false, "single_option");

    await sessionData.utils.clickOn("#validate-poll-def-btn");
    expect(await sessionData.utils.isPresent("#export-poll-def-btn")).toBeTruthy();
    let downloadPromise = sessionData.page.waitForEvent("download");
    await sessionData.utils.clickOn("#export-poll-def-btn");
    await (await downloadPromise).saveAs("e2e/data/downloads/single-option-poll-def.json");
    let downloadedDef = (await readFile("e2e/data/downloads/single-option-poll-def.json")).toString();
    let expectedDef = (await readFile("e2e/data/expected-so-poll-def.json")).toString();

    expect(downloadedDef === expectedDef).toBeTruthy();

  });

  test("Exported definition from a MULTIPLE OPTION POLL should have MultipleOptionPoll fields", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await createBasicPoll(sessionData, true, false, "multiple_option");

    await sessionData.utils.clickOn("#validate-poll-def-btn");
    expect(await sessionData.utils.isPresent("#export-poll-def-btn")).toBeTruthy();
    let downloadPromise = sessionData.page.waitForEvent("download");
    await sessionData.utils.clickOn("#export-poll-def-btn");
    await (await downloadPromise).saveAs("e2e/data/downloads/multiple-option-poll-def.json");
    let downloadedDef = (await readFile("e2e/data/downloads/multiple-option-poll-def.json")).toString();
    let expectedDef = (await readFile("e2e/data/expected-mo-poll-def.json")).toString();

    expect(downloadedDef === expectedDef).toBeTruthy();

  });

  test("Exported definition from a PREFERENCE ORDER POLL should have PreferenceOrderPoll fields", async () => {

    await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);
    await joinSessionAs(sessionData, "Moderator");
    await createBasicPoll(sessionData, true, false, "preference_order");

    await sessionData.utils.clickOn("#validate-poll-def-btn");
    expect(await sessionData.utils.isPresent("#export-poll-def-btn")).toBeTruthy();
    let downloadPromise = sessionData.page.waitForEvent("download");
    await sessionData.utils.clickOn("#export-poll-def-btn");
    await (await downloadPromise).saveAs("e2e/data/downloads/preference-order-poll-def.json");
    let downloadedDef = (await readFile("e2e/data/downloads/preference-order-poll-def.json")).toString();
    let expectedDef = (await readFile("e2e/data/expected-po-poll-def.json")).toString();

    expect(downloadedDef === expectedDef).toBeTruthy();

  });

  test("Exported Results from ANONYMOUS POLL should not contain participants", async ({browser}) => {

    await sessionData.page.goto("/#/anonymousExportTest");
    await joinSessionAs(sessionData, "Moderator");
    await createBasicPoll(sessionData);
    await sessionData.utils.waitFor("#poll-close-btn");

    let partSession = await createTestSessionData(browser);
    await doLogin(partSession);
    await partSession.page.goto("/#/anonymousExportTest");
    await joinSessionAs(partSession, "Participant1");
    await respondPollOption(partSession, 0);

    let part2Session = await createTestSessionData(browser);
    await doLogin(part2Session);
    await part2Session.page.goto("/#/anonymousExportTest");
    await joinSessionAs(part2Session, "Participant2");
    await respondPollOption(part2Session, 1);

    let downloadPromise = sessionData.page.waitForEvent("download");

    await sessionData.utils.clickOn("#poll-close-btn");
    await sessionData.utils.clickOn("#poll-prepare-export-btn");
    await sessionData.utils.clickOn("#poll-export-btn");

    await (await downloadPromise).saveAs("e2e/data/downloads/anonymous-result.json");
    let downloadedResult = (await readFile("e2e/data/downloads/anonymous-result.json")).toString();
    let expectedResult = (await readFile("e2e/data/expected-anonymous-result.json")).toString();

    expect(downloadedResult === expectedResult).toBeTruthy();

    await closeTestSessionData(partSession);
    await closeTestSessionData(part2Session);

  });

  test("Exported Results from NOT ANONYMOUS POLL should contain participants", async ({browser}) => {

    await sessionData.page.goto("/#/notAnonymousExportTest");
    await joinSessionAs(sessionData, "Moderator");
    await createBasicPoll(sessionData, false);
    await sessionData.utils.waitFor("#poll-close-btn");

    let partSession = await createTestSessionData(browser);
    await doLogin(partSession);
    await partSession.page.goto("/#/notAnonymousExportTest");
    await joinSessionAs(partSession, "Participant");
    await respondPollOption(partSession, 0);

    let downloadPromise = sessionData.page.waitForEvent("download");

    await sessionData.utils.clickOn("#poll-close-btn");
    await sessionData.utils.clickOn("#poll-prepare-export-btn");
    await sessionData.utils.clickOn("#poll-export-btn");

    await (await downloadPromise).saveAs("e2e/data/downloads/not-anonymous-result.json");
    let downloadedResult = (await readFile("e2e/data/downloads/not-anonymous-result.json")).toString();
    let expectedResult = (await readFile("e2e/data/expected-not-anonymous-result.json")).toString();

    expect(downloadedResult === expectedResult).toBeTruthy();

    await closeTestSessionData(partSession);

  });

});
