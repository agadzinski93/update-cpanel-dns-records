/*
    CPanel Configuration
*/
const CPANEL_HOSTNAME: string | undefined = process.env.CPANEL_HOSTNAME;
const CPANEL_PORT: string = process.env.CPANEL_PORT || '2083';
const CPANEL_USERNAME: string | undefined = process.env.CPANEL_USERNAME;
const CPANEL_API_KEY: string | undefined = process.env.CPANEL_API_KEY;

const ZONE: string | undefined = process.env.ZONE;

/*
    Options for what script to run
*/

const GET_ZONE = 'get_zone';
const EDIT_ZONE = 'edit_zone';

/*
    Options for when script is meant to run.
*/
const NORMAL = 'normal';
const STARTUP = 'startup';
const SHUTDOWN = 'shutdown';

/*
    File Paths
*/
const ERROR_FILE = './nodeError.txt';
const ZONE_OUTPUT_FILE = './zone.json';
const RECORDS_FILE = './records.txt';
const A_RECORD_FILE = './newValueA.txt';
const MX_RECORD_FILE = './newValueMx.txt';
const CNAME_RECORD_FILE = './newValueCname.txt';
const TXT_RECORD_FILE = './newValueTxt.txt';
const SERIAL_FILE = './serial.txt';

const FILE_ENCODING = 'utf8';

export {
    CPANEL_HOSTNAME,
    CPANEL_PORT,
    CPANEL_USERNAME,
    CPANEL_API_KEY,
    ZONE,
    GET_ZONE,
    EDIT_ZONE,
    NORMAL,
    STARTUP,
    SHUTDOWN,
    ERROR_FILE,
    ZONE_OUTPUT_FILE,
    RECORDS_FILE,
    A_RECORD_FILE,
    MX_RECORD_FILE,
    CNAME_RECORD_FILE,
    TXT_RECORD_FILE,
    SERIAL_FILE,
    FILE_ENCODING
}