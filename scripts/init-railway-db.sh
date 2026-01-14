#!/bin/bash

# CDS HR System - Railway Database Initialization Script
# This script initializes the PostgreSQL database on Railway

echo "🗄️  Initializing CDS HR System Database on Railway..."
echo ""

# Check if DATABASE_URL is provided
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Usage:"
    echo "  export DATABASE_URL='your-railway-database-url'"
    echo "  ./scripts/init-railway-db.sh"
    echo ""
    echo "Or:"
    echo "  DATABASE_URL='your-url' ./scripts/init-railway-db.sh"
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Run schema creation
echo "📝 Creating database schema..."
psql "$DATABASE_URL" -f database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema created successfully"
else
    echo "❌ Schema creation failed"
    exit 1
fi

echo ""

# Run migration for work schedules
echo "📝 Running work schedule migration..."
psql "$DATABASE_URL" -f database/migration_add_work_schedule.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully"
else
    echo "❌ Migration failed"
    exit 1
fi

echo ""
echo "🎉 Database initialization completed!"
echo ""
echo "Next steps:"
echo "1. Verify tables exist: psql \$DATABASE_URL -c '\\dt hr_system.*'"
echo "2. Deploy your application"
echo "3. Test the API endpoints"
