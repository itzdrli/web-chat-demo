# 开发
```bash
npm install
npm run dev
```

# 部署

构建

```bash
npm install
npm run build
```

得到 build 文件夹，将 `package.json` 和 `package-lock.json` 复制到 `build` 文件夹，然后上传到云端

运行

```bash
npm ci
HOST=0.0.0.0 PORT=4000 node .
```