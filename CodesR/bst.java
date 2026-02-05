import java.util.Scanner;

class Node {
    int val;
    Node left, right;

    Node(int val) {
        this.val = val;
        left = right = null;
    }
}

public class bst {
    Node root;

    public Node buildR(int low, int high) {
        if (low > high) {
            return null;
        }
        int mid = (low + high) / 2;
        Node node = new Node(mid);
        node.left = buildR(low, mid - 1);
        node.right = buildR(mid + 1, high);
        return node;
    }

    public void guessTarget(Node curr, int target) {
        if (curr == null) {
            return;
        }
        System.out.println("Checking: " + curr.val);
        if (curr.val == target) {
            System.out.println("Target Found!");
            return;
        }
        if (target < curr.val) {
            guessTarget(curr.left, target);
        } else {
            guessTarget(curr.right, target);
        }
    }

    public void visualize(Node node, String indent, boolean isLeft) {
        if (node != null) {
            System.out.println(indent + (isLeft ? "├── " : "└── ") + node.val);
            visualize(node.left, indent + (isLeft ? "│   " : "    "), true);
            visualize(node.right, indent + (isLeft ? "│   " : "    "), false);
        }
    }

    public static void main(String[] args) {
        bst b = new bst();
        b.root = b.buildR(0, 10);

        System.out.println("Tree Structure:");
        b.visualize(b.root, "", false);
        System.out.println("-----------------");

        Scanner sc = new Scanner(System.in);
        System.out.print("Enter target (0-10): ");
        int target = sc.nextInt();
        b.guessTarget(b.root, target);
    }
}