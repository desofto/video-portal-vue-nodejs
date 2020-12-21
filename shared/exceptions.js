class SqlError {
  constructor(sql, params, message = null) {
    params.forEach((value, index) => {
      sql = sql.replace(new RegExp("\\$" + (1 + index), "g"), value)
    })
    this.message = sql
    if (message) this.message = `sql failed: ${this.message} with "${message}"`
    this.name = "SqlError"
  }
}

class NotFound extends SqlError {
  constructor(sql, params) {
    super(`Not found: ${sql}`, params)
    this.name = "NotFound"
  }
}

class UnprocessableEntity {
  constructor(entityClass, msg) {
    this.message = `Unprocessable entity ${entityClass}: ${msg}`
    this.name = "NotFound"
  }
}



module.exports = { SqlError, NotFound, UnprocessableEntity }