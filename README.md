# Miner Stats

## Encrypting Firebase credentials
```
sls encrypt -s dev -k 04f165ba-e293-4c7a-b707-9672dd96465a -n FIREBASE_CREDENTIALS \
  -v $(node -e "console.log(fs.readFileSync('src/config/dev.firebase.json').toString('base64'));")
```
