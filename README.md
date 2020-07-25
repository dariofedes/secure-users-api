# Secure Users API

Preventing unintended data leaks in your users API.

"PLAN
IMPLEMENT
TEST
IMPROVE
ITERATE"

## 1.0.0

Our API works properly by registering and authenticating users and retrieving their information. However, it is still very insecure as it returns users' passwords on request. It also exposes metadata from our database, which is also very insecure.

## 1.1.0

We use the `sanitize()` function to remove the password and MongoDB metadata from the `user` object before sending it back to the client.

## 1.2.0

Until now, users' passwords were stored in the database unencrypted, which compromised our users' accounts in the event of an attack that exposed the database. We now use [`bcrypt`](https://www.npmjs.com/package/bcrypt) to store passwords securely encrypted.