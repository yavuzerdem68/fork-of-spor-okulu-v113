import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Upload, Github, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  saveAthleteData, 
  savePaymentData, 
  saveTrainingData, 
  saveFormData 
} from '@/lib/github-storage';

export default function GitHubTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [testData, setTestData] = useState({
    athleteName: 'Test Sporcu',
    athleteEmail: 'test@example.com',
    sport: 'Basketbol',
    notes: 'GitHub entegrasyon testi'
  });

  const handleTestSave = async (dataType: string) => {
    setLoading(true);
    
    try {
      let result;
      const timestamp = new Date().toISOString();
      
      const sampleData = {
        ...testData,
        timestamp,
        testType: dataType,
        source: 'GitHub Test Page'
      };

      switch (dataType) {
        case 'athlete':
          result = await saveAthleteData(sampleData);
          break;
        case 'payment':
          result = await savePaymentData({
            ...sampleData,
            amount: 500,
            paymentType: 'Aylık Aidat'
          });
          break;
        case 'training':
          result = await saveTrainingData({
            ...sampleData,
            trainingDate: timestamp,
            duration: 90
          });
          break;
        default:
          result = await saveFormData(dataType, sampleData);
      }

      setResults(prev => [...prev, {
        type: dataType,
        timestamp,
        success: result.success,
        message: result.message,
        githubUrl: result.githubUrl,
        filePath: result.filePath
      }]);

      if (result.success) {
        toast.success(`${dataType} verisi başarıyla GitHub'a kaydedildi!`);
      } else {
        toast.error(`${dataType} verisi kaydedilemedi: ${result.message}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test sırasında bir hata oluştu');
      
      setResults(prev => [...prev, {
        type: dataType,
        timestamp: new Date().toISOString(),
        success: false,
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
        error: true
      }]);
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Github className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">GitHub Entegrasyon Testi</h1>
          <p className="text-muted-foreground">
            Form verilerinin GitHub repository'ye kaydedilmesini test edin
          </p>
        </div>
      </div>

      {/* Test Data Input */}
      <Card>
        <CardHeader>
          <CardTitle>Test Verisi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="athleteName">Sporcu Adı</Label>
              <Input
                id="athleteName"
                value={testData.athleteName}
                onChange={(e) => setTestData(prev => ({ ...prev, athleteName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="athleteEmail">Email</Label>
              <Input
                id="athleteEmail"
                type="email"
                value={testData.athleteEmail}
                onChange={(e) => setTestData(prev => ({ ...prev, athleteEmail: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sport">Spor Branşı</Label>
              <Input
                id="sport"
                value={testData.sport}
                onChange={(e) => setTestData(prev => ({ ...prev, sport: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Input
                id="notes"
                value={testData.notes}
                onChange={(e) => setTestData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>GitHub Kaydetme Testleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => handleTestSave('athlete')}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Sporcu Verisi</span>
            </Button>
            
            <Button
              onClick={() => handleTestSave('payment')}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Ödeme Verisi</span>
            </Button>
            
            <Button
              onClick={() => handleTestSave('training')}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Antrenman Verisi</span>
            </Button>
            
            <Button
              onClick={() => handleTestSave('general')}
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Genel Form</span>
            </Button>
          </div>
          
          {results.length > 0 && (
            <div className="mt-4">
              <Button
                onClick={clearResults}
                variant="ghost"
                size="sm"
              >
                Sonuçları Temizle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Sonuçları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, index) => (
              <Alert key={index} variant={result.success ? "default" : "destructive"}>
                <div className="flex items-start space-x-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(result.timestamp).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    
                    <AlertDescription>
                      {result.message}
                    </AlertDescription>
                    
                    {result.success && result.githubUrl && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">GitHub Dosyası:</p>
                        <a
                          href={result.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {result.filePath}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Nasıl Çalışır?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>1. GitHub Token:</strong> GitHub Personal Access Token'ınızın doğru ayarlandığından emin olun.</p>
            <p><strong>2. Repository Bilgileri:</strong> GITHUB_OWNER ve GITHUB_REPO environment variable'ları doğru olmalı.</p>
            <p><strong>3. Veri Kaydetme:</strong> Her test butonu farklı veri tipini GitHub'a JSON dosyası olarak kaydeder.</p>
            <p><strong>4. Dosya Konumu:</strong> Dosyalar <code>data/[veri-tipi]/</code> klasörüne kaydedilir.</p>
            <p><strong>5. Başarılı Kayıt:</strong> GitHub'da dosya linki görüntülenir ve tıklanabilir.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}