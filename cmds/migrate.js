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

  //for(const file of files) {
  await files.reduce(async (promise, file) => {
    await promise;
    await migrate(file, async () => {
      console.log(file)
      await require("../db/migrations/" + file)()
    })
  }, Promise.resolve())

  pool.end()
})()