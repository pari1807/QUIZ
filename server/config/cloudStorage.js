import ImageKit from 'imagekit';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadToStorage = async (file, folder = '') => {
  try {
    const fileBuffer = fs.readFileSync(file.path);

    const folderPath = folder ? `/quiz/${folder}` : '/quiz';

    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: file.originalname,
      folder: folderPath,
    });

    return {
      url: result.url,
      publicId: result.fileId,
    };
  } catch (error) {
    throw new Error(`ImageKit upload failed: ${error.message}`);
  }
};

export const deleteFromStorage = async (publicId) => {
  try {
    await imagekit.deleteFile(publicId);
  } catch (error) {
    throw new Error(`ImageKit delete failed: ${error.message}`);
  }
};

export default imagekit;
