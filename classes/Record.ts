import { createReadStream, ReadStream } from 'fs';
import type { Readable } from 'stream';
import readLine from 'node:readline'

const PROPS = ['line_index', 'dname', 'ttl', 'record_type', 'data'];
const RECORD_TYPES = ['A', 'MX', 'CNAME', 'TXT'];

type record_type = 'A' | 'MX' | 'CNAME' | 'TXT';

interface DnsRecordObj {
    line_index: number,
    dname: string,
    ttl: number,
    record_type: record_type,
    data: string[] | undefined
}

class DnsRecord {
    /*
        Non-Static Methods and Properties
    */
    #line_index: number;
    #dname: string;
    #ttl: number;
    #record_type: record_type;
    #data: string[] | undefined;

    constructor(line_index: number = 0, dname: string = '', ttl: number = 0, record_type: record_type = 'A', data?: string[]) {
        this.#line_index = line_index;
        this.#dname = dname;
        this.#ttl = ttl;
        this.#record_type = record_type;
        if (data) this.#data = data;
    }

    get LineIndex(): number { return this.#line_index; }
    set LineIndex(line_index: number) { this.#line_index = line_index; }
    get Dname() { return this.#dname; }
    set Dname(dname: string) { this.#dname = dname; }
    get Ttl(): number { return this.#ttl; }
    set Ttl(ttl: number) { this.#ttl = ttl; }
    get RecordType() { return this.#record_type; }
    set RecordType(record_type: record_type) { this.#record_type = record_type; }
    get Data(): string[] | undefined { return this.#data; }
    set Data(data: string[]) { this.#data = data; }

    convertToJsObject(): DnsRecordObj {
        return {
            line_index: this.#line_index,
            dname: this.#dname,
            ttl: this.#ttl,
            record_type: this.#record_type,
            data: this.#data
        }
    }

    /*
        Static Methods
    */
    static async openReadStream(path: string): Promise<ReadStream> {
        let data;
        try {
            data = createReadStream(path);
        } catch (err) {
            if (err instanceof Error) console.error(err.message);
            process.exit(1);
        }
        return data;
    }
    static closeFile(file: Readable): void {
        file.destroy();
    }
    static async generateRecordObjects(file: Readable): Promise<DnsRecord[]> {
        const records: DnsRecord[] = Array();
        let record = new DnsRecord();

        let i = 0;
        let j = 0;
        let props = Array(...PROPS);
        let keyValue = null;
        let done = false;
        let error = false; //True when a line in records.txt is not: line_index, dname, ttl, or record_type

        const rl = readLine.createInterface({
            input: file,
            crlfDelay: Infinity
        });

        try {
            for await (const line of rl) {
                if (i % 4 === 0) {
                    props = Array(...PROPS);
                }
                keyValue = line.split('=');
                while (!done && !error && j < props.length) {
                    if (keyValue[0] === props[j]) {
                        switch (keyValue[0]) {
                            case PROPS[0]:
                                record.LineIndex = parseInt(keyValue[1]);
                                break;
                            case PROPS[1]:
                                record.Dname = keyValue[1];
                                break;
                            case PROPS[2]:
                                record.Ttl = parseInt(keyValue[1]);
                                break;
                            case PROPS[3]:
                                if (RECORD_TYPES.includes(keyValue[1])) {
                                    record.RecordType = keyValue[1] as record_type;
                                }
                                break;
                            default:
                                error = true;
                        }
                        props.splice(j, 1);
                        done = true;
                    }
                    j++;
                }
                if (error) {
                    throw new Error('Each group of 4 lines in records.txt must be: line_index, dname, ttl, and record_type');
                }
                if (i % 4 === 3) {
                    records.push(record);
                    record = new DnsRecord();
                }
                done = false;
                j = 0;
                i++;
            }
        } catch (err) {

        }

        return records;
    }
    /**
     * Add the data property (array) to each record and populate it with the supplied IP address
     * @param {object[]} records array of records
     * @param {string} address IP address 
     */
    static addDataToRecordObjects = (records: DnsRecord[], address: string): void => {
        for (const record of records) {
            record.Data = [address];
        }
    }
    /**
     * Valdate if the record has five properties - line_number, dname, ttl, record_type, and data
     * @param {DnsRecord} record Individual DNS record to validate
     * @returns {boolean}
     */
    static validateRecord = (record: DnsRecord): boolean => {
        let valid = true;
        if ([record.LineIndex, record.Dname, record.Ttl, record.RecordType].some(el => el === '' || el === 0)) {
            valid = false;
        } else if (!record.Data || !Array.isArray(record.Data)) {
            valid = false;
        }
        return valid;
    }
    /**
     * Validate each record has exactly five properties - line_number, dname, record_type, ttl, and data
     * @param {DnsRecord[]} records array of records
     * @returns {boolean}
     */
    static validateRecords = (records: DnsRecord[]): boolean => {
        let valid = true;
        let i = 0;
        while (valid && i < records.length) {
            valid = this.validateRecord(records[i]);
            i++;
        }
        return valid;
    }
    /**
     * Stringify each record and remove newline characters
     * @param {DnsRecord[]} records array of records
     * @returns {string[]}
     */
    static stringifyAndRemoveNewlines = (records: DnsRecord[]): string[] => {
        let strRecords: string[] = Array(records.length);
        records.forEach((record, i) => {
            strRecords[i] = JSON.stringify(record.convertToJsObject()).replace(/\\n/g, '');
        });
        return strRecords;
    }
    /**
     * 
     * @param {string[]} records array of records 
     * @returns {string} query parameter
     */
    static generateQueryParameters = (records: string[]): string => {
        let output = '';
        for (let i = 0; i < records.length; i++) {
            output += `&edit=${records[i]}`;
        }
        return output;
    }
}
export { DnsRecord };