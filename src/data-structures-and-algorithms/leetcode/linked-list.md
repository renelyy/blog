---
outline: [1, 2] # 显示 # 和 ## 级别标题
---

::: tip

<b>链表总数：</b> `3`

:::

# 简单题

## 1. [21. 合并两个有序链表](https://leetcode-cn.com/problems/merge-two-sorted-lists/)

::: code-group

```javascript [采用递归]
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
```

```javascript [创建节点]
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
   * 比较头节点，创建节点，没有破坏原链表
   */
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
```

```javascript [直接修改指针]
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
   * 比较头节点，不创建节点，直接修改原始指针指向
   */
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
```

```javascript [直接修改指针2]
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
```

:::

## 2. [141. 环形链表](https://leetcode.cn/problems/linked-list-cycle/description/)

::: code-group

```js [使用 set 存储访问过的节点]
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function (head) {
  // 使用 set 存储访问过的节点
  // 时间复杂度 O(N)
  // 空间复杂度 O(N)
  if (head === null) return false;
  const set = new Set();
  let p = head;
  while (p) {
    if (set.has(p)) return true;
    set.add(p);
    p = p.next;
  }
  return false;
};
```

```js [快慢指针]
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function (head) {
  // 快慢指针
  // 时间复杂度 O(N)
  // 空间复杂度 O(1)
  if (head === null || head.next === null) return false;
  let p = head,
    q = head.next;
  // 如果在没有环的情况下，快指针会率先等于 null，所以这里没必要 判断满指针
  // while (p && q && q.next && p !== q) {
  while (q && q.next && p !== q) {
    p = p.next;
    q = q.next.next;
  }

  return p === q;
};
```

```js [快慢指针2]
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function (head) {
  // 换个写法也行
  if (head === null || head.next === null) return false;
  let fast = (slow = head);
  do {
    fast = fast.next.next;
    slow = slow.next;
  } while (fast && fast.next && fast !== slow);
  return fast === slow;
};
```

:::

## 3. [206. 反转链表](https://leetcode.cn/problems/reverse-linked-list/description/)

::: code-group

```js [迭代]
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {
  if (head === null || head.next === null) return head;
  let p = null;
  let q = head;
  let r = head.next;
  do {
    q.next = p;
    p = q;
    q = r;
    r && (r = r.next);
  } while (q);
  return p;
};
```

```js [递归1]
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {
  if (head === null || head.next === null) return head;

  let tail = head.next;
  let p = reverseList(head.next);
  head.next = null;
  tail.next = head;
  return p;
};
```

```js [递归2]
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {
  // 此时不需要反转，直接返回节点即可
  if (head === null || head.next === null) return head;
  let tail = head.next,
    q = reverseList(head.next);
  // 其实 tail.next 一直为 null
  // 这里主要目的是想置 head.next = null，防止出现环，因为 tail.next 马上要指向 head 了
  // 原来本来 head.next 就指向 tail，tail.next 再指向 head就会出现环了，
  // 可以直接 head.next = null
  // 而正好 tail.next 一直为 null，所以也可以 head.next = tail.next
  // 所以为什么 tail.next 一直为 null 呢？
  // 答：我们可以模拟一下
  /**
    1 -> 2 -> 3 -> 4 -> 5 -> 6 -> null
    当 head = 5时，tail = head.next = 6
    所以再次递归进入后，直接会返回 6，回溯回来以后，而此时 tail.next 的的确确是指向 null 的
    后续的操作把 head.next 指向了 tail.next 即 null，
    所以回溯的时候，tail.next 一直为 null
   */
  // 回溯时，由于 tail.next = null，由于第一次的 head.next = tail.next = null
  // 所以在回溯时，tail.next 一直为 null，因为在回溯前，就将其设置为 null 了
  // 因为回溯前的 head.next 其实就是回溯后的tail
  /**
                          head  tail
                            |     |
    1 --> 2 --> 3 --> 4 --> 5 -\-> 6 --> null
                            |      |
                          null     p
        回溯下一轮的 tail 指向 5，其 tail.next 当然为 null
   */
  head.next = tail.next;
  tail.next = head;
  return q;
};
```

:::

## 4. [LCR 023. 相交链表](https://leetcode.cn/problems/intersection-of-two-linked-lists/description/)

::: code-group

```js [使用 Set]
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} headA
 * @param {ListNode} headB
 * @return {ListNode}
 * */
var getIntersectionNode = function (headA, headB) {
  if (headA === null || headB === null) return null;
  const set = new Set();
  let p = headA;
  while (p) {
    set.add(p);
    p = p.next;
  }
  p = headB;
  while (p) {
    if (set.has(p)) return p;
    p = p.next;
  }
  return null;
};
```

```js [双指针]
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} headA
 * @param {ListNode} headB
 * @return {ListNode}
 */
var getIntersectionNode = function (headA, headB) {
  let p = headA,
    q = headB;
  while (p !== q) {
    p = p === null ? headB : p.next;
    q = q === null ? headA : q.next;
  }
  return p;
};
```

:::

# 中等题

# 困难题
