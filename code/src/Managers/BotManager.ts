import DiscordService from '../Services/DiscordService';
import MessageService from '../Services/MessageService';
import SettingsConstants from '../Constants/SettingsConstants';
import { ButtonInteraction, Message, TextChannel } from 'discord.js';
import { Utils } from '../Utils/Utils';
import Top2KProvider from '../Providers/Top2KProvider';
import Top2KEmbeds from '../Embeds/Top2KEmbeds';
import DiscordUtils from '../Utils/DiscordUtils';
import CommandHandler from '../Handlers/CommandHandler';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { Redis } from '../Providers/Redis';
import RedisConstants from '../Constants/RedisConstants';
import ButtonManager from './ButtonManager';
import LogService from '../Services/LogService';
import { LogType } from '../Enums/LogType';

export default class BotManager {

    private static top2KChannel: TextChannel;

    public static async OnReady() {
        console.log('Top 2000: Connected');
        BotManager.top2KChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.TOP_2K_CHANNEL_ID);

        await Top2KProvider.GetTop2KList();

        // Prevent current song being sent twice on restart
        await Top2KProvider.GetNewCurrentSong();
        await Top2KProvider.GetNewCurrentPresenter();

        setInterval(() => {
            const time = new Date().getTime();

            if (time < 1640386800 || time > 1640991600) {
                return;
            }

            BotManager.SendTop2KUpdates();
        }, Utils.GetSecondsInMilliseconds(15));
    }

    public static async OnMessage(message: Message) {
        const messageInfo: IMessageInfo = DiscordUtils.ParseMessageToInfo(message, message.author);

        const content = message.content.trim();
        const prefix = SettingsConstants.PREFIX;

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
                const message = await MessageService.SendMessageToTop2KChannel('', Top2KEmbeds.GetSongEmbed(song));
                this.OnNewSong();
                await Utils.Sleep(5);
                await message.crosspost();
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
            }
        }
    }

    public static async OnNewSong() {
        const currentPosition = Top2KProvider.GetCurrentPosition();
        if (currentPosition == 1) {
            return;
        }

        const reminders = await Redis.hgetall(RedisConstants.REDIS_KEY + RedisConstants.REMINDER_KEY + (currentPosition - 1));
        if (reminders == null) {
            return;
        }

        const list = await Top2KProvider.GetTop2KList();
        const nextSong = list[currentPosition - 2];

        const reminderMessage = `Zometeen komt **${nextSong.title}** van **${nextSong.artist}**.\n`;
        for (const id in reminders) {
            MessageService.SendMessageToDMById(id, reminderMessage);
        }
    }

    public static async OnInteractionCommand(interaction: ButtonInteraction) {
        const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);
        CommandHandler.OnCommand(messageInfo, '');
    }

    public static OnInteractionButton(interaction: ButtonInteraction) {
        ButtonManager.OnClick(<Message>interaction.message, interaction.customId, interaction.user);
        interaction.deferUpdate();
    }

    public static OnAddedToGuild() {
        LogService.Log(LogType.GuildJoined);
    }

    public static OnKickedFromGuild() {
        LogService.Log(LogType.GuildLeft);
    }
}
