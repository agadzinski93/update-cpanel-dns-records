import { readFile } from "fs/promises";
import {
    GET_ZONE,
    EDIT_ZONE,
    NORMAL,
    STARTUP,
    SHUTDOWN,
    A_RECORD_FILE,
    MX_RECORD_FILE,
    CNAME_RECORD_FILE,
    TXT_RECORD_FILE,
    SERIAL_FILE,
    FILE_ENCODING
} from "../config/config";

class Config {
    static run: typeof GET_ZONE | typeof EDIT_ZONE = EDIT_ZONE;
    static runWhen: typeof NORMAL | typeof STARTUP | typeof SHUTDOWN = NORMAL;
    static newValueA: string;
    static newValueMx: String;
    static newValueCname: String;
    static newValueTxt: String;
    static serial: string;

    /*
        Check if user selected the GET_ZONE script: npm start get_zone
    */
    static chooseScript(args: string[]) {
        if (args.length === 3) {
            switch (args[2].toLowerCase()) {
                case GET_ZONE:
                    Config.run = GET_ZONE;
                    break;
                default:
                    Config.run = EDIT_ZONE;
            }
        }
    }
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
                    break;
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
                Config.newValueA = await readFile(A_RECORD_FILE, { encoding: FILE_ENCODING });
            } catch (err) {
                if (err instanceof Error) printFileError(err);
            }
        }
        if (!Config.newValueMx) {
            try {
                Config.newValueMx = await readFile(MX_RECORD_FILE, { encoding: FILE_ENCODING });
            } catch (err) {
                if (err instanceof Error) printFileError(err);
            }
        }
        if (!Config.newValueCname) {
            try {
                Config.newValueCname = await readFile(CNAME_RECORD_FILE, { encoding: FILE_ENCODING });
            } catch (err) {
                if (err instanceof Error) printFileError(err);
            }
        }
        if (!Config.newValueTxt) {
            try {
                Config.newValueTxt = await readFile(TXT_RECORD_FILE, { encoding: FILE_ENCODING });
            } catch (err) {
                if (err instanceof Error) printFileError(err);
            }
        }
    }
    static async setSerial() {
        /*
           Populate Serial Value (Users can get this number from their SOA record)
       */
        try {
            Config.serial = await readFile(SERIAL_FILE, { encoding: FILE_ENCODING });
        } catch (err) {
            if (err instanceof Error) console.error(err.message);
            process.exit(1);
        }
    }
}
export { Config };