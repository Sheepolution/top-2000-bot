import DiscordService from '../Services/DiscordService';
import MessageService from '../Services/MessageService';
import SettingsConstants from '../Constants/SettingsConstants';
import { Message, TextChannel } from 'discord.js';
import { Utils } from '../Utils/Utils';
import Top2KProvider from '../Providers/Top2KProvider';
import Top2KEmbeds from '../Embeds/Top2KEmbeds';
import DiscordUtils from '../Utils/DiscordUtils';
import CommandHandler from '../Handlers/CommandHandler';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { Redis } from '../Providers/Redis';
import RedisConstants from '../Constants/RedisConstants';

export default class BotManager {

    private static top2KChannel:TextChannel;

    public static async OnReady() {
        console.log('Robot Stenders: Connected');
        BotManager.top2KChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.TOP_2K_CHANNEL_ID);

        await Top2KProvider.GetTop2KList();

        // Prevent from current song being sent twice on restart
        await Top2KProvider.GetNewCurrentSong();

        BotManager.UpdatePresenter();

        setInterval(() => {
            BotManager.SendTop2KUpdates();
        }, Utils.GetSecondsInMilliseconds(15))

        setInterval(() => {
            BotManager.UpdatePresenter();
        }, Utils.GetMinutesInMilliseconds(1))
    }

    public static async OnMessage(message:Message) {
        if (message.guild == null) {
            return;
        }

        if (message.member == null) {
            return;
        }

        const messageInfo:IMessageInfo = DiscordUtils.ParseMessageToInfo(message, message.member);

        var content = message.content.trim();
        var prefix = SettingsConstants.PREFIX;

        if (content.startsWith(prefix)) {
            await CommandHandler.OnCommand(messageInfo, content);
        }
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
                this.OnNewSong();
            }
        }
    }

    public static async UpdatePresenter() {
        const newPresenter = await Top2KProvider.GetNewCurrentPresenter();
        if (newPresenter != null) {
            const guild = this.top2KChannel.guild;
            const member = guild.members.cache.get(SettingsConstants.BOT_ID);
            if (member != null) {
                await DiscordService.SetNickname(member, newPresenter.name);
                await DiscordService.SetAvatar(newPresenter.image);
            }
        }
    }

    public static async OnNewSong() {
        const currentPosition = Top2KProvider.GetCurrentPosition();
        if (currentPosition == 1) {
            return;
        }

        const reminders = await Redis.hgetall(RedisConstants.REDIS_KEY + RedisConstants.REMINDER_KEY + (currentPosition - 1))
        if (reminders == null) {
            return;
        }

        const list = await Top2KProvider.GetTop2KList();
        const nextSong = list[currentPosition - 2];

        var reminderMessage = `Hierna komt ${nextSong.s} van ${nextSong.a}.\n`;
        for (const id in reminders) {
            reminderMessage += `<@${id}>, `;
        }

        reminderMessage = reminderMessage.slice(0, -2);

        MessageService.SendMessageToTop2KChannel(reminderMessage);
    }
}
