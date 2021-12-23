import { CommandInteraction, Message, MessageActionRow, MessageButton } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import RedisConstants from '../Constants/RedisConstants';
import Top2KEmbeds from '../Embeds/Top2KEmbeds';
import { ButtonMessageType } from '../Enums/ButtonMessageType';
import { LogType } from '../Enums/LogType';
import IMessageInfo from '../Interfaces/IMessageInfo';
import ButtonManager from '../Managers/ButtonManager';
import Top2KSong from '../Objects/Top2KSong';
import { Redis } from '../Providers/Redis';
import Top2KProvider from '../Providers/Top2KProvider';
import LogService from '../Services/LogService';
import MessageService from '../Services/MessageService';

export default class SongHandler {

    public static OnCommand(messageInfo: IMessageInfo) {
        const commands = CommandConstants.COMMANDS;
        const commandInfo = messageInfo.commandInfo;

        switch (commandInfo.commands) {
            case commands.SEARCH:
                this.OnSearchingSong(messageInfo, commandInfo.args[0], commandInfo.args.slice(1).join(' '));
                break;
            case commands.LIST:
                this.OnList(messageInfo);
                break;
            case commands.REMIND:
                this.OnRemind(messageInfo, commandInfo.args[0]);
                break;
            default:
                return false;
        }

        return true;
    }

    public static async OnPlaylistNavigation(obj: any, id: string) {
        if (id == 'previous') {
            obj.values.position += 20;
        } else if (id == 'next') {
            obj.values.position -= 20;
        }

        obj.values.position = Math.max(0, Math.min(2000, obj.values.position));

        const detailedSongList = await this.GetSongList(obj.values.position);

        obj.message.edit({embeds: [Top2KEmbeds.GetSongListEmbed(detailedSongList, 'Playlist')]});
    }

    private static async OnSearchingSong(messageInfo: IMessageInfo, searchType: string, searchKey: string) {
        const list = await Top2KProvider.GetTop2KList();
        if (searchKey == null || searchKey == '') {
            searchKey = searchType;
            searchType = 'titel';
        }

        if (messageInfo.interaction != null) {
            searchType = (messageInfo.interaction as CommandInteraction).options.get('categorie').value as string;
            searchKey = (messageInfo.interaction as CommandInteraction).options.get('zoekterm').value as string;
        }

        let lowerSearchKey = searchKey.toLowerCase();

        let songs = new Array<any>();

        switch (searchType.toLowerCase()) {
            case 'titel':
            case 'title':
            case 'naam':
            case 'name':
            case 'nummer':
            case 'lied':
                songs = list.filter(s => s.title.toLowerCase().includes(lowerSearchKey));
                break;
            case 'author':
            case 'artiest':
            case 'artist':
            case 'muziekant':
            case 'componist':
            case 'composer':
                songs = list.filter(s => s.artist.toLowerCase().includes(lowerSearchKey));
                break;
            case 'plaats':
            case 'positie':
            case 'position':
            case 'getal':
                // eslint-disable-next-line no-case-declarations
                const position = parseInt(lowerSearchKey);
                if (position == null) {
                    MessageService.ReplyMessage(messageInfo, `${searchKey} is geen geldig getal.`, false, true);
                    return;
                }

                if (position > 2000 || position < 1) {
                    MessageService.ReplyMessage(messageInfo, 'De Top 2000 heeft maar 2000 nummers.', false, true);
                    return;
                }

                songs = [list[position - 1]];
                break;
            default:
                lowerSearchKey = `${searchType.toLowerCase()} ${lowerSearchKey}`;
                songs = list.filter(s => s.title.toLowerCase().includes(lowerSearchKey));
                if (songs.length == 0) {
                    MessageService.ReplyMessage(messageInfo, `Ik heb geen nummers kunnen vinden met '${searchKey}' als titel.`, false, true);
                    return;
                }
                break;
        }

        LogService.Log(LogType.CommandSearch);

        if (songs.length == 0) {
            MessageService.ReplyMessage(messageInfo, `Ik heb geen nummers kunnen vinden met '${searchKey}' als ${searchType}.`, false, true);
            return;
        }

        const detailedSongList = new Array<Top2KSong>();

        for (const song of songs) {
            detailedSongList.push(new Top2KSong(song));
        }

        if (detailedSongList.length == 1) {
            MessageService.ReplyMessage(messageInfo, '', undefined, true, Top2KEmbeds.GetSongEmbed(detailedSongList[0]));
            return;
        }

        MessageService.ReplyMessage(messageInfo, '', undefined, true, Top2KEmbeds.GetSongListEmbed(detailedSongList, `Nummers met '${searchKey}' als ${searchType}`));
    }

    private static async OnRemind(messageInfo: IMessageInfo, positionString: string) {
        let position;
        if (messageInfo.interaction) {
            position = (messageInfo.interaction as CommandInteraction).options.get('plek').value as number;
        } else {

            if (!positionString?.isFilled()) {
                MessageService.ReplyMessage(messageInfo, 'Geef een geldig getal mee tussen de 1 en de 2000.', false);
                return;
            }

            position = parseInt(positionString);
            if (isNaN(position)) {
                MessageService.ReplyMessage(messageInfo, 'Geef een geldig getal mee tussen de 1 en de 2000.', false);
                return;
            }
        }

        if (position > 2000 || position < 1) {
            MessageService.ReplyMessage(messageInfo, 'De Top 2000 heeft maar 2000 nummers.', false);
            return;
        }

        const list = await Top2KProvider.GetTop2KList();
        const song = list[position - 1];

        const currentPosition = Top2KProvider.GetCurrentPosition();

        const title = `**${song.title}**`;
        const artist = `**${song.artist}**`;

        if (currentPosition < position) {
            MessageService.ReplyMessage(messageInfo, `${title} van ${artist} is al geweest.`, false);
            return;
        }

        if (currentPosition == position) {
            MessageService.ReplyMessage(messageInfo, `${title} van ${artist} wordt momenteel afgespeeld.`);
            return;
        }

        if (currentPosition == position + 1) {
            MessageService.ReplyMessage(messageInfo, `${title} van ${artist} is het volgende nummer.`);
            return;
        }

        Redis.hmset(RedisConstants.REDIS_KEY + RedisConstants.REMINDER_KEY + position, messageInfo.user.id, 1);

        MessageService.ReplyMessage(messageInfo, `Oké, ik stuur je een reminder wanneer ${title} van ${artist} bijna aan de beurt is.`, true, true);

        LogService.Log(LogType.CommandRemind);
    }

    private static async OnList(messageInfo: IMessageInfo) {
        const currentPosition = Top2KProvider.GetCurrentPosition() ?? 1000;

        const detailedSongList = await this.GetSongList(currentPosition);

        const actionRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('previous')
                    .setLabel('⬅️')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('next')
                    .setLabel('➡️')
                    .setStyle('SECONDARY'));

        const message = await MessageService.ReplyEmbed(messageInfo, Top2KEmbeds.GetSongListEmbed(detailedSongList, 'Playlist'), null, [actionRow]);
        ButtonManager.AddMessage(<Message>message, ButtonMessageType.SongList, messageInfo, {position: currentPosition});
        LogService.Log(LogType.CommandList);
    }

    private static async GetSongList(position: number) {
        const detailedSongList = new Array<Top2KSong>();
        const list  = await Top2KProvider.GetTop2KList();

        for (let i = position + 1; i >= Math.max(0, position - 20); i--) {
            if (i >= 2000 || i < 0) {
                continue;
            }

            const song = list[i];
            detailedSongList.push(new Top2KSong(song));
        }

        return detailedSongList;
    }
}
