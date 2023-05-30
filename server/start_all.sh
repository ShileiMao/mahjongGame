nohup node ./account_server/app.js ../configs.js > startup.log 2>&1 &
echo $! > server_pids.txt
nohup node ./hall_server/app.js ../configs.js >> startup.log 2>&1 &
echo $! >> server_pids.txt
nohup node ./game_server/app.js ../configs.js >> startup.log 2>&1 &
echo $! >> server_pids.txt