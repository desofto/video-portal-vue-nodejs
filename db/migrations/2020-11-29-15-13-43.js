
module.exports = async () => {
  const { createTable } = require("../../db")
  
  await createTable(
    "videos",
    {
      id: "SERIAL PRIMARY KEY", 
      name: "VARCHAR(30)",
      poster_url: "VARCHAR(4096)",
      created_at: "timestamp"
    }
  )
}
