'use strict'
const fs = require('fs')
const express = require('express')
const path = require('path')
const app = express()

process.env.NODE_ENV = 'development'

app.use(require('morgan')('dev'))

app.use('/', express.static(path.join(__dirname, 'releases')))

console.log(__dirname)

app.get('/releases/latest', (req, res) => {
  const latest = getLatestRelease()
  const clientVersion = req.query.v
  console.log(clientVersion)

  console.log(latest, clientVersion)

  if (clientVersion === latest) {
    console.warn("no update available")
    res.status(204).end()
  } else {
        console.warn("time to update!")
    res.json({
      url: `${getBaseUrl()}/releases/${latest}/lapsey.zip`
    })
  }
})

let getLatestRelease = () => {
  const dir = `${__dirname}/releases`

  const versionsDesc = fs.readdirSync(dir).filter((file) => {
    const filePath = path.join(dir, file)
    return fs.statSync(filePath).isDirectory()
  }).reverse()

  return versionsDesc[0]
}

let getBaseUrl = () => {
  if (location.protocol !== "https:") location.protocol = "https:"

  if (process.env.NODE_ENV === 'development') {
    return '//localhost:3000'
  } else {
    return '//schultz.co'
  }
}

app.listen(process.env.PORT, () => {
  console.log(`Express server listening on port ${process.env.PORT}`)
})
