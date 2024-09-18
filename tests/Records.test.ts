import { DnsRecord } from "../classes/Record";
import { Readable } from "stream";

const goodRecordOne = new DnsRecord(100, "www.example", 14400, 'A', ['1.1.1.1']);
const goodRecordTwo = new DnsRecord(100, "www.example", 14400, 'A', ['1.1.1.1']);
const badRecordEmptyProps = new DnsRecord(100, '', 14400, 'A', ['1.1.1.1']);
const badRecordWithZeros = new DnsRecord(100, '', 0, 'A', ['1.1.1.1']);
const badRecordNoData = new DnsRecord(100, '', 14400, 'A');

const sampleRecordsTxtFileOne = [
    'line_index=25\n',
    'dname=test\n',
    'ttl=14400\n',
    'record_type=A\n'
]

const sampleRecordsTxtFileTwo = [
    ...sampleRecordsTxtFileOne,
    'line_index=26\n',
    'dname=www.test\n',
    'ttl=14400\n',
    'record_type=A\n'
]

describe('Create DNS Record from external file (stream in test) and convert the data to a GET query parameter', () => {
    test('Generate array of a single DnsRecord object literal from a readable stream containing one set of data', async () => {
        let stream = new Readable();
        stream._read = () => { };
        for (const line of sampleRecordsTxtFileOne) {
            stream.push(line);
        }
        stream.push(null);
        let record = await DnsRecord.generateRecordObjects(stream);
        expect(record[0]).toEqual(new DnsRecord(25, 'test', 14400, 'A'));

        stream.destroy();
    });
    test('Generate array of multiple DnsRecord object literals from a readable stream containing multiple sets of data', async () => {
        const stream = new Readable();
        stream._read = () => { };
        for (const line of sampleRecordsTxtFileTwo) {
            stream.push(line);
        }
        stream.push(null);
        const record = await DnsRecord.generateRecordObjects(stream);
        expect(record[0]).toEqual(new DnsRecord(25, 'test', 14400, 'A'));
        expect(record[1]).toEqual(new DnsRecord(26, 'www.test', 14400, 'A'));

        stream.destroy();
    });
    test('Add data to DnsRecord object', () => {
        const record = [new DnsRecord(25, 'test', 14400, 'A')];
        DnsRecord.addDataToRecordObjects(record, '1.1.1.1');
        expect(record[0]).toEqual(new DnsRecord(25, 'test', 14400, 'A', ['1.1.1.1']));
    });
    test('Validate a record has all 5 properties populated: line_index, dname, ttl, record_type, data', () => {
        expect(DnsRecord.validateRecord(goodRecordOne)).toBe(true);
        expect(DnsRecord.validateRecord(badRecordEmptyProps)).toBe(false);
        expect(DnsRecord.validateRecord(badRecordWithZeros)).toBe(false);
        expect(DnsRecord.validateRecord(badRecordNoData)).toBe(false);
    });
    test('Validate array of records have all 5 properties populated: line_index, dname, ttl, record_type, data', () => {
        const goodRecords = [
            goodRecordOne,
            goodRecordTwo
        ]
        const badRecords = [
            goodRecordOne,
            badRecordNoData
        ]
        expect(DnsRecord.validateRecords(goodRecords)).toBe(true);
        expect(DnsRecord.validateRecords(badRecords)).toBe(false);
    });
    test('Test converting DnsRecord object literal to JS object', () => {
        expect(goodRecordOne.convertToJsObject()).toEqual({ line_index: 100, dname: 'www.example', ttl: 14400, record_type: 'A', data: ['1.1.1.1'] });
    });
    test('Test stringifying Record object', () => {
        expect(DnsRecord.stringifyAndRemoveNewlines([goodRecordOne])).toStrictEqual([JSON.stringify(goodRecordOne.convertToJsObject())]);
        expect(DnsRecord.stringifyAndRemoveNewlines([goodRecordOne, goodRecordTwo])).toStrictEqual([JSON.stringify(goodRecordOne.convertToJsObject()), JSON.stringify(goodRecordTwo.convertToJsObject())]);
    });
    test('Test creating GET query parameter using one Record object', () => {
        const record = new DnsRecord(25, 'www.test', 14400, 'A', ['1.1.1.1']);
        const strRecord = DnsRecord.stringifyAndRemoveNewlines([record]);
        const q = DnsRecord.generateQueryParameters(strRecord);
        expect(q).toBe('&edit={"line_index":25,"dname":"www.test","ttl":14400,"record_type":"A","data":["1.1.1.1"]}');
    });
    test('Test creating GET query parameter using multiple Record objects', () => {
        const records = [new DnsRecord(25, 'test', 14400, 'A', ['1.1.1.1']), new DnsRecord(26, 'www.test', 14400, 'A', ['1.1.1.1'])];
        const strRecords = DnsRecord.stringifyAndRemoveNewlines(records);
        const q = DnsRecord.generateQueryParameters(strRecords);
        expect(q).toBe('&edit={"line_index":25,"dname":"test","ttl":14400,"record_type":"A","data":["1.1.1.1"]}&edit={"line_index":26,"dname":"www.test","ttl":14400,"record_type":"A","data":["1.1.1.1"]}');
    });
});