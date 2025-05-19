# 中等题

## [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/description/)

```js
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
  let ans = 0, l = 0, r = 0;
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
    r++;
    ans = Math.max(r - l, ans);
  }
  return ans;
};
```