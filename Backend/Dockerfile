# ใช้ Node.js แบบ Alpine สำหรับ image ที่เบา
FROM node:18-alpine

# กำหนด working directory
WORKDIR /app

# Copy package.json และ package-lock.json (ถ้ามี) ลงไปก่อน
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# Copy โค้ดทั้งหมด
COPY . .

# เปิด port 3000 (ใช้สำหรับรันเซิร์ฟเวอร์)
EXPOSE 3000

# รันคำสั่ง start ตามที่ระบุใน package.json
CMD ["npm", "run", "server"]
