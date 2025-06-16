import { Request, Response, NextFunction } from 'express';
import fileUpload from "express-fileupload";
import cloudinary from "../../config/cloudinary";


export const upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
      if (req.files && req.files.image) {
         const file = req.files.image as fileUpload.UploadedFile;

         const result = await cloudinary.uploader.upload(file.tempFilePath, {
            public_id: `${Date.now()}`,
            resource_type: 'auto',
            folder: 'images',
         });

         if (result?.secure_url) {
            res.status(201).json({
               success: true,
               message: 'Image uploaded.',
               data: {
                  public_id: result.public_id,
                  url: result.secure_url,
               },
            });
            return;
         } else {
            res.status(500).json({
               success: false,
               message: 'Image not uploaded.',
            });
            return
         }
      } else {
         res.status(400).json({
            success: false,
            message: 'No image file found in the request.',
         });
         return
      }
   } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error during image upload.',
      });
      return
   }
};


export const updateFile = async (req: Request, res: Response): Promise<void> => {
  const imageId = req.body.imageId;

  try {
    // Step 1: Delete old image from Cloudinary
    const deleteResult = await cloudinary.uploader.destroy(
      imageId,
      { resource_type: "image", invalidate: true }
    );

    if (deleteResult.result === "ok") {
      // Step 2: Upload new image if provided
      if (req.files && req.files.image) {
        const file = req.files.image as fileUpload.UploadedFile;

        const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
          public_id: `${Date.now()}`,
          resource_type: "auto",
          folder: "images"
        });

        if (uploadResult && uploadResult.secure_url) {
          const imageData = {
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url
          };

          res.status(201).json({ success: true, message: 'Image updated.', data: imageData });
        } else {
          res.status(500).json({ success: false, message: 'Image not uploaded.', data: '' });
        }
      } else {
        res.status(400).json({ success: false, message: 'No new image file provided.', data: '' });
      }
    } else if (deleteResult.result === "not found") {
      res.status(404).json({ success: false, message: 'File to update not found on Cloudinary.', data: '' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete old file.', error: deleteResult.result });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error occurred while updating file.', error });
  }
};


export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  const imageId = req.body.imageId;

  try {
    const result = await cloudinary.uploader.destroy(
      imageId,
      { resource_type: "image", invalidate: true }
    );

    if (result.result === "ok") {
      res.status(200).json({ success: true, message: 'File deleted.', data: '' });
    } else if (result.result === "not found") {
      res.status(404).json({ success: false, message: 'File not found on Cloudinary.', data: '' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete the file.', error: result.result });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting file.', error });
  }
};