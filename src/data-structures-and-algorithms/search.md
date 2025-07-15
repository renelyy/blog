# 查找算法

## 二分查找

::: code-group

```js [基础二分查找]
/**
 * 在不重复的有序数组中查找值为 target 的下标
 */
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1, mid;
  while (left <= right) {
    mid = (left + right) >> 1;
    if (target === arr[mid]) return mid;
    if (target > arr[mid]) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
```

```js [二分查找最小下标]
/**
 * 在有重复元素的有序数组中查找值为 target 的下标，如果有多个，返回最小的下标
 */
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1, mid;
  while (left <= right) {
    mid = (left + right) >> 1;
    if (target === arr[mid]) {
      // 这一步是关键，如果 target 等于 mid，则继续往左查找
      if (mid === 0 || target > arr[mid - 1]) return mid;
      right = mid - 1;
    } else if (target > arr[mid]) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
```

```js [二分 01 模型之第一个 1]
/**
 * 在有序数组中查找第一个大于等于 target 的下标
 * 转化为：在 01 数组中查找第一个 1 的下标（小于 target 的为 0，大于等于 target 的为 1）
 */
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1, mid;
  while (left < right) {
    mid = (left + right) >> 1;
    if (arr[mid] < target) left = mid + 1;
    else right = mid;
  }
  return arr[left] >= target ? left : -1;
}
```

```js [二分 01 模型之最后一个 0]
/**
 * 在有序数组中查找最后一个小于 target 的下标
 * 转化为：在 01 数组中查找最后一个 0 的下标（小于 target 的为 0，大于等于 target 的为 1）
 */
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1, mid;
  while (left < right) {
    mid = (left + right + 1) >> 1;
    if (arr[mid] > target) right = mid - 1;
    else left = mid;
  }
  return arr[right] < target ? right : -1;
}

// 当然也可以进行转化，在 01 数组中查找第一个 1 的下标（小于 target 的为 0，大于等于 target 的为 1）
// 然后返回【第一个 1 的下标 - 1】
```

:::
