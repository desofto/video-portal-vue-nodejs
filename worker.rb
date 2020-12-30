require 'dotenv'
require 'redis'
require 'active_record'
require 'json'

Dotenv.load

ActiveRecord::Base.establish_connection(ENV['DATABASE_URL'])

class Video < ActiveRecord::Base
  validates :name, presence: true
end

exit_requested = false
Kernel.trap( "INT" ) { exit }

class Processor
  def initialize
    @channels = {}
  end

  def add(channel, &block)
    @channels[channel] = block
  end

  def run
    loop do
      channel, key = redis.brpop @channels.keys
      res = { 'status' => nil, 'data' => nil }

      begin
        req = redis.get(key)
        req = JSON.parse(req)

        res['data'] = @channels[channel].call(req)

        res['status'] = res['data'] ? 200 : 204
      rescue
        res['status'] = 500
      end

      redis.set(key, res.to_json)
      redis.publish(channel, key)
    end
  end

  private

  def redis
    @redis ||= ::Redis.new(url: ENV['REDIS_URL']).tap(&:ping)
  end
end

processor = Processor.new

processor.add "videos" do |req, res|
  videos = Video.where('name ilike ?', "%" + req['search'] + "%").order(rating: :desc)

  videos.map do |video|
    {
      id: video.id,
      name: video.name,
      poster_url: video.poster_url,
      rating: video.rating
    }
  end
end

processor.add "video-post" do |req, res|
  video = Video.find(req['id'])
  video.rating = req['rating']
  video.save!
end

processor.run