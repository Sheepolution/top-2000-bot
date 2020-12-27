import Top2KConstants from '../Constants/Top2KConstants';
import Top2KSong from '../Objects/Top2KSong';

var fetch = require('node-fetch');

export default class Top2KProvider {

    private static currentSongId: string;
    private static currentPosition: number;
    private static list: Array<any> = new Array<any>();

    public static async GetTop2KList() {
        this.list = await this.GetTopListJSON();
    }

    public static async GetNewCurrentSong() {
        const song = await this.GetCurrentSongJSON();
        if (this.currentSongId != null && (this.currentSongId == song.id || this.currentSongId == song.title + song.artist)) {
            return;
        }

        this.currentSongId = song.id;

        if (this.currentSongId == '') {
            this.currentSongId = song.title + song.artist;
        }

        return song;
    }

    public static GetSongObject() {
        const songData = this.GetSongData();
        if (songData != null) {
            this.UpdateCurrentPosition(songData);
            const song = new Top2KSong(songData);
            return song;
        }
    }

    public static UpdateCurrentPosition(songData: any) {
        const currentPosition = this.list.indexOf(songData);
        if (this.currentPosition != -1) {
            this.currentPosition = <number> currentPosition + 1;
        }
    }

    private static GetSongData() {
        var songData = this.list.find((s: any) => s.aid == this.currentSongId || s.s + s.a == this.currentSongId);
        if (songData == null) {
            songData = this.list[this.currentPosition - 2];
        }
        return songData;
    }

    private static async GetTopListJSON() {
        return await this.GetJSON(`${Top2KConstants.BASE_URL}/?option=com_ajax&plugin=Top2000&format=json&year=2020`);
    }

    private static async GetCurrentSongJSON() {
        return await this.GetJSON(`${Top2KConstants.BASE_URL}/?option=com_ajax&plugin=nowplaying&format=json&channel=nporadio2`);
    }

    private static async GetJSON(url: string) {
        var response = await fetch(url);
        var json = await response.json();
        return json.data[0];
    }
}