import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { employeeService } from '@/services/employee.service';
import toast from 'react-hot-toast';

interface ImportExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

interface ImportExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface PreviewRow {
    nik: string;
    nama: string;
    departemen: string;
    isValid: boolean;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onDrop = async (acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            setValidationError(null);
            await parseExcel(selectedFile);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        maxFiles: 1
    });

    const parseExcel = async (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

            if (jsonData.length < 2) {
                setValidationError('File is empty or missing headers');
                setPreviewData([]);
                return;
            }

            const headers = (jsonData[0] as string[]).map(h => h?.toLowerCase());
            const nikIndex = headers.indexOf('nik');
            const namaIndex = headers.indexOf('nama');

            if (nikIndex === -1 || namaIndex === -1) {
                setValidationError('Missing required columns: NIK, Nama');
            }

            // Preview first 5 rows (excluding header)
            const preview = jsonData.slice(1, 6).map((row) => {
                const r = row as unknown[];
                return {
                    nik: r[nikIndex] as string,
                    nama: r[namaIndex] as string,
                    departemen: headers.indexOf('departemen') > -1 ? r[headers.indexOf('departemen')] as string : '-',
                    isValid: !!(r[nikIndex] && r[namaIndex])
                };
            });

            setPreviewData(preview);
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (!file || validationError) return;

        setLoading(true);
        try {
            await employeeService.importFromExcel(file);
            toast.success('Employees imported successfully');
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to import employees');
        } finally {
            setLoading(false);
        }
    };

    // Reset state on close
    React.useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setPreviewData([]);
            setValidationError(null);
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Import Employees from Excel"
            size="lg" // Larger modal for preview
        >
            <div className="space-y-4">
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                >
                    <input {...getInputProps()} />
                    <span className="material-icons-outlined text-4xl text-gray-400 mb-2">cloud_upload</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {file ? file.name : 'Drag & drop Excel file here, or click to select'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Supported: .xlsx, .xls
                    </p>
                </div>

                {validationError && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded text-sm flex items-center">
                        <span className="material-icons-outlined text-base mr-2">error</span>
                        {validationError}
                    </div>
                )}

                {previewData.length > 0 && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold uppercase text-gray-500">
                            Preview (First {previewData.length} Rows)
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NIK</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dept</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {previewData.map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{row.nik}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{row.nama}</td>
                                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{row.departemen}</td>
                                            <td className="px-4 py-2 text-sm">
                                                {row.isValid
                                                    ? <span className="text-green-500 material-icons-outlined text-base">check_circle</span>
                                                    : <span className="text-red-500 material-icons-outlined text-base">cancel</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-semibold mb-1">Required Headers:</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                        <li>NIK</li>
                        <li>Nama</li>
                    </ul>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        isLoading={loading}
                        disabled={!file || !!validationError || previewData.some(r => !r.isValid)}
                    >
                        Import
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
