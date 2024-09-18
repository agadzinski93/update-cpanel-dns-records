import { readFile } from "fs/promises";
import {
    CPANEL_USERNAME,
    CPANEL_API_KEY,
    NORMAL,
    STARTUP,
    SHUTDOWN
}
    from "../config/config";

class Config {
    static runWhen: 'normal' | 'startup' | 'shutdown' = 'normal';
    static newValueA: string;
    static newValueMx: String;
    static newValueCname: String;
    static newValueTxt: String;
    static serial: string;
    static authorization_header: string

    static initWithArgs(args: string[]) {
        /*
            Search for args passed into script in process.argv starting with index 2
            Fill in values passed for a, mx, cname, and txt records
        */
        let nextIndexExists = false;
        for (let i = 2; i < args.length; i++) {
            nextIndexExists = i + 1 < args.length;
            switch (args[i].toLowerCase()) {
                case NORMAL:
                    Config.runWhen = NORMAL;
                case STARTUP:
                    Config.runWhen = STARTUP;
                    break;
                case SHUTDOWN:
                    Config.runWhen = SHUTDOWN;
                    break;
                case 'a':
                    if (nextIndexExists) { Config.newValueA = args[i + 1]; i++; }
                    break;
                case 'mx':
                    if (nextIndexExists) { Config.newValueMx = args[i + 1]; i++; }
                    break;
                case 'cname':
                    if (nextIndexExists) { Config.newValueCname = args[i + 1]; i++; }
                    break;
                case 'txt':
                    if (nextIndexExists) { Config.newValueTxt = args[i + 1]; i++; }
                    break;
            }
        }
    }
    static async initWithFiles() {
        /*
            For DNS Record types that did not get a value via process.argv, try reading from a local file
        */
        const printFileError = (err: Error) => {
            //Print error message only if it's not related to the file not existing
            if (!err.message.includes('ENOENT')) {
                console.error(err.message);
            }
        }
        if (!Config.newValueA) {
            try {
                Config.newValueA = await readFile('./newValueA.txt', { encoding: 'utf8' });
            } catch (err) {
                if (err instanceof Error) printFileError(err);
            }
        }
        if (!Config.newValueMx) {
            try {
                Config.newValueMx = await readFile('./newValueMx.txt', { encoding: 'utf8' });
            } catch (err) {
                if (err instanceof Error) printFileError(err);
            }
        }
        if (!Config.newValueCname) {
            try {
                Config.newValueCname = await readFile('./newValueCname.txt', { encoding: 'utf8' });
            } catch (err) {
                if (err instanceof Error) printFileError(err);
            }
        }
        if (!Config.newValueTxt) {
            try {
                Config.newValueTxt = await readFile('./newValueTxt.txt', { encoding: 'utf8' });
            } catch (err) {
                if (err instanceof Error) printFileError(err);
            }
        }
    }
    static setAuthHeader() {
        Config.authorization_header = `cpanel ${CPANEL_USERNAME}:${CPANEL_API_KEY}`;
    }
    static async setSerial() {
        /*
           Populate Serial Value (Users can get this number from their SOA record)
       */
        try {
            Config.serial = await readFile('./serial.txt', { encoding: 'utf8' });
        } catch (err) {
            if (err instanceof Error) console.error(err.message);
            process.exit(1);
        }
    }
}

export { Config };