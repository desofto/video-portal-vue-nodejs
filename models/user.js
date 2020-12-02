const Model = require("../shared/model")

class User extends Model {
  static TableName = "users"
}

module.exports = User