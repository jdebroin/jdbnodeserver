docker build -t jdbnodeserver .

docker run --name jdbnodeserver -d --restart unless-stopped -p 5000:5000 jdbnodeserver
