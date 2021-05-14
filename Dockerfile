# Dockerfile.rails
FROM ruby:latest

RUN apt-get update -qq && apt-get install -y nginx vim

COPY ./nginx/default /etc/nginx/sites-enabled/default

WORKDIR /source

COPY . .

RUN rm -rf _site

RUN gem install jekyll bundle

RUN bundle install

RUN bundle exec jekyll build

RUN mv _site /site 

WORKDIR /site

RUN rm -rf /source

CMD ["nginx", "-g", "daemon off;"]

