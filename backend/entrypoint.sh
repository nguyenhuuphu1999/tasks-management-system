#!/bin/sh

echo "Waiting for PostgreSQL to be ready..."
while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Chạy file SQL trực tiếp
echo "Executing SQL query from file..."
psql -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER -d $DATABASE_NAME -f migrations/1234567890000-insert-user-admin.sql

# Khởi động ứng dụng
echo "Starting application..."
exec npm run start:prod