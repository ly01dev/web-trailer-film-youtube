#!/bin/bash

echo "🚀 Quick HTTPS API Test"
echo "========================"

DOMAIN="film8x.xyz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local url=$1
    local description=$2
    
    echo -n "🔍 Testing $description... "
    
    # Test with curl
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ OK (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (HTTP $response)${NC}"
        return 1
    fi
}

# Test HTTP redirect
echo -n "🔄 Testing HTTP redirect... "
redirect_status=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN/api/health" 2>/dev/null)
if [ "$redirect_status" = "301" ] || [ "$redirect_status" = "302" ]; then
    echo -e "${GREEN}✅ OK (Redirect $redirect_status)${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected ($redirect_status)${NC}"
fi

echo ""

# Test HTTPS endpoints
test_endpoint "https://$DOMAIN/" "Frontend (HTTPS)"
test_endpoint "https://$DOMAIN/api/health" "API Health (HTTPS)"
test_endpoint "https://$DOMAIN/api/test" "API Test (HTTPS)"

echo ""

# Test CORS preflight
echo -n "🔄 Testing CORS preflight... "
cors_response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X OPTIONS \
    -H "Origin: https://$DOMAIN" \
    -H "Access-Control-Request-Method: GET" \
    "https://$DOMAIN/api/health" 2>/dev/null)

if [ "$cors_response" = "204" ] || [ "$cors_response" = "200" ]; then
    echo -e "${GREEN}✅ OK (HTTP $cors_response)${NC}"
else
    echo -e "${RED}❌ FAILED (HTTP $cors_response)${NC}"
fi

echo ""
echo "📊 Summary:"
echo "==========="
echo "🌐 Frontend: https://$DOMAIN"
echo "🔗 API Base: https://$DOMAIN/api"
echo "🏥 Health: https://$DOMAIN/api/health"
echo ""
echo "💡 If any tests failed:"
echo "   1. Check Cloudflare Page Rules"
echo "   2. Purge Cloudflare cache"
echo "   3. Restart Docker containers"
echo "   4. Check SSL mode = 'Full (strict)'" 