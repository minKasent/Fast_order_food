module.exports = {
  apps: [
    {
      name: 'next-order-food-web',
      cwd: '/home/prod/Next_Pro/Next_order_food',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: '3000'
      }
    },
    {
      name: 'fast-order-food-api',
      cwd: '/home/prod/Next_Pro/Fast_order_food',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: '4000'
      }
    }
  ]
}
