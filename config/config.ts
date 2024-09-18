/*
    CPanel Configuration
*/
const CPANEL_HOSTNAME: string | undefined = process.env.CPANEL_HOSTNAME;
const CPANEL_PORT: string = process.env.CPANEL_PORT || '2083';
const CPANEL_USERNAME: string | undefined = process.env.CPANEL_USERNAME;
const CPANEL_API_KEY: string | undefined = process.env.CPANEL_API_KEY;

const ZONE: string | undefined = process.env.ZONE;

/*
    Options for when script is meant to run.
*/
const NORMAL = 'normal';
const STARTUP = 'startup';
const SHUTDOWN = 'shutdown';

export {
    CPANEL_HOSTNAME,
    CPANEL_PORT,
    CPANEL_USERNAME,
    CPANEL_API_KEY,
    ZONE,
    NORMAL,
    STARTUP,
    SHUTDOWN
}