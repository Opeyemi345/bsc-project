import { Request, Response, NextFunction } from 'express';
import { upload, deleteFromCloudinary, getOptimizedUrl } from '../config/cloudinary';
import { AppError } from '../utils/errorHandler';
import { CustomRequest } from '../types/User';

// Single file upload
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadSingle = upload.single(fieldName);
    
    uploadSingle(req, res, (error: any) => {
      if (error) {
        return next(new AppError(error.message, 400));
      }
      
      if (!req.file) {
        return next(new AppError('No file uploaded', 400));
      }

      // Return file information
      res.json({
        success: true,
        data: {
          url: req.file.path,
          publicId: (req.file as any).filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          optimizedUrl: getOptimizedUrl((req.file as any).filename)
        },
        message: 'File uploaded successfully'
      });
    });
  };
};

// Multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMultiple = upload.array(fieldName, maxCount);
    
    uploadMultiple(req, res, (error: any) => {
      if (error) {
        return next(new AppError(error.message, 400));
      }
      
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return next(new AppError('No files uploaded', 400));
      }

      const files = req.files as Express.Multer.File[];
      const fileData = files.map(file => ({
        url: file.path,
        publicId: (file as any).filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        optimizedUrl: getOptimizedUrl((file as any).filename)
      }));

      res.json({
        success: true,
        data: fileData,
        message: `${files.length} file(s) uploaded successfully`
      });
    });
  };
};

// Mixed files upload (different field names)
export const uploadFields = (fields: { name: string; maxCount: number }[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadFields = upload.fields(fields);
    
    uploadFields(req, res, (error: any) => {
      if (error) {
        return next(new AppError(error.message, 400));
      }
      
      if (!req.files) {
        return next(new AppError('No files uploaded', 400));
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const fileData: { [key: string]: any[] } = {};

      Object.keys(files).forEach(fieldName => {
        fileData[fieldName] = files[fieldName].map(file => ({
          url: file.path,
          publicId: (file as any).filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          optimizedUrl: getOptimizedUrl((file as any).filename)
        }));
      });

      res.json({
        success: true,
        data: fileData,
        message: 'Files uploaded successfully'
      });
    });
  };
};

// Delete file from Cloudinary
export const deleteFile = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return next(new AppError('Public ID is required', 400));
    }

    await deleteFromCloudinary(publicId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get optimized URL for existing file
export const getOptimizedFileUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.params;
    const { width, height, quality, format } = req.query;
    
    if (!publicId) {
      return next(new AppError('Public ID is required', 400));
    }

    const options: any = {};
    if (width) options.width = parseInt(width as string);
    if (height) options.height = parseInt(height as string);
    if (quality) options.quality = quality;
    if (format) options.format = format;

    const optimizedUrl = getOptimizedUrl(publicId, options);

    res.json({
      success: true,
      data: {
        originalPublicId: publicId,
        optimizedUrl,
        options
      }
    });
  } catch (error) {
    next(error);
  }
};
