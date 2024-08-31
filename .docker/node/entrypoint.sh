#!/bin/bash
echo "Container em execução"
mkdir -p tmp/export
#rm -rf node_modules
npm install --legacy-peer-deps
npm run migration:run
npm run start:debug