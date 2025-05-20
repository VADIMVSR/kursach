import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const access = promisify(fs.access);
const unlink = promisify(fs.unlink);

export const deleteFiles = async (urls) => {
  const deleteOperations = urls.map(async (relativePath) => {
    try {
      const filename = relativePath.replace('/uploads/', '');
      const fullPath = path.join(process.cwd(), 'uploads', filename);

      await access(fullPath, fs.constants.F_OK);
      await unlink(fullPath);
      console.log(`Файл удален: ${fullPath}`);
      return { success: true, path: fullPath };
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`Файл не существует: ${fullPath}`);
        return { success: false, path: fullPath, error: 'File not found' };
      }
      console.error(`Ошибка удаления ${fullPath}:`, error);
      return { success: false, path: fullPath, error: error.message };
    }
  });

  return Promise.all(deleteOperations);
};