# Vaiselle E-commerce

## Backend Django + SQLite

### Installation

_Windows_:
```bash
python -m venv .venv
.venv/bin/activate
```

_Mac_:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Install libraries
```bash
pip install -r requirements.txt
```

### Migrations for database
```bash
python manage.py migrate
```

### Load data in database (products)
```bash
python manage.py loaddata shop/fixtures/products.json
```

### Admin : create supersuser
```bash
python manage.py createsuperuser
```

```bash
name : admin
email : ad@min.com
password : admin
```

### Run backend server
```bash
python manage.py runserver
```

Browser URL : http://127.0.0.1:8000/admin/