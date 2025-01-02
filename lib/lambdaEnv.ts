export type PutHandler = {
    VIDEO_TABLE_NAME: string;
    VIDEO_TABLE_REGION: string;
    UPLOAD_BUCKET_NAME: string;
    UPLOAD_BUCKET_REGION: string;
};

export type S3EventListener = {
    VIDEO_TABLE_NAME: string;
    VIDEO_TABLE_REGION: string;   
    MEDIA_INFO_CLI_PATH: string; 
};