import SettingsConstants from '../Constants/SettingsConstants';
import { MessageEmbed } from 'discord.js';
import Top2KSong from '../Objects/Top2KSong';
import Top2KConstants from '../Constants/Top2KConstants';

export default class Top2KEmbeds {

    public static GetSongEmbed(song:Top2KSong) {
        const change = song.GetChange();
        const absChange = Math.abs(change || 0);

        const embed = new MessageEmbed()
            .setColor(change == null ? SettingsConstants.COLORS.NEW : (change == 0 ? SettingsConstants.COLORS.UNCHANGED : (change > 0 ? SettingsConstants.COLORS.GOOD : SettingsConstants.COLORS.BAD)))
            .setAuthor(song.GetArtist(), Top2KConstants.ICONS.NPO2, song.GetPageUrl())
            .setTitle(song.GetTitle())
            .setThumbnail(song.GetImageUrl())
            .setDescription(`[Luister fragment](${song.GetAudioUrl()})`)
            .setFooter(`${song.GetCurrentPosition()} | ${change == null ? 'Nieuw!' : (change == 0 ? 'Onveranderd' : `${absChange} plaats${change == 1 ? '' : 'en'} ${change > 0 ? 'gestegen' : 'gedaald'}`)}`);

        return embed;
    }
}