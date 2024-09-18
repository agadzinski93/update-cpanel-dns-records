import type { Config as ConfigType } from "../classes/Config";
import { NORMAL, STARTUP } from "../config/config";

//As of now, NodeJS populates the first two indices in process.argv, we wish to include them for testing
const FIRST_PARAMS_IN_ARGV = ['skip', 'skip'];

describe('Initialize configuration using process.argv', () => {
    let Config: typeof ConfigType;

    beforeAll(() => {
        process.env.CPANEL_HOSTNAME = 'test.com';
        process.env.CPANEL_USERNAME = 'username';
        process.env.CPANEL_API_KEY = 'sample_key';
        process.env.ZONE = 'zone';
    });
    beforeEach(() => {
        return import('../classes/Config').then(module => {
            Config = module.Config;
            jest.resetModules();
        })
    });

    test('Only A record defined when calling script: npm start a 1.1.1.1', () => {
        const process_argv = [
            ...FIRST_PARAMS_IN_ARGV,
            'a',
            '1.1.1.1'
        ]
        Config.initWithArgs(process_argv);
        expect(Config.newValueA).toBe('1.1.1.1');
        expect(Config.newValueCname).toBe(undefined);
        expect(Config.newValueMx).toBe(undefined);
        expect(Config.newValueTxt).toBe(undefined);
        expect(Config.runWhen).toBe(NORMAL);
    })
    test('Only CNAME record defined when calling script: npm start cname example.com', () => {
        const process_argv = [
            ...FIRST_PARAMS_IN_ARGV,
            'cname',
            'example.com'
        ]
        Config.initWithArgs(process_argv);
        expect(Config.newValueA).toBe(undefined);
        expect(Config.newValueCname).toBe('example.com');
        expect(Config.newValueMx).toBe(undefined);
        expect(Config.newValueTxt).toBe(undefined);
        expect(Config.runWhen).toBe(NORMAL);
    })
    test('Only MX record defined when calling script: npm start mx 1.1.1.1', () => {
        const process_argv = [
            ...FIRST_PARAMS_IN_ARGV,
            'mx',
            '1.1.1.1'
        ]
        Config.initWithArgs(process_argv);
        expect(Config.newValueA).toBe(undefined);
        expect(Config.newValueCname).toBe(undefined);
        expect(Config.newValueMx).toBe('1.1.1.1');
        expect(Config.newValueTxt).toBe(undefined);
        expect(Config.runWhen).toBe(NORMAL);
    })
    test('Only TXT record defined when calling script: npm start txt "some data"', () => {
        const process_argv = [
            ...FIRST_PARAMS_IN_ARGV,
            'txt',
            'some data'
        ]
        Config.initWithArgs(process_argv);
        expect(Config.newValueA).toBe(undefined);
        expect(Config.newValueCname).toBe(undefined);
        expect(Config.newValueMx).toBe(undefined);
        expect(Config.newValueTxt).toBe('some data');
        expect(Config.runWhen).toBe(NORMAL);
    })
    test('Define A and MX records: npm start a 1.1.1.1 mx 1.1.1.1', () => {
        const process_argv = [
            ...FIRST_PARAMS_IN_ARGV,
            'a',
            '1.1.1.1',
            'mx',
            '1.1.1.1'
        ]
        Config.initWithArgs(process_argv);
        expect(Config.newValueA).toBe('1.1.1.1');
        expect(Config.newValueCname).toBe(undefined);
        expect(Config.newValueMx).toBe('1.1.1.1');
        expect(Config.newValueTxt).toBe(undefined);
        expect(Config.runWhen).toBe(NORMAL);
    })
    test('Run script at startup and define A and MX records: npm start startup a 1.1.1.1 mx 1.1.1.1', () => {
        const process_argv = [
            ...FIRST_PARAMS_IN_ARGV,
            'startup',
            'a',
            '1.1.1.1',
            'mx',
            '1.1.1.1'
        ]
        Config.initWithArgs(process_argv);
        expect(Config.newValueA).toBe('1.1.1.1');
        expect(Config.newValueCname).toBe(undefined);
        expect(Config.newValueMx).toBe('1.1.1.1');
        expect(Config.newValueTxt).toBe(undefined);
        expect(Config.runWhen).toBe(STARTUP);
    })
    test('Run script at startup and defines only A records: npm start a 1.1.1.1 startup', () => {
        const process_argv = [
            ...FIRST_PARAMS_IN_ARGV,
            'startup',
            'a',
            '1.1.1.1'
        ]
        Config.initWithArgs(process_argv);
        expect(Config.newValueA).toBe('1.1.1.1');
        expect(Config.newValueCname).toBe(undefined);
        expect(Config.newValueMx).toBe(undefined);
        expect(Config.newValueTxt).toBe(undefined);
        expect(Config.runWhen).toBe(STARTUP);
    })
})