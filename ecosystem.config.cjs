module.exports = {
  apps: [
    {
      name: 'fitness-api',
      script: 'server.mjs',
      env: {
        NODE_ENV: 'development',
        FITNESS_API_PORT: 9100
      }
    },
    {
      name: 'fitness-agent-server',
      script: 'uv',
      args: 'run python -m fitness_agent.server',
      cwd: 'catalog',
    },
    {
      name: 'fitness-agent-watcher',
      script: 'uv',
      args: 'run python -m fitness_agent.cli watch',
      cwd: 'catalog',
    }

  ]
};
