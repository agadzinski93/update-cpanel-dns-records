# Update CPanel DNS Records

This script allows you to update many DNS records in a single DNS Zone in CPanel using the CPanel API. This is great to use in a bash script on a remote server with a dynamic IP address.

Supported DNS Records:

    A,CNAME,MX,TXT

For getting DNS records, this script uses the CPanel API endpoint `/DNS/parse_zone` found [here](https://api.docs.cpanel.net/openapi/cpanel/operation/dns-parse_zone/)

For updating DNS records, this script uses the CPanel API endpoint `/DNS/mass_edit_zone`  found [here](https://api.docs.cpanel.net/openapi/cpanel/operation/dns-mass_edit_zone/).

## Contents

1. [Setup](#Setup)
    * [Serial File](#Serial-File)
    * [Records File](#Records-File)
2. [How To Supply New Values](#How-To-Supply-New-Values)
    * [Arguments](#Arguments)
    * [External Files](#External-Files)
3. [CPanel API Key](#Cpanel-API-Key)
4. [Get DNS Records](#Get-DNS-Records)
5. [Environment Variables](#Environment-Variables)
6. [Using the Script](#Using-the-Script)

## Setup

To install the application, simply download the script and place it into the directory of your choosing then run:

```bash
npm install --include=dev
npm run build
```

Two files are required in the root of this application:
1. serial.txt - Holds the serial from the SOA record for your domain
2. records.txt - This holds the new info you wish to push onto preexisiting records

### Serial File

The serial.txt file must contain the serial from the SOA record for your domain. This value is required when editing DNS records in a zone via the CPanel API. If the value you provide is stale, the CPanel API returns the correct value and this Node script will attempt to extract it and make a second attempt at updating your records.

A bash command like the one found below may be able to extract the serial for you. Just replace *your-domain.com* with your actual domain.

```bash
dig +short your-domain.com soa | awk '{ print $3 }'
```

You can also send the output of the above directly to the root of this Node script.

```bash
dig +short your-domain.com soa | awk '{ print $3 }' > /path/to/this/script/serial.txt
```

### Records File

Each record you wish to update will have 5 properties:
 1. line_index
 2. record_type - A, CNAME, MX, or TXT
 3. ttl - time to live (in seconds)
 4. dname - Name of DNS record
 5. data - The new value you wish to give

 You will provide the `data` as either an argument into this script or in a separate file, thus you will only need to provide the other four properties in `records.txt`.

 The `line_index` is how to identify the record you wish to update, all other values can be changed from their original values.

 You can get information such as the `line_index` and `dname` using the [get_zone](#Get-DNS-Records) feature of this script. It will store your DNS records into a file called `zone.json` that you can browse.

 Here is an example for updating a single DNS record.

 ```
line_index=24
ttl=14400
record_type=A
dname=example
 ```

 Here is an example for updating two A records for a domain w/ and w/out the www prefix.

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

## How To Supply New Values

There are two ways to supply new values for the DNS records you wish to modify:

1. Pass the values as arguments into the script
2. External files in the root of this script

The script will look for values you passed as arguments before checking if you provided external files. You can do both for different record types, but not for the same record type as script arguments have priority.

### Arguments

Below is an example of passing the value you wish to give A records

```bash
npm start a 1.1.1.1 # This will give 1.1.1.1 to all A records you're updating
```

Below is an example of giving a value to A and MX records

```bash
npm start a 1.1.1.1 mx 1.1.1.1
```

### External Files

Alternatively, you can create a text file for each type of record.

1. newValueA.txt
2. newValueCname.txt
3. newValueMx.txt
4. newValueTxt.txt

Simply place the new value into the corresponding text file and nothing else.

## CPanel API Key

In order to make calls to the CPanel API, you must generate an API token in your account. This feature is likely under Security labeled Manage API Tokens.

This key is a necessary environment variable but you may also need it to determine the line indexes of the records you wish to modify.

## Get DNS Records

If you need to find info such as the `line_index` or the current `dname` of the DNS records you wish to modify, you can use this feature to download all the DNS records in your zone into a JSON file called `zone.json`.

Simply call the script like this:

```bash
npm start get_zone
```

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

## Using the Script

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