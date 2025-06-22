import { expect } from 'chai';
import { Builder, WebDriver } from 'selenium-webdriver';

import { OpenViduCallConfig } from './selenium.conf';
import { OpenViduCallPO } from './utils.po.test';

const url = OpenViduCallConfig.appUrl;

describe("Testing POLL ACCESS features", () => {
	let browser: WebDriver;
	let incognitoBrowser: WebDriver;
	let utils: OpenViduCallPO;

	async function createChromeBrowser(incognito: boolean = false): Promise<WebDriver> {
		const browser = new Builder()
			.forBrowser(OpenViduCallConfig.browserName)
			.withCapabilities(OpenViduCallConfig.browserCapabilities)
			.setChromeOptions(OpenViduCallConfig.browserOptions)
			.usingServer(OpenViduCallConfig.seleniumAddress);

			if(incognito) {
				browser.setChromeOptions(browser.getChromeOptions().addArguments('--incognito'));
			}

			return await browser.build();
	}

	beforeEach(async () => {
		browser = await createChromeBrowser();
		utils = new OpenViduCallPO(browser);
	});

	afterEach(async () => {
		await browser.quit();
	});

	it("EVERYBODY should have access to the POLL PANEL", async () => {

		await browser.get(`${url}/test-poll-panel-session`);

		await utils.waitForElement('#join-button');
		await utils.clickOn("#join-button");

		await utils.checkActionButtonsArePresent();
		await utils.waitForElement("#poll-panel-btn");
		await utils.clickOn("#poll-panel-btn");

		await utils.waitForElement("#poll-panel");
		expect(await utils.isPresent("#poll-panel")).to.be.true;


		incognitoBrowser = await createChromeBrowser(true);
		const incognitoUtils =  new OpenViduCallPO(incognitoBrowser);

		await incognitoBrowser.get(`${url}/test-poll-panel-session`);

		await incognitoUtils.waitForElement('#join-button');
		await incognitoUtils.clickOn("#join-button");

		await incognitoUtils.checkActionButtonsArePresent();
		await incognitoUtils.waitForElement("#poll-panel-btn");
		await incognitoUtils.clickOn("#poll-panel-btn");

		await incognitoUtils.waitForElement("#poll-panel");
		expect(await incognitoUtils.isPresent("#poll-panel")).to.be.true;

		await incognitoBrowser.quit();

	});

	it("MODERATOR should have access to the CREATE POLL button", async () => {

		await browser.get(`${url}/test-poll-admin-create-button-session`);

		await utils.waitForElement('#join-button');
		await utils.clickOn("#join-button");

		await utils.checkActionButtonsArePresent();
		await utils.waitForElement("#poll-panel-btn");
		await utils.clickOn("#poll-panel-btn");

		await utils.waitForElement("#poll-panel");
		expect(await utils.isPresent("#create-poll-def-btn")).to.be.true;

	});

	it("PARTICIPANT should not have access to the CREATE POLL button", async () => {

		await browser.get(`${url}/test-poll-part-create-button-session`);

		await utils.waitForElement('#join-button');
		await utils.clickOn("#join-button");

		await utils.checkActionButtonsArePresent();

		incognitoBrowser = await createChromeBrowser(true);
		const incognitoUtils =  new OpenViduCallPO(incognitoBrowser);

		await incognitoBrowser.get(`${url}/test-poll-part-create-button-session`);

		await incognitoUtils.clickOn("#join-button");

		await incognitoUtils.checkActionButtonsArePresent();
		await incognitoUtils.clickOn("#poll-panel-btn");

		await incognitoUtils.waitForElement("#poll-panel");
		expect(await incognitoUtils.isPresent("#create-poll-def-btn")).to.be.false;

		await incognitoBrowser.quit();

	});

});

describe("Testing POLL CREATION features", () => {
	let browser: WebDriver;
	let incognitoBrowser: WebDriver;
	let utils: OpenViduCallPO;

	async function createChromeBrowser(incognito: boolean = false): Promise<WebDriver> {
		const browser = new Builder()
			.forBrowser(OpenViduCallConfig.browserName)
			.withCapabilities(OpenViduCallConfig.browserCapabilities)
			.setChromeOptions(OpenViduCallConfig.browserOptions)
			.usingServer(OpenViduCallConfig.seleniumAddress);

			if(incognito) {
				browser.setChromeOptions(browser.getChromeOptions().addArguments('--incognito'));
			}

			return await browser.build();
	}

	async function createBasicPoll() {

		await utils.clickOn("#create-poll-def-btn");

		await utils.waitForElement("#poll-creation-form");
		expect(await utils.isPresent("#poll-creation-form")).to.be.true;

		await utils.writeOnElement("#question-input", "Test Question");
		await utils.writeOnElement("#input_option-0", "Option A");
		await utils.writeOnElement("#input_option-1", "Option B");

		await utils.clickOn("#submit-poll-def-btn");

	}

	beforeEach(async () => {
		browser = await createChromeBrowser();
		utils = new OpenViduCallPO(browser);
	});

	afterEach(async () => {
		await browser.quit();
	});

	it("MODERATOR should be able to add an option to a POLL DEFINITION", async () => {

		await browser.get(`${url}/test-poll-admin-create-poll-session`);

		await utils.waitForElement('#join-button');
		await utils.clickOn("#join-button");

		await utils.checkActionButtonsArePresent();
		await utils.clickOn("#poll-panel-btn");

		await utils.clickOn("#create-poll-def-btn");

		await utils.waitForElement("#poll-creation-form");
		expect(await utils.isPresent("#poll-creation-form")).to.be.true;

		await utils.waitForElement("#add-response-btn");
		await utils.clickOn("#add-response-btn");
		await utils.waitForElement("#input_option-2");
		expect(await utils.isPresent("#input_option-2")).to.be.true;

	});

	it("MODERATOR should be able to remove an option to a POLL DEFINITION when there were more than 2", async () => {

		await browser.get(`${url}/test-poll-admin-create-poll-session`);

		await utils.waitForElement('#join-button');
		await utils.clickOn("#join-button");

		await utils.checkActionButtonsArePresent();
		await utils.clickOn("#poll-panel-btn");

		await utils.clickOn("#create-poll-def-btn");

		await utils.waitForElement("#poll-creation-form");
		expect(await utils.isPresent("#poll-creation-form")).to.be.true;

		await utils.waitForElement("#add-response-btn");
		await utils.clickOn("#add-response-btn");
		await utils.waitForElement("#input_option-2");
		await utils.waitForElement("#rm-btn-option-2");
		await utils.clickOn("#rm-btn-option-2");
		expect(await utils.isPresent("#input_option-2")).to.be.false;

	});

	it("MODERATOR should be able to create a POLL", async () => {

		await browser.get(`${url}/test-poll-admin-create-poll-session`);

		await utils.waitForElement('#join-button');
		await utils.clickOn("#join-button");

		await utils.checkActionButtonsArePresent();
		await utils.clickOn("#poll-panel-btn");

		await createBasicPoll();

		await utils.waitForElement("#poll-close-btn");
		expect(await utils.isPresent("#poll-close-btn")).to.be.true;

	});

});

describe("Testing POLL INTERACTION features", () => {
	let browser: WebDriver;
	let incognitoBrowser: WebDriver;
	let utils: OpenViduCallPO;

	async function createChromeBrowser(incognito: boolean = false): Promise<WebDriver> {
		const browser = new Builder()
			.forBrowser(OpenViduCallConfig.browserName)
			.withCapabilities(OpenViduCallConfig.browserCapabilities)
			.setChromeOptions(OpenViduCallConfig.browserOptions)
			.usingServer(OpenViduCallConfig.seleniumAddress);

			if(incognito) {
				browser.setChromeOptions(browser.getChromeOptions().addArguments('--incognito'));
			}

			return await browser.build();
	}

	async function createBasicPoll() {

		await utils.clickOn("#create-poll-def-btn");

		await utils.waitForElement("#poll-creation-form");
		expect(await utils.isPresent("#poll-creation-form")).to.be.true;

		await utils.writeOnElement("#question-input", "Test Question");
		await utils.writeOnElement("#input_option-0", "Option A");
		await utils.writeOnElement("#input_option-1", "Option B");

		await utils.clickOn("#submit-poll-def-btn");

	}

	beforeEach(async () => {
		browser = await createChromeBrowser();
		utils = new OpenViduCallPO(browser);
	});

	afterEach(async () => {
		await browser.quit();
	});

	it("PARTICIPANT should be able to respond a POLL", async () => {

		await browser.get(`${url}/test-poll-part-respond-poll-session`);

		await utils.clickOn("#join-button");

		await utils.checkActionButtonsArePresent();
		await utils.clickOn("#poll-panel-btn");

		await createBasicPoll();

		await utils.waitForElement("#poll-close-btn");

		incognitoBrowser = await createChromeBrowser(true);
		const incognitoUtils =  new OpenViduCallPO(incognitoBrowser);

		await incognitoBrowser.get(`${url}/test-poll-part-respond-poll-session`);

		await incognitoUtils.clickOn("#join-button");

		await incognitoUtils.checkActionButtonsArePresent();
		await incognitoUtils.clickOn("#poll-panel-btn");

		await incognitoUtils.waitForElement("#poll-panel");
		expect(await incognitoUtils.waitForElement("#option-0")).to.be.true;

		await incognitoBrowser.quit();

	});

	it("MODERATOR should be able to close a POLL after a PARTICIPANT had responded", async () => {

		await browser.get(`${url}/test-poll-part-respond-poll-session`);

		await utils.clickOn("#join-button");

		await utils.checkActionButtonsArePresent();
		await utils.clickOn("#poll-panel-btn");

		await createBasicPoll();

		await utils.waitForElement("#poll-close-btn");

		incognitoBrowser = await createChromeBrowser(true);
		const incognitoUtils =  new OpenViduCallPO(incognitoBrowser);

		await incognitoBrowser.get(`${url}/test-poll-part-respond-poll-session`);

		await incognitoUtils.clickOn("#join-button");

		await incognitoUtils.checkActionButtonsArePresent();
		await incognitoUtils.clickOn("#poll-panel-btn");

		await incognitoUtils.waitForElement("#poll-panel");
		await incognitoUtils.waitForElement("#option-0");
		await incognitoUtils.clickOn("#option-0");

		if(await incognitoUtils.isPresent("#submit-poll-response-btn")) {
			await incognitoUtils.clickOn("#submit-poll-response-btn")
		}

		await utils.clickOn("#poll-close-btn");
		await utils.waitForElement("#poll-rm-btn");
		expect(utils.isPresent("#poll-rm-btn")).to.be.true;
		await utils.clickOn("#poll-rm-btn");
		await utils.waitForElement("#create-poll-def-btn");
		expect(await utils.isPresent("#create-poll-def-btn")).to.be.true;

		await incognitoBrowser.quit();

	});

});
