# Use an official Node.js runtime as the base image
FROM node:20.11.1


# Set the working directory
WORKDIR /app

# Install dependencies
# Install Python, make, g++, and other necessary tools
#RUN apk add --no-cache python3 make g++ cairo-dev pango-dev giflib-dev

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"]
