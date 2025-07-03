# 常用技巧

## 求二进制中 1 的个数

::: code-group

```js [转字符串遍历]
function countOnes(n) {
  const str = n.toString(2);
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "1") {
      count++;
    }
  }
  return count;
}
```

```js [位运算]
// 通过不断地将数字与 1 进行按位与操作，可以检查最低位是否为 1。
// 然后将数字右移一位，继续检查下一位，直到数字变为 0 为止。
function countOnes(n) {
  let count = 0;
  while (n) {
    if (n & 1) {
      count++;
    }
    n >>= 1;
  }
  return count;
}
```

```js [位运算优化]
// 通过不断地将数字与 (n - 1) 进行按位与操作，可以消除数字中的最低位的 1。
// 然后通过计数器记录消除的次数，直到数字变为 0 为止。
function countOnes(n) {
  let count = 0;
  while (n) {
    n = n & (n - 1);
    count++;
  }
  return count;
}
```

:::

## 求二进制中 0 的个数

```js [位运算]
// 通过不断地将数字与 1 进行按位或操作，可以检查最低位是否为 0。
// 然后将数字右移一位，继续检查下一位，直到数字变为 0 为止。
function countZeros(n) {
  let count = 0;
  while (n) {
    if (!(n & 1)) {
      count++;
    }
    n >>= 1;
  }
  return count;
}
```

## 判断一个数是否是 2 的幂

```js [位运算]
// 一个数是 2 的幂，那么它的二进制表示中只有一个 1。
// 可以通过将数字减去 1，然后与原数字进行按位与操作，
// 如果结果为 0，则说明数字是 2 的幂。
function isPowerOfTwo(n) {
  return (n & (n - 1)) === 0;
}
```

## 判断一个数是否是质数

```js [质数判断]
// 质数又称素数
// 思路：如果一个数是质数，那么它只能被 1 和它本身整除。
// 因此，我们可以从 2 开始，依次检查是否能整除该数。
// 如果能整除，则说明该数不是质数；如果不能整除，则继续检查下一个数。
// 如果检查到该数的平方根都没有能整除的数，那么该数就是质数。
function isPrime(n) {
  if (n <= 1) {
    return false;
  }
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      return false;
    }
  }
  return true;
}
```

## 判断一个数是否是回文数

```js [回文数判断]
// 思路：将数字转换为字符串，然后从两端开始比较字符是否相等。
// 如果相等，则继续比较下一个字符；如果不相等，则说明该数不是回文数。
function isPalindrome(n) {
  const str = n.toString();
  let left = 0;
  let right = str.length - 1;
  while (left < right) {
    if (str[left] !== str[right]) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}
```

## 判断一个数是否是阿姆斯特朗数

```js [阿姆斯特朗数判断]
// 如果一个n位正整数等于其各位数字的n次方之和,则称该数为阿姆斯特朗数。
// 例如 1^3 + 5^3 + 3^3 = 153
// 思路：将数字转换为字符串，然后计算每个数字的幂次和。
// 如果幂次和等于原数字，则说明该数是阿姆斯特朗数。
function isArmstrong(n) {
  const str = n.toString();
  const len = str.length;
  let sum = 0;
  for (let i = 0; i < len; i++) {
    sum += Math.pow(parseInt(str[i]), len);
  }
  return sum === n;
}
```

## 判断一个数是否是完美数

```js [完美数判断]
// 如果一个数恰好等于它的因子之和，则称该数为完美数。
// 例如 6 = 1 + 2 + 3
// 思路：从 1 开始，依次检查是否能整除该数。
// 如果能整除，则将因子累加到 sum 中。
// 最后判断 sum 是否等于原数字，如果是，则说明该数是完美数。
function isPerfectNumber(n) {
  let sum = 0;
  for (let i = 1; i < n; i++) {
    if (n % i === 0) {
      sum += i;
    }
  }
  return sum === n;
}
```

## 求一个数的所有因子

```js [求一个数的所有因子]
// 思路：从 1 开始，依次检查是否能整除该数。
// 如果能整除，则将该数添加到因子数组中。
function getFactors(n) {
  const factors = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) {
      factors.push(i);
    }
  }
  return factors;
}
```

## 求一个数的所有质因子

```js [求一个数的所有质因子]
// 思路：从 2 开始，依次检查是否能整除该数。
// 如果能整除，则将该数添加到质因子数组中，并将该数除以质因子。
// 继续检查下一个数，直到该数变为 1 为止。
function getPrimeFactors(n) {
  const primeFactors = [];
  for (let i = 2; i <= n; i++) {
    while (n % i === 0) {
      primeFactors.push(i);
      n /= i;
    }
  }
}
```

## 求最大公约数

```js [求最大公约数]
// 思路：使用辗转相除法，即用较大数除以较小数，然后用余数替换较大数，继续除以较小数，直到余数为 0 为止。
// 最后的除数即为最大公约数。
function gcd(a, b) {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}
```

## 求最小公倍数

```js [求最小公倍数]
// 思路：最小公倍数 = (a * b) / 最大公约数
function lcm(a, b) {
  return (a * b) / gcd(a, b);
}
```

## 进制转换

```js [进制转换]
// toString 可以将数字转换为指定进制的字符串
// 例如：n.toString(2) 将数字 n 转换为二进制字符串
// parseInt 可以将字符串转以指定进制转为数字
// 例如：parseInt("1010", 2) 将二进制字符串 "1010" 转换为十进制数字 10
//      parseInt("ff", 16) 将十六进制字符串 "ff" 转换为十进制数字 255
// 需要注意：其他进制转化时，需要借助十进制进行中转

// 十进制转二进制
function decimalToBinary(n) {
  return n.toString(2);
}

// 二进制转十进制
function binaryToDecimal(n) {
  return parseInt(n, 2);
}

// 十进制转八进制
function decimalToOctal(n) {
  return n.toString(8);
}

// 八进制转十进制
function octalToDecimal(n) {
  return parseInt(n, 8);
}

// 十进制转十六进制
function decimalToHex(n) {
  return n.toString(16);
}

// 十六进制转十进制
function hexToDecimal(n) {
  return parseInt(n, 16);
}
```

## 快速幂

:::code-group

```js [递归法]
function quickPow(x, n) {
  if (n === 0) return 1;
  let y = quickPow(x, n >>> 1);
  return n % 2 === 0 ? y * y : y * y * x;
}
```

```js [迭代法]
function quickPow(x, n) {
  let ans = 1;
  while (n > 0) {
    if (n % 2 === 1) {
      ans *= x;
    }
    x *= x;
    n >>>= 1;
  }
  return ans;
}
```

:::

## 快速选择算法

快速选择算法是一种用于在未排序列表中找到第k小（或第k大）元素的高效算法。它是快速排序算法的一个变种，通过不断缩小搜索范围来找到目标元素。

```js [快速选择算法]
/**
 * 快速选择算法：用于在无序数组中找到第 k 大的元素
 */
var findKthLargest = function (nums, k) {
  function swap(arr, i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  /**
   * 分区函数：将比基准大的放在左边，小的放在右边
   * 
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
