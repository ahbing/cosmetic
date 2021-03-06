module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : "cosmetic",
      script    : "./bin/www",
      env: {
        COMMON_VARIABLE: "true"
      },
      env_production : {
        NODE_ENV: "production"
      },
      watch : true,
      ignore_watch: ["node_modules"]
    },

    // Second application
    {
      name      : "check-cosmetic",
      script    : "./lib/check.js",
      watch : true,
      ignore_watch: ["node_modules"]
    },

    // Third application
    {
      name      : "check-newest",
      script    : "./lib/newest.js",
      watch : true,
      ignore_watch: ["node_modules"]
    }
  ]
}
