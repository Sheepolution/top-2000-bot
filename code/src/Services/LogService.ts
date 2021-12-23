import { Snowflake, TextChannel } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import { LogType } from '../Enums/LogType';
import Discord from '../Providers/Discord';
import { Utils } from '../Utils/Utils';

export default class LogService {

    private static logChannel: TextChannel;

    public static async Log(logType: LogType) {
        if (this.logChannel == null) {
            const logChannel = await Discord.GetClient().channels.fetch(SettingsConstants.LOG_CHANNEL_ID as Snowflake);
            this.logChannel = <TextChannel>logChannel;
        }

        this.logChannel.send(`${Utils.GetDateAsUserFriendlyString(new Date())} - ${logType}`);
    }
}