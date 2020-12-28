import BotManager from '../Managers/BotManager';
import DiscordService from './DiscordService';
import { MessageEmbed, TextChannel } from 'discord.js';
import IMessageInfo from '../Interfaces/IMessageInfo';
import EmojiConstants from '../Constants/EmojiConstants';

export default class MessageService {

    public static async ReplyMessage(messageInfo:IMessageInfo, message:string, good?:boolean, mention?:boolean, embed?:MessageEmbed) {
        if (good != null) {
            message = (good ?  EmojiConstants.STATUS.GOOD : EmojiConstants.STATUS.BAD) + ' ' + message;
        }
        if (mention != false) {
            return DiscordService.ReplyMessage(<TextChannel>messageInfo.channel, messageInfo.member, message, embed)
        } else {
            return DiscordService.SendMessage(<TextChannel>messageInfo.channel, message, embed)
        }
    }

    public static async ReplyEmbed(messageInfo:IMessageInfo, embed:MessageEmbed, message?:string) {
        return DiscordService.SendEmbed(messageInfo.channel, embed, message)
    }

    public static async SendMessageToTop2KChannel(message:string, embed?:MessageEmbed) {
        return await this.SendMessage(BotManager.GetTop2KChannel(), message, embed);
    }

    private static async SendMessage(channel:TextChannel, message:string, embed?:MessageEmbed) {
        return await DiscordService.SendMessage(channel, message, embed)
    }
}
