//This file is used for setting env variables in PM2
module.exports = {
  apps : [
      {
        env_development: {
            "NODE_ENV": "development"
        },
        env_staging: {
            "NODE_ENV": "staging"
        },
        env_production: {
            "NODE_ENV": "production"
        },
        env_demo: {
            "NODE_ENV": "demo"
        }
      }
  ]
}


