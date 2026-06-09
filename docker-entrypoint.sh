#!/bin/sh
set -e

mkdir -p /app/public/uploads/menu
chown -R bristo:bristo /app/public/uploads

exec su-exec bristo "$@"
