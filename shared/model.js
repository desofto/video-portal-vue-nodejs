const { pool } = require("../db")

class GettersSetters {
  constructor() {
    this._data = {}
    this._changes = {}

    return new Proxy(this, {
      get(target, key, _receiver) {
        if(key in target) {
          return target[key]
        } else {
          return target._data[key]
        }
      },

      set(target, key, value, _receiver) {
        if(key in target) {
          target[key] = value
        } else {
          target._data[key] = value
          target._changes[key] = value
        }

        return true
      }
    })
  }
}

class Model extends GettersSetters {
  constructor(data = {}) {
    super()
    this._data = data
  }

  async save() {
    if(this.id) {
      let fields = [], params = []
      params.push(this.id)
      Object.keys(this._changes).forEach((name, index) => {
        fields.push(name + " = $" + (2 + index))
        params.push(this._changes[name])
      })

      let sql = `update ${this.constructor.TableName} set ${fields.join(", ")} where id = $1`

      let res = await pool.query(sql, params)
      if (res.rowCount > 0) {
        this._changes = {}
        return true
      }
    } else {
      let fields = [], values = [], params = []
      Object.keys(this._changes).forEach((name, index) => {
        fields.push(name)
        values.push("$" + (1 + index))
        params.push(this._changes[name])
      })

      let sql = `insert into ${this.constructor.TableName}(${fields.join(", ")}) values(${values.join(", ")}) RETURNING id`

      let res = await pool.query(sql, params)
      if (res.rowCount > 0) {
        this._data.id = res.rows[0].id
        this._changes = {}
        return true
      }
    }
  }

  async destroy() {
    let sql = `delete from ${this.constructor.TableName} where id = $1`
    let res = await pool.query(sql, [this.id])
    return res.rowCount > 0
  }

  static async query(sql, params) {
    try {
      let { rows } = await pool.query(sql, params)
      return rows
    } catch (e) {
      return
    }
  }

  static async find(id) {
    return this.findBySQL("id = $1", [id])
  }

  static async findBySQL(conditions = "1 = 1", params = []) {
    let rows = await this.query(`select * from ${this.TableName} where ${conditions} limit 1`, params)
    if (rows.length > 0) {
      return (new this(rows[0]))
    }
  }

  static async where(conditions = "1 = 1", params = []) {
    let rows = await this.query(`select * from ${this.TableName} where ${conditions}`, params)
    return rows.map(row => new this(row))
  }

  static async all() {
    return await this.where()
  }
}

module.exports = Model