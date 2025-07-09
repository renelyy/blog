# 排序算法

## 归并排序

```js [将第一个作为基准]
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
  let k = 0,
    p1 = l,
    p2 = mid + 1;
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

## 快速排序

::: code-group

```js [将第一个作为基准]
function quickSort(arr) {
  __quickSort(arr, 0, arr.length - 1);
}

function __quickSort(arr, l, r) {
  if (l >= r) return;
  const p = __partition(arr, l, r);
  __quickSort(arr, l, p - 1);
  __quickSort(arr, p + 1, r);
}

function __partition(arr, l, r) {
  // 将 arr[l] 作为基准值
  const p = arr[l];
  let p1 = l + 1,
    p2 = r;
  while (p1 <= p2) {
    // 从左向右找到第一个大于基准值的元素
    while (p1 <= p2 && arr[p1] <= p) p1++;
    // 从右向左找到第一个小于基准值的元素
    while (p1 <= p2 && arr[p2] >= p) p2--;
    if (p1 < p2) {
      // 交换 arr[p1] 和 arr[p2]
      [arr[p1], arr[p2]] = [arr[p2], arr[p1]];
      p1++;
      p2--;
    }
  }
  // 将基准值放到正确的位置
  // 这里为什么是 p2 而不是 p1 呢？
  // 因为 p1 指向的是第一个大于基准值的元素，p2 指向的是第一个小于基准值的元素
  // 而基准值在左边，需要将小的值放到左边，大的值放到右边
  [arr[l], arr[p2]] = [arr[p2], arr[l]];
  return p2;
}
```

```js [随机选择一个作为基准且交换到最右边]
unction quickSort(arr) {
  __quickSort(arr, 0, arr.length - 1);
}

function __quickSort(arr, l, r) {
  if (l >= r) return;
  const poivtIndex = __partition(arr, l, r);
  __quickSort(arr, l, poivtIndex - 1);
  __quickSort(arr, poivtIndex + 1, r);
}

function __partition(arr, l, r) {
  // 随机选择一个基准值
  const poivtIndex =  (l + r) >> 1;
  // 将基准值放到最右边
  [arr[r], arr[poivtIndex]] = [arr[poivtIndex], arr[r]];
  let p1 = l, p2 = r - 1;
  while (p1 <= p2) {
    while (p1 <= p2 && arr[p1] <= arr[r]) p1++;
    while (p1 <= p2 && arr[p2] >= arr[r]) p2--;
    if (p1 < p2) {
      [arr[p1], arr[p2]] = [arr[p2], arr[p1]];
      p1++;
      p2--;
    }
  }
  // 这里为什么是 p1 而不是 p2 呢？
  // 因为 p2 是从右往左遍历的，所以 p2 最后指向的是小于基准值的元素
  // 而 p1 是从左往右遍历的，所以 p1 最后指向的是第一个大于基准值的元素
  // 因此交换 arr[p1] 和 arr[r] 就可以将基准值放到正确的位置
  // 本质上是因为一开始将基准交换到了右边，而右边需要将大的交换过去
  [arr[r], arr[p1]] = [arr[p1], arr[r]];
  return p1;
}
```

```js [直接找基准值位置]
// 这种写法的问题是会多次交换基准值
function quickSort(arr) {
  __quickSort(arr, 0, arr.length - 1);
}

function __quickSort(arr, l, r) {
  if (l >= r) return;
  const poivtIndex = __partition(arr, l, r);
  __quickSort(arr, l, poivtIndex - 1);
  __quickSort(arr, poivtIndex + 1, r);
}

function __partition(arr, l, r) {
  // 随机选择一个基准值
  const poivtIndex = l + Math.floor(Math.random() * (r - l + 1));
  // 将基准值放到最右边
  [arr[r], arr[poivtIndex]] = [arr[poivtIndex], arr[r]];
  let storeIndex = l;
  for (let i = l; i < r; i++) {
    if (arr[i] < arr[r]) {
      [arr[i], arr[storeIndex]] = [arr[storeIndex], arr[i]];
      storeIndex++;
    }
  }
  // 将基准值放到正确的位置
  [arr[storeIndex], arr[r]] = [arr[r], arr[storeIndex]];
  return storeIndex;
}
```

:::
