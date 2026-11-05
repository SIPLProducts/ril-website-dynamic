module.exports = {
  apps: [{
    name: "ril-website",
    cwd: "/apps/website/ril-website/frontend",
    script: "dist/server/index.mjs",
    node_args: "--env-file=/apps/website/ril-website/frontend/.env",
    instances: 1,
    autorestart: true,
    max_memory_restart: "1G",
  }],
};
