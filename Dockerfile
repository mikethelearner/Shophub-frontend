FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy project files
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Build the app
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Expose port
EXPOSE 8080

# Run the application
CMD ["serve", "-s", "dist", "-l", "8080"]