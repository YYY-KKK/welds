//
// Name:    helpers.js
// Purpose: Library for helper functions
// Creator: Tom Söderlund
//

'use strict'

const puppeteer = require('puppeteer')

// Private functions

const fetchPageWithPuppeteer = function (pageUrl, { loadExtraTime, bodyOnly }) {
  console.log(`Fetch page with Puppeteer: "${pageUrl}"`, { loadExtraTime, bodyOnly })

  return new Promise(async function (resolve, reject) {
    try {
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] })

      const page = await browser.newPage()
      await page.goto(pageUrl)
      await page.waitFor(loadExtraTime)

      // await page.content(), document.body.innerHTML, document.documentElement.outerHTML
      const documentHTML = bodyOnly
        ? await page.evaluate(() => document.body.outerHTML)
        : await page.evaluate(() => document.documentElement.outerHTML)

      await browser.close()

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

  // fetchPageWithChrome,
  fetchPageWithPuppeteer

}