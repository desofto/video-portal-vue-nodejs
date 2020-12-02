module.exports = async () => {
  const { createTable } = require("../../db")
  
  await createTable(
    "users",
    {
      id: "SERIAL PRIMARY KEY", 
      email: "VARCHAR(30)",
      password: "VARCHAR(30)",
      token: "VARCHAR(64)",
      full_name: "VARCHAR(30)",
      created_at: "timestamp"
    }
  )
}