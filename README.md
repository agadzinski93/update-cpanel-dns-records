# Update CPanel DNS Records
This script allows you to update many DNS records in a single DNS Zone in CPanel using the CPanel API. This is great to use in a bash script on a remote server with a dynamic IP address.

Supported DNS Records: A

Soon: MX, CNAME, TXT

This script uses CPanel's endpoint `/DNS/mass_edit_zone` found [here](https://api.docs.cpanel.net/openapi/cpanel/operation/dns-mass_edit_zone/).

## Contents
1. [Setup](#Setup)
    * [Records TXT Format](#Records-TXT-Format)
    * [CPanel API Key](#Cpanel-API-Key)
    * [Line Indexes](#Line-Indexes)
2. [Environment Variables](#Environment-Variables)
3. [Running the Script](#Running-the-Script)

## Setup
Three files are required in the root of this application:
1. newAddress.txt - Holds the new IP address for the A records. Nothing else.
2. serial.txt - Holds the serial from the SOA record for your domain. You can get this with the `dig` command (e.g. `dig +short your-domain.com soa | awk '{ print $3 }'`)
3. records.txt - This holds the new info you wish to push onto preexisiting records

In your bash script, you can use commands like the one above to write the data into the required text files before calling this Node script like this `> /path/to/this/script/newAddress.txt`

### Records TXT Format
Each record will have 5 properties: `line_index`, `ttl`, `record_type`, `dname`, and `data`. The data property will be injected using the value you provide in `newAddress.txt` so you only need to provide the other four.

The `line_index` for the records you wish to modify can be found using the CPanel endpoint `/DNS/parse_zone` found [here](https://api.docs.cpanel.net/openapi/cpanel/operation/dns-parse_zone/). Use a tool like Postman and supply your credentials in the Authorization header to get this info.

Below is an example of what a file with two records that modifies a domain with and without www would look like.
```
line_index=24
ttl=14400
record_type=A
dname=example
line_index=25
ttl=14400
record_type=A
dname=www.example
```

### CPanel API Key
In order to make calls to the CPanel API, you must generate an API token in your account. This feature is likely under Security labeled Manage API Tokens.

This key is a necessary environment variable but you may also need it to determine the line indexes of the records you wish to modify.

### Line Indexes
To get the line indexes of the DNS records you wish to update, use a tool like Postman to make a call to the endpoint `/DNS/parse_zone` found [here](https://api.docs.cpanel.net/openapi/cpanel/operation/dns-parse_zone/). Search through the JSON output until you found the records and save the line indexes.

Note: When making API calls to CPanel, make sure the format for the Authorization header is `cpanel username:[token]`. Of course, replace `[token]` with your actual token.

## Environment Variables
Create a .env file in the root of this script.

1. `CPANEL_HOSTNAME`
    * Hostname for your CPanel account. Likely just the domain (e.g. example.com). Do NOT include the protocol.

2. `CPANEL_PORT`
    * Port for your CPanel account. Likely somewhere in the 2083-2087 range.

3. `CPANEL_USERNAME`
    * Your CPanel username.

4. `CPANEL_API_KEY`
    * Your CPanel API token.

5. `ZONE`
    * Your DNS zone. Likely same as hostname. Do not include subdomains in this field even if that's all you intend to modify. Those distinctions will be made in your `records.txt`.

## Running the Script

That's all there is. To execute this script, simply run
```
npm install
node start
```

A sample bash script that uses this Node script can be seen below
```bash
# Grab the serial from your domain's SOA record and place it into serial.txt
sudo /usr/bin/dig +short my-domain.com soa | awk '{ print $3 }' > /home/myAccount/bin/path/to/NodeScript/serial.txt 2>error.txt

# Grab the public IP address for your server. Useful when using AWS EC2 instances.
sudo /usr/bin/dig +short myip.opendns.com @resolver1.opendns.com > /home/myAccount/bin/path/to/NodeScript/updateAddress.txt 2>error.txt

cd /home/myAccount/bin/path/to/NodeScript
# You may need to make sure their is a symlink to npm for sudo to recognize it
sudo npm start
```