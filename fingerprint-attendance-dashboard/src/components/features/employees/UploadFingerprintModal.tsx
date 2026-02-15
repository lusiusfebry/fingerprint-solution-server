import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { employeeService } from '@/services/employee.service';
import { Employee } from '@/types/employee.types';
import toast from 'react-hot-toast';

interface UploadFingerprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee?: Employee;
}

export const UploadFingerprintModal: React.FC<UploadFingerprintModalProps> = ({
    isOpen,
    onClose,
    employee
}) => {
    const [fingerIndex, setFingerIndex] = useState('0');
    const [templateData, setTemplateData] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setTemplateData(content);
            toast.success('Template loaded from file');
        };
        reader.onerror = () => {
            toast.error('Failed to read file');
        };
        reader.readAsText(file);
    };

    const handleUpload = async () => {
        if (!employee || !templateData) return;

        setLoading(true);
        try {
            await employeeService.uploadFingerprint(employee.id, {
                finger_index: parseInt(fingerIndex),
                template_data: templateData,
                // device_id: undefined // Optional, can be added if we select a device to push to immediately
            });
            toast.success('Fingerprint template uploaded successfully');
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to upload fingerprint template');
        } finally {
            setLoading(false);
        }
    };

    const fingerOptions = Array.from({ length: 10 }, (_, i) => ({
        value: String(i),
        label: `Finger ${i} (${['Left Pinky', 'Left Ring', 'Left Middle', 'Left Index', 'Left Thumb', 'Right Thumb', 'Right Index', 'Right Middle', 'Right Ring', 'Right Pinky'][i]})`
    }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Upload Fingerprint for ${employee?.nama || 'Employee'}`}
            size="md"
        >
            <div className="space-y-4">
                <Select
                    label="Finger Index"
                    value={fingerIndex}
                    onChange={(e) => setFingerIndex(e.target.value)}
                    options={fingerOptions}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Template Data
                    </label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary file:text-white
                                hover:file:bg-blue-700
                            "
                        />
                    </div>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 h-32 font-mono text-xs"
                        value={templateData}
                        onChange={(e) => setTemplateData(e.target.value)}
                        placeholder="Paste template data or upload file..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Upload a file or paste base64 template data.
                    </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} isLoading={loading} disabled={!templateData}>
                        Upload
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
