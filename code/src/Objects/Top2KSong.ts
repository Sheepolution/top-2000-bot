import Top2KConstants from '../Constants/Top2KConstants';

export default class Top2KSong {

    private id: string;
    private title: string;
    private artist: string;
    private year: string;
    private currentPosition: number;
    private previousPosition: number;
    private change?: number;
    private imageUrl: string;
    private pageUrl: string;
    private audioUrl: string;

    constructor(data:any) {
        this.id = data.aid;
        this.title = data.s;
        this.artist = data.a;
        this.year = data.yr;
        this.currentPosition = data.pos;
        this.previousPosition = data.prv;
        this.change = this.previousPosition == 0 ? undefined : this.previousPosition - this.currentPosition;
        this.imageUrl = data.img;
        this.pageUrl = `${Top2KConstants.BASE_URL}${data.url}`;
        this.audioUrl = data.aud;
    }

    public GetId() {
        return this.id;
    }

    public GetTitle() {
        return this.title;
    }

    public GetArtist() {
        return this.artist;
    }

    public GetYear() {
        return this.year;
    }

    public GetCurrentPosition() {
        return this.currentPosition;
    }

    public GetPreviousPosition() {
        return this.previousPosition;
    }

    public GetChange() {
        return this.change;
    }

    public GetImageUrl() {
        return this.imageUrl;
    }

    public GetPageUrl() {
        return this.pageUrl;
    }

    public GetAudioUrl() {
        return this.audioUrl;
    }
}