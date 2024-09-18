import { readFile, appendFile } from 'fs/promises';
import 'dotenv/config.js';
import { DnsRecord } from './classes/Record';

const updateDnsRecords = async () => {
    try {
        const ADDRESS = await readFile('./newAddress.txt', { encoding: 'utf8' });
        let serial = await readFile('./serial.txt', { encoding: 'utf8' });
        const AUTHORIZATION_HEADER = `cpanel ${process.env.CPANEL_USERNAME}:${process.env.CPANEL_API_KEY}`;

        const file = await DnsRecord.openReadStream('records.txt');
        const RECORDS = await DnsRecord.generateRecordObjects(file);
        DnsRecord.closeFile(file);
        DnsRecord.addDataToRecordObjects(RECORDS, ADDRESS);
        if (DnsRecord.validateRecords(RECORDS)) {
            const STR_RECORDS = DnsRecord.stringifyAndRemoveNewlines(RECORDS);

            const QUERY_PARAMETER = DnsRecord.generateQueryParameters(STR_RECORDS);
            let url = `https://${process.env.CPANEL_HOSTNAME}:${process.env.CPANEL_PORT}/execute/DNS/mass_edit_zone?serial=${serial}&zone=${process.env.ZONE}${QUERY_PARAMETER}`;

            const output = await fetch(url, {
                method: 'GET',
                headers: {
                    "Authorization": AUTHORIZATION_HEADER
                }
            });
            const final = await output.json();
            if (final && final.status === 0) {
                if (final.errors && final.errors.length > 0) {
                    const msg = final.errors[0];
                    const indexOfSecondOpParanthesis = msg.indexOf('(', msg.indexOf('(') + 1);
                    const indexOfSecondEndParanthesis = msg.indexOf(')', msg.indexOf(')') + 1);
                    serial = msg.substring(indexOfSecondOpParanthesis + 1, indexOfSecondEndParanthesis);

                    if (serial) {
                        url = `https://${process.env.CPANEL_HOSTNAME}:${process.env.CPANEL_PORT}/execute/DNS/mass_edit_zone?serial=${serial}&zone=${process.env.ZONE}${QUERY_PARAMETER}`;
                        await fetch(url, {
                            method: 'GET',
                            headers: {
                                "Authorization": AUTHORIZATION_HEADER
                            }
                        });
                    }
                }
            }
        } else {
            throw new Error('Validation of records failed. Check your records.txt and try again.');
        }
    } catch (err) {
        try {
            if (err instanceof Error) await appendFile('./nodeError.txt', err.message + '\n');
        } catch (err) {
            if (err instanceof Error) console.error('Error: ' + err.message);
        }
        process.exit(1);
    }

}

(async () => {
    if (process.argv.length === 3) {
        switch (process.argv[2]) {
            case 'startup':
                await updateDnsRecords();
                break;
            case 'shutdown':
                break;
            default:
        }
    } else {
        await updateDnsRecords();
    }
})();