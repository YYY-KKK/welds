//
// Name:    helpers.js
// Purpose: Library for helper functions
// Creator: Tom Söderlund
//

'use strict'

const puppeteer = require('puppeteer')
const genericPool = require('generic-pool')

// Private functions

const poolManager = {
  create: () => puppeteer.launch({ args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'], ignoreHTTPSErrors: true }),
  destroy: (browser) => browser.close()
}

const browserPool = genericPool.createPool(poolManager, { min: 1, max: process.env.MAX_BROWSER_THREADS || 3, acquireTimeoutMillis: process.env.RENDER_TIMEOUT || 20 * 1000 })

const fetchPageWithPuppeteer = function (pageUrl, { loadExtraTime, bodyOnly }) {
  console.log(`Fetch page with Puppeteer: "${pageUrl}"`, { loadExtraTime, bodyOnly })

  return new Promise(async function (resolve, reject) {
    try {
      const browser = await browserPool.acquire()
      const page = await browser.newPage()

      if (['networkidle0'].includes(loadExtraTime)) {
        await page.goto(pageUrl, { waitUntil: loadExtraTime })
      } else {
        await page.goto(pageUrl)
        await page.waitFor(loadExtraTime)
      }

      // await page.content(), document.body.innerHTML, document.documentElement.outerHTML
      const documentHTML = bodyOnly
        ? await page.evaluate(() => document.body.outerHTML)
        : await page.evaluate(() => document.documentElement.outerHTML)

      await browserPool.release(browser)

      resolve(documentHTML)
    } catch (err) {
      reject(err)
    }
  })
}

/*
const fetchPageWithChrome = function (pageUrl, { loadExtraTime, bodyOnly }) {
  console.log(`Fetch page with Chrome: "${pageUrl}", ${loadExtraTime} ms`)

  return new Promise(async function (resolve, reject) {
    const domElement = bodyOnly ? 'document.body.outerHTML' : 'document.documentElement.outerHTML'

    const CDP = require('chrome-remote-interface')
    CDP((client) => {
      // Extract used DevTools domains.
      const { Page, Runtime } = client

      // Enable events on domains we are interested in.
      Promise.all([
        Page.enable()
      ]).then(() => {
        return Page.navigate({ url: pageUrl })
      })

      // Evaluate outerHTML after page has loaded.
      Page.loadEventFired(() => {
        setTimeout(() => {
          Runtime.evaluate({ expression: domElement }).then(response => {
            client.close()
            resolve(response.result.value)
          })
        }, loadExtraTime) // extra time before accessing DOM
      })
    }).on('error', err => {
      reject(err)
    })
  })
}
*/

// Public API

module.exports = {

  browserPool,

  // fetchPageWithChrome,
  fetchPageWithPuppeteer

}
