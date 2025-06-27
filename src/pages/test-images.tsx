import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestImages = () => {
  const imageUrls = [
    'https://assets.co.dev/e522a9c1-d37e-4a9b-a7ec-bbeec7aa3e7a/1-36cb025.jpg',
    'https://assets.co.dev/e522a9c1-d37e-4a9b-a7ec-bbeec7aa3e7a/2-cd31000.jpg',
    'https://assets.co.dev/e522a9c1-d37e-4a9b-a7ec-bbeec7aa3e7a/3-500ff5b.jpg'
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Test Images</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imageUrls.map((url, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader>
                <CardTitle>Screenshot {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full h-96">
                  <Image
                    src={url}
                    alt={`Screenshot ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold">Direct Image Links:</h2>
          {imageUrls.map((url, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600 mb-2">Image {index + 1}:</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {url}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestImages;