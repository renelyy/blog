const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});
const iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;

(async () => {
  const tree = new AVLTree();
  while ((line = await readline())) {
    const [op, val] = line.trim().split(" ").map(Number);
    switch (op) {
      case 1:
        tree.insert(val);
        break;
      case 2:
        tree.remove(val);
        break;
      case 3:
        console.log(tree.root);
        tree.output(tree.root);
        break;
      default:
        console.log("invalid op");
        break;
    }
  }
})();

const nullptr = { val: null, left: null, right: null, height: 0 };

class AVLTreeNode {
  constructor(val, height = 0, left = nullptr, right = nullptr) {
    this.val = val;
    this.left = left;
    this.right = right;
    this.height = height;
  }

  static getNewNode(val) {
    return new AVLTreeNode(val, 1);
  }
}

class AVLTree {
  constructor() {
    this.root = nullptr;
  }

  insert(val) {
    this.root = this.__insert(this.root, val);
  }

  remove(val) {
    this.root = this.__remove(this.root, val);
  }

  output(root) {
    if (root === nullptr) return;
    this.output(root.left);
    console.log(root.val);
    this.output(root.right);
  }

  __insert(root, val) {
    if (root === nullptr) return AVLTreeNode.getNewNode(val);
    if (val === root.val) return root;
    if (val < root.val) root.left = this.__insert(root.left, val);
    else if (val > root.val) root.right = this.__insert(root.right, val);

    // 更新树高
    this.__updateHeight(root);

    // 返回调整（旋转）以后的根
    return this.__maintain(root);
  }

  __remove(root, val) {
    if (root === nullptr) return nullptr;
    if (val < root.val) root.left = this.__remove(root.left, val);
    else if (val > root.val) root.right = this.__remove(root.right, val);
    else {
      if (root.left === nullptr || root.right === nullptr) {
        // 处理度为 0 和 度为 1 的节点情况
        return root.left || root.right;
      } else {
        // 处理度为 2 的节点情况
        const pre = this.__predeccessor(root);
        root.val = pre.val;
        root.left = this.__remove(root.left, pre.val);
      }
    }

    // 更新树高
    this.__updateHeight(root);

    // 返回调整（旋转）以后的根
    return this.__maintain(root);
  }

  __predeccessor(root) {
    let temp = root.left;
    while (temp.right !== nullptr) temp = temp.right;
    return temp;
  }

  __updateHeight(root) {
    root.height = Math.max(root.left.height, root.right.height) + 1;
  }

  __maintain(root) {
    // TODO: 维护平衡
    // 当前节点是否平衡的条件的是左右子树的高度差是否小于 2
    // 左右子树的高度差小于 2，说明是平衡的，不需要调整，直接返回即可
    if (Math.abs(root.left.height - root.right.height) < 2) return root;

    // 左子树的高度大于右子树的高度，说明是 L-型不平衡
    if (root.left.height > root.right.height) {
      if (root.left.left.height > root.left.right.height) {
        // LL 型
        return this.__rightRotate(root);
      } else {
        // LR 型
        root.left = this.__leftRotate(root.left);
        return this.__rightRotate(root);
      }
    } else {
      if (root.right.right.height > root.right.left.height) {
        // RR 型
        return this.__leftRotate(root);
      } else {
        // RL 型
        root.right = this.__rightRotate(root.right);
        return this.__leftRotate(root);
      }
    }
  }

  __leftRotate(root) {
    // TODO: 左旋
    let newRoot = root.right;
    root.right = newRoot.left;
    newRoot.left = root;
    this.__updateHeight(root);
    this.__updateHeight(newRoot);
    return newRoot;
  }

  __rightRotate(root) {
    // TODO: 右旋
    let newRoot = root.left;
    root.left = newRoot.right;
    newRoot.right = root;
    this.__updateHeight(root);
    this.__updateHeight(newRoot);
    return newRoot;
  }
}

// Test: AVL
let avlTree = new AVLTree();
avlTree.insert(1);
avlTree.insert(2);
avlTree.insert(3);
avlTree.insert(4);
avlTree.insert(5);
avlTree.insert(6);
avlTree.insert(7);
avlTree.insert(8);
avlTree.insert(9);
avlTree.remove(9);

console.log(avlTree.root);

avlTree.output(avlTree.root);
