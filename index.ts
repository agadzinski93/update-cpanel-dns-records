import 'dotenv/config.js';
import { CPanel } from './classes/CPanel';
import { Config } from './classes/Config';
import {
    GET_ZONE,
    EDIT_ZONE,
    NORMAL,
    STARTUP,
    SHUTDOWN
} from './config/config';

const updateDnsRecords = async () => {
    const cpanel = new CPanel();
    await cpanel.editZone();
}
const getDnsRecords = async () => {
    const cpanel = new CPanel();
    await cpanel.parseZone();
}
(async () => {
    Config.chooseScript(process.argv);
    switch (Config.run) {
        case GET_ZONE:
            await getDnsRecords();
            break;
        case EDIT_ZONE:
            Config.initWithArgs(process.argv);
            await Config.initWithFiles();
            Config.setSerial();

            switch (Config.runWhen) {
                case NORMAL:
                    await updateDnsRecords();
                    break;
                case STARTUP:
                    //Future feature
                    break;
                case SHUTDOWN:
                    //Future feature
                    break;
                default:
            }
            break;
    }
})();