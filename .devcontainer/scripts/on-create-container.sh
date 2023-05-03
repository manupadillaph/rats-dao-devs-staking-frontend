#!/usr/bin/env bash

echo ""
echo "----------------------------"

echo "Change owner of ${WORK}"

# sudo find ${WORK}/* -maxdepth 1 -type f -exec chown -R frontend {} \;

find ${WORK}/* -maxdepth 2 -exec sudo chown ${USER} -hR "${WORK}" \; | pv -lep -s $(find ${WORK}/* -maxdepth 2 | wc -l) >/dev/null
find ${WORK}/* -maxdepth 2 -type d -exec sudo chmod 755 {} \;  | pv -lep -s $(find ${WORK}/* -maxdepth 2 -type d | wc -l) >/dev/null
find ${WORK}/* -maxdepth 2 -type f -exec sudo chmod u+w  {} \; | pv -lep -s $(find ${WORK}/* -maxdepth 2 -type f | wc -l) >/dev/null

echo "Change owner of ${WORK}: OK"

echo "----------------------------"

echo "Install dependencies"

npm install

echo "Install dependencies: OK"

echo "----------------------------"

echo "Build project"

npm run build

echo "Build project: OK"

echo "----------------------------"