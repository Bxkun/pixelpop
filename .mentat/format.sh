#!/bin/bash

# Run ESLint with auto-fix
npm run lint:fix

# Run Prettier to format all files
npx prettier --write .
