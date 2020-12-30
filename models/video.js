const Model = require("../shared/model")
const currentUser = require("../shared/current-user")
const VideoRating = require("./video-rating")

class Video extends Model {
  static TableName = "videos"

  async rating(rating) {
    return new Promise(async (resolve, reject) => {
      if (rating === undefined) {
        if (currentUser.id) {
          try {
            let rating = await VideoRating.findBySQL("video_id = $1 and user_id = $2", [this.id, currentUser.id])
            resolve(rating.rating)
          } catch {
            resolve(this._data.rating)
          }
        } else {
          resolve(this._data.rating)
        }
      } else {
        if (!currentUser.id) {
          reject()
          return
        }

        let rate
        try {
          rate = await VideoRating.findBySQL("video_id = $1 and user_id = $2", [this.id, currentUser.id])
        } catch {
          rate = new VideoRating()
          rate.video_id = this.id
          rate.user_id = currentUser.id
          rate.created_at = new Date()
        }
        rate.rating = rating
        await rate.save()
        resolve()
      }
    })
  }
}

module.exports = Video