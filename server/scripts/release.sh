#!/bin/bash

WORK_DIR=$(pwd)
# ! check deploy.sh for details:
SCR_DIR=$(dirname -- "$0")
OUTPUT_DIR=server_build

cd "$SCR_DIR" && cd ..

echo "cleaning up output folder"
if [[ -d ${OUTPUT_DIR} ]]; then 
  rm -r ${OUTPUT_DIR}
fi 


echo "building backend ..."

mkdir -p ${OUTPUT_DIR}

cp -r account_server ${OUTPUT_DIR}
cp -r game_server ${OUTPUT_DIR}
cp -r hall_server ${OUTPUT_DIR}
cp -r sql ${OUTPUT_DIR}
cp -r utils ${OUTPUT_DIR}
cp -r scripts ${OUTPUT_DIR}
cp deploy_config.js ${OUTPUT_DIR}/configs.js
cp package-lock.json ${OUTPUT_DIR}
cp package.json ${OUTPUT_DIR}
cp start_all.sh ${OUTPUT_DIR}

tar -cvf server_build.tar.gz ${OUTPUT_DIR}

echo "finished"






