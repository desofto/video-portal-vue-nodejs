const { query, pool } = require("../db")

; (async () => {
  let rows = await query("select hash from migrations order by hash desc limit 1")

  let hash = rows[0].hash

  console.log(hash)

  await query("delete from migrations where hash = $1", [hash])

  pool.end()
})()