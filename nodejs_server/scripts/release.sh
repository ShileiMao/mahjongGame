#!/bin/bash


WORK_DIR=$(pwd)
# ! check deploy.sh for details:
SCR_DIR=$(dirname -- "$0")

cd "$SCR_DIR" && cd ..

echo "cleaning up output folder"
if [[ -d artifacts ]]; then 
  rm -r artifacts
fi 


echo "building backend ..."
npm run build-prod

echo "genering build archive ..."

mkdir artifacts

cp -r server-backend artifacts/server-backend

cp -r game_root artifacts/server-backend

cp start_server.sh artifacts/server-backend
cp stop_server.sh artifacts/server-backend

tar -cvf artifacts.tar artifacts

echo "finished"