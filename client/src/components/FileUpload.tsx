import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaUpload, FaTimes, FaImage, FaVideo, FaFile } from 'react-icons/fa';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';

interface UploadedFile {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  mimetype: string;
  optimizedUrl: string;
}

interface FileUploadProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  uploadEndpoint?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf'],
  uploadEndpoint = '/upload/multiple',
  className = ''
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Cloudinary (you'll need to set your cloud name)
  const cld = new Cloudinary({
    cloud: {
      cloudName: (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'demo'
    }
  });

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    if (uploadedFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();

    // Append files with proper field names for the backend
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        formData.append('images', file);
      } else if (file.type.startsWith('video/')) {
        formData.append('videos', file);
      } else {
        formData.append('documents', file);
      }
    });

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please login to upload files');
      }

      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}${uploadEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Upload failed: ${response.statusText}`);
      }

      if (result.success && result.data) {
        // Flatten the response data since backend returns grouped files
        const allFiles = [];
        if (result.data.images) allFiles.push(...result.data.images);
        if (result.data.videos) allFiles.push(...result.data.videos);
        if (result.data.documents) allFiles.push(...result.data.documents);

        const updatedFiles = [...uploadedFiles, ...allFiles];
        setUploadedFiles(updatedFiles);

        if (onFilesUploaded) {
          onFilesUploaded(updatedFiles);
        }

        toast.success(`${allFiles.length} file(s) uploaded successfully!`);
      } else {
        throw new Error(result.message || 'Upload failed - no data received');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleUploadAreaClick = (e: React.MouseEvent) => {
    // Only trigger file input if clicking on the upload area itself, not on buttons
    if (e.target === e.currentTarget && !isUploading) {
      e.preventDefault();
      e.stopPropagation();
      fileInputRef.current?.click();
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);

    if (onFilesUploaded) {
      onFilesUploaded(newFiles);
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <FaImage className="text-blue-500" />;
    if (mimetype.startsWith('video/')) return <FaVideo className="text-green-500" />;
    return <FaFile className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${dragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleUploadAreaClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          <FaUpload className="text-4xl text-gray-400" />

          {isUploading ? (
            <div className="text-blue-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Uploading files...</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drop files here or{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Maximum {maxFiles} files, up to 10MB each
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file.mimetype)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {file.mimetype.startsWith('image/') && (
                  <div className="w-10 h-10 rounded overflow-hidden">
                    <AdvancedImage
                      cldImg={cld.image(file.publicId).resize('w_40,h_40,c_fill')}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
