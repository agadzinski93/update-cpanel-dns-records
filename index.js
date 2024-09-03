import {readFile, appendFile} from 'fs/promises';
import 'dotenv/config.js';
import { Records } from './classes/Records/Records.js';

const updateARecord = async () => {
    try {
        const ADDRESS =  await readFile('./newAddress.txt',{encoding: 'utf8'});
        let serial = await readFile('./serial.txt',{encoding: 'utf8'});
        const AUTHORIZATION_HEADER = `cpanel ${process.env.CPANEL_USERNAME}:${process.env.CPANEL_API_KEY}`;

        const RECORDS = await Records.generateRecordObjectsFromFile();
        Records.addDataToRecordObjects(RECORDS,ADDRESS);
        if (Records.validateRecords(RECORDS)) {
            Records.stringifyAndRemoveNewlines(RECORDS);

            const QUERY_PARAMETER = Records.generateQueryParameters(RECORDS);
            let url = `https://${process.env.CPANEL_HOSTNAME}:${process.env.PORT}/execute/DNS/mass_edit_zone?serial=${serial}&zone=${process.env.ZONE}${QUERY_PARAMETER}`;
            const output = await fetch(url,{
                method:'GET',
                headers: {
                    "Authorization": AUTHORIZATION_HEADER
                }
            });
            const final = await output.json();
            if (final && final.status === 0) {
                if (final.errors && final.errors.length > 0) {
                    const msg = final.errors[0];
                    const indexOfSecondOpParanthesis = msg.indexOf('(',msg.indexOf('(')+1);
                    const indexOfSecondEndParanthesis = msg.indexOf(')',msg.indexOf(')')+1);
                    serial = msg.substring(indexOfSecondOpParanthesis+1, indexOfSecondEndParanthesis);
                    
                    if (serial) {
                        url = `https://${process.env.CPANEL_HOSTNAME}:${process.env.PORT}/execute/DNS/mass_edit_zone?serial=${serial}&zone=${process.env.ZONE}${QUERY_PARAMETER}`;
                        await fetch(url,{
                            method:'GET',
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
            await appendFile('./nodeError.txt',err.message + '\n');
        } catch (err) {
            console.error('Error: ' + err.message);
        }
    }
    
}

(async ()=> {
    if (process.argv.length > 2) {
        switch (process.argv[2]) {
            case 'startup':
                await updateARecord();
                break;
            case 'shutdown':
                break;
            default:
        }
    }
})();