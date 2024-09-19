import { writeFile, appendFile } from "fs/promises";
import { Config } from "./Config";
import { DnsRecord } from "./Record";
import {
    CPANEL_HOSTNAME,
    CPANEL_PORT,
    CPANEL_USERNAME,
    CPANEL_API_KEY,
    ZONE,
    ERROR_FILE,
    ZONE_OUTPUT_FILE,
    RECORDS_FILE
} from "../config/config";

class CPanel {
    #hostname: string | undefined;
    #port: string;
    #username: string | undefined;
    #api_key: string | undefined;
    #auth_header: string;

    constructor() {
        this.#hostname = CPANEL_HOSTNAME;
        this.#port = CPANEL_PORT;
        this.#username = CPANEL_USERNAME;
        this.#api_key = CPANEL_API_KEY;
        this.#auth_header = `cpanel ${CPANEL_USERNAME}:${CPANEL_API_KEY}`;
    }
    /**
     * Checks that all CPanel-related config variables were provided in the .env file
     * @returns {boolean}
     */
    configIsValid(): boolean {
        let valid = true;
        if ([this.#hostname, this.#port, this.#username, this.#api_key].includes(undefined)) {
            valid = false;
        }
        return valid;
    }
    async parseZoneRequest(url: string) {
        const output = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': this.#auth_header
            }
        });
        return await output.json();
    }
    async parseZone(): Promise<void> {
        try {
            if (this.configIsValid()) {
                const URL = `https://${this.#hostname}:${this.#port}/execute/DNS/parse_zone?zone=${ZONE}`;
                const result = await this.parseZoneRequest(URL);
                if (result.errors) {
                    for (let error of result.errors as string[]) {
                        await appendFile(ERROR_FILE, error + '\n');
                    }
                } else {
                    if (result.data) await writeFile(ZONE_OUTPUT_FILE, JSON.stringify(result.data));
                }
            } else {
                console.error('All Env variables have not been configured. Check your .env file.');
                process.exit(9);
            }
        } catch (err) {
            if (err instanceof Error) console.error(err.message);
            process.exit(1);
        }
    }
    async editZoneRequest(url: string): Promise<any> {
        const output = await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": this.#auth_header
            }
        });
        return await output.json();
    }
    /**
     * Writes each error message from the Cpanel API to a local file and returns the message 
     * for an incorrect serial number, if it exists, null otherwise
     * @param {string[]} errors 
     * @returns {Promise<null | string>}
     */
    async editZoneRequestError(errors: string[]): Promise<string | null> {
        let msg_serial_error = null;
        for (let error of errors) {
            if (error.includes('The given serial')) msg_serial_error = error;

            await writeFile(ERROR_FILE, error);
        }
        return msg_serial_error;
    }
    /**
     * Parses the new serial from the error message from the CPanel API
     * (e.g. "The given serial number (11111111) does not match the DNS zone’s serial number (2222222222)...")
     * @param {string} msg 
     * @returns {string}
     */
    getNewSerialFromError(msg: string): string {
        const indexOfSecondOpParanthesis = msg.indexOf('(', msg.indexOf('(') + 1);
        const indexOfSecondEndParanthesis = msg.indexOf(')', msg.indexOf(')') + 1);
        return msg.substring(indexOfSecondOpParanthesis + 1, indexOfSecondEndParanthesis);
    }

    async editZone(): Promise<void> {
        try {
            if (this.configIsValid()) {
                const file = await DnsRecord.openReadStream(RECORDS_FILE);
                const RECORDS = await DnsRecord.generateRecordObjects(file);
                DnsRecord.closeFile(file);
                DnsRecord.addDataToRecordObjects(RECORDS, Config.newValueA);

                if (DnsRecord.validateRecords(RECORDS)) {
                    const STR_RECORDS = DnsRecord.stringifyAndRemoveNewlines(RECORDS);
                    const QUERY_PARAMETER = DnsRecord.generateQueryParameters(STR_RECORDS);
                    let url = `https://${this.#hostname}:${this.#port}/execute/DNS/mass_edit_zone?serial=${Config.serial}&zone=${ZONE}${QUERY_PARAMETER}`;

                    const result = await this.editZoneRequest(url);
                    if (result && result.errors) {
                        const msg_serial_error = await this.editZoneRequestError(result.errors);
                        if (msg_serial_error) {
                            Config.serial = this.getNewSerialFromError(msg_serial_error);
                            url = `https://${this.#hostname}:${this.#port}/execute/DNS/mass_edit_zone?serial=${Config.serial}&zone=${ZONE}${QUERY_PARAMETER}`;
                            await this.editZoneRequest(url);
                        }
                    }
                } else {
                    throw new Error('Validation of records failed. Check your records.txt and try again.');
                }
            } else {
                console.error('All Env variables have not been configured. Check your .env file.');
                process.exit(9);
            }
        } catch (err) {
            try {
                if (err instanceof Error) await appendFile(ERROR_FILE, err.message + '\n');
            } catch (err) {
                if (err instanceof Error) console.error('Error: ' + err.message);
            }
            process.exit(1);
        }
    }
}
export { CPanel };