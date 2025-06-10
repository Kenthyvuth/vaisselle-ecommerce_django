# Backend Django + SQLite

## Installation
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Load data in database (products)
python manage.py loaddata shop/fixtures/products.json

## Admin
python manage.py createsuperuser
```
name : admin
email : ad@min.com
password : admin
```
URL : http://127.0.0.1:8000/admin/

## Endpoints principaux
- `GET /api/produits/`
- `POST /api/auth/register/`
- etc.
