#!/bin/bash

echo "🔍 Testing HTTPS API endpoints..."

DOMAIN="film8x.xyz"

echo "📊 Testing HTTP endpoints (should redirect to HTTPS):"
echo "----------------------------------------"
curl -I http://$DOMAIN/api/health 2>/dev/null | head -5
echo ""

echo "🔒 Testing HTTPS endpoints:"
echo "----------------------------------------"

# Test frontend
echo "🌐 Frontend (HTTPS):"
curl -I https://$DOMAIN/ 2>/dev/null | head -5
echo ""

# Test API health
echo "🔗 API Health (HTTPS):"
curl -I https://$DOMAIN/api/health 2>/dev/null | head -5
echo ""

# Test API with data
echo "📡 API Test endpoint (HTTPS):"
curl -s https://$DOMAIN/api/test 2>/dev/null | head -3
echo ""

# Test CORS preflight
echo "🔄 CORS Preflight test:"
curl -I -X OPTIONS \
  -H "Origin: https://$DOMAIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://$DOMAIN/api/health 2>/dev/null | head -5
echo ""

echo "✅ Testing completed!"
echo ""
echo "📋 Summary:"
echo "- Frontend: https://$DOMAIN"
echo "- API Base: https://$DOMAIN/api"
echo "- Health Check: https://$DOMAIN/api/health" 