declare module 'multer-storage-cloudinary' {
    import { v2 as cloudinary } from 'cloudinary';
    import { StorageEngine } from 'multer';

    export interface Options {
        cloudinary: typeof cloudinary;
        params?: {
            folder?: string;
            format?: string;
            public_id?: (req: any, file: any) => string;
            [key: string]: any;
        };
    }

    export class CloudinaryStorage implements StorageEngine {
        constructor(options: Options);
        _handleFile(req: any, file: any, cb: any): void;
        _removeFile(req: any, file: any, cb: any): void;
    }
}
