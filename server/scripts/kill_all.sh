# sudo kill -9 `sudo lsof -t -i:9000`
# sudo kill -9 `sudo lsof -t -i:9001`
# sudo kill -9 `sudo lsof -t -i:9002`
# sudo kill -9 `sudo lsof -t -i:9003`
# sudo kill -9 `sudo lsof -t -i:10000`


WORK_DIR=$(pwd)
# ! check deploy.sh for details:
SCR_DIR=$(dirname -- "$0")

cd $SCR_DIR 

echo "PIDs: "
cat ../server_pids.txt 

kill -9 `cat ../server_pids.txt`

rm ../server_pids.txt

cd $WORK_DIR