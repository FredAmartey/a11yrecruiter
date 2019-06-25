FROM node:10

LABEL maintainer="Fred Amartey"

# Sets work directory
RUN mkdir -p /var/www/a11yrecruiter
WORKDIR /var/www/a11yrecruiter

# Copy package.json
COPY ["package.json", "./"]

# Installs dependencies 
RUN npm install --production --silent

# Copy working files
COPY ./ ./

# Expose port
EXPOSE 3000 27017

# Starts run command
CMD node app.js