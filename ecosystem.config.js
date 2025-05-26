module.exports = {
  apps: [
    {
      name: 'rrs-cluster',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      wait_ready: true,
      kill_timeout: 5000,
      out_file: '/dev/null',
      error_file: '/dev/null',
      log_file: '/dev/null',
      node_args: '--max-old-space-size=4096 --trace_gc',
    },
  ],
};
