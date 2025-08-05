#!/usr/bin/env node

/**
 * Test script to verify Spotify OAuth endpoints
 * Run with: node scripts/test-spotify-api.js
 */

const https = require('https');

const BASE_URL = 'https://armyverse.vercel.app';

async function testEndpoint(endpoint, description) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ ${description}:`, res.statusCode);
          if (json.error) {
            console.log(`   Error: ${json.error}`);
          }
        } catch (e) {
          console.log(`❌ ${description}: Invalid JSON response`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve();
    });
  });
}

async function runTests() {
  console.log('🧪 Testing Spotify OAuth Endpoints...\n');
  
  // Test auth URL endpoint
  await testEndpoint('/api/spotify/auth-url', 'Auth URL Endpoint');
  
  // Test callback endpoint (should redirect)
  await testEndpoint('/api/spotify/callback', 'Callback Endpoint');
  
  console.log('\n📋 Test Summary:');
  console.log('- Auth URL endpoint should return a valid Spotify authorization URL');
  console.log('- Callback endpoint should handle redirects properly');
  console.log('- Check Vercel function logs for detailed error messages');
}

runTests().catch(console.error); 