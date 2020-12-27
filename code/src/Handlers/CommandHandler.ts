import SettingsConstants from '../Constants/SettingsConstants';
import IMessageInfo from '../Interfaces/IMessageInfo';
import SongHandler from './SongHandler';

export default class CommandHandler {

    public static async OnCommand(messageInfo:IMessageInfo, content:string) {
        const words = content.split(' ');
        const command = words[0].substr(SettingsConstants.PREFIX.length).toLowerCase();
        words.shift();
        const args = words;
        if (content.trim().includes(' ')) {
            content = content.slice(content.indexOf(' ')).trim();
        } else {
            content = '';
        }

        if (messageInfo.message?.channel?.id != SettingsConstants.TOP_2K_CHANNEL_ID) {
            return;
        }

        if (await SongHandler.OnCommand(messageInfo, command, args)) {
            return;
        }

        return true;
    }
}
