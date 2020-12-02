const { query, pool } = require("../db")

async function migrate(hash, migration) {
  let rows = await query("select count(*) from migrations where hash = $1", [hash])
  if (rows[0].count > 0) return

  await migration()

  await query("insert into migrations(hash) values($1)", [hash])
}

; (async () => {
  try {
    await query("select count(*) from migrations", [])
  } catch(_) {
    await query("create table migrations(hash text PRIMARY KEY)")
  }

  const fs = require("fs")

  let files = fs.readdirSync("./db/migrations/").sort()

  let promises = []

  files.forEach(file => {
    promises.push(migrate(file, async () => {
      await require("../db/migrations/" + file)()
    }))
  })

  await Promise.all(promises)

  pool.end()
})()