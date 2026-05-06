# MartOS — Mall & Mart Owner Dashboard

React.js frontend fully wired to your exact backend API spec.

## Quick Start

```bash
unzip mart-dashboard.zip
cd mart-dashboard
npm install
npm start
```

### Set backend URL in .env

```
REACT_APP_API_URL=http://your-backend.com
```

Token auth — store token as `mart_token` in localStorage:
```js
localStorage.setItem("mart_token", "your-drf-token");
```

## API Endpoints Used

| Page | Method | Endpoint |
|------|--------|----------|
| All pages (on load) | GET | `profile/` |
| Dashboard | GET | `store/orders/?start_date=&end_date=` + `store/products/` |
| Products — list | GET | `store/products/` |
| Products — add | POST | `store/products/` |
| Products — edit | PUT | `store/product/<id>/` |
| Products — delete | DELETE | `store/product/<id>/` |
| QR Generator | GET | `store/product/<id>/get-qr/` |
| Orders — list | GET | `store/orders/?start_date=&end_date=` |
| Orders — detail | GET | `store/order/<id>/` |
| Orders — delete | DELETE | `store/order/<id>/` |
| Guard — list | GET | `store/guards/` |
| Guard — add | POST | `store/guards/` |
| Guard — remove | DELETE | `store/guard/<id>/` |

## Key Details

- **QR page** shows your existing products, click one → calls `GET store/product/<id>/get-qr/` → backend returns `{ data: { product_qr: "/media/..." } }` → displayed as image with Download + Print
- **Products** support `photo` file upload (sent as multipart)
- **Expiry** warnings: orange badge within 30 days, red EXPIRED banner past date
- **Guards** — POST creates user with `role=guard` and emails credentials; detail panel shows full `GuardObject` with `user_detail` + `store_detail`
- **Navbar** auto-populates with `store.store_name`, `store.logo`, `user.full_name`, `user.profile_photo` from `GET profile/`
