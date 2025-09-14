#!/bin/bash

echo "🚀 BYOK AI Template Setup"
echo "========================="

# Get project details
read -p "📝 Project name (my-ai-app): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-"my-ai-app"}

read -p "🔥 Firebase project ID: " FIREBASE_PROJECT
read -p "🌐 Firebase auth domain (${FIREBASE_PROJECT}.firebaseapp.com): " FIREBASE_DOMAIN
FIREBASE_DOMAIN=${FIREBASE_DOMAIN:-"${FIREBASE_PROJECT}.firebaseapp.com"}

# Update package.json
echo "📦 Updating package.json..."
sed -i '' "s/byok-ai-template/$PROJECT_NAME/g" package.json

# Update Firebase config if provided
if [ ! -z "$FIREBASE_PROJECT" ]; then
  echo "🔥 Updating Firebase configuration..."
  sed -i '' "s/your-project-id/$FIREBASE_PROJECT/g" src/services/firebaseService.ts
  sed -i '' "s/your-project.firebaseapp.com/$FIREBASE_DOMAIN/g" src/services/firebaseService.ts
  echo "⚠️  Don't forget to update the full Firebase config in src/services/firebaseService.ts"
fi

# Initialize git if not already done
if [ ! -d ".git" ]; then
  echo "📚 Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit: BYOK AI template setup"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. npm install"
echo "2. Update Firebase config in src/services/firebaseService.ts"
echo "3. npm run dev"
echo ""
echo "🎉 Happy coding!"
