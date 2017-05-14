module.exports = {
  db: '<YOUR MONGODB>',
  mailgun: {
    domain_name: '<YOUR MAILGUN DOMAIN_NAME>',
    api_key: '<YOUR MAILGUN API_KEY>'
  },
  mailto: {
    success: ['<YOUR MAIL>'],
    error: ['<YOUR MAIL>']
  },
  domain: '<YOUR DOMAIN>',
  redis: {
    host: "",
    port: 0000
  },
  session_keys: ["", ""],
  admin: [
    {
      username: '',
      password: '',
      root: false
    },
    {
      username: '',
      password: '',
      root: ture
    }
  ]
};