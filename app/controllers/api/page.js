//
// Name:    page.js
// Purpose: Controller and routing for full page text
// Creator: Tom Söderlund
//

'use strict'

const express = require('express')
const helpers = require('../helpers')

const scrapePageContent = async function (req, res, next) {
  const pageUrl = decodeURIComponent(req.query.url)
  const loadExtraTime = req.query.time || 1000
  const bodyOnly = req.query.bodyOnly

  console.log(`Scrape text: "${pageUrl}", ${loadExtraTime} ms`)

  helpers.fetchPageWithPuppeteer(pageUrl, { loadExtraTime, bodyOnly })
    .then(documentHTML => {
      res.json({
        url: pageUrl,
        length: documentHTML.length,
        content: documentHTML
      })
    })
    .catch(err => {
      console.error({ err }, Object.keys(err))
      const statusCode = 400
      res.status(statusCode).json({ statusCode, message: err.toString() })
    })
}

// Routes

module.exports = function (app, config) {
  const router = express.Router()
  app.use('/', router)

  router.get('/api/page', scrapePageContent)
}
