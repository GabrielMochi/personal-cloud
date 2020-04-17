const { IncomingForm } = require('formidable')

class AsyncIncomingForm extends IncomingForm {

  parseAsync (req) {
    return new Promise((resolve, reject) => {
      this.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        resolve({ fields, files })
      })
    })
  }

}

module.exports.AsyncIncomingForm = AsyncIncomingForm
