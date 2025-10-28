#!/bin/bash

# Test the marksheet processing API
# Replace FILE_ID and USER_ID with actual values

FILE_ID="your_file_id_here"
USER_ID="your_user_id_here"

echo "🧪 Testing Marksheet Processing API"
echo "===================================="
echo ""
echo "Endpoint: POST http://localhost:3000/api/process-marksheet"
echo "FileID: $FILE_ID"
echo "UserID: $USER_ID"
echo ""

curl -X POST http://localhost:3000/api/process-marksheet \
  -H "Content-Type: application/json" \
  -d "{\"fileId\": \"$FILE_ID\", \"userId\": \"$USER_ID\"}" \
  | json_pp

echo ""
echo "✅ Test complete!"
echo ""
echo "To use:"
echo "1. Upload a file to Appwrite storage and get the fileId"
echo "2. Get your userId from auth context"
echo "3. Update FILE_ID and USER_ID in this script"
echo "4. Run: bash scripts/test-marksheet-api.sh"
