export default class SettingsConstants {
    public static readonly COLORS = {
        BAD:'#ff0000',
        GOOD:'#00ff00',
        DEFAULT:'#e61e14',
        NEW:'#0669dd',
        UNCHANGED:'#696969',
    }

    public static readonly PREFIX = ';';

    public static readonly BOT_ID = process.env.BOT_ID || '';
    public static readonly ADMIN_ID = process.env.ADMIN_ID || '';
    public static readonly TOP_2K_CHANNEL_ID = process.env.TOP_2K_CHANNEL_ID || '';

}
