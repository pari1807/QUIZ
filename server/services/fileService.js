import { uploadToStorage, deleteFromStorage } from '../config/cloudStorage.js';
import fs from 'fs';

class FileService {
  // Upload file to Cloudinary
  async uploadFile(file, folder = 'quiz-platform') {
    try {
      const result = await uploadToStorage(file, folder);
      
      // Delete local file after upload
      fs.unlinkSync(file.path);
      
      return {
        url: result.url,
        publicId: result.publicId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
      };
    } catch (error) {
      // Delete local file if upload fails
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, folder = 'quiz-platform') {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return await Promise.all(uploadPromises);
  }

  // Delete file from Cloudinary
  async deleteFile(publicId) {
    try {
      await deleteFromStorage(publicId);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Delete multiple files
  async deleteMultipleFiles(publicIds) {
    const deletePromises = publicIds.map((publicId) => this.deleteFile(publicId));
    return await Promise.all(deletePromises);
  }

  // Validate file type
  validateFileType(file, allowedTypes) {
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    return allowedTypes.includes(fileExtension);
  }

  // Validate file size
  validateFileSize(file, maxSize) {
    return file.size <= maxSize;
  }
}

export default new FileService();
