import fs from 'fs/promises';

const PROPS = ['line_index','dname','ttl','record_type','data'];

class Records {
    static async generateRecordObjectsFromFile() {
        const records = Array();
        let record = {};
        const file = await fs.open('records.txt');
        let i = 0;
        let j = 0;
        let props;
        let keyValue = null;
        let done = false;

        for await (const line of file.readLines()) {
            if (i % 4 === 0) props = Array(...PROPS);
            keyValue = line.split('=');
            while (!done && j < props.length) {
                if (keyValue[0] === props[j]) {
                    record[`${keyValue[0]}`] = keyValue[1];
                    props.splice(j,1);
                    done = true;
                }
                j++;
            }
            if (i % 4 === 3) {
                records.push(record);
                record = {};
            }
            done = false;
            j = 0;
            i++;
        }
        return records;
    }
    /**
     * Add the data property (array) to each record and populate it with the supplied IP address
     * @param {object[]} records array of records
     * @param {string} address IP address 
     */
    static addDataToRecordObjects = (records, address) => {
        for (const record of records) {
            record.data = [address];
        }
    }
    /**
     * Valdate if the record has five properties - line_number, dname, ttl, record_type, and data
     * @param {object} record Individual DNS record to validate
     * @returns {boolean}
     */
    static validateRecord = (record) => {
        const NUM_OF_PROPERTIES = 5;
        let valid = true;
        if (Object.keys(record).length === NUM_OF_PROPERTIES) {
            const props = Array(...PROPS);
            for (let prop in record) {
                let found = false;
                let i = 0;
                do {
                    if (prop === props[i]) {
                        found = true;
                        props.splice(i,1); //Ensures we don't recheck this prop in future iterations
                    } else if (!found && i === NUM_OF_PROPERTIES - 1) {
                        valid = false;
                    }
                    i++;
                } while(!found && i < NUM_OF_PROPERTIES)
                found = false;
                i = 0;
            }
        } else {
            valid = false;
        }
        return valid;
    }
    /**
     * Validate each record has exactly five properties - line_number, dname, record_type, ttl, and data
     * @param {object[]} records array of records
     * @returns {boolean}
     */
    static validateRecords = (records) => {
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
     * @param {object} records array of records
     */
    static stringifyAndRemoveNewlines = (records) => {
        records.forEach((record, i) => {
            records[i] = JSON.stringify(record).replace(/\\n/g, '');
        });
    }
    /**
     * 
     * @param {object[]} records array of records 
     * @returns {string} query parameter
     */
    static generateQueryParameters = (records) => {
        let output = '';
        for (let i = 0; i < records.length; i++) {
            output += `&edit=${records[i]}`;
        }
        return output;
    }
}

export { Records };