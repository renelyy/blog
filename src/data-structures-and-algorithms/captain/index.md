# 船长算法刷题

## 手撕红黑树-上（插入调整）

### [971. 翻转二叉树以匹配先序遍历](https://leetcode.cn/problems/flip-binary-tree-to-match-preorder-traversal/) `中等` :white_check_mark:

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number[]} voyage
 * @return {number[]}
 */
var flipMatchVoyage = function (root, voyage) {
  let curIndex = 0;
  const ret = [];
  const preorder = (root, voyage) => {
    if (root === null || curIndex + 1 === voyage.length) return true;
    if (root.val !== voyage[curIndex]) {
      ret.length = 0;
      ret.push(-1);
      return false;
    }
    curIndex++; // 指向左子树
    if (root.left && root.left.val !== voyage[curIndex]) {
      let temp = root.left;
      root.left = root.right;
      root.right = temp;
      ret.push(root.val);
    }
    if (!preorder(root.left, voyage)) return false;
    if (!preorder(root.right, voyage)) return false;
    return true;
  };
  preorder(root, voyage);
  return ret;
};
```
