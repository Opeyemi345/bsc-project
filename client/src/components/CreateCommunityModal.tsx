import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Modal from './Modal';
import Button from './Button';
import Input, { MultilineInput } from './Input';
import { communityApi } from '../services/api';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (community: any) => void;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    rules: [''],
    tags: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData(prev => ({
      ...prev,
      rules: newRules
    }));
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const removeRule = (index: number) => {
    if (formData.rules.length > 1) {
      const newRules = formData.rules.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        rules: newRules
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Community name is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Community description is required');
      return;
    }

    setIsLoading(true);
    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      const rules = formData.rules
        .map(rule => rule.trim())
        .filter(rule => rule);

      const response = await communityApi.createCommunity({
        name: formData.name.trim(),
        description: formData.description.trim(),
        isPrivate: formData.isPrivate,
        rules: rules.length > 0 ? rules : undefined,
        tags: tags.length > 0 ? tags : undefined
      });

      if (response.success) {
        toast.success('Community created successfully!');
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          isPrivate: false,
          rules: [''],
          tags: ''
        });
        
        onClose();
        
        if (onSuccess) {
          onSuccess(response.data);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create community');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        description: '',
        isPrivate: false,
        rules: [''],
        tags: ''
      });
      onClose();
    }
  };

  return (
    <Modal
      title="Create Community"
      openModal={isOpen}
      closeModal={handleClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          
          <Input
            text="Community Name"
            placeholder="Enter a unique community name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            outerStyle="w-full"
            required
          />
          
          <MultilineInput
            text="Description"
            placeholder="Describe what your community is about..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            outerStyle="w-full"
            rows={4}
            required
          />

          <Input
            text="Tags (comma-separated)"
            placeholder="e.g. programming, education, discussion"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            outerStyle="w-full"
          />
        </div>

        {/* Privacy Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
          
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
              className="mt-1 rounded"
            />
            <div>
              <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700">
                Make this community private
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Private communities require approval to join and are not visible in public listings
              </p>
            </div>
          </div>
        </div>

        {/* Community Rules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Community Rules</h3>
            <button
              type="button"
              onClick={addRule}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              <FaPlus className="w-3 h-3" />
              <span>Add Rule</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.rules.map((rule, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                <Input
                  placeholder={`Rule ${index + 1}`}
                  value={rule}
                  onChange={(e) => handleRuleChange(index, e.target.value)}
                  outerStyle="flex-1"
                />
                {formData.rules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500">
            Community rules help maintain a positive environment. Leave blank if no specific rules are needed.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            styles="bg-gray-500 hover:bg-gray-600"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Community'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCommunityModal;
