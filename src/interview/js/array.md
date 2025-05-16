# 数组原型方法

## 实现 forEach

```javascript
Array.prototype.forEach = function (callback, thisArg) {
  if (this == null) {
    throw new TypeError("Array.prototype.forEach called on null or undefined");
  }
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  let T, k;
  let O = Object(this);
  let len = O.length >>> 0;

  if (arguments.length > 1) {
    T = thisArg;
  }

  k = 0;

  while (k < len) {
    let kValue;
    if (k in O) {
      kValue = O[k];
      callback.call(T, kValue, k, O);
    }
    k++;
  }
};
```

## 实现 map

```javascript
Array.prototype.map = function (callback, thisArg) {
  if (this == null) {
    throw new TypeError("Array.prototype.map called on null or undefined");
  }
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  var T,
    result = [];
  var O = Object(this);
  var len = O.length >>> 0;

  if (arguments.length > 1) {
    T = thisArg;
  }

  for (var i = 0; i < len; i++) {
    if (i in O) {
      var element = O[i];
      result[i] = callback.call(T, element, i, O);
    }
  }

  return result;
};
```

## 实现 filter

```javascript
Array.prototype.filter = function (callback, thisArg) {
  if (this == null) {
    throw new TypeError("Array.prototype.filter called on null or undefined");
  }
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  let T,
    result = [];
  let O = Object(this);
  let len = O.length >>> 0;

  if (arguments.length > 1) {
    T = thisArg;
  }

  for (let i = 0; i < len; i++) {
    if (i in O) {
      let element = O[i];
      if (callback.call(T, element, i, O)) {
        result.push(element);
      }
    }
  }

  return result;
};
```

## 实现 some

```javascript
Array.prototype.some = function (callback, thisArg) {
  if (this == null) {
    throw new TypeError("Array.prototype.some called on null or undefined");
  }
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  let T;
  let O = Object(this);
  let len = O.length >>> 0;

  if (arguments.length > 1) {
    T = thisArg;
  }

  for (let i = 0; i < len; i++) {
    if (i in O && callback.call(T, O[i], i, O)) {
      return true;
    }
  }

  return false;
};
```

## 实现 reduce

```javascript
Array.prototype.reduce = function (callback, initialValue) {
  if (this == null) {
    throw new TypeError("Array.prototype.reduce called on null or undefined");
  }
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }
  let O = Object(this);
  let len = O.length >>> 0;
  let k = 0;
  let accumulator;
  if (arguments.length >= 2) {
    accumulator = initialValue;
  } else {
    while (k < len && !(k in O)) {
      k++;
    }
    if (k >= len) {
      throw new TypeError("Reduce of empty array with no initial value");
    }
    accumulator = O[k++];
  }
  while (k < len) {
    if (k in O) {
      accumulator = callback.call(undefined, accumulator, O[k], k, O);
    }
    k++;
  }
  return accumulator;
};
```

## 实现 every

```javascript
Array.prototype.every = function (callback, thisArg) {
  if (this == null) {
    throw new TypeError("Array.prototype.every called on null or undefined");
  }
  if (typeof callback !== "function") {
    throw new TypeError(callback + " is not a function");
  }

  let T;
  let O = Object(this);
  let len = O.length >>> 0;

  if (arguments.length > 1) {
    T = thisArg;
  }

  for (let i = 0; i < len; i++) {
    if (i in O && !callback.call(T, O[i], i, O)) {
      return false;
    }
  }

  return true;
};
```

## 实现 find

```javascript
Array.prototype.find = function (predicate, thisArg) {
  if (this == null) {
    throw new TypeError("Array.prototype.find called on null or undefined");
  }
  if (typeof predicate !== "function") {
    throw new TypeError("predicate must be a function");
  }

  let list = Object(this);
  let length = list.length >>> 0;
  let thisArg = arguments.length >= 2 ? arguments[1] : undefined;

  for (let i = 0; i < length; i++) {
    let value = list[i];
    if (predicate.call(thisArg, value, i, list)) {
      return value;
    }
  }
  return undefined;
};
```

## 实现 indexOf

```javascript
Array.prototype.indexOf = function (searchElement, fromIndex) {
  if (this == null) {
    throw new TypeError("Array.prototype.indexOf called on null or undefined");
  }

  let O = Object(this);
  let len = O.length >>> 0;

  if (len === 0) {
    return -1;
  }

  let n = 0;
  if (arguments.length > 1) {
    n = Number(fromIndex);
    if (n != n) {
      // shortcut for verifying if it's NaN
      n = 0;
    } else if (n !== 0 && n != Infinity && n != -Infinity) {
      n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
  }

  if (n >= len) {
    return -1;
  }

  let k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);

  for (; k < len; k++) {
    if (k in O && O[k] === searchElement) {
      return k;
    }
  }
  return -1;
};
```

## 实现 push

```javascript
Array.prototype.push = function () {
  let O = Object(this);
  let len = parseInt(O.length);
  let argCount = arguments.length;
  if (len + argCount > 2 ** 53 - 1) {
    throw new TypeError(
      "The number of array elements exceeds the maximum array size"
    );
  }
  for (let i = 0; i < argCount; i++) {
    O[len + i] = arguments[i];
  }
  O.length = len + argCount;
  return parseInt(O.length);
};
```

<a name="sfQHp"></a>

## 实现 pop

```javascript
Array.prototype.pop = function () {
  let O = Object(this);
  let len = parseInt(O.length);
  if (len === 0) {
    O.length = 0;
    return undefined;
  }
  len--;
  let value = O[len];
  delete O[len];
  O.length = len;
  return value;
};
```

## 实现 splice

```javascript
// 分为 5 步
//    1. 拷贝删除的元素（因为需要返回）
//    2. 移动删除元素后面的元素
//       2.1 删除的元素数量 = 插入的元素数量：无需移动，相当于替换
//       2.2 删除的元素数量 < 插入的元素数量：向右移动
//       2.3 删除的元素数量 > 插入的元素数量：向左移动
//    3. 插入新元素
//    4. 更新 length 属性
//    5. 返回删除元素组成的数组
Array.prototype.splice = function (startIndex, deleteCount, ...addedItems) {
  let O = Object(this);
  let len = O.length >>> 0;

  // 非法下标
  if (startIndex + len < 0 || startIndex > len) return [];
  // 处理负数下标情况
  startIndex = (startIndex + len) % len;

  deleteCount = Math.min(deleteCount, len);
  let deletedArr = new Array(deleteCount);

  // 1. 拷贝删除的元素
  copyDeletedElements(O, startIndex, deleteCount, deletedArr);

  // 2. 移动删除元素后面的元素
  moveElements(O, startIndex, deleteCount, addedItems);

  // 3. 插入新元素
  insertElements(O, startIndex, addedItems);

  // 4. 更新 length 属性
  O.length = len - deleteCount + addedItems.length;

  // 5. 返回
  return deletedArr;
};

function copyDeletedElements(array, startIndex, deleteCount, deletedArr) {
  for (let k = 0; k < deleteCount; k++) {
    deletedArr[k] = array[startIndex + k];
  }
}

function moveElements(array, startIndex, deleteCount, addedItems) {
  if (deleteCount === addedItems.length) return;
  let delta = addedItems.length - deleteCount;
  let len = array.length + delta;
  if (delta > 0) {
    // 新增的多，向右移动 delta 位
    for (let k = len - 1; k >= startIndex + delta; k--) {
      array[k] = array[k - delta];
    }
  } else {
    // 新增的少，向左移动 delta 位
    // 注意：这里 delta < 0，下面两种写法均可
    // delta = Math.abs(delta)
    // for (let k = startIndex + delta - 1; k < len; k++) {
    // array[k] = array[k + delta];
    for (let k = startIndex - delta - 1; k < len; k++) {
      array[k] = array[k - delta];
    }
  }
}

function insertElements(array, startIndex, addedItems) {
  for (let i = 0; i < addedItems.length; i++) {
    array[startIndex + i] = addedItems[i];
  }
}
```

## 实现 sort

```javascript
// 常见的排序算法
// 冒泡排序的大致思路是：
// 1. 遍历数组，比较相邻两个元素的大小
// 2. 如果前一个元素大于后一个元素，则交换它们的位置，直到最大的元素到数组最后
// 3. 然后，继续比较相邻的两个元素，直到数组中的所有元素都排序完成
function bubbleSort(array, start, end) {
  for (let i = start; i < end; i++) {
    let hasChanged = false;
    for (let j = start; j < end - i - 1; j++) {
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        hasChanged = true;
        changedIndex = j;
      }
    }
    if (!hasChanged) break;
  }
}

// 选择排序
// 选择排序的大致思路是：
// 1. 遍历数组，找到最小的元素
// 2. 将最小的元素与数组的第一个位置交换
// 3. 然后，再从剩下的元素中找到最小的元素，与数组的第二个位置交换，以此类推
function selectSort(array, start, end) {
  for (let i = start; i < end; i++) {
    let minIndex = i;
    for (let j = i + 1; j < end; j++) {
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
    }
  }
}

// 插入排序
// 插入排序的大致思路是：
// 1. 从第二个元素开始，将当前元素插入到前一个元素的正确位置（找正确位置的过程中，依次往后交换）
// 2. 然后，继续从第三个元素开始，将当前元素插入到前一个元素的正确位置
// 3. 以此类推，直到所有元素都排序完成
function insertSort(array, start, end) {
  for (let i = start + 1; i < end; i++) {
    let current = array[i];
    let j = i - 1;
    while (j >= start && current < array[j]) {
      // 交换
      array[j + 1] = array[j];
      j--;
    }
    // 找到了正确位置，将当前元素插入到正确位置
    array[j + 1] = current;
  }
}

// 希尔排序
// 希尔排序（Shell Sort）是一种改进的插入排序算法，也称为缩小增量排序
// 此处暂不深究

// 快速排序
// 快速排序的大致思路是：
// 1. 选择一个基准值（一般三元取中）
// 2. 将所有小于基准值的元素放在基准值左边，将所有大于基准值的元素放在基准值右边
// 3. 然后，对左右两个子数组重复以上步骤，直到所有元素都排序完成
function quickSort(array, start, end) {
  if (start >= end) return;
  let pos = (start + end) >>> 1;
  let pivot = array[pos];
  let left = start;
  let right = end;
  while (left <= right) {
    while (left <= right && array[left] < pivot) left++;
    while (left <= right && array[right] > pivot) right--;
    if (left <= right) {
      [array[left], array[right]] = [array[right], array[left]];
      left++;
      right--;
    }
  }
  quickSort(array, start, left - 1);
  quickSort(array, left, end);
}

// 归并排序
// 归并排序的大致思路是：
// 1. 将数组分为两个子数组
// 2. 递归地对两个子数组进行排序
// 3. 将两个排序好的子数组合并成一个排序数组
function mergeSort(array, left, right) {
  if (left >= right) return;
  let mid = (left + right) >>> 1;
  mergeSort(array, left, mid);
  mergeSort(array, mid + 1, right);
  // 合并的过程
  let p1 = left,
    p2 = mid + 1,
    k = 0;
  let temp = [];
  while (p1 <= mid || p2 <= right) {
    if (p2 > right || (p1 <= mid && array[p1] <= array[p2])) {
      temp[k++] = array[p1++];
    } else {
      temp[k++] = array[p2++];
    }
  }

  k = 0;
  while (k < temp.length) array[left + k] = temp[k++];
}

// 堆排序
// 此处暂不深究

// 计数排序
// 此处暂不深究

// 桶排序
// 此处暂不深究

// V8 sort
// V8 中的 sort 方法是使用快速排序实现的
// 大致思路
// 1. 当 n <= 10 时，采用 插入排序
// 2. 当 n > 10 时，采用 三路快速排序
//    2.1 10 < n <= 1000, 采用中位数作为哨兵元素
//    2.2 n > 1000, 每隔 200 ~ 215 个元素挑出一个元素，放到一个新数组，然后对它排序，找到中间位置的数，以此作为中位数
Array.prototype.v8sort = function (compareFn) {
  let O = Object(this);
  let len = O >>> 0;

  return innerV8ArraySort(O, len, compareFn);
};

const innerV8ArraySort = (array, length, compareFn) => {
  // 未传入比较函数
  if (Object.prototype.toString.call(compareFn) !== "[object Function]") {
    compareFn = function (x, y) {
      x = x.toString();
      y = y.toString();
      if (x === y) return 0;
      else return x < y ? -1 : 1;
    };
  }

  // 插入排序
  // 左闭右开 [)
  const insertSort = (arr, from = 0, to) => {
    to = to || arr.length;
    for (let i = from; i < to; i++) {
      let current = arr[i],
        j;
      // 前面的位置比当前值大，把前一个位置覆盖到当前位置
      for (j = i; j > from && compareFn(arr[j - 1], current) > 0; j--) {
        arr[j] = arr[j - 1];
      }
      // 找到合适的位置了，插入
      arr[j] = current;
    }
  };

  // 获取哨兵索引：三元取中
  const getThirdIndex = (a, from, to) => {
    let tmpArr = [];
    // 递增量，200 ~ 215 之间，因为任何正数和 15 做与操作，不会超过 15，当然是大于 0 的
    let increment = 200 + ((to - from) & 15);
    for (let i = from, k = 0; i < to; i += increment) {
      tmpArr[k++] = [i, a[i]];
    }
    // 把临时数组排序，取中间的值，确保哨兵的值接近平均位置
    tmpArr.sort((a, b) => compareFn(a[1], b[1]));
    return tmpArr[tmpArr.length >> 1][0];
  };

  const _sort = (a, b, c) => {
    let arr = [];
    arr.push(a, b, c);
    insertSort(arr, 0, 3);
    return arr;
  };

  // 左闭右开 [)
  const quickSort = (a, from, to) => {
    // 哨兵位置
    let thirdIndex = 0;
    while (Boolean) {
      if (to - from <= 10) {
        insertSort(a, from, to);
        return;
      }
      if (to - from > 1000) {
        thirdIndex = getThirdIndex(a, from, to);
      } else {
        // 小于 1000 直接取中点
        thirdIndex = from + ((to - from) >> 2);
      }
      // 三元取中法
      [a[from], a[thirdIndex], a[to - 1]] = _sort(
        a[from],
        a[thirdIndex],
        a[to - 1]
      );
      // 现在正式把 thirdIndex 作为哨兵
      let pivot = a[thirdIndex];
      // 把哨兵移动到开头
      [a[from], a[thirdIndex]] = [a[thirdIndex], a[from]];
      // 正式进入快排
      let lowEnd = from + 1;
      let highStart = to - 1;
      a[thirdIndex] = a[lowEnd];
      a[lowEnd] = pivot;
      // [lowEnd, i)的元素是和 pivot 相等的
      // [i, highStart) 的元素是需要处理的
      for (let i = lowEnd + 1; i < highStart; i++) {
        let element = a[i];
        let order = compareFn(element, pivot);
        if (order < 0) {
          a[i] = a[lowEnd];
          a[lowEnd] = element;
          lowEnd++;
        } else if (order > 0) {
          do {
            highStart--;
            if (highStart === i) break;
            order = compareFn(a[highStart], pivot);
          } while (order > 0);
          // 现在 a[highStart] <= pivot
          // a[i] > pivot
          // 两者交换
          a[i] = a[highStart];
          a[highStart] = element;
          if (order < 0) {
            // a[i] 和 a[lowEnd] 交换
            element = a[i];
            a[i] = a[lowEnd];
            a[lowEnd] = element;
            lowEnd++;
          }
        }
      }

      // 永远切分大区间
      if (lowEnd - from > to - highStart) {
        // 单独处理小区间
        quickSort(a, highStart, to);
        // 继续切分 lowEnd ~ from 这个区间
        to = lowEnd;
      } else if (lowEnd - from <= to - highStart) {
        quickSort(a, from, lowEnd);
        from = highStart;
      }
    }
  };

  quickSort(array, 0, length);
};
```

# 其他

## 数组去重

```javascript
// ES5
// filter + indexOf
// for + indexOf / includes
function uniqueES5(arr) {
  return arr.filter((item, index, array) => {
    return array.indexOf(item) === index;
  });
}

// ES6
function uniqueES6(arr) {
  return Array.from(new Set(arr));
  // return [...new Set(arr)];
}
```

## 数组扁平化

```javascript
// ES5 实现：递归
function flatten(arr) {
  let ret = [];
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      ret = ret.concat(flatten(arr[i]));
    } else {
      ret.push(arr[i]);
    }
  }
  return ret;
}

// ES6 实现：reduce
function flatten2(arr) {
  return arr.reduce((acc, cur) => {
    return acc.concat(Array.isArray(cur) ? flatten2(cur) : cur);
  });
}

// ES6 实现：扩展运算符
function flatten3(arr) {
  while (arr.some(item => Array.isArray(item))) {
    arr = [].concat(...arr);
  }
  return arr;
}

// ES6 实现：flat()
function flatten4(arr) {
  return arr.flat(Infinity);
}

Array.prototype.flat = function (depth = 1) {
  if (depth < 0) return this;

  return this.reduce((acc, cur) =>
    acc.concat(Array.isArray(cur) && depth > 1 ? cur.flat(depth - 1) : cur)
  );
};
```

## 数组转树

```javascript
// 定义一个函数，用于将数组转换为树形结构
function array2Tree(arr, parentId) {
  const tree = [];

  if (arr.length === 0) return tree;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].parentId === parentId) {
      const children = array2Tree(arr, arr[i].id);
      if (children.length > 0) {
        arr[i].children = children;
      }
      tree.push(arr[i]);
    }
  }

  return tree;
}
```

## 求笛卡尔积

> 问题描述

```js
const list = [
  ["戴尔", "联想", "华为"],
  ["笔记本", "台式机"],
  ["黑色", "白色"]
];

const result = [
  ["戴尔", "笔记本", "黑色"],
  ["戴尔", "笔记本", "白色"],
  ["戴尔", "台式机", "黑色"],
  ["戴尔", "台式机", "白色"],
  ["联想", "笔记本", "黑色"],
  ["联想", "笔记本", "白色"],
  ["联想", "台式机", "黑色"],
  ["联想", "台式机", "白色"],
  ["华为", "笔记本", "黑色"],
  ["华为", "笔记本", "白色"],
  ["华为", "台式机", "黑色"]
];
```

> 代码实现

::: code-group

```javascript [递归实现]
// 递归实现
function cartesianProduct(arr) {
  if (arr.length === 0) return [];
  if (arr.length === 1) return arr[0].map(item => [item]);

  const result = [];
  const first = arr[0];
  const rest = arr.slice(1);

  const restProduct = cartesianProduct(rest);

  for (let i = 0; i < first.length; i++) {
    for (let j = 0; j < restProduct.length; j++) {
      result.push([first[i], ...restProduct[j]]);
    }
  }

  return result;
}
```

```javascript [非递归实现]
// 非递归实现
// 思路：
// 1. 先将第一个数组中的每个元素与第二个数组中的每个元素组合
// 2. 然后将结果与第三个数组中的每个元素组合
// 3. 依次类推，直到所有数组都被组合完毕
function cartesianProduct(arr) {
  if (arr.length === 0) return [];
  if (arr.length === 1) return arr[0].map(item => [item]);

  let result = arr[0].map(item => [item]);

  for (let i = 1; i < arr.length; i++) {
    const current = arr[i];
    const newResult = [];

    for (let j = 0; j < result.length; j++) {
      for (let k = 0; k < current.length; k++) {
        newResult.push([...result[j], current[k]]);
      }
    }

    result = newResult;
  }

  return result;
}
```

```js [使用 reduce + flatMap + map + concat 实现]
// 使用 reduce + flatMap + map + concat 实现
function cartesianProduct(arr) {
  return arr.reduce((acc, curr) => {
    return acc.flatMap(item => {
      return curr.map(subItem => {
        return [].concat(item, subItem);
      });
    });
  });
}
```

:::

## 数组乱序/洗牌

```javascript
// 洗牌算法
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
```
