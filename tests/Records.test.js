import { Records } from "../classes/Records/Records.js";

test('Validate records have exactly 5 properties: line_number, dname, ttl, record_type, data', () => {
    const goodRecord = {
        line_index:100,
        dname:"www.example",
        ttl:14400,
        record_type:"A",
        data:["1.1.1.1"]
    }
    const badRecordTooManyProps = {
        line_index:100,
        dname:"www.example",
        ttl:14400,
        name:'Hi',
        record_type:"A",
        data:["1.1.1.1"]
    }
    const badRecordTooFewProps = {
        line_index:100,
        dname:"www.example",
        ttl:14400,
        record_type:"A"
    }
    const badRecordMisspelledProps = {
        lineindex:100,
        dname:"www.example",
        ttl:14400,
        record_type:"A",
        data:["1.1.1.1"]
    }
    expect(Records.validateRecord(goodRecord)).toBe(true);
    expect(Records.validateRecord(badRecordTooManyProps)).toBe(false);
    expect(Records.validateRecord(badRecordTooFewProps)).toBe(false);
    expect(Records.validateRecord(badRecordMisspelledProps)).toBe(false);
});

test('Validate array of records are all valid', () => {
    const goodRecords = [
        {
            line_index:100,
            dname:"www.example",
            ttl:14400,
            record_type:"A",
            data:["1.1.1.1"]
        },
        {
            line_index:101,
            dname:"example",
            ttl:14400,
            record_type:"A",
            data:["1.1.1.1"]
        }
    ]
    const badRecords = [
        {
            line_index:100,
            dname:"www.example",
            ttl:14400,
            record_type:"A",
            data:["1.1.1.1"]
        },
        {
            lineindex:101,
            dname:"example",
            ttl:14400,
            record_type:"A",
            data:["1.1.1.1"]
        }
    ]
    expect(Records.validateRecords(goodRecords)).toBe(true);
    expect(Records.validateRecords(badRecords)).toBe(false);
})