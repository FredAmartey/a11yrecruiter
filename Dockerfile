FROM node:10

LABEL maintainer="Fred Amartey"

# Sets work directory
WORKDIR /usr/src/app

# Copy package.json
COPY ["package.json", "./"]

# Installs dependencies 
RUN npm install --production --silent

# Copy working files
COPY . .

# Expose port
EXPOSE 3000

# Starts run command
CMD node app.js