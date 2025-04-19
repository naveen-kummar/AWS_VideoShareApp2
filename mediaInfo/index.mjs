import child_process from "child_process";
import {promisify} from "util";

export const handler = async (event) => {
    console.log("Entered handler to call 4k video url");
    const res = await promisify(child_process.exec)(
        "./mediainfo --output=JSON http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    );
    console.log(res.stdout);
    return res.stdout;
};