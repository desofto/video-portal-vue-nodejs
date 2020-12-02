
module.exports = async () => {
  const { createTable } = require("../../db")
  
  await createTable(
    "ratings",
    {
      id: "SERIAL PRIMARY KEY", 
      user_id: "bigint",
      video_id: "bigint",
      created_at: "timestamp"
    }
  )
}
