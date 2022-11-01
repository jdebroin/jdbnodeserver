# parent image
FROM node:18.12.0-bullseye

# to make it easier to troubleshoot
RUN apt-get update && apt-get install -y \
    vim

# set working directory
WORKDIR /usr/local/webrtc

COPY *.js ./
COPY public public/
COPY package.json ./
COPY *.pem ./
  
RUN npm install
# for production
# RUN npm install --only=production

USER node

CMD [ "npm", "start" ]
