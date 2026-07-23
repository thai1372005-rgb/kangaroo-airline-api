Hướng dẫn Docker cho dự án Kangaroo_Airline_v2

Tổng quan
- Backend: ASP.NET Core (Kangaroo.API) lắng nghe tại cổng 8088 trong container.
- Frontend: Vite build -> phục vụ bằng nginx trong container (container port 80, mapped host 5173).

Các lệnh thường dùng (từ thư mục gốc dự án)

- Build images và khởi động stack:
```bash
docker compose build
docker compose up -d
```

- Kiểm tra trạng thái containers và ports:
```bash
docker compose ps
```

- Xem logs (theo service):
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

- Dừng và dọn dẹp:
```bash
docker compose down
# xóa cả images nếu muốn
docker compose down --rmi all --volumes
```

Ghi chú cấu hình
- `VITE_API_URL` được truyền vào lúc build cho frontend (đã cấu hình trong `docker-compose.yml` bằng build-arg). Mặc định setup hiện tại dùng `http://backend:8088` cho container networking.

- Port mapping: host `5173` → container `80` (nginx). Nếu muốn dùng port khác, sửa phần `ports` trong `docker-compose.yml`.

- Docker warning: trường `version` trong `docker-compose.yml` đã bị loại bỏ (Docker Compose v2/v3 CLI mới không cần). Nếu bạn vẫn thấy cảnh báo, hãy cập nhật Docker Compose lên phiên bản mới.

Phát triển frontend (dev)
- Hiện Dockerfile frontend build production static. Để phát triển nhanh (hot reload), chạy frontend dev server cục bộ:
```bash
cd frontend
npm install
npm run dev -- --host
```
Hoặc tạo Dockerfile dev riêng nếu cần containerized dev.

Healthchecks
- `docker-compose.yml` đã thêm `healthcheck` cho backend và frontend; Compose sẽ báo trạng thái `healthy` khi container sẵn sàng.

Vấn đề thường gặp
- Nếu backend không khởi động: kiểm tra logs `docker compose logs backend` và đảm bảo migrations/DB đã được thiết lập (nếu cần).
- Nếu frontend hiển thị lỗi CORS/API: kiểm tra `VITE_API_URL` và đảm bảo backend có thể truy cập từ container (sử dụng hostname `backend` trong compose).

Muốn tôi hỗ trợ thêm?
- Thêm health endpoint cụ thể trong `Kangaroo.API` (ví dụ `/health`) và cấu hình readiness/liveness; hoặc
- Tạo phiên bản production nginx config (gzip, cache headers); hoặc
- Commit các thay đổi vào git và push.

