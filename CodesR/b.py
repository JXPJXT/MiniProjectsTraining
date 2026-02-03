import networkx as nx
import matplotlib.pyplot as plt

# ==================== PROPERTY FUNCTIONS ====================
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

def is_even(n): return n % 2 == 0
def divisible_by_3(n): return n % 3 == 0
def divisible_by_4(n): return n % 4 == 0
def divisible_by_5(n): return n % 5 == 0
def is_one(n): return n == 1

# ==================== TREE NODE ====================
class Node:
    def __init__(self, question=None, func=None, yes=None, no=None, value=None):
        self.question = question
        self.func = func
        self.yes = yes
        self.no = no
        self.value = value

    def is_leaf(self):
        return self.value is not None

# ==================== FIXED DECISION TREE ====================
def build_tree():
    return Node(
        "Prime?",
        is_prime,
        yes=Node(
            "Even?",
            is_even,
            yes=Node(value=2),
            no=Node(
                "Divisible by 3?",
                divisible_by_3,
                yes=Node(value=3),
                no=Node(
                    "Divisible by 5?",
                    divisible_by_5,
                    yes=Node(value=5),
                    no=Node(value=7)
                )
            )
        ),
        no=Node(
            "Even?",
            is_even,
            yes=Node(
                "Divisible by 3?",
                divisible_by_3,
                yes=Node(value=6),
                no=Node(
                    "Divisible by 4?",
                    divisible_by_4,
                    yes=Node(value=4),
                    no=Node(value=8)
                )
            ),
            no=Node(
                "Divisible by 3?",
                divisible_by_3,
                yes=Node(value=9),
                no=Node(
                    "Is 1?",
                    is_one,
                    yes=Node(value=1),
                    no=Node(value=0)
                )
            )
        )
    )

# ==================== GUESS + PATH TRACKING ====================
def guess_with_path(root, n):
    node = root
    path_nodes = [id(node)]
    path_edges = []

    while not node.is_leaf():
        next_node = node.yes if node.func(n) else node.no
        path_edges.append((id(node), id(next_node)))
        node = next_node
        path_nodes.append(id(node))

    return node.value, path_nodes, path_edges

# ==================== PURE PYTHON TREE LAYOUT ====================
def tree_layout(root, x=0, y=0, dx=1.6, dy=1.8, pos=None):
    if pos is None:
        pos = {}

    pos[id(root)] = (x, -y)

    children = []
    if root.yes:
        children.append(root.yes)
    if root.no:
        children.append(root.no)

    if children:
        width = dx * (len(children) - 1)
        start_x = x - width / 2
        for i, child in enumerate(children):
            tree_layout(
                child,
                x=start_x + i * dx,
                y=y + dy,
                dx=dx / 1.25,
                dy=dy,
                pos=pos
            )
    return pos

# ==================== VISUALIZATION WITH HIGHLIGHT ====================
def visualize(root, path_nodes=None, path_edges=None):
    G = nx.DiGraph()

    def dfs(node, parent=None, edge=None):
        nid = id(node)
        label = str(node.value) if node.is_leaf() else node.question
        G.add_node(nid, label=label)

        if parent:
            G.add_edge(parent, nid, label=edge)

        if node.yes:
            dfs(node.yes, nid, "Yes")
        if node.no:
            dfs(node.no, nid, "No")

    dfs(root)

    pos = tree_layout(root)
    node_labels = nx.get_node_attributes(G, "label")
    edge_labels = nx.get_edge_attributes(G, "label")

    # Default styling
    node_colors = []
    for node in G.nodes():
        if path_nodes and node in path_nodes:
            node_colors.append("#fde047")  # highlight nodes
        else:
            node_colors.append("#dbeafe")

    edge_colors = []
    edge_widths = []
    for edge in G.edges():
        if path_edges and edge in path_edges:
            edge_colors.append("#dc2626")  # highlight edges
            edge_widths.append(3.0)
        else:
            edge_colors.append("#334155")
            edge_widths.append(1.4)

    plt.figure(figsize=(14, 9))
    nx.draw(
        G,
        pos,
        with_labels=False,
        node_size=2600,
        node_color=node_colors,
        edge_color=edge_colors,
        width=edge_widths
    )
    nx.draw_networkx_labels(G, pos, node_labels, font_size=10)
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=9)

    plt.title("Decision Tree with Traversal Path Highlighted", fontsize=14)
    plt.axis("off")
    plt.show()

# ==================== MAIN ====================
tree = build_tree()

while True:
    n = int(input("Enter a number (0–10): "))
    guess, path_nodes, path_edges = guess_with_path(tree, n)

    print("System guess:", guess)
    visualize(tree, path_nodes, path_edges)

    if input("Continue? (y/n): ").lower() != "y":
        break
