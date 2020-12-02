
module.exports = async () => {
  const { query } = require("../../db")

  const sql = `
    insert into users(id, email, password, full_name, created_at) values($1, $2, $3, $4, $5)
  `
  
  await query(sql, [1, "dmitry@desofto.com", "qwe", "Dmitry", new Date()])
  await query(sql, [2, "ellensia@desofto.com", "qwe", "Elen", new Date()])
}
