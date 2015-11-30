import google from 'googleapis';
var OAuth2 = google.auth.OAuth2;
import credential from './.credential';
import fs from 'fs';
import readline from 'readline';


var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var oauth2Client = new OAuth2(
    credential.client_id,
    credential.client_sectret,
    'urn:ietf:wg:oauth:2.0:oob'
)

var scopes = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/plus.stream.write'
]


var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
});

console.log(url);

rl.question('input code:', (code)=>{
    oauth2Client.getToken(code, (err, tokens)=>{
        if (err) {
            console.log(err);
            return
        }
        oauth2Client.setCredentials(tokens);
        console.log('test');
        fs.writeFileSync('./.token.json', JSON.stringify(tokens,null,4));
    })
})

