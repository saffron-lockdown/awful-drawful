import {
  BrowserContext,
  ChromiumBrowser,
  Page,
  WebKitBrowser,
  chromium,
  devices,
  webkit,
} from 'playwright';

const appUrl = 'http://localhost:3000/';

let browserChrome: ChromiumBrowser;
let browserWebKit: WebKitBrowser;
let context1: BrowserContext;
let context2: BrowserContext;
let page1: Page;

beforeAll(async () => {
  browserChrome = await chromium.launch({
    headless: false,
    slowMo: 100,
  });
  browserWebKit = await webkit.launch({
    headless: false,
    slowMo: 100,
  });
});

afterAll(async () => {
  await browserChrome.close();
  await browserWebKit.close();
});

beforeEach(async () => {
  context1 = await browserChrome.newContext(devices['Pixel 2']);
  context2 = await browserWebKit.newContext(devices['iPhone 6']);
  page1 = await context1.newPage();
  await page1.goto(appUrl);
});

it('end to end tests', async () => {
  expect(await page1.textContent('input[name="name"]')).toBe('');

  await page1.click('input[name="name"]');
  await page1.fill('input[name="name"]', 'wz');
  await page1.click('text=Set name');
  expect(await page1.textContent('#name-display')).toContain('wz tap to edit');

  await page1.click('text=wz tap to edit');
  await page1.click('input[name="name"]');
  await page1.fill('input[name="name"]', 'wzt');
  await page1.click('text=Set name');
  expect(await page1.textContent('#name-display')).toContain('wzt tap to edit');

  await page1.click('text=Join game');
  expect(await page1.textContent('#error-display')).toContain(
    'Error: game does not exist'
  );

  await page1.click('text=Create game');
  expect(await page1.textContent('#player-list-display')).toBe(
    ' Players:  wzt '
  );

  // second player joins the game
  let page2 = await context2.newPage();
  await page2.goto(appUrl);
  await page2.click('input[name="name"]');
  await page2.fill('input[name="name"]', 'tom');
  await page2.click('text=Set name');
  await page2.click('input[name="gameId"]');
  const fullGameIdText = await page1.textContent('text=Game ID');
  const gameId = fullGameIdText.match(/Game ID: ([A-Z]{4})/)[1];
  await page2.fill('input[name="gameId"]', gameId);
  await page2.click('text=Join game');
  const playerListDisplay1 = await page1.$('#player-list-display');
  expect(await playerListDisplay1?.screenshot()).toMatchImageSnapshot({
    customSnapshotIdentifier: 'player-list-display',
  });

  // second player disconnects
  await page2.close();
  await waitForExpect(async () => {
    expect(
      await page1.isVisible('#player-list-display > span:nth-child(2) > svg')
    ).toBeTruthy();
  });

  // second player rejoins
  page2 = await context2.newPage();
  await page2.goto(appUrl);
  expect(await page2.textContent('#player-list-display')).toBe(
    ' Players:  wzt  tom '
  );

  // start the game
  await page1.click("text=Everybody's in!");
  expect(await page1.textContent('#display')).toContain(
    'Your prompt to draw is:'
  );

  await page1.mouse.click(200, 300);
  await page1.mouse.click(300, 400);
  await page1.mouse.click(200, 500);
  await page1.mouse.click(300, 600);
  expect(await page1.screenshot()).toMatchImageSnapshot({
    customSnapshotIdentifier: 'easel-drawing-1',
  });

  await page1.click('text=Post');
  expect(await page1.textContent('#display')).toContain(
    'Waiting for other players to caption the drawing'
  );

  // leave game
  // await page1.click('text=Game ID');
  // await page1.click('text=Leave game');
  // expect(await page1.isVisible('#join-game-button')).toBeTruthy();
  // expect(await page1.isVisible('#create-game-button')).toBeTruthy();
});
