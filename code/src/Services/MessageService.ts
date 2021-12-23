import BotManager from '../Managers/BotManager';
import DiscordService from './DiscordService';
import { CommandInteraction, MessageActionRow, MessageEmbed, TextChannel } from 'discord.js';
import IMessageInfo from '../Interfaces/IMessageInfo';
import EmojiConstants from '../Constants/EmojiConstants';
import MessageManager from '../Managers/MessageManager';

export default class MessageService {

    public static async ReplyMessage(messageInfo: IMessageInfo, text: string, good?: boolean, mention?: boolean, embed?: MessageEmbed, components?: Array<MessageActionRow>) {
        if (embed && messageInfo.guild) {
            if (!await DiscordService.CheckPermission(messageInfo, 'EMBED_LINKS')) {
                return;
            }
        }

        if (good != null) {
            text = (good ? EmojiConstants.STATUS.GOOD : EmojiConstants.STATUS.BAD) + ' ' + text;
        }

        const data: any = {};

        if (text?.isFilled()) {
            data.content = text;
        }

        if (embed != null) {
            data.embeds = [embed];
        }

        if (components != null) {
            data.components = components;
        }

        if (messageInfo.interaction != null) {
            if (good == false) {
                data.ephemeral = true;
            }

            await (messageInfo.interaction as CommandInteraction).reply(data);
            if (!data.ephemeral) {
                return await (messageInfo.interaction as CommandInteraction).fetchReply();
            }

            return;
        }

        if (mention) {
            return DiscordService.ReplyMessage(<TextChannel>messageInfo.channel, messageInfo.user, data);
        } else {
            return DiscordService.SendMessage(<TextChannel>messageInfo.channel, data);
        }
    }

    public static async ReplyEmbed(messageInfo: IMessageInfo, embed: MessageEmbed, text?: string, components?: Array<MessageActionRow>) {
        if (messageInfo.guild) {
            if (!await DiscordService.CheckPermission(messageInfo, 'EMBED_LINKS')) {
                return;
            }
        }

        const data: any = { embeds: [embed] };

        if (text?.isFilled()) {
            data.content = text;
        }

        if (components != null) {
            data.components = components;
        }

        if (messageInfo.interaction != null) {
            await (messageInfo.interaction as CommandInteraction).reply(data);
            return await (messageInfo.interaction as CommandInteraction).fetchReply();
        }

        return await DiscordService.SendMessage(messageInfo.channel, data);
    }

    public static async SendMessageToTop2KChannel(message: string, embed?: MessageEmbed) {
        return await this.SendMessage(BotManager.GetTop2KChannel(), message, embed);
    }

    public static async SendMessageToDM(messageInfo: IMessageInfo, text: string, embed?: MessageEmbed, good?: boolean) {
        if (good != null) {
            text = (good ? EmojiConstants.STATUS.GOOD : EmojiConstants.STATUS.BAD) + ' ' + text;
        }

        if (messageInfo.interaction != null) {
            if (messageInfo.channel.id == messageInfo.user.dmChannel?.id) {
                const data: any = {};

                if (text?.isFilled()) {
                    data.content = text;
                }

                if (embed != null) {
                    data.embeds = [embed];
                }

                if (good == false) {
                    data.ephemeral = true;
                }

                await (messageInfo.interaction as CommandInteraction).reply(data);
                if (!data.ephemeral) {
                    return await (messageInfo.interaction as CommandInteraction).fetchReply();
                }

                return;
            }
        }

        const dmChannel = messageInfo.user.dmChannel || await messageInfo.user.createDM();
        return await MessageManager.SendMessageToDM(dmChannel, text, embed);
    }

    public static async SendMessageToDMById(id: string, text: string, embed?: MessageEmbed, good?: boolean) {
        if (good != null) {
            text = (good ? EmojiConstants.STATUS.GOOD : EmojiConstants.STATUS.BAD) + ' ' + text;
        }

        const user = await DiscordService.FindUserById(id);
        if (user != null) {
            const dmChannel = user.dmChannel || await user.createDM();
            return await MessageManager.SendMessageToDM(dmChannel, text, embed);
        }
    }

    private static async SendMessage(channel: TextChannel, text: string, embed?: MessageEmbed) {
        const data: any = {};

        if (text?.isFilled()) {
            data.content = text;
        }

        if (embed != null) {
            data.embeds = [embed];
        }

        return DiscordService.SendMessage(<TextChannel>channel, data);
    }

}
