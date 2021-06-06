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
const testGameId = 'ABCD';

let browserChrome: ChromiumBrowser;
let browserWebKit: WebKitBrowser;
let context1: BrowserContext;
let context2: BrowserContext;
let page1: Page;
let page2: Page;

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

  await page1.fill('input[name="name"]', 'wz');
  await page1.click('text=Set name');
  expect(await page1.textContent('#name-display')).toContain('wz tap to edit');

  await page1.click('text=wz tap to edit');
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
  expect(await page1.textContent('#game-id-display')).toMatch(
    /Game ID: [A-Z]{4}  Leave game/
  );

  // leave game
  await page1.click('text=Game ID');
  await page1.click('text=Leave game');
  expect(await page1.isVisible('#join-game-button')).toBeTruthy();
  expect(await page1.isVisible('#create-game-button')).toBeTruthy();

  // first player joins test game
  await page1.fill('input[name="gameId"]', testGameId);
  await page1.click('text=Join game');

  // second player joins test game
  page2 = await context2.newPage();
  await page2.goto(appUrl);
  await page2.fill('input[name="name"]', 'tom');
  await page2.click('text=Set name');
  await page2.fill('input[name="gameId"]', testGameId);
  await page2.click('text=Join game');
  await page1.waitForSelector('#player-list-display > span:nth-child(2)');
  const playerListDisplay1 = await page1.$('#player-list-display');
  expect(await playerListDisplay1?.screenshot()).toMatchImageSnapshot({
    customSnapshotIdentifier: 'player-list-display',
  });

  // second player disconnects
  await page2.close();
  await page1.waitForSelector('#player-list-display > span:nth-child(2) > svg');

  // second player rejoins
  page2 = await context2.newPage();
  await page2.goto(appUrl);
  expect(await page2.textContent('#player-list-display')).toBe(
    ' Players:  wzt  tom '
  );

  // first player starts the game
  await page1.click("text=Everybody's in!");
  expect(await page1.textContent('#display')).toContain(
    'Your prompt to draw is:'
  );

  // first player draws and submits
  const positions1: [number, number][] = [
    [150, 200],
    [200, 200],
    [250, 200],
    [150, 300],
    [200, 300],
    [250, 300],
    [150, 400],
    [200, 400],
    [250, 400],
  ];
  for (const position of positions1) {
    await page1.mouse.click(...position);
  }
  const easel = await page1.$('#easel');
  expect(await easel?.screenshot()).toMatchImageSnapshot({
    customSnapshotIdentifier: 'easel-drawing-1',
  });

  await page1.click('text=Post');
  expect(await page1.textContent('#display')).toContain(
    'Waiting for other players to finish drawing'
  );

  // second player draws and submits
  const positions2: [number, number][] = [
    [150, 250],
    [200, 250],
    [250, 250],
    [150, 300],
    [200, 300],
    [250, 300],
    [150, 350],
    [200, 350],
    [250, 350],
  ];
  for (const position of positions2) {
    await page2.mouse.click(...position);
  }
  await page2.click('text=Post');
  await waitForExpect(async () => {
    expect(await page1.textContent('#display')).toContain(
      'Waiting for other players to caption the drawing'
    );
  });

  // second player enters caption
  await page2.fill('#caption-input', 'test caption');
  await page2.click('text=Submit');
});
