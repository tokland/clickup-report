import crypto from "crypto";
import path from "path";
import fs from "fs";
import _ from "lodash";
import { promisify } from "util";
import sanitize from "sanitize-filename";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const deleteFile = promisify(fs.unlink);
const listFiles = promisify(fs.readdir);
const mkDir = promisify(fs.mkdir);

export class FilesystemStore {
    constructor(private options: { cacheDir: string }) {}

    async getItem(key: string): Promise<object | undefined> {
        const filePath = this.getFilePath(key);
        const contents = await readFile(filePath, "utf-8").catch(_err => null);
        // console.debug("[FilesystemStore:get]", { key, filePath, contents: contents?.length });
        return contents ? JSON.parse(contents) : undefined;
    }

    async setItem(key: string, value: unknown): Promise<void> {
        const filePath = this.getFilePath(key);
        // console.debug("[FilesystemStore:set]", this.options.cacheDir, { key });
        await mkDir(this.options.cacheDir, { recursive: true });
        const data = JSON.stringify(value, null, 2);
        await writeFile(filePath, data);
    }

    async removeItem(key: string): Promise<void> {
        const filePath = this.getFilePath(key);
        await deleteFile(filePath).catch(_err => {});
    }

    async clear(): Promise<void> {
        const filenames = await listFiles(this.options.cacheDir);
        for (const filename of filenames) {
            await deleteFile(filename);
        }
    }

    async length(): Promise<number> {
        const filenames = await listFiles(this.options.cacheDir);
        return filenames.length;
    }

    private getFilePath(key: string): string {
        const filename = sanitize(key);
        const hash = crypto.createHash("md5").update(key).digest("hex");
        return path.join(this.options.cacheDir, filename + "-" + hash + ".json");
    }
}
