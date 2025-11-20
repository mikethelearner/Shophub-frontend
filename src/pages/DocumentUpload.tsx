import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, File, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const DocumentUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, or PDF file",
        });
      }
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Missing document",
        description: "Please upload a document file",
      });
      return;
    }
    
    // Here you would typically handle the upload to a backend service
    toast({
      title: "Document submitted",
      description: "We'll review your document and get back to you soon",
    });
  };

  return (
    <div className="min-h-screen bg-[#F1F0FB] py-8">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-[#3b82f6]">E-Commerce</h1>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4">
        <Card className="border-[#3b82f6]/20">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold text-[#2563eb] mb-6">Upload Document</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-[#3b82f6]/30 rounded-lg p-8 text-center">
                  {!selectedFile ? (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-[#3b82f6] mb-4" />
                      <label htmlFor="document-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-600">
                          Drop your document here or{" "}
                          <span className="text-[#3b82f6]">browse</span>
                        </span>
                        <Input
                          id="document-upload"
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileSelect}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Supported formats: JPG, PNG, PDF
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-[#3b82f6]/10 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <File className="h-6 w-6 text-[#3b82f6]" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedFile(null)}
                        className="hover:bg-[#3b82f6]/20"
                      >
                        <X className="h-4 w-4 text-[#3b82f6]" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any specific instructions or details about your document..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#3b82f6] text-[#3b82f6]"
                  onClick={() => {
                    setSelectedFile(null);
                    setNotes("");
                  }}
                >
                  Clear
                </Button>
                <Button type="submit" className="bg-[#3b82f6] hover:bg-[#2563eb]">
                  Submit Document
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentUpload;
