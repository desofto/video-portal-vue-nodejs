require 'json'
require 'dotenv'
require 'redis'
require 'active_record'
require 'json'
require 'sinatra'

Dotenv.load

set :port, ENV['PORT']

ActiveRecord::Base.establish_connection(ENV['DATABASE_URL'])

class Video < ActiveRecord::Base
  validates :name, presence: true
end

get '/api/videos' do
  videos = Video.where('name ilike ?', "%" + (params.dig('search') || '') + "%").order(rating: :desc)

  data = videos.map do |video|
    {
      id: video.id,
      name: video.name,
      poster_url: video.poster_url,
      rating: video.rating
    }
  end

  content_type :json
  JSON.generate(data)
end
