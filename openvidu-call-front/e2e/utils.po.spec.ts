import { Browser, BrowserContext, expect, Locator, Page } from '@playwright/test';

// Extracted from Page.locator
export interface LocatorOptions {
  has?: Locator;
  hasNot?: Locator;
  hasNotText?: string|RegExp;
  hasText?: string|RegExp;
}

// Util types and interfaces for Page.getBy... (except by role) functions
// const GetByModes = [] as const;
export type GetByMode = "altText" | "label" | "placeholder" | "testId" | "text" | "title";
export interface GetByOptions { exact?: boolean };
export type GetByFunction = (text: string | RegExp, options?: GetByOptions) => Locator;
export type GetByFunctions = Record<GetByMode, GetByFunction>;

// Extracted from Page.getByRole
export type Role = "alert" | "alertdialog" | "application" | "article" | "banner" | "blockquote" | "button" | "caption" | "cell" | "checkbox" | "code" | "columnheader" | "combobox" | "complementary" | "contentinfo" | "definition" | "deletion" | "dialog" | "directory" | "document" | "emphasis" | "feed" | "figure" | "form" | "generic" | "grid" | "gridcell" | "group" | "heading" | "img" | "insertion" | "link" | "list" | "listbox" | "listitem" | "log" | "main" | "marquee" | "math" | "meter" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "navigation" | "none" | "note" | "option" | "paragraph" | "presentation" | "progressbar" | "radio" | "radiogroup" | "region" | "row" | "rowgroup" | "rowheader" | "scrollbar" | "search" | "searchbox" | "separator" | "slider" | "spinbutton" | "status" | "strong" | "subscript" | "superscript" | "switch" | "tab" | "table" | "tablist" | "tabpanel" | "term" | "textbox" | "time" | "timer" | "toolbar" | "tooltip" | "tree" | "treegrid" | "treeitem";
export interface GetByRoleOptions {
  checked?: boolean;
  disabled?: boolean;
  exact?: boolean;
  expanded?: boolean;
  includeHidden?: boolean;
  level?: number;
  name?: string | RegExp; pressed?: boolean;
  selected?: boolean;
}

// Extracted from Locator.click
export interface ClickOptions {
  button?: "left"|"right"|"middle";
  clickCount?: number;
  delay?: number;
  force?: boolean;
  modifiers?: Array<"Alt"|"Control"|"ControlOrMeta"|"Meta"|"Shift">;
  noWaitAfter?: boolean;
  position?: {
    x: number;
    y: number;
  };
  timeout?: number;
  trial?: boolean;
}

export class OpenViduCallPO {

  public timeout = 60000;

  public getFunctions: GetByFunctions;

  constructor(private page: Page) {
    this.getFunctions = {
      altText: this.page.getByAltText,
      label: this.page.getByLabel,
      placeholder: this.page.getByPlaceholder,
      testId: this.page.getByTestId,
      text: this.page.getByText,
      title: this.page.getByTitle
    };
  }

  // waitForElement is not needed since Playwright waits for them before performing any action

  getBy(byMode: GetByMode, text: string | RegExp, options?: GetByOptions): Locator {
    return this.getFunctions[byMode](text, options);
  }

  async waitFor(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, {timeout: timeout === undefined? this.timeout: timeout});
  }

  async isPresent(selector: string, options?: LocatorOptions, wait?: boolean): Promise<boolean> {
    if(wait === undefined || !!wait)
      await this.waitFor(selector, this.timeout)
    return (await this.page.locator(selector, options).all()).length > 0;
  }

  async isPresentBy(byMode: GetByMode, text: string | RegExp, options?: GetByOptions): Promise<boolean> {
    return (await this.getBy(byMode, text, options).all()).length > 0;
  }

  async isPresentByRole(role: Role, options?: GetByRoleOptions): Promise<boolean> {
    return (await this.page.getByRole(role, options).all()).length > 0;
  }

  async clickOn(selector: string, locatorOptions?: LocatorOptions, clickOptions?: ClickOptions): Promise<void> {
    await this.page.waitForSelector(selector, {timeout: this.timeout})
    await this.page.locator(selector, locatorOptions).click(clickOptions);
  }

  async clickOnBy(byMode: GetByMode, text: string | RegExp, getByOptions?: GetByOptions, clickOptions?: ClickOptions): Promise<void> {
    this.getBy(byMode, text, getByOptions).click(clickOptions);
  }

  async clickOnByRole(role: Role, roleOptions?: GetByRoleOptions, clickOptions?: ClickOptions): Promise<void> {
    this.page.getByRole(role, roleOptions).click(clickOptions);
  }

  async writeOn(selector: string, data: string): Promise<void> {
    await this.waitFor(selector);
    await this.page.fill(selector, data);
  }

  async checkPrejoinIsPresent(): Promise<void> {
    expect(await this.isPresent('#prejoin-container')).toBeTruthy();
  }

  async checkToolbarIsPresent(): Promise<void> {
    expect(await this.isPresent('#toolbar')).toBeTruthy();
  }

  async checkMediaButtonsArePresent(): Promise<void> {
    await this.checkToolbarIsPresent();
    expect(await this.isPresent('#media-buttons-container')).toBeTruthy();
  }

  async checkActionButtonsArePresent(): Promise<void> {
    await this.checkToolbarIsPresent();
    expect(await this.isPresent('#menu-buttons-container')).toBeTruthy();
  }

}

export interface OpenViduTestSessionData {
  context: BrowserContext;
  page: Page;
  utils: OpenViduCallPO;
  randomSessionId: string
}

export async function createTestSessionData(browser: Browser): Promise<OpenViduTestSessionData> {
  let context = await browser.newContext();
  let page = await context.newPage();
  return {context, page, utils: new OpenViduCallPO(page), randomSessionId: Math.floor(Math.random() * Math.pow(2, 64)).toString(16)};
}

export async function closeTestSessionData(data: OpenViduTestSessionData): Promise<void> {
  await data.page.close({reason: "Test End"});
  await data.context.close({reason: "Test End"});
}

export async function doLogin(sessionData: OpenViduTestSessionData, params?: {username: string, password: string}) {

  params ??= {username: "admin", password: "MY_SECRET"};

  await sessionData.page.goto(`/#/${sessionData.randomSessionId}`);

  await sessionData.utils.waitFor("#slogan-text");
  expect((await sessionData.page.locator("#slogan-text"))).toHaveText("Videoconference rooms in one click");
  await sessionData.utils.waitFor("#form-login");

  await sessionData.utils.waitFor("#login-username input");
  await sessionData.utils.writeOn("#login-username input", params.username);

  await sessionData.utils.waitFor("#login-password input");
  await sessionData.utils.writeOn("#login-password input", params.password);

  await sessionData.utils.clickOn("#join-btn");

  await sessionData.utils.waitFor('#form-session');

}
