import { appendFile } from 'fs/promises';
import 'dotenv/config.js';
import { DnsRecord } from './classes/Record';
import { Config } from './classes/Config';
import { NORMAL, STARTUP, SHUTDOWN, CPANEL_HOSTNAME, CPANEL_PORT, ZONE } from './config/config';

const updateDnsRecords = async () => {
    try {
        const file = await DnsRecord.openReadStream('records.txt');
        const RECORDS = await DnsRecord.generateRecordObjects(file);
        DnsRecord.closeFile(file);
        DnsRecord.addDataToRecordObjects(RECORDS, Config.newValueA);

        if (DnsRecord.validateRecords(RECORDS)) {
            const STR_RECORDS = DnsRecord.stringifyAndRemoveNewlines(RECORDS);

            const QUERY_PARAMETER = DnsRecord.generateQueryParameters(STR_RECORDS);
            let url = `https://${CPANEL_HOSTNAME}:${CPANEL_PORT}/execute/DNS/mass_edit_zone?serial=${Config.serial}&zone=${ZONE}${QUERY_PARAMETER}`;

            const output = await fetch(url, {
                method: 'GET',
                headers: {
                    "Authorization": Config.authorization_header
                }
            });
            const final = await output.json();
            if (final && final.status === 0) {
                if (final.errors && final.errors.length > 0) {
                    const msg = final.errors[0];
                    const indexOfSecondOpParanthesis = msg.indexOf('(', msg.indexOf('(') + 1);
                    const indexOfSecondEndParanthesis = msg.indexOf(')', msg.indexOf(')') + 1);
                    Config.serial = msg.substring(indexOfSecondOpParanthesis + 1, indexOfSecondEndParanthesis);

                    if (Config.serial) {
                        url = `https://${CPANEL_HOSTNAME}:${CPANEL_PORT}/execute/DNS/mass_edit_zone?serial=${Config.serial}&zone=${ZONE}${QUERY_PARAMETER}`;
                        await fetch(url, {
                            method: 'GET',
                            headers: {
                                "Authorization": Config.authorization_header
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
    Config.initWithArgs(process.argv);
    await Config.initWithFiles();

    Config.setAuthHeader();
    Config.setSerial();

    switch (Config.runWhen) {
        case NORMAL:
            await updateDnsRecords();
            break;
        case STARTUP:
            break;
        case SHUTDOWN:
            break;
        default:
    }
})();