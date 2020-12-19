const fs = require("fs")
const moment = require("moment")

const Template = `
module.exports = async () => {
  const { query } = require("../../db")

  const sql = \`
  \`
  
  await query(sql)
}
`

fs.writeFile("./db/migrations/" + moment().format('YYYY-MM-DD-HH-mm-ss') + ".js", Template, function (err) {
  if (err) throw err
})