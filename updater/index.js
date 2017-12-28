'use strict';
const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();

process.env.NODE_ENV = 'development';

app.use(require('morgan')('dev'));

app.use('/updates/releases', express.static(path.join(__dirname, 'releases')));

console.log(__dirname);

app.get('/updates/latest', (req, res) => {
  const latest = getLatestRelease();
  const clientVersion = req.query.v;

  console.log(latest, clientVersion)

  if (clientVersion === latest) {
    console.log("no update available");
    res.status(204).end();
  } else {
        console.log("time to update!");
    res.json({
      url: `${getBaseUrl()}/updates/releases/${latest}/MyApp.zip`
    });
  }
});

let getLatestRelease = () => {
  const dir = `${__dirname}/updates/releases`;

  const versionsDesc = fs.readdirSync(dir).filter((file) => {
    const filePath = path.join(dir, file);
    return fs.statSync(filePath).isDirectory();
  }).reverse();

  return versionsDesc[0];
}

let getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  } else {
    return 'http://download.mydomain.com'
  }
}

app.listen(process.env.PORT, () => {
  console.log(`Express server listening on port ${process.env.PORT}`);
});
