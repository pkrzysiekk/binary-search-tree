import { NODATA } from "dns";
import { Node } from "./node.js";
import util from "util";
import { error } from "console";

class Tree {
  constructor(array) {
    this.array = this.formatInputArray(array);
    this.root = this.buildTree();
  }
  prettyPrint(node = this.root, prefix = "", isLeft = true) {
    if (node === null) {
      return;
    }

    if (node.right !== null) {
      this.prettyPrint(
        node.right,
        `${prefix}${isLeft ? "│   " : "    "}`,
        false
      );
    }

    console.log(`${prefix}${isLeft ? "└── " : "┌── "}${node.value}`);

    if (node.left !== null) {
      this.prettyPrint(node.left, `${prefix}${isLeft ? "    " : "│   "}`, true);
    }
  }

  formatInputArray(array) {
    let newArray = [...new Set(array)];
    newArray.sort((a, b) => a - b);
    console.log(newArray);

    return newArray;
  }

  buildTree(array = this.array, start = 0, end = this.array.length - 1) {
    if (start > end) {
      return null;
    }
    let mid = Math.floor((start + end) / 2);
    let node = new Node(array[mid]);
    node.left = this.buildTree(array, start, mid - 1);
    node.right = this.buildTree(array, mid + 1, end);
    return node;
  }
  isLeaf(root) {
    return root.left == null && root.right == null;
  }
  hasOneChild(root) {
    return (
      (root.left !== null && root.right === null) ||
      (root.left === null && root.right !== null)
    );
  }
  hasTwoChildren(root) {
    return root.left !== null && root.right !== null;
  }
  getParent(root) {
    let currentRoot = this.root;
    if (root.value == currentRoot.value) return null;
    while (root) {
      if (
        (currentRoot.left && currentRoot.left.value === root.value) ||
        (currentRoot.right && currentRoot.right.value === root.value)
      )
        return currentRoot;

      if (root.value < currentRoot.value) {
        currentRoot = currentRoot.left;
      } else {
        currentRoot = currentRoot.right;
      }
    }
  }
  insert(value) {
    let node = new Node(value);
    let currentRoot = this.root;
    while (true) {
      if (value < currentRoot.value) {
        if (!currentRoot.left) {
          currentRoot.left = node;
          return;
        }
        currentRoot = currentRoot.left;
      } else {
        if (!currentRoot.right) {
          currentRoot.right = node;
          return;
        }
        currentRoot = currentRoot.right;
      }
    }
  }
  getMinRightSubTree(root) {
    let currentRoot = root.right;
    while (currentRoot.left) {
      currentRoot = currentRoot.left;
    }
    return currentRoot;
  }
  delete(value) {
    let node = new Node(value);
    let currentRoot = this.root;
    if (currentRoot.value == value) {
      console.error("Can't delete main root!");
      return;
    }
    while (currentRoot) {
      if (currentRoot.value == value) {
        if (this.isLeaf(currentRoot)) {
          let parent = this.getParent(currentRoot);
          if (parent.left && parent.left.value == value) {
            parent.left = null;
            return;
          } else {
            parent.right = null;
            return;
          }
        }
        if (this.hasOneChild(currentRoot)) {
          let parent = this.getParent(currentRoot);
          if (parent.left && parent.left.value == value) {
            if (currentRoot.left == null) {
              parent.left = currentRoot.right;
              return;
            } else {
              parent.left = currentRoot.left;
              return;
            }
          } else {
            if (currentRoot.left == null) {
              parent.right = currentRoot.right;
              return;
            } else {
              parent.right = currentRoot.left;
              return;
            }
          }
        }
        if (this.hasTwoChildren(currentRoot)) {
          let parent = this.getParent(currentRoot);
          let min = this.getMinRightSubTree(currentRoot);
          this.delete(min.value);
          if (parent.left && parent.left.value == currentRoot.value) {
            parent.left = min;
            min.left = currentRoot.left;
            min.right = currentRoot.right;
          } else {
            parent.right = min;
            min.left = currentRoot.left;
            min.right = currentRoot.right;
          }
        }
      }
      if (value < currentRoot.value) {
        currentRoot = currentRoot.left;
      } else {
        currentRoot = currentRoot.right;
      }
    }
  }
  find(value) {
    let currentRoot = this.root;
    if (!currentRoot) return null;
    while (currentRoot) {
      if (currentRoot.value == value) return currentRoot;
      if (value < currentRoot.value) {
        currentRoot = currentRoot.left;
      } else {
        currentRoot = currentRoot.right;
      }
    }
    return null;
  }
  levelOrder(callback) {
    let currentRoot = this.root;
    if (!currentRoot) return null;
    if (!callback) throw error("No callback provided");
    let queue = [];
    queue.push(currentRoot);
    while (queue.length > 0) {
      let temp = queue.shift();
      if (temp.left) queue.push(temp.left);
      if (temp.right) queue.push(temp.right);
      callback(temp);
    }
  }
  preOrder(callback, root) {
    if (!root) return;
    callback(root);
    this.preOrder(callback, root.left);
    this.preOrder(callback, root.right);
  }
  inOrder(callback, root) {
    if (!root) return;

    this.inOrder(callback, root.left);
    callback(root);
    this.inOrder(callback, root.right);
  }
  postOrder(callback, root) {
    if (!root) return;
    this.postOrder(callback, root.left);
    this.postOrder(callback, root.right);
    callback(root);
  }
  height(root) {
    if (!root) return 0;
    let lh = this.height(root.left);
    let rh = this.height(root.right);
    return lh > rh ? lh + 1 : rh + 1;
  }
  isBalanced(root = this.root) {
    if (root == null) return 1;
    let lh = this.height(root.left);
    let rh = this.height(root.right);
    if (
      Math.abs(lh - rh) <= 1 &&
      this.isBalanced(root.left) &&
      this.isBalanced(root.right)
    )
      return true;

    return false;
  }
  depth(root) {
    if (!root) return null;
    let depth = 0;
    let currentRoot = this.root;
    while (currentRoot) {
      if (root.value == currentRoot.value) return depth;
      else {
        if (root.value < currentRoot.value) {
          currentRoot = currentRoot.left;
          depth++;
        } else {
          currentRoot = currentRoot.right;
          depth++;
        }
      }
    }
    return -1;
  }
  rebalance() {
    let currentRoot = this.root;
    if (!currentRoot) return null;
    let array = [];
    let queue = [];
    queue.push(currentRoot);
    while (queue.length > 0) {
      let temp = queue.shift();
      if (temp.left) queue.push(temp.left);
      if (temp.right) queue.push(temp.right);
      array.push(temp.value);
    }
    //array.sort((a, b) => a.value - b.value);
    this.root = this.buildTree(array, 0, array.length - 1);
  }
}
function logNode(root) {
  console.log(root.value);
}
