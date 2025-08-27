import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Input, { MultilineInput } from './Input';
import Button from './Button';
import FileUpload from './FileUpload';
import { contentApi } from '../services/api';

interface CreatePostProps {
  onPostCreated?: () => void;
  onCancel?: () => void;
}

interface UploadedFile {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  mimetype: string;
  optimizedUrl: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    isPublic: true
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setIsLoading(true);
    try {
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        media: uploadedFiles.map(file => ({
          url: file.url,
          type: file.mimetype.startsWith('image/') ? 'image' :
            file.mimetype.startsWith('video/') ? 'video' : 'file',
          filename: file.originalName,
          size: file.size
        })),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isPublic: formData.isPublic
      };

      const response = await contentApi.createContent(postData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create post');
      }

      toast.success('Post created successfully!');

      // Reset form
      setFormData({
        title: '',
        content: '',
        tags: '',
        isPublic: true
      });
      setUploadedFiles([]);

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Post</h3>

      <form onSubmit={handleSubmit}>
        <Input
          text="Title"
          placeholder="Enter post title..."
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
        />

        <MultilineInput
          text="Content"
          placeholder="What's on your mind?"
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
        />

        <Input
          text="Tags"
          placeholder="Enter tags separated by commas (e.g., technology, education)"
          value={formData.tags}
          onChange={(e) => handleInputChange('tags', e.target.value)}
        />

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Make this post public</span>
          </label>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Media
          </label>
          <FileUpload
            onFilesUploaded={handleFilesUploaded}
            maxFiles={5}
            acceptedTypes={['image/*', 'video/*', 'application/pdf']}
            uploadEndpoint="/upload/post-media"
            className="mb-4"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}

          <Button
            type="submit"
            loading={isLoading}
            styles="px-6"
          >
            Create Post
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
