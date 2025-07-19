import React, { useState, useEffect } from 'react';
import { simpleAuthManager } from '@/lib/simple-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthTest() {
  const [users, setUsers] = useState<any[]>([]);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const initAndTest = async () => {
      try {
        await simpleAuthManager.initialize();
        await simpleAuthManager.initializeDefaultUsers();
        
        const allUsers = simpleAuthManager.getAllUsers();
        setUsers(allUsers);
        
        // Test login with the expected credentials
        try {
          const user = await simpleAuthManager.signIn('yavuz@g7spor.org', '444125yA/');
          setTestResult(`✅ Login successful: ${user.email} (${user.role})`);
          await simpleAuthManager.signOut(); // Sign out after test
        } catch (error: any) {
          setTestResult(`❌ Login failed: ${error.message}`);
        }
      } catch (error: any) {
        setTestResult(`❌ Initialization failed: ${error.message}`);
      }
    };

    initAndTest();
  }, []);

  const testCreateAdmin = async () => {
    try {
      const admin = await simpleAuthManager.createDefaultAdmin();
      setTestResult(`✅ Admin created: ${admin.email}`);
      const allUsers = simpleAuthManager.getAllUsers();
      setUsers(allUsers);
    } catch (error: any) {
      setTestResult(`❌ Admin creation failed: ${error.message}`);
    }
  };

  const clearAllData = () => {
    simpleAuthManager.clearAllData();
    setUsers([]);
    setTestResult('🗑️ All data cleared');
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Test Result:</h3>
            <p className="text-sm bg-gray-100 p-2 rounded">{testResult || 'Testing...'}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">All Users ({users.length}):</h3>
            <div className="space-y-2">
              {users.map((user, index) => (
                <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                  <strong>Email:</strong> {user.email}<br />
                  <strong>Password:</strong> {user.password}<br />
                  <strong>Role:</strong> {user.role}<br />
                  <strong>Name:</strong> {user.name} {user.surname}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={testCreateAdmin}>Create Default Admin</Button>
            <Button onClick={clearAllData} variant="destructive">Clear All Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}