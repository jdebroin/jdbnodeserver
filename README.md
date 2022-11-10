Usage with Docker
-----------------

```
docker build -t jdbnodeserver .

docker run --name jdbnodeserver -d --restart unless-stopped -p 5000:5000 jdbnodeserver
```


Add HTTPS via nginx
-------------------

```
vim /etc/nginx/sites-enabled/$SITENAME
server {
        listen 443 ssl;
        listen [::]:443 ssl;

        server_name $SITENAME

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_prefer_server_ciphers on;
        ssl_ciphers "EECDH+ECDSA+AESGCM:EECDH+aRSA+AESGCM:EECDH+ECDSA+SHA256:EECDH+aRSA+SHA256:EECDH+ECDSA+SHA384:EECDH+ECDSA+SHA256:EECDH+aRSA+SHA384:EDH+aRSA+AESGCM:EDH+aRSA+SHA256:EDH+aRSA:EECDH:!aNULL:!eNULL:!MEDIUM:!LOW:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS:!RC4:!SEED";
        add_header Strict-Transport-Security "max-age=31536000";

        ssl_certificate /etc/certs/tls.crt;
        ssl_certificate_key /etc/certs/tls.key;

        location /mock {
                proxy_pass  http://localhost:5000;
        }
}
```


Add mTLS via nginx
------------------

https://medium.com/geekculture/mtls-with-nginx-and-nodejs-e3d0980ed950

### Create a CA

```
openssl req \
  -newkey rsa:4096 \
  -x509 \
  -keyout ca.key \
  -out ca.crt \
  -days 30 \
  -nodes \
  -subj "/CN=jdbca"
```

### Create a CSR

```
openssl req \
  -newkey rsa:4096 \
  -keyout client.key \
  -out client.csr \
  -nodes \
  -days 30 \
  -subj "/CN=client"
```

### Create a certificate signed by the CA

```
openssl x509 \ 
  -req \
  -in client.csr \
  -out client.crt \
  -CA ca.crt \
  -CAkey ca.key \
  -CAcreateserial \
  -days 30
```

### display the contents of a certificate

```
openssl x509 -in ca.crt -text -noout
```

### nginx config

```
vim /etc/nginx/sites-enabled/$SITENAME
server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name $SITENAME

    ssl_protocols           TLSv1.2 TLSv1.3;
    ssl_ciphers             HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    add_header Strict-Transport-Security "max-age=31536000";

    ssl_certificate /etc/certs/tls.crt;
    ssl_certificate_key /etc/certs/tls.key;

    ssl_client_certificate  /etc/nginx/client_certs/ca.crt;
    ssl_verify_client       optional;
    ssl_verify_depth        2;


    location /mockmtls {
	if ($ssl_client_verify != SUCCESS) { return 403; }

	proxy_set_header     SSL_Client_Issuer $ssl_client_i_dn;
	proxy_set_header     SSL_Client $ssl_client_s_dn;
	proxy_set_header     SSL_Client_Verify $ssl_client_verify;

	proxy_pass  http://localhost:5000;
    }
}
```

### test with curl

```
curl https://localhost \
  --cacert ca.crt \
  --key client.key \
  --cert client.crt
```
