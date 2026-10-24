#!usr/bin/env bash
set -o errexit

cd backend

pip install -r requirements.txt

cd config
python manage.py collectstatic --no-input
python manage.py migrate