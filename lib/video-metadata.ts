interface Metadata{
    width : number,
    height : number,
    fileSize : number
}

export class VideoMetadata{
    async frommUrl(url : string) : Promise<Metadata>{
        return undefined as any
    }
}

