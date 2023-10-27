#!/bin/ash

# Command 1
echo "Executing migrate:deploy"
npm run migrate:deploy

# Command 2
echo "Executing generate"
npm run generate

echo "Executing seeder"
npm run seed:production

echo "Executing run"
npm run start:production