const express = require('express')
const request = require('request')

const app = express()

const RESTRICTED_FILES = ['env-config.js', 'favicon']

app.use('/subscription/_next', express.static('.next'))
// app.use("/", express.static("public"));

app.use('/:path(*)', async (req, res) => {
   try {
      /*
    Browser <-> Express <-> NextJS
    */
      const { path } = req.params
      const { host } = req.headers

      console.log(path)

      const url = RESTRICTED_FILES.some(file => path.includes(file))
         ? 'http://localhost:3000/' + path
         : 'http://localhost:3000/subscription/' +
           host.replace(':', '') +
           '/' +
           path.replace('subscription/', '')
      console.log(url)

      request(url, function (error, _, body) {
         if (error) {
            console.log(error)
         } else {
            res.send(body)
         }
      })
   } catch (err) {
      console.log(err)
   }
})

app.listen(4000, () => {
   console.log('App started on 4000!')
})
