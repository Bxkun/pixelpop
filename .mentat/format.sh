#!/bin/bash

# Run ESLint with auto-fix
npm run lint:fix

# Run Prettier to format all files, ignoring files in .gitignore
npx prettier --write . --ignore-path .gitignore
