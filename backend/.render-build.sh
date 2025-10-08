#!/usr/bin/env bash
# Ensure devDependencies (like @types) are installed before building
npm install --include=dev
npm run build
