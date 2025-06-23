# Vaiselle E-commerce

---
**Authors:** SARFATI Jason, TAN Kenthyvuth

**Date:** 2025-05-26

---


Projet de création d'un site web d'achats de vaisselles (assiettes, verres, couverts, ...).


## Project tree:
```
vaisselle-ecommerce/
|
|__backend/
|    |__.venv/
|    |__backend/
|    |__shop/
|    |
|    |__.env
|    |__db.sqlite3
|    |__manage.py
|    |__requirements.txt
| 
|__frontend/
|    |__assets/
|    |    |__scripts.js
|    |
|    |__...
|    |__index.html
|    |__...
|
|__.gitignore
|__README.md
```


## Backend Django + SQLite

### 1. Go inside _backend_ folder

### 2. Create environment + Activation

_Windows_:
```bash
python -m venv .venv
.venv/Scripts/activate
```

_Mac_:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install libraries
```bash
pip install -r requirements.txt
```

### 4. Create .env file

Will be used to store email credentials (Gmail)

### 5. Migrations for database
```bash
python manage.py migrate
```

### 6. Load data in database (all product items)
```bash
python manage.py loaddata shop/fixtures/products.json
```

### 7. Admin : create superuser
```bash
python manage.py createsuperuser
```

```bash
name : admin
email : ad@min.com
password : admin
```

### 8. Run backend server
```bash
python manage.py runserver
```

Browser URL : http://127.0.0.1:8000/admin/