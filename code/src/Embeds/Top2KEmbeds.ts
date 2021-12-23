import SettingsConstants from '../Constants/SettingsConstants';
import { MessageEmbed } from 'discord.js';
import Top2KSong from '../Objects/Top2KSong';
import Top2KConstants from '../Constants/Top2KConstants';
import Top2KProvider from '../Providers/Top2KProvider';

export default class Top2KEmbeds {

    public static GetSongEmbed(song: Top2KSong) {
        const change = song.GetChange();
        const absChange = Math.abs(change || 0);

        const embed = new MessageEmbed()
            .setColor(change == null ? SettingsConstants.COLORS.NEW : (change == 0 ? SettingsConstants.COLORS.UNCHANGED : (change > 0 ? SettingsConstants.COLORS.GOOD : SettingsConstants.COLORS.BAD)))
            .setAuthor(song.GetArtist(), Top2KConstants.ICONS.NPO2, song.GetPageUrl())
            .setTitle(song.GetTitle())
            .setThumbnail(song.GetImageUrl())
            .setFooter(`#${song.GetCurrentPosition()} ${change == null ? '🔷 Nieuw!' : (change == 0 ? '🔘 Onveranderd' : `${change > 0 ? '🔺' : '🔻'} ${absChange} plaats${absChange == 1 ? '' : 'en'} ${change > 0 ? 'gestegen' : 'gedaald'}`)}`);

        let description = '';

        const statsUrl = song.GetStatsUrl();
        if (statsUrl != null) {
            description = `📈 [Statistieken](${statsUrl})\n`;
        }

        const audioUrl = song.GetAudioUrl();
        if (audioUrl != null) {
            description += `🎵 [Luister fragment](${audioUrl})`;
        }

        if (description.isFilled()) {
            embed.setDescription(description);
        }

        return embed;
    }

    public static GetSongListEmbed(songList: Array<Top2KSong>, title: string) {

        let songListString = '';
        const currentPosition = Top2KProvider.GetCurrentPosition();

        for (const song of songList) {
            const nowPlaying = song.GetCurrentPosition() == currentPosition;
            const addition = `\`#${song.GetCurrentPosition()}\` ${nowPlaying ? '**' : ''}${song.GetTitle()} - ${song.GetArtist()}${nowPlaying ? '**' : ''}\n`;
            if (songListString.length + addition.length > 2048) {
                break;
            }

            songListString += addition;
        }

        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(title)
            .setDescription(songListString);

        return embed;
    }
}