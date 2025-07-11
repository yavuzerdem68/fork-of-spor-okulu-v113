import React from "react";
import Head from "next/head";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Users, Search } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";

export default function MatchingAnalysis() {
  const screenshots = [
    {
      url: "https://assets.co.dev/c2a6b84b-12f8-489e-a0f1-11644e41c5cc/2-0420b4a.jpg",
      title: "Eşleştirme Problemi 1",
      description: "İlk ekran görüntüsü - eşleştirme sorunları"
    },
    {
      url: "https://assets.co.dev/c2a6b84b-12f8-489e-a0f1-11644e41c5cc/3-5bc2f24.jpg", 
      title: "Eşleştirme Problemi 2",
      description: "İkinci ekran görüntüsü - anlamsız eşleştirmeler"
    },
    {
      url: "https://assets.co.dev/c2a6b84b-12f8-489e-a0f1-11644e41c5cc/4-7db443e.jpg",
      title: "Eşleştirme Problemi 3", 
      description: "Üçüncü ekran görüntüsü - yanlış kardeş eşleştirmeleri"
    },
    {
      url: "https://assets.co.dev/c2a6b84b-12f8-489e-a0f1-11644e41c5cc/ekran-goruntusu-2025-07-11-231643-78c5952.jpg",
      title: "Eşleştirme Problemi 4",
      description: "Dördüncü ekran görüntüsü - eski sporcu ödemeleri"
    }
  ];

  return (
    <>
      <Head>
        <title>Eşleştirme Analizi - SportsCRM</title>
        <meta name="description" content="Ödeme eşleştirme problemlerinin analizi" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Link href="/payments" className="text-muted-foreground hover:text-primary">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h1 className="text-3xl font-bold">Eşleştirme Analizi</h1>
              </div>
              <p className="text-muted-foreground">Ödeme eşleştirme problemlerinin detaylı incelenmesi</p>
            </div>
          </div>

          {/* Problem Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Tespit Edilen Problemler</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Ana Problem:</h3>
                  <p className="text-orange-700">
                    Banka extre dosyasındaki ödemeler, eski/ayrılmış sporcularla eşleştiriliyor. 
                    Bu sporcular artık aktif olmadığı için ödemeler yok sayılması gerekiyor.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Çözüm Stratejisi:</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Sadece aktif sporcularla eşleştirme yapılacak</li>
                    <li>• Eski sporcu kayıtları eşleştirmeden hariç tutulacak</li>
                    <li>• Eşleşmeyen ödemeler için uyarı sistemi eklenecek</li>
                    <li>• Manuel onay mekanizması güçlendirilecek</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Screenshots Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {screenshots.map((screenshot, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{screenshot.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{screenshot.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <img 
                      src={screenshot.url} 
                      alt={screenshot.title}
                      className="w-full h-auto rounded-lg border shadow-sm"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700">
                        <strong>Problem:</strong> Bu ekran görüntüsünde görülen eşleştirme hataları 
                        düzeltilecek ve sadece aktif sporcularla eşleştirme yapılacak.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Plan */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-green-600" />
                <span>Düzeltme Planı</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">1. Aktif Sporcu Filtresi</h3>
                    <p className="text-green-700 text-sm">
                      Eşleştirme algoritması sadece "Aktif" durumundaki sporcularla çalışacak
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">2. Gelişmiş Filtreleme</h3>
                    <p className="text-green-700 text-sm">
                      Eski sporcu kayıtları otomatik olarak eşleştirmeden hariç tutulacak
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">3. Uyarı Sistemi</h3>
                    <p className="text-green-700 text-sm">
                      Eşleşmeyen ödemeler için detaylı uyarı ve manuel kontrol seçenekleri
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">4. Manuel Onay</h3>
                    <p className="text-green-700 text-sm">
                      Tüm eşleştirmeler manuel onay gerektirip, yanlış eşleştirmeleri önleyecek
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Payments */}
          <div className="mt-8 text-center">
            <Link href="/payments">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ödemeler Sayfasına Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}