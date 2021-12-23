import { DMChannel, MessageEmbed } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import DiscordService from '../Services/DiscordService';
import { Utils } from '../Utils/Utils';

export default class MessageManager {

    private static dmQueue = 0;

    public static async SendMessageToDM(dmChannel: DMChannel, text: string, embed?: MessageEmbed) {
        this.dmQueue += 1;
        if (this.dmQueue > 5) {
            await Utils.Sleep((this.dmQueue - 5) * SettingsConstants.DM_WAIT_DURATION);
        }

        this.HandleDMQueue();

        const data: any = {};

        if (text?.isFilled()) {
            data.content = text;
        }

        if (embed != null) {
            data.embeds = [embed];
        }

        return await DiscordService.SendMessage(dmChannel, data);
    }

    public static GetDMQueue() {
        return this.dmQueue;
    }

    private static async HandleDMQueue() {
        await Utils.Sleep(SettingsConstants.DM_WAIT_DURATION);
        this.dmQueue -= 1;
    }
}