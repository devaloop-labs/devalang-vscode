import * as fs from 'fs/promises';
import * as path from 'path';

export class PathChecker {
    public async checkPaths(
        parseResult: any,
        filePath: string,
        plugin: any
    ): Promise<{ line: number, message: string }[]> {
        const errors: { line: number, message: string }[] = [];

        const includes = parseResult.includes ?? [];

        for (const include of includes) {
            const relativePath = include.path;
            const line = include.line ?? 0;

            const absolutePath = path.resolve(path.dirname(filePath), relativePath);

            try {
                await fs.access(absolutePath);
            } catch {
                errors.push({
                    line,
                    message: `Included file not found: ${relativePath}`
                });
            }
        }

        return errors;
    }
}
