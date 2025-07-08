# 排序算法

## 归并排序

```js
function mergeSort(arr) {
  __mergeSort(arr, 0, arr.length - 1);
}

function __mergeSort(arr, l, r) {
  if (l >= r) return;
  const mid = l + ((r - l) >> 1);
  __mergeSort(arr, l, mid);
  __mergeSort(arr, mid + 1, r);
  // 合并两个有序序列
  const temp = [];
  let k = 0, p1 = l, p2 = mid + 1;
  while (p1 <= mid || p2 <= r) {
    if (p2 > r || (p1 <= mid && arr[p1] <= arr[p2])) {
      temp[k++] = arr[p1++];
    } else {
      temp[k++] = arr[p2++];
    }
  }
  // 将 temp 中的元素拷贝到 arr 中
  for (let i = l; i <= r; i++) arr[i] = temp[i - l];
}
```
