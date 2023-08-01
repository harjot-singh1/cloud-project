# Pull official base image
FROM node:20.4.0

# Set working directory in the container
WORKDIR /app


# Install application dependencies
COPY package.json ./
COPY package-lock.json ./
# RUN npm ci --silent
RUN npm install --legacy-peer-deps

# Add app
COPY . ./

EXPOSE 3000
# Start app
CMD ["npm", "start"]
