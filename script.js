const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Открываем страницу
  await page.goto("http://localhost:3000");

  // Десктопный скриншот
  await page.setViewport({ width: 1280, height: 800 });
  await page.screenshot({ path: "public/screenshots/desktop.png" });

  // Мобильный скриншот
  await page.setViewport({ width: 750, height: 1334, isMobile: true });
  await page.screenshot({ path: "public/screenshots/mobile.png" });

  await browser.close();
})();