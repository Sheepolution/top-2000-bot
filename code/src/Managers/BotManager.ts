import DiscordService from '../Services/DiscordService';
import MessageService from '../Services/MessageService';
import SettingsConstants from '../Constants/SettingsConstants';
import { TextChannel } from 'discord.js';
import { Utils } from '../Utils/Utils';
import Top2KProvider from '../Providers/Top2KProvider';
import Top2KEmbeds from '../Embeds/Top2KEmbeds';

export default class BotManager {

    private static liveBlogChannel:TextChannel;
    private static sportsChannel:TextChannel;
    private static top2KChannel:TextChannel;

    public static async OnReady() {
        console.log('Robot Stenders: Connected');
        BotManager.top2KChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.TOP_2K_CHANNEL_ID);

        await Top2KProvider.GetTop2KList();

        // Prevent from current song being sent twice on restart
        await Top2KProvider.GetNewCurrentSong();

        setInterval(() => {
            BotManager.SendTop2KUpdates();
        }, Utils.GetSecondsInMilliseconds(15))
    }

    public static GetLiveBlogChannel() {
        return BotManager.liveBlogChannel;
    }

    public static GetSportsChannel() {
        return BotManager.sportsChannel;
    }

    public static GetTop2KChannel() {
        return BotManager.top2KChannel;
    }

    public static async SendTop2KUpdates() {
        const newSong = await Top2KProvider.GetNewCurrentSong();
        if (newSong != null) {
            const song = Top2KProvider.GetSongObject();
            if (song != null) {
                MessageService.SendMessageToTop2KChannel('', Top2KEmbeds.GetSongEmbed(song));
            }
        }
    }
}
