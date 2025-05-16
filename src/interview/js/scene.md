# 场景题目实现

## 并发图片上传

```js
// 并发图片上传
// 限制最大并发数
// 如果有一个上传成功，则补位上传
const list = [
  "https://1.png",
  "https://2.png",
  "https://3.png",
  "https://4.png",
  "https://5.png",
  "https://6.png",
  "https://7.png",
  "https://8.png",
  "https://9.png",
  "https://10.png"
];

// 模拟上传
function upload(url) {
  console.log(`开始上传 ${url}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`上传 ${url} 成功`);
      resolve(url);
    }, Math.random() * 1000);
  });
}

// 补充间隔，100ms 上传下一张
function uploadAll(urls, limit = 3, interval = 100) {
  const len = urls.length;
  let index = 0;
  const result = new Map();

  return new Promise((resolve, reject) => {
    function __startUpload() {
      if (index === len) {
        resolve(result);
        return;
      }
      const url = urls[index];
      index++;
      upload(url)
        .then(res => {
          result.set(url, res);
          // 成功后 间隔 interval 毫秒上传下一张
          setTimeout(__startUpload, interval);
        })
        .catch(err => {
          reject(err);
        });
    }

    // 初次并发上传 limit 张
    while (index < limit && index < len) {
      __startUpload();
    }
  });
}

uploadAll(list, 3).then(res => {
  console.log(res);
});
```
