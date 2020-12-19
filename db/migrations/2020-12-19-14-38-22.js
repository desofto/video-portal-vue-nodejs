
module.exports = async () => {
  const { query } = require("../../db")

  const sql = `
    alter table videos add column rating bigint default 0
  `
  
  await query(sql)
}
