class Node:
    def __init__(self, name, title=None):
        self.name = name
        self.title = title
        self.parent = None
        self.children = []
    a 
    def add_child(self, child):
        child.parent = self
        self.children.append(child)


class Tree:
    def __init__(self, root):
        self.root = root
        self.nodes = {root.name: root}

    def add(self, parent_name, child):
        parent = self.nodes.get(parent_name)
        if not parent:
            raise ValueError(f"Parent '{parent_name}' not found")
        parent.add_child(child)
        self.nodes[child.name] = child

    def parent_of(self, name):
        node = self.nodes.get(name)
        return node.parent.name if node and node.parent else "None"

    def children_of(self, name):
        node = self.nodes.get(name)
        return [c.name for c in node.children] if node else []

    def ancestors_of(self, name):
        node = self.nodes.get(name)
        res = []
        while node and node.parent:
            node = node.parent
            res.append(node.name)
        return res

    def descendants_of(self, name):
        node = self.nodes.get(name)
        res = []

        def dfs(n):
            for c in n.children:
                res.append(c.name)
                dfs(c)

        if node:
            dfs(node)
        return res

    def path_to_root(self, name):
        node = self.nodes.get(name)
        path = []
        while node:
            path.append(node.name)
            node = node.parent
        return path[::-1]

    def is_descendant(self, child, ancestor):
        return ancestor in self.ancestors_of(child)

    # -------- TREE PRINTING --------

    def print_tree(self):
        def dfs(node, prefix="", is_last=True):
            connector = "└── " if is_last else "├── "
            print(prefix + connector + node.name)

            new_prefix = prefix + ("    " if is_last else "│   ")

            for i, child in enumerate(node.children):
                dfs(child, new_prefix, i == len(node.children) - 1)

        print(self.root.name)
        for i, child in enumerate(self.root.children):
            dfs(child, "", i == len(self.root.children) - 1)


# ---------------- HARD CODED HIERARCHY ----------------

root = Node("Aegon I")
tree = Tree(root)

tree.add("Aegon I", Node("Aenys I"))
tree.add("Aegon I", Node("Maegor I"))

tree.add("Aenys I", Node("Jaehaerys I"))
tree.add("Jaehaerys I", Node("Baelon"))
tree.add("Baelon", Node("Viserys I"))
tree.add("Baelon", Node("Daemon"))

tree.add("Viserys I", Node("Rhaenyra"))
tree.add("Viserys I", Node("Aegon II"))

tree.add("Rhaenyra", Node("Jacaerys"))
tree.add("Rhaenyra", Node("Lucerys"))
tree.add("Jacaerys", Node("Aegon III"))
tree.add("Aegon III", Node("Viserys II"))
tree.add("Viserys II", Node("Aegon IV"))
tree.add("Aegon IV", Node("Daemon Blackfyre"))

tree.add("Daemon", Node("Aemond"))
tree.add("Daemon", Node("Helaena"))

# ---------------- COMMAND INTERFACE ----------------

def help_menu():
    print("""
Commands:
 parent <name>
 children <name>
 ancestors <name>
 descendants <name>
 path <name>
 check <child> <ancestor>
 print
 help
 exit
""")


print("Royal Lineage Console")
help_menu()

while True:
    cmd = input(">> ").strip()
    if not cmd:
        continue

    parts = cmd.split()
    action = parts[0].lower()

    try:
        if action == "exit":
            break

        elif action == "help":
            help_menu()

        elif action == "print":
            tree.print_tree()

        elif action == "parent":
            print(tree.parent_of(" ".join(parts[1:])))

        elif action == "children":
            print(tree.children_of(" ".join(parts[1:])))

        elif action == "ancestors":
            print(tree.ancestors_of(" ".join(parts[1:])))

        elif action == "descendants":
            print(tree.descendants_of(" ".join(parts[1:])))

        elif action == "path":
            print(tree.path_to_root(" ".join(parts[1:])))

        elif action == "check":
            child = parts[1]
            ancestor = " ".join(parts[2:])
            print(tree.is_descendant(child, ancestor))

        else:
            print("Unknown command. Type 'help'.")

    except Exception as e:
        print("Error:", e)
