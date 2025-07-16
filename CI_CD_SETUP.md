# CI/CD Setup với GitHub Actions

## 🚀 Tự động deploy lên AWS EC2

### Bước 1: Thiết lập GitHub Secrets

Vào **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Thêm các secrets sau:

#### 1. `AWS_SSH_KEY`

- **Value**: Nội dung file `aws-key.pem` (copy toàn bộ nội dung file)
- **Description**: SSH private key để kết nối EC2

#### 2. `EC2_IP`

- **Value**: `13.229.113.215`
- **Description**: IP public của EC2 instance

#### 3. `EC2_USER`

- **Value**: `ec2-user`
- **Description**: Username để SSH vào EC2

### Bước 2: Lấy nội dung SSH key

```bash
# Copy nội dung file aws-key.pem
cat aws-key.pem
```

### Bước 3: Test CI/CD

1. **Commit và push** code mới:

   ```bash
   git add .
   git commit -m "Add CI/CD workflow"
   git push
   ```

2. **Kiểm tra GitHub Actions**:
   - Vào **Actions** tab trên GitHub
   - Xem workflow "Deploy to AWS EC2" chạy
   - Kiểm tra logs nếu có lỗi

### Bước 4: Quy trình làm việc mới

Từ giờ chỉ cần:

1. **Sửa code** trên máy local
2. **Push lên GitHub**:
   ```bash
   git add .
   git commit -m "Mô tả thay đổi"
   git push
   ```
3. **GitHub Actions tự động deploy** lên AWS! 🎉

### Troubleshooting

#### Lỗi SSH connection:

- Kiểm tra `AWS_SSH_KEY` có đúng format không
- Kiểm tra `EC2_IP` và `EC2_USER` có đúng không
- Kiểm tra Security Group có cho phép SSH (port 22) không

#### Lỗi Docker:

- Kiểm tra Docker đã cài trên EC2 chưa
- Kiểm tra quyền thư mục `web-trailer-film-youtube`

#### Lỗi Git pull:

- Kiểm tra EC2 có quyền pull từ GitHub repository không
- Kiểm tra network connection

### Monitoring

- **GitHub Actions**: Xem logs deployment
- **AWS CloudWatch**: Monitor EC2 performance
- **Website**: https://film8x.xyz

### Rollback

Nếu deployment lỗi, có thể rollback:

```bash
# SSH vào EC2
ssh -i aws-key.pem ec2-user@13.229.113.215

# Checkout commit cũ
cd web-trailer-film-youtube
git log --oneline
git checkout <commit-hash>
docker-compose up -d --build
```
