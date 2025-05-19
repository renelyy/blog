# 中等题

## [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/description/)

:::code-group

```js [使用 map]
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  /**
   * 思路：使用滑动窗口，不断更新最大值
   * 使用 map 记录字符下标，当新加入的字符已经存在时，
   * 应当移动左边界到相同字符的下一位
   */
  const map = new Map();
  let ans = 0,
    l = 0,
    r = 0;
  while (l <= r && r < s.length) {
    const char = s.charAt(r);

    if (map.has(char)) {
      let tempL = map.get(char) + 1;
      for (let i = l; i < tempL; i++) {
        map.delete(s.charAt(i));
      }

      l = tempL;
    }
    map.set(char, r);
    ans = Math.max(r - l + 1, ans);
    r++;
  }
  return ans;
};
```

```js [使用 array更方便]
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  /**
   * 思路：使用滑动窗口，不断更新最大值
   * 使用 arrry 记录字符下标，当新加入的字符已经存在时，
   * 应当移动左边界到相同字符的下一位
   */
  const arr = [];
  let ans = 0,
    l = 0,
    r = 0;
  while (l <= r && r < s.length) {
    const char = s.charAt(r);
    let index = arr.indexOf(char);
    if (index !== -1) {
      l = index + 1;
      arr = arr.slice(l);
    }
    arr.push(char);
    // 注意这里不能用 r - l + 1，因为 r arr 数组中的下标
    // 而 r 是字符串的下标，直接取窗口的大小即可
    ans = Math.max(arr.length, ans);
    r++;
  }
  return ans;
};
```

:::
