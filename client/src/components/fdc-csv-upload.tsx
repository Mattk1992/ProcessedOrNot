import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FdcCsvUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await fetch('/api/admin/fdc-branded-foods/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      setUploadResult(result);
      toast({
        title: "Upload Successful",
        description: `${result.successfulInserts} records inserted successfully`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          FoodData Central CSV Upload
        </CardTitle>
        <CardDescription>
          Upload USDA FoodData Central branded food data in CSV format. The CSV should include columns for 
          fdc_id, description, brand_owner, gtin_upc, and other relevant fields.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="csv-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> your FoodData Central CSV file
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">CSV files only (MAX 100MB)</p>
            </div>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {isUploading && (
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              Uploading and processing CSV file... This may take a few moments for large files.
            </AlertDescription>
          </Alert>
        )}

        {uploadResult && (
          <div className="space-y-2">
            <Alert className={uploadResult.successfulInserts > 0 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
              {uploadResult.successfulInserts > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertDescription>
                <strong>Upload Results:</strong>
                <ul className="mt-2 space-y-1">
                  <li>Total rows processed: {uploadResult.totalRows}</li>
                  <li>Successfully inserted: {uploadResult.successfulInserts}</li>
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <li>Errors: {uploadResult.errors.length} {uploadResult.hasMoreErrors && "(showing first 10)"}</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Errors encountered:</strong>
                  <ul className="mt-2 space-y-1">
                    {uploadResult.errors.map((error: string, index: number) => (
                      <li key={index} className="text-sm">• {error}</li>
                    ))}
                  </ul>
                  {uploadResult.hasMoreErrors && (
                    <p className="mt-2 text-sm font-medium">... and more errors</p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Expected CSV Format:</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Your CSV should include the following columns (case-insensitive):
          </p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>fdc_id</strong> (required) - USDA FoodData Central ID</li>
            <li>• <strong>description</strong> (required) - Product name/description</li>
            <li>• <strong>gtin_upc</strong> - Product barcode</li>
            <li>• <strong>brand_owner</strong> - Manufacturer/brand owner</li>
            <li>• <strong>brand_name</strong> - Brand name</li>
            <li>• <strong>branded_food_category</strong> - Food category</li>
            <li>• <strong>ingredients</strong> - Ingredients list</li>
            <li>• <strong>serving_size</strong> - Serving size in grams</li>
            <li>• Additional columns for nutrients and other metadata</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}