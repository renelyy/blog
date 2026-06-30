# LeetCode 题解（6）

[← 返回索引](../index.md)

> 迁移自 profile algorithm/leetCode/code，第 6 批

---

## 面试题03.04.化栈为队

> 来源：`profile/algorithm/leetCode/code/面试题03.04.化栈为队.js`

```javascript
/**
 * 实现一个MyQueue类，该类用两个栈来实现一个队列。
 * 
 示例：
 MyQueue queue = new MyQueue();

  queue.push(1);
  queue.push(2);
  queue.peek();  // 返回 1
  queue.pop();   // 返回 1
  queue.empty(); // 返回 false

  说明：
  你只能使用标准的栈操作 -- 也就是只有 push to top, peek/pop from top, size 和 is empty 操作是合法的。
  你所使用的语言也许不支持栈。你可以使用 list 或者 deque（双端队列）来模拟一个栈，只要是标准的栈操作即可。
  假设所有操作都是有效的 （例如，一个空的队列不会调用 pop 或者 peek 操作）。

  来源：力扣（LeetCode）
  链接：https://leetcode-cn.com/problems/implement-queue-using-stacks-lcci
  著作权归领扣网络所有。商业转载请联系官方授权，非商业转载请注明出处。
 */
/**
 * Initialize your data structure here.
 * 解题思路：正常用两个栈实现
 * s1入栈
 * s2出栈 出栈时，如果s2不为空，直接出栈；
 *              否则，先把s1里的全部数据挪到s2中，再出栈
 */
var MyQueue = function () {
  this.s = []
};

// function transfter () {
//     if (this.s1.length) return
//     for (let i = 0; i < this.s2.length; i--) {
//         this.s1.push(this.s2[i])
//     }
//     this.s2 = []
// }

/**
* Push element x to the back of queue. 
* @param {number} x
* @return {void}
*/
MyQueue.prototype.push = function (x) {
  this.s.push(x)
};

/**
* Removes the element from in front of queue and returns that element.
* @return {number}
*/
MyQueue.prototype.pop = function () {
  // transfter.bind(this)
  return this.s.length && this.s.shift()
  // return ret
};

/**
* Get the front element.
* @return {number}
*/
MyQueue.prototype.peek = function () {
  // transfter.bind(this)
  return this.s.length && this.s[0]
};

/**
* Returns whether the queue is empty.
* @return {boolean}
*/
MyQueue.prototype.empty = function () {
  return this.s.length === 0
};

/**
* Your MyQueue object will be instantiated and called as such:
* var obj = new MyQueue()
* obj.push(x)
* var param_2 = obj.pop()
* var param_3 = obj.peek()
* var param_4 = obj.empty()
*/
```

---

