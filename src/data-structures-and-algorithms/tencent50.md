# 腾讯精选练习 50 题

## [215. 数组中的第 K 个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/description/?envType=problem-list-v2&envId=ex0k24j) :white_check_mark:

1. **问题描述**

给定整数数组 nums 和整数 k，请返回数组中第 k 个最大的元素。

请注意，你需要找的是数组排序后的第 k 个最大的元素，而不是第 k 个不同的元素。

你必须设计并实现时间复杂度为 O(n) 的算法解决此问题。

2. **示例 1:**

```
输入: [3,2,1,5,6,4], k = 2
输出: 5
```

3. **代码实现**

:::code-group

```js [暴力]
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function (nums, k) {
  nums.sort((a, b) => b - a);
  return nums[k - 1];
};
```

```js [小顶堆]
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function (nums, k) {
  const minHeap = new MinHeap();
  for (const n of nums) {
    minHeap.insert(n);
    if (minHeap.size() > k) {
      minHeap.pop();
    }
  }
  return minHeap.peek();
};

class MinHeap {
  constructor() {
    this.heap = [];
  }

  /**
   * 插入元素
   */
  insert(val) {
    this.heap.push(val);
    this.__heapifyUp(this.size() - 1);
  }

  /**
   * 删除堆顶元素
   */
  pop() {
    if (this.isEmpty()) return null;

    const top = this.heap[0];
    const last = this.heap.pop();

    if (this.size() > 0) {
      this.heap[0] = last;
      this.__heapifyDown(0);
    }

    return top;
  }

  /**
   * 获取堆顶元素
   */
  peek() {
    if (this.isEmpty()) return null;

    return this.heap[0];
  }

  /**
   * 返回堆的大小
   */
  size() {
    return this.heap.length;
  }

  /**
   * 判断堆是否为空
   */
  isEmpty() {
    return this.size() === 0;
  }

  /**
   * 获取父节点的索引
   */
  __getParentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  /**
   * 获取左子节点的索引
   */
  __getLeftChildIndex(index) {
    return 2 * index + 1;
  }

  /**
   * 获取右子节点的索引
   */
  __getRightChildIndex(index) {
    return 2 * index + 2;
  }

  /**
   * 交换两个节点的值
   */
  __swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  /**
   * 向上调整，插入元素时使用
   */
  __heapifyUp(index) {
    while (index > 0) {
      const parentIndex = this.__getParentIndex(index);
      if (this.heap[parentIndex] <= this.heap[index]) break;
      this.__swap(index, parentIndex);
      index = parentIndex;
    }
  }

  /**
   * 向下调整，删除堆顶元素时使用
   */
  __heapifyDown(index) {
    // 左子节点
    const leftIndex = this.__getLeftChildIndex(index);
    // 右子节点
    const rightIndex = this.__getRightChildIndex(index);
    // 三者找最小
    let minIndex = index;

    if (leftIndex < this.size() && this.heap[leftIndex] < this.heap[minIndex]) {
      minIndex = leftIndex;
    }

    if (
      rightIndex < this.size() &&
      this.heap[rightIndex] < this.heap[minIndex]
    ) {
      minIndex = rightIndex;
    }

    if (minIndex !== index) {
      this.__swap(index, minIndex);
      this.__heapifyDown(minIndex);
    }
  }
}
```

```js [快速选择]
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function (nums, k) {
  function swap(arr, i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  /**
   * 分区函数：将比基准大的放在左边，小的放在右边
   * @return 基准的最终位置
   */
  function partition(left, right, pivotIndex) {
    const pivotValue = nums[pivotIndex];
    swap(nums, pivotIndex, right); // 将 pivot 移到最右边
    let storeIndex = left;

    for (let i = left; i < right; i++) {
      if (nums[i] > pivotValue) {
        // 注意这里是找第 k 大，所以用 >
        swap(nums, storeIndex, i);
        storeIndex++;
      }
    }
    swap(nums, storeIndex, right); // 将 pivot 放回正确位置
    return storeIndex;
  }

  function quickSelect(left, right, kLargest) {
    if (left === right) return nums[left];

    // 随机选择 pivot 以避免最坏情况
    let pivotIndex = left + Math.floor(Math.random() * (right - left + 1));
    pivotIndex = partition(left, right, pivotIndex);

    if (kLargest === pivotIndex) {
      return nums[kLargest];
    } else if (kLargest < pivotIndex) {
      return quickSelect(left, pivotIndex - 1, kLargest);
    } else {
      return quickSelect(pivotIndex + 1, right, kLargest);
    }
  }

  return quickSelect(0, nums.length - 1, k - 1);
};
```

:::
