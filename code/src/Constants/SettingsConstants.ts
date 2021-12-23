import { ColorResolvable } from 'discord.js';

export default class SettingsConstants {
    public static readonly COLORS: { [key: string]: ColorResolvable }  = {
        BAD:'#ff0000',
        GOOD:'#00ff00',
        DEFAULT:'#696969',
        NEW:'#0669dd',
        UNCHANGED:'#696969',
    };

    public static readonly PREFIX = 'top>';

    public static readonly BOT_ID = process.env.BOT_ID || '';
    public static readonly ADMIN_ID = process.env.ADMIN_ID || '';
    public static readonly TOP_2K_CHANNEL_ID = process.env.TOP_2K_CHANNEL_ID || '';
    public static readonly LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || '';

    public static readonly SPAM_EXPIRE_TIME = 7; // Seconds
    public static readonly DM_WAIT_DURATION = 3;
}
