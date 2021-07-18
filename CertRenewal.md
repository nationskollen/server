# Certbot and LetsEncrypt

The server that is used for nationskollen uses certificates with the help of
`Certbot` and `LetsEncrypt`.

Let's Encrypt is a non-profit certificate authority run by Internet Security
Research Group (ISRG) that provides X.509 certificates for Transport Layer
Security (TLS) encryption at no charge. It is the world's largest certificate
authority, used by millions of websites. The goal is to make all websites secure
and use `HTTPS`.

Certbot is usually meant to be used to switch an existing HTTP site to work in
HTTPS (and, afterward, to continue renewing the site's HTTPS certificates
whenever necessary). Some Certbot documentation assumes or recommends that you
have a working web site that can already be accessed using HTTP on port 80.

Basically, Certbot is set up with the help of a CRON-job in the system that runs
when it is time to renew the certificate(s).

## If you need to renew Certificates manually - or a Certbot challenge failed

Try to run at first the following command as root:

```
$ sudo certbot renew
```

The following output is the expected output:

```
root@nationskollen-staging:~# sudo certbot renew --dry-run
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Processing /etc/letsencrypt/renewal/nationskollen-staging.engstrand.nu.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Cert not due for renewal, but simulating renewal for dry run
Plugins selected: Authenticator nginx, Installer nginx
Renewing an existing certificate
Performing the following challenges:
http-01 challenge for nationskollen-staging.engstrand.nu
Waiting for verification...
Cleaning up challenges

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
new certificate deployed with reload of nginx server; fullchain is
/etc/letsencrypt/live/nationskollen-staging.engstrand.nu/fullchain.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
** DRY RUN: simulating 'certbot renew' close to cert expiry
**          (The test certificates below have not been saved.)

Congratulations, all renewals succeeded. The following certs have been renewed:
  /etc/letsencrypt/live/nationskollen-staging.engstrand.nu/fullchain.pem (success)
** DRY RUN: simulating 'certbot renew' close to cert expiry
**          (The test certificates above have not been saved.)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

Do have in mind that the output above is a simulated output achieved with the
help of the command

```
$ sudo certbot renew --dry-run
```

The `--dry-run` flag tells certbot to simulate the renewal.

Reason for this is that there is a limit as to how many requests that is allowed
to renew or create a certificate and apply it. The amount is ~7 as to how many
'attempts' that is allowed.

If all goes well, test by going to any nationskollen route and make sure that
the browser accepts a connectiion with the protocol `HTTPS`.

### If things dont go well...

Try to understand what is wrong, ask team-members or someone that also knows
about the server before making changes!

If its not helping, you can probably achieve a new certificate by deleting the
old (expired) certificate and create a new one.

Do it in this order:

-   Comment out lines that look similar to this:

```
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/nationskollen-staging.engstrand.nu/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/nationskollen-staging.engstrand.nu/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
```

in file `/etc/nginx/sites-enabled/default`

-   Turn off the Nginx server:

```
$ sudo systemctl stop nginx
```

-   Delete the old certificate

```
$ sudo certbot delete nationskollen-staging.engstrand.nu
```

-   Make sure that either port 80 and 443 is allowed in `ufw` or Nginx
    Full/HTTP/HTTPS, see below output for reference:

```
$ sudo ufw status numbered
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] Nginx HTTPS                ALLOW IN    Anywhere
[ 2] 22/tcp                     ALLOW IN    Anywhere
[ 3] 80/tcp                     ALLOW IN    Anywhere
[ 4] 443/tcp                    ALLOW IN    Anywhere
[ 5] Nginx Full                 ALLOW IN    Anywhere
[ 6] Nginx HTTPS (v6)           ALLOW IN    Anywhere (v6)
[ 7] 22/tcp (v6)                ALLOW IN    Anywhere (v6)
[ 8] 80/tcp (v6)                ALLOW IN    Anywhere (v6)
[ 9] 443/tcp (v6)               ALLOW IN    Anywhere (v6)
[10] Nginx Full (v6)            ALLOW IN    Anywhere (v6)
```

-   Start nginx server

```
$ sudo systemctl start nginx
```

-   If the server started and nothing interuppts the startup, run the setup
    command of certificate:

```
$ sudo certbot --nginx # this command will provide configuration for the rows that were commented out earlier
```

-   Follow the wizard and set up the new certificate for the website
    `nationskollen-staging.engstrand.nu`.

-   Make sure that in `/etc/nginx/sites-enabled/default`, the following rows are
    supplied by the certbot command earlier:

```
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/nationskollen-staging.engstrand.nu/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/nationskollen-staging.engstrand.nu/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
```

Try to visit any route in the webserver now and see if it allows any sort of
HTTPS connection.

Run the command `sudo certbot renew --dry-run` to simulate the renewal and make
sure this passes.

Congratulations, hopefully the server is not certified and all is well!
Run the regular setup for starting nationskollen api.
