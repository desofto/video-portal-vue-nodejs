
module.exports = async () => {
  const { createTable } = require("../../db")

  await createTable(
    "video_ratings",
    {
      id: "SERIAL PRIMARY KEY",
      video_id: "bigint",
      user_id: "bigint",
      rating: "int",
      created_at: "timestamp"
    }
  )
}
