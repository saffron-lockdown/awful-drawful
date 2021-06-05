import { Browser, BrowserContext, Page, chromium, devices } from 'playwright';

const iPhone = devices['iPhone 6'];
const appUrl = 'http://localhost:3000/';

let browser: Browser;
let context1: BrowserContext;
let context2: BrowserContext;
let page1: Page;

beforeEach(async () => {
  browser = await chromium.launch({
    headless: false,
  });
  context1 = await browser.newContext(iPhone);
  context2 = await browser.newContext();
  page1 = await context1.newPage();
  await page1.goto(appUrl);
});

afterEach(async () => {
  await browser.close();
});

it('lobby interactions', async () => {
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
  const fullGameIdText = await page1.textContent('text=Game ID');
  const gameId = fullGameIdText.match(/Game ID: ([A-Z]{4})/)[1];

  // second player joins the game
  const page2 = await context2.newPage();
  await page2.goto(appUrl);
  await page2.click('input[name="name"]');
  await page2.fill('input[name="name"]', 'tom');
  await page2.click('text=Set name');
  await page2.click('input[name="gameId"]');
  await page2.fill('input[name="gameId"]', gameId);
  await page2.click('text=Join game');
  const playerListDisplay1 = await page1.$('#player-list-display');
  expect(await playerListDisplay1?.screenshot()).toMatchImageSnapshot();
  const playerListDisplay2 = await page2.$('#player-list-display');
  expect(await playerListDisplay2?.screenshot()).toMatchImageSnapshot();

  // second player disconnects
  await page2.close();
  expect(await playerListDisplay1?.screenshot()).toMatchImageSnapshot();

  // second player rejoins
  const page3 = await context2.newPage();
  await page3.goto(appUrl);

  await page1.click('text=Game ID');
  await page1.click('text=Leave game');
  expect(await page1.isVisible('#join-game-button')).toBeTruthy();
  expect(await page1.isVisible('#create-game-button')).toBeTruthy();
});
