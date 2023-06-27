# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install --only=production

# Copy the application code to the working directory
COPY . .

# Expose the port on which the Node.js application will run
EXPOSE 3000

# Specify the command to run the Node.js application
CMD ["node", "index.js"]
