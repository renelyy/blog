# 链表

## 1. [21. 合并两个有序链表](https://leetcode-cn.com/problems/merge-two-sorted-lists/)

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function (list1, list2) {
  /**
   * 采用递归
   */
  const mergeTwoListsI = (l1, l2) => {
    if (l1 === null) return l2;
    if (l2 === null) return l1;
    if (l1.val < l2.val) {
      l1.next = mergeTwoLists(l1.next, l2);
      return l1;
    } else {
      l2.next = mergeTwoLists(l2.next, l1);
      return l2;
    }
  };

  /**
   * 比较头节点，创建节点，没有破坏原链表
   */
  const mergeTwoListsII = (l1, l2) => {
    if (l1 === null) return l2;
    if (l2 === null) return l1;
    let vhead = new ListNode(),
      p = l1,
      q = l2,
      tail = vhead;
    while (p && q) {
      if (p.val < q.val) {
        tail.next = new ListNode(p.val);
        p = p.next;
      } else {
        tail.next = new ListNode(q.val);
        q = q.next;
      }
      tail = tail.next;
    }
    let remainder = p || q;
    while (remainder) {
      tail.next = new ListNode(remainder.val);
      tail = tail.next;
      remainder = remainder.next;
    }
    return vhead.next;
  };

  /**
   * 比较头节点，不创建节点，直接修改原始指针指向
   */
  const mergeTwoListsIII = (l1, l2) => {
    if (l1 === null) return l2;
    if (l2 === null) return l1;
    let vhead = new ListNode(),
      tail = vhead;
    while (l1 && l2) {
      if (l1.val < l2.val) {
        tail.next = l1;
        l1 = l1.next;
      } else {
        tail.next = l2;
        l2 = l2.next;
      }
      tail = tail.next;
    }
    tail.next = l1 || l2;
    return vhead.next;
  };

  const mergeTwoListsIV = (l1, l2) => {
    if (l1 === null) return l2;
    if (l2 === null) return l1;
    const vhead = new ListNode();
    let p = vhead;
    while (l1 || l2) {
      if (l2 === null || (l1 !== null && l1.val < l2.val)) {
        p.next = l1;
        l1 = l1.next;
      } else {
        p.next = l2;
        l2 = l2.next;
      }
      p = p.next;
    }

    return vhead.next;
  };

  // return mergeTwoListsI(list1, list2);
  // return mergeTwoListsII(list1, list2);
  // return mergeTwoListsIII(list1, list2);
  return mergeTwoListsIV(list1, list2);
};
```

# 数组

# 栈

# 队列

# 哈希表

# 字符串

# 树

# 图

# 排序

# 搜索

# 动态规划

# 贪心算法

# 位运算

# 数学
