import { CommandInteraction } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import IMessageInfo from '../Interfaces/IMessageInfo';
import CommandManager from '../Managers/CommandManager';
import MessageService from '../Services/MessageService';
import CommandUtils from '../Utils/CommandUtils';
import { Utils } from '../Utils/Utils';
import SongHandler from './SongHandler';

export default class CommandHandler {

    public static async OnCommand(messageInfo: IMessageInfo, content: string) {
        let commandInfo;

        if (messageInfo.interaction != null) {
            commandInfo = CommandUtils.ParseInteractionToCommand(messageInfo.interaction as CommandInteraction);
        } else {
            commandInfo = CommandUtils.ParseContentToCommand(content, SettingsConstants.PREFIX);
        }

        messageInfo.commandInfo = commandInfo;

        const command = this.GetCommand(commandInfo.command);

        if (command == null) {
            return;
        }

        const spam = await CommandManager.CheckSpam(messageInfo);
        if (spam.spam) {
            if (spam.warn) {
                MessageService.ReplyMessage(messageInfo, `Please wait ${SettingsConstants.SPAM_EXPIRE_TIME} seconds before using another command.`, false, true);
            }

            return;
        }

        commandInfo.command = command[0];
        commandInfo.commands = command;

        const cooldown = await CommandManager.GetCooldown(messageInfo);

        if (cooldown.time > 0) {
            if (cooldown.tell) {
                MessageService.ReplyMessage(messageInfo, `Please wait ${Utils.GetSecondsInMinutesAndSeconds(cooldown.time)} before using this command again.`, false, true);
            }

            return;
        }

        if (SongHandler.OnCommand(messageInfo)) {
            return;
        }
    }

    public static GetCommand(command: string) {
        const commandConstants = <{ [key: string]: any }>CommandConstants;

        for (const commandConstantKey in commandConstants) {
            const commandGroup = <{ [key: string]: Array<string> }>commandConstants[commandConstantKey];
            for (const commandGroupKey in commandGroup) {
                if (commandGroup[commandGroupKey].includes(command)) {
                    return commandGroup[commandGroupKey];
                }
            }
        }

        return null;
    }
}
