import Top2KEmbeds from '../Embeds/Top2KEmbeds';
import IMessageInfo from '../Interfaces/IMessageInfo';
import Top2KSong from '../Objects/Top2KSong';
import { Redis } from '../Providers/Redis';
import Top2KProvider from '../Providers/Top2KProvider';
import MessageService from '../Services/MessageService';

export default class SongHandler {

    public static async OnCommand(messageInfo:IMessageInfo, command:string, args:Array<string>) {
        switch (command) {
            case 'zoek':
            case 'search':
                this.OnSearchingSong(messageInfo, args[0], args.slice(1).join(' '));
                break;
            case 'remind':
                this.OnRemind(messageInfo, parseInt(args[0]));
                break;
            default:
                return false;
        }

        return true;
    }

    private static async OnSearchingSong(messageInfo:IMessageInfo, searchType:string, searchKey:string) {
        const list = await Top2KProvider.GetTop2KList();
        if (searchKey == null || searchKey == '') {
            searchKey = searchType;
            searchType = 'titel';
        }

        searchKey = searchKey.toLowerCase();

        var songs = new Array<any>();

        switch (searchType.toLowerCase()) {
            case 'titel':
            case 'title':
            case 'naam':
            case 'name':
            case 'nummer':
            case 'lied':
                songs = list.filter(s => s.sorts.includes(searchKey));
                break;
            case 'author':
            case 'artiest':
            case 'artist':
            case 'muziekant':
            case 'componist':
            case 'composer':
                songs = list.filter(s => s.sorta.includes(searchKey));
                break;
            case 'plaats':
            case 'getal':
                // eslint-disable-next-line no-case-declarations
                const position = parseInt(searchKey);
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
        }

        if (songs.length == 0) {
            MessageService.ReplyMessage(messageInfo, `Ik heb geen nummers kunnen vinden met '${searchKey}' als ${searchType}`, false, true);
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

        MessageService.ReplyMessage(messageInfo, '', undefined, true, Top2KEmbeds.GetSongListEmbed(detailedSongList, searchType, searchKey));
    }

    private static async OnRemind(messageInfo:IMessageInfo, position?:number) {
        if (position == null) {
            MessageService.ReplyMessage(messageInfo, 'Geef een geldig getal mee tussen de 1 en de 2000.', false);
            return;
        }

        if (position > 2000 || position < 1) {
            MessageService.ReplyMessage(messageInfo, 'De Top 2000 heeft maar 2000 nummers.', false);
            return;
        }

        const list = await Top2KProvider.GetTop2KList();
        const song = list[position - 1];

        var currentPosition = Top2KProvider.GetCurrentPosition();

        if (currentPosition < position) {
            MessageService.ReplyMessage(messageInfo, `${song.s} van ${song.a} is al geweest.`, false);
            return;
        }

        if (currentPosition == position) {
            MessageService.ReplyMessage(messageInfo, `${song.s} van ${song.a} wordt momenteel afgespeeld.`);
            return;
        }

        if (currentPosition == position + 1) {
            MessageService.ReplyMessage(messageInfo, `${song.s} van ${song.a} is het volgende nummer.`);
            return;
        }

        Redis.hmset(position, messageInfo.member.id, 1);

        MessageService.ReplyMessage(messageInfo, `Oké, ik stuur je een reminder wanneer ${song.s} van ${song.a} bijna aan de beurt is.`, true, true);
        return;
    }
}
