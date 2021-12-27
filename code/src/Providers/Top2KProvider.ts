import Top2KConstants from '../Constants/Top2KConstants';
import Top2KSong from '../Objects/Top2KSong';

const fetch = require('node-fetch');

export default class Top2KProvider {

    private static currentSongId: string;
    private static currentPosition: number = -1;
    private static currentPresenterId: string;
    private static list: Array<any> = new Array<any>();
    private static seen: Array<string> = new Array<string>();

    public static async GetTop2KList() {
        if (this.list.length == 0) {
            this.list = (await this.GetTopListJSON()).positions;
        }

        return this.list;
    }

    public static async GetNewCurrentSong() {
        const song = await this.GetCurrentSongJSON();
        if (song?.data?.radio_track_plays?.data == null) {
            return;
        }

        if (song.data.radio_track_plays.data.length == 0) {
            return;
        }

        let songData = song.data.radio_track_plays.data[0];
        if (songData.radioTracks != null) {
            songData = songData.radioTracks;
        }

        if (songData == null) {
            return;
        }

        let songInList = this.list.find((s: any) => s.title == songData.name && s.artist == songData.artist);

        if (songInList == null) {
            const song = await this.GetCurrentSongJSON2();
            if (song?.data?.radio_track_plays?.data == null) {
                return;
            }

            if (song.data.radio_track_plays.data.length == 0) {
                return;
            }

            songData = song.data.radio_track_plays.data[0].radio_tracks;

            if (songData == null) {
                return;
            }

            songInList = this.list.find((s: any) => s.id == songData.id);
        }

        const songId = songInList.id;

        if (this.currentSongId == songId) {
            return;
        }

        if (this.seen.includes(songId)) {
            return;
        }

        this.currentSongId  = songId;

        this.seen.push(this.currentSongId);

        this.UpdateCurrentPosition(songInList);

        return song;
    }

    public static async GetNewCurrentPresenter() {
        const broadcast = await this.GetCurrentBroadcastJSON();
        const presenter = broadcast.data[0].presenters;

        if (this.currentPresenterId != null && this.currentSongId == presenter.id) {
            return;
        }

        this.currentPresenterId = presenter.id;

        return presenter;
    }

    public static GetSongObject() {
        const songData = this.GetSongData();
        if (songData != null) {
            this.UpdateCurrentPosition(songData);
            const song = new Top2KSong(songData);
            return song;
        }
    }

    public static GetCurrentPosition() {
        return this.currentPosition;
    }

    public static UpdateCurrentPosition(songData: any) {
        const currentPosition = this.list.findIndex((s: any) => s.id == songData.id);
        if (currentPosition != -1) {
            this.currentPosition = <number> currentPosition + 1;
        }
    }

    private static GetSongData() {
        let songData = this.list.find((s: any) => s.id == this.currentSongId);
        if (songData == null) {
            songData = this.list[this.currentPosition - 2];
        }

        return songData;
    }

    private static async GetTopListJSON() {
        return await this.GetJSON(`${Top2KConstants.BASE_URL}/api/chart/positions?editionSlug=top-2000-van-2021-12-25`);
    }

    private static async GetCurrentSongJSON() {
        return await this.GetJSON(`${Top2KConstants.BASE_URL}/api/miniplayer/info?channel=npo-radio-2`);
    }

    private static async GetCurrentSongJSON2() {
        return await this.GetJSON(`${Top2KConstants.BASE_URL}/api/miniplayer/liveTrack?channel=npo-radio-2`);
    }

    private static async GetCurrentBroadcastJSON() {
        return await this.GetJSON(`${Top2KConstants.BASE_URL}/api/broadcasts`);
    }

    private static async GetJSON(url: string) {
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }
}