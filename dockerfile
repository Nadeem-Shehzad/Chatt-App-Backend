FROM node:22

WORKDIR /usr/src/app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install all dependencies, including dev dependencies (needed for nodemon, ts-node)
RUN npm ci

# Install nodemon etc globally is optional but you can skip if already in devDependencies
RUN npm install -g nodemon ts-node typescript

# Copy all source code after dependencies installed
COPY . .

EXPOSE 3000

# Start your app with nodemon watching your source files
CMD ["nodemon"]


#CMD ["npm", "run", "dev"]