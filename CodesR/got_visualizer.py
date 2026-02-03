"""
🐉 Game of Thrones Royal Lineage Visualizer
Enhanced version with beautiful visualizations and interactive features
"""

import json
import webbrowser
import tempfile
import os
from pathlib import Path

# ============== ANSI Color Codes for Terminal ==============
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    GOLD = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'
    
    # House colors
    TARGARYEN = '\033[91m'  # Red for fire
    DRAGON = '\033[95m'     # Purple/Magenta

# ============== Node Class ==============
class Node:
    def __init__(self, name, title=None, house="Targaryen", reign_start=None, reign_end=None):
        self.name = name
        self.title = title
        self.house = house
        self.reign_start = reign_start
        self.reign_end = reign_end
        self.parent = None
        self.children = []

    def add_child(self, child):
        child.parent = self
        self.children.append(child)
    
    def to_dict(self):
        """Convert node to dictionary for JSON serialization"""
        return {
            "name": self.name,
            "title": self.title,
            "house": self.house,
            "reign": f"{self.reign_start or '?'} - {self.reign_end or '?'}" if self.reign_start or self.reign_end else None,
            "children": [child.to_dict() for child in self.children]
        }


# ============== Tree Class ==============
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

    def depth_of(self, name):
        """Calculate the depth of a node"""
        return len(self.ancestors_of(name))

    def height(self):
        """Calculate the height of the tree"""
        def get_height(node):
            if not node.children:
                return 0
            return 1 + max(get_height(c) for c in node.children)
        return get_height(self.root)

    def size(self):
        """Return total number of nodes"""
        return len(self.nodes)

    def to_json(self):
        """Convert tree to JSON for web visualization"""
        return json.dumps(self.root.to_dict(), indent=2)

    # ============== ENHANCED TREE PRINTING ==============

    def print_tree(self, colored=True):
        """Print tree with optional ANSI colors"""
        def get_icon(node):
            if node == self.root:
                return "👑"
            elif not node.children:
                return "🐉"
            else:
                return "⚔️"
        
        def dfs(node, prefix="", is_last=True):
            connector = "└── " if is_last else "├── "
            icon = get_icon(node)
            
            if colored:
                name_display = f"{Colors.GOLD}{Colors.BOLD}{node.name}{Colors.END}"
            else:
                name_display = node.name
            
            print(f"{prefix}{connector}{icon} {name_display}")
            
            new_prefix = prefix + ("    " if is_last else "│   ")
            
            for i, child in enumerate(node.children):
                dfs(child, new_prefix, i == len(node.children) - 1)

        # Print root with crown
        if colored:
            print(f"\n{Colors.DRAGON}{Colors.BOLD}🏰 HOUSE TARGARYEN LINEAGE 🏰{Colors.END}\n")
            print(f"👑 {Colors.GOLD}{Colors.BOLD}{self.root.name}{Colors.END} (Founder)")
        else:
            print(f"\n🏰 HOUSE TARGARYEN LINEAGE 🏰\n")
            print(f"👑 {self.root.name} (Founder)")
        
        for i, child in enumerate(self.root.children):
            dfs(child, "", i == len(self.root.children) - 1)
        print()

    def print_stats(self):
        """Print tree statistics"""
        print(f"\n{Colors.CYAN}{Colors.BOLD}📊 LINEAGE STATISTICS{Colors.END}")
        print(f"{'─' * 40}")
        print(f"  Total Members: {Colors.GREEN}{self.size()}{Colors.END}")
        print(f"  Generations:   {Colors.GREEN}{self.height() + 1}{Colors.END}")
        print(f"  Founder:       {Colors.GOLD}{self.root.name}{Colors.END}")
        
        # Find the member with most children
        max_children = 0
        most_prolific = None
        for name, node in self.nodes.items():
            if len(node.children) > max_children:
                max_children = len(node.children)
                most_prolific = name
        
        if most_prolific:
            print(f"  Most Children: {Colors.GOLD}{most_prolific}{Colors.END} ({max_children})")
        print()


# ============== WEB VISUALIZATION ==============

def generate_html_visualization(tree):
    """Generate an interactive HTML visualization"""
    tree_json = tree.to_json()
    
    html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐉 House Targaryen Lineage</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Crimson+Text:ital@0;1&display=swap" rel="stylesheet">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Crimson Text', serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%);
            min-height: 100vh;
            color: #e8d5b7;
            overflow-x: auto;
        }}
        
        /* Animated fire background */
        body::before {{
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(ellipse at 20% 80%, rgba(139, 0, 0, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 20%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 50%, rgba(75, 0, 130, 0.1) 0%, transparent 70%);
            pointer-events: none;
            animation: flicker 4s ease-in-out infinite alternate;
            z-index: -1;
        }}
        
        @keyframes flicker {{
            0%, 100% {{ opacity: 1; }}
            50% {{ opacity: 0.7; }}
        }}
        
        header {{
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(180deg, rgba(139, 0, 0, 0.3) 0%, transparent 100%);
            border-bottom: 2px solid rgba(218, 165, 32, 0.3);
        }}
        
        h1 {{
            font-family: 'Cinzel', serif;
            font-size: 3rem;
            color: #c9a227;
            text-shadow: 
                0 0 10px rgba(218, 165, 32, 0.5),
                0 0 20px rgba(218, 165, 32, 0.3),
                0 0 30px rgba(139, 0, 0, 0.3);
            letter-spacing: 4px;
            animation: glow 3s ease-in-out infinite alternate;
        }}
        
        @keyframes glow {{
            from {{ text-shadow: 0 0 10px rgba(218, 165, 32, 0.5), 0 0 20px rgba(218, 165, 32, 0.3); }}
            to {{ text-shadow: 0 0 20px rgba(218, 165, 32, 0.8), 0 0 30px rgba(218, 165, 32, 0.5), 0 0 40px rgba(139, 0, 0, 0.5); }}
        }}
        
        .subtitle {{
            font-style: italic;
            color: #8b8b8b;
            margin-top: 10px;
            font-size: 1.2rem;
        }}
        
        .dragon-icon {{
            font-size: 2rem;
            margin: 0 15px;
            animation: dragonFloat 2s ease-in-out infinite;
        }}
        
        @keyframes dragonFloat {{
            0%, 100% {{ transform: translateY(0); }}
            50% {{ transform: translateY(-10px); }}
        }}
        
        .stats-bar {{
            display: flex;
            justify-content: center;
            gap: 40px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.5);
            border-bottom: 1px solid rgba(218, 165, 32, 0.2);
            flex-wrap: wrap;
        }}
        
        .stat {{
            text-align: center;
        }}
        
        .stat-value {{
            font-family: 'Cinzel', serif;
            font-size: 2rem;
            color: #c9a227;
        }}
        
        .stat-label {{
            font-size: 0.9rem;
            color: #8b8b8b;
            text-transform: uppercase;
            letter-spacing: 2px;
        }}
        
        #tree-container {{
            padding: 60px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }}
        
        .tree-node {{
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
        }}
        
        .node-card {{
            background: linear-gradient(145deg, rgba(30, 10, 10, 0.9) 0%, rgba(20, 5, 5, 0.95) 100%);
            border: 2px solid rgba(218, 165, 32, 0.4);
            border-radius: 12px;
            padding: 15px 25px;
            text-align: center;
            min-width: 140px;
            position: relative;
            transition: all 0.3s ease;
            cursor: pointer;
            box-shadow: 
                0 4px 15px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(218, 165, 32, 0.1);
        }}
        
        .node-card:hover {{
            transform: translateY(-5px) scale(1.05);
            border-color: #c9a227;
            box-shadow: 
                0 10px 30px rgba(139, 0, 0, 0.3),
                0 0 20px rgba(218, 165, 32, 0.2),
                inset 0 1px 0 rgba(218, 165, 32, 0.2);
        }}
        
        .node-card::before {{
            content: '🐉';
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 1.2rem;
            opacity: 0;
            transition: opacity 0.3s ease;
        }}
        
        .node-card:hover::before {{
            opacity: 1;
        }}
        
        .node-card.founder {{
            border-color: #c9a227;
            background: linear-gradient(145deg, rgba(50, 20, 0, 0.9) 0%, rgba(30, 10, 0, 0.95) 100%);
        }}
        
        .node-card.founder::before {{
            content: '👑';
            opacity: 1;
        }}
        
        .node-name {{
            font-family: 'Cinzel', serif;
            font-size: 1.1rem;
            color: #e8d5b7;
            font-weight: 700;
        }}
        
        .node-title {{
            font-size: 0.85rem;
            color: #8b8b8b;
            font-style: italic;
            margin-top: 4px;
        }}
        
        .children-container {{
            display: flex;
            gap: 30px;
            margin-top: 50px;
            position: relative;
            justify-content: center;
        }}
        
        .children-container::before {{
            content: '';
            position: absolute;
            top: -25px;
            left: 50%;
            width: 2px;
            height: 25px;
            background: linear-gradient(180deg, rgba(218, 165, 32, 0.6) 0%, rgba(139, 0, 0, 0.4) 100%);
        }}
        
        .tree-node:not(:first-child):not(:last-child) > .node-card::after,
        .tree-node:first-child:not(:only-child) > .node-card::after,
        .tree-node:last-child:not(:only-child) > .node-card::after {{
            content: '';
            position: absolute;
            top: -25px;
            height: 25px;
            width: 2px;
            background: linear-gradient(180deg, rgba(218, 165, 32, 0.6) 0%, rgba(139, 0, 0, 0.4) 100%);
            left: 50%;
            transform: translateX(-50%);
        }}
        
        /* Horizontal connecting line */
        .children-container > .tree-node:not(:only-child)::before {{
            content: '';
            position: absolute;
            top: -25px;
            height: 2px;
            background: linear-gradient(90deg, rgba(139, 0, 0, 0.4) 0%, rgba(218, 165, 32, 0.6) 50%, rgba(139, 0, 0, 0.4) 100%);
            left: 0;
            right: 0;
        }}
        
        /* Tooltip */
        .tooltip {{
            position: fixed;
            background: rgba(20, 5, 5, 0.95);
            border: 2px solid #c9a227;
            border-radius: 8px;
            padding: 15px 20px;
            max-width: 300px;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        }}
        
        .tooltip.visible {{
            opacity: 1;
        }}
        
        .tooltip h3 {{
            font-family: 'Cinzel', serif;
            color: #c9a227;
            margin-bottom: 10px;
        }}
        
        .tooltip p {{
            color: #e8d5b7;
            font-size: 0.9rem;
            line-height: 1.4;
        }}
        
        /* Search bar */
        .search-container {{
            display: flex;
            justify-content: center;
            padding: 20px;
            gap: 15px;
            flex-wrap: wrap;
        }}
        
        input[type="text"] {{
            font-family: 'Crimson Text', serif;
            font-size: 1rem;
            padding: 12px 20px;
            border: 2px solid rgba(218, 165, 32, 0.3);
            border-radius: 8px;
            background: rgba(20, 5, 5, 0.8);
            color: #e8d5b7;
            min-width: 250px;
            transition: all 0.3s ease;
        }}
        
        input[type="text"]:focus {{
            outline: none;
            border-color: #c9a227;
            box-shadow: 0 0 15px rgba(218, 165, 32, 0.2);
        }}
        
        input[type="text"]::placeholder {{
            color: #666;
        }}
        
        button {{
            font-family: 'Cinzel', serif;
            font-size: 1rem;
            padding: 12px 25px;
            border: 2px solid #c9a227;
            border-radius: 8px;
            background: linear-gradient(145deg, rgba(139, 0, 0, 0.3) 0%, rgba(50, 10, 10, 0.5) 100%);
            color: #c9a227;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 2px;
        }}
        
        button:hover {{
            background: linear-gradient(145deg, rgba(218, 165, 32, 0.3) 0%, rgba(139, 0, 0, 0.3) 100%);
            box-shadow: 0 0 20px rgba(218, 165, 32, 0.3);
            transform: translateY(-2px);
        }}
        
        #info-panel {{
            background: rgba(20, 5, 5, 0.9);
            border: 2px solid rgba(218, 165, 32, 0.3);
            border-radius: 12px;
            padding: 25px;
            margin: 20px auto;
            max-width: 600px;
            display: none;
        }}
        
        #info-panel.visible {{
            display: block;
            animation: fadeIn 0.3s ease;
        }}
        
        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(-10px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        
        #info-panel h2 {{
            font-family: 'Cinzel', serif;
            color: #c9a227;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        
        #info-panel .info-row {{
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(218, 165, 32, 0.1);
        }}
        
        #info-panel .info-label {{
            color: #8b8b8b;
        }}
        
        #info-panel .info-value {{
            color: #e8d5b7;
            font-weight: bold;
        }}
        
        .highlight {{
            animation: highlightPulse 1s ease;
        }}
        
        @keyframes highlightPulse {{
            0%, 100% {{ box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5); }}
            50% {{ box-shadow: 0 0 30px rgba(218, 165, 32, 0.8), 0 0 50px rgba(139, 0, 0, 0.5); }}
        }}
        
        footer {{
            text-align: center;
            padding: 30px;
            color: #555;
            font-size: 0.9rem;
            border-top: 1px solid rgba(218, 165, 32, 0.1);
            margin-top: 50px;
        }}
        
        footer a {{
            color: #c9a227;
            text-decoration: none;
        }}
        
        /* Responsive */
        @media (max-width: 768px) {{
            h1 {{ font-size: 1.8rem; }}
            .children-container {{ gap: 15px; }}
            .node-card {{ padding: 10px 15px; min-width: 100px; }}
            .node-name {{ font-size: 0.9rem; }}
        }}
    </style>
</head>
<body>
    <header>
        <h1>
            <span class="dragon-icon">🐉</span>
            HOUSE TARGARYEN
            <span class="dragon-icon">🐉</span>
        </h1>
        <p class="subtitle">"Fire and Blood" - The Royal Lineage</p>
    </header>
    
    <div class="stats-bar">
        <div class="stat">
            <div class="stat-value" id="total-members">0</div>
            <div class="stat-label">Total Members</div>
        </div>
        <div class="stat">
            <div class="stat-value" id="generations">0</div>
            <div class="stat-label">Generations</div>
        </div>
        <div class="stat">
            <div class="stat-value" id="founder">-</div>
            <div class="stat-label">Founder</div>
        </div>
    </div>
    
    <div class="search-container">
        <input type="text" id="searchInput" placeholder="Search for a member..." oninput="searchMember(this.value)">
        <button onclick="resetView()">Reset View</button>
    </div>
    
    <div id="info-panel">
        <h2>🐉 <span id="info-name">Member Info</span></h2>
        <div class="info-row">
            <span class="info-label">Parent:</span>
            <span class="info-value" id="info-parent">-</span>
        </div>
        <div class="info-row">
            <span class="info-label">Children:</span>
            <span class="info-value" id="info-children">-</span>
        </div>
        <div class="info-row">
            <span class="info-label">Ancestors:</span>
            <span class="info-value" id="info-ancestors">-</span>
        </div>
        <div class="info-row">
            <span class="info-label">Descendants:</span>
            <span class="info-value" id="info-descendants">-</span>
        </div>
        <div class="info-row">
            <span class="info-label">Generation:</span>
            <span class="info-value" id="info-generation">-</span>
        </div>
    </div>
    
    <div id="tree-container"></div>
    
    <div id="tooltip" class="tooltip"></div>
    
    <footer>
        <p>🐉 Crafted with Fire and Blood 🐉</p>
        <p style="margin-top: 10px;">Interactive House Targaryen Lineage Visualizer</p>
    </footer>

    <script>
        // Tree data from Python
        const treeData = {tree_json};
        
        // Build lookup map
        const nodeLookup = {{}};
        
        function buildLookup(node, parent = null) {{
            nodeLookup[node.name] = {{
                ...node,
                parentName: parent ? parent.name : null
            }};
            if (node.children) {{
                node.children.forEach(child => buildLookup(child, node));
            }}
        }}
        buildLookup(treeData);
        
        // Calculate stats
        function countNodes(node) {{
            let count = 1;
            if (node.children) {{
                node.children.forEach(child => {{
                    count += countNodes(child);
                }});
            }}
            return count;
        }}
        
        function getHeight(node) {{
            if (!node.children || node.children.length === 0) return 0;
            return 1 + Math.max(...node.children.map(getHeight));
        }}
        
        function getAncestors(name) {{
            const ancestors = [];
            let current = nodeLookup[name];
            while (current && current.parentName) {{
                ancestors.push(current.parentName);
                current = nodeLookup[current.parentName];
            }}
            return ancestors;
        }}
        
        function getDescendants(name) {{
            const descendants = [];
            const node = nodeLookup[name];
            function dfs(n) {{
                if (n.children) {{
                    n.children.forEach(child => {{
                        descendants.push(child.name);
                        dfs(nodeLookup[child.name]);
                    }});
                }}
            }}
            if (node) dfs(node);
            return descendants;
        }}
        
        // Update stats
        document.getElementById('total-members').textContent = countNodes(treeData);
        document.getElementById('generations').textContent = getHeight(treeData) + 1;
        document.getElementById('founder').textContent = treeData.name;
        
        // Build tree visualization
        function buildTreeHTML(node, isRoot = false) {{
            const card = document.createElement('div');
            card.className = 'tree-node';
            
            const nodeCard = document.createElement('div');
            nodeCard.className = 'node-card' + (isRoot ? ' founder' : '');
            nodeCard.dataset.name = node.name;
            
            const nodeName = document.createElement('div');
            nodeName.className = 'node-name';
            nodeName.textContent = node.name;
            nodeCard.appendChild(nodeName);
            
            if (node.title) {{
                const nodeTitle = document.createElement('div');
                nodeTitle.className = 'node-title';
                nodeTitle.textContent = node.title;
                nodeCard.appendChild(nodeTitle);
            }}
            
            // Click handler
            nodeCard.addEventListener('click', () => showInfo(node.name));
            
            card.appendChild(nodeCard);
            
            if (node.children && node.children.length > 0) {{
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'children-container';
                
                node.children.forEach(child => {{
                    childrenContainer.appendChild(buildTreeHTML(child));
                }});
                
                card.appendChild(childrenContainer);
            }}
            
            return card;
        }}
        
        document.getElementById('tree-container').appendChild(buildTreeHTML(treeData, true));
        
        // Show info panel
        function showInfo(name) {{
            const node = nodeLookup[name];
            if (!node) return;
            
            const ancestors = getAncestors(name);
            const descendants = getDescendants(name);
            const children = node.children ? node.children.map(c => c.name) : [];
            
            document.getElementById('info-name').textContent = name;
            document.getElementById('info-parent').textContent = node.parentName || 'None (Founder)';
            document.getElementById('info-children').textContent = children.length > 0 ? children.join(', ') : 'None';
            document.getElementById('info-ancestors').textContent = ancestors.length > 0 ? ancestors.join(' → ') : 'None';
            document.getElementById('info-descendants').textContent = descendants.length > 0 ? descendants.join(', ') : 'None';
            document.getElementById('info-generation').textContent = ancestors.length + 1;
            
            document.getElementById('info-panel').classList.add('visible');
            
            // Highlight selected node
            document.querySelectorAll('.node-card').forEach(card => {{
                card.classList.remove('highlight');
                if (card.dataset.name === name) {{
                    card.classList.add('highlight');
                    card.scrollIntoView({{ behavior: 'smooth', block: 'center' }});
                }}
            }});
        }}
        
        // Search functionality
        function searchMember(query) {{
            const normalizedQuery = query.toLowerCase().trim();
            
            document.querySelectorAll('.node-card').forEach(card => {{
                const name = card.dataset.name.toLowerCase();
                if (normalizedQuery && name.includes(normalizedQuery)) {{
                    card.style.borderColor = '#c9a227';
                    card.style.boxShadow = '0 0 20px rgba(218, 165, 32, 0.5)';
                }} else {{
                    card.style.borderColor = '';
                    card.style.boxShadow = '';
                }}
            }});
            
            // If exact match, show info
            if (nodeLookup[query]) {{
                showInfo(query);
            }}
        }}
        
        // Reset view
        function resetView() {{
            document.getElementById('searchInput').value = '';
            document.getElementById('info-panel').classList.remove('visible');
            document.querySelectorAll('.node-card').forEach(card => {{
                card.style.borderColor = '';
                card.style.boxShadow = '';
                card.classList.remove('highlight');
            }});
        }}
        
        // Add keyboard shortcut
        document.addEventListener('keydown', (e) => {{
            if (e.key === 'Escape') {{
                resetView();
            }}
        }});
    </script>
</body>
</html>'''
    
    return html_content


def open_web_visualization(tree):
    """Open the visualization in the default web browser"""
    html = generate_html_visualization(tree)
    
    # Save to a temporary file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(html)
        temp_path = f.name
    
    print(f"\n{Colors.CYAN}🌐 Opening visualization in browser...{Colors.END}")
    webbrowser.open('file://' + temp_path)
    
    return temp_path


def save_visualization(tree, filename="targaryen_lineage.html"):
    """Save the visualization to a file"""
    html = generate_html_visualization(tree)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"\n{Colors.GREEN}✅ Visualization saved to: {filename}{Colors.END}")
    return filename


# ============== HARD CODED HIERARCHY ================

def create_targaryen_tree():
    """Create the Targaryen family tree"""
    root = Node("Aegon I", title="The Conqueror")
    tree = Tree(root)
    
    tree.add("Aegon I", Node("Aenys I", title="The Weak"))
    tree.add("Aegon I", Node("Maegor I", title="The Cruel"))
    
    tree.add("Aenys I", Node("Jaehaerys I", title="The Conciliator"))
    tree.add("Jaehaerys I", Node("Baelon", title="Prince"))
    tree.add("Baelon", Node("Viserys I", title="The Peaceful"))
    tree.add("Baelon", Node("Daemon", title="Prince of the City"))
    
    tree.add("Viserys I", Node("Rhaenyra", title="The Realm's Delight"))
    tree.add("Viserys I", Node("Aegon II", title="The Usurper"))
    
    tree.add("Rhaenyra", Node("Jacaerys", title="Prince"))
    tree.add("Rhaenyra", Node("Lucerys", title="Prince"))
    tree.add("Jacaerys", Node("Aegon III", title="The Dragonbane"))
    tree.add("Aegon III", Node("Viserys II"))
    tree.add("Viserys II", Node("Aegon IV", title="The Unworthy"))
    tree.add("Aegon IV", Node("Daemon Blackfyre", title="The Black Dragon"))
    
    tree.add("Daemon", Node("Aemond", title="One-Eye"))
    tree.add("Daemon", Node("Helaena", title="Princess"))
    
    return tree


# ============== COMMAND INTERFACE ================

def help_menu():
    print(f"""
{Colors.CYAN}{Colors.BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐉 COMMANDS 🐉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.END}
  {Colors.GOLD}parent{Colors.END} <name>        ─ Show parent of a member
  {Colors.GOLD}children{Colors.END} <name>      ─ Show children of a member
  {Colors.GOLD}ancestors{Colors.END} <name>     ─ Show all ancestors
  {Colors.GOLD}descendants{Colors.END} <name>   ─ Show all descendants
  {Colors.GOLD}path{Colors.END} <name>          ─ Show path from root
  {Colors.GOLD}check{Colors.END} <child> <anc>  ─ Check if descendant relation
  {Colors.GOLD}print{Colors.END}               ─ Print the family tree
  {Colors.GOLD}stats{Colors.END}               ─ Show lineage statistics
  {Colors.GOLD}visualize{Colors.END}           ─ Open web visualization
  {Colors.GOLD}save{Colors.END}                ─ Save visualization to file
  {Colors.GOLD}help{Colors.END}                ─ Show this menu
  {Colors.GOLD}exit{Colors.END}                ─ Exit the console
{Colors.CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.END}
""")


def main():
    tree = create_targaryen_tree()
    
    print(f"""
{Colors.DRAGON}{Colors.BOLD}
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║    🐉  HOUSE TARGARYEN ROYAL LINEAGE CONSOLE  🐉         ║
    ║                                                           ║
    ║              "Fire and Blood"                             ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
{Colors.END}""")
    
    help_menu()
    
    while True:
        try:
            cmd = input(f"{Colors.RED}🔥 >{Colors.END} ").strip()
        except EOFError:
            break
            
        if not cmd:
            continue
        
        parts = cmd.split()
        action = parts[0].lower()
        
        try:
            if action == "exit":
                print(f"\n{Colors.GOLD}Valar Morghulis. Farewell! 🐉{Colors.END}\n")
                break
            
            elif action == "help":
                help_menu()
            
            elif action == "print":
                tree.print_tree()
            
            elif action == "stats":
                tree.print_stats()
            
            elif action == "visualize":
                open_web_visualization(tree)
            
            elif action == "save":
                filename = parts[1] if len(parts) > 1 else "targaryen_lineage.html"
                save_visualization(tree, filename)
            
            elif action == "parent":
                name = " ".join(parts[1:])
                result = tree.parent_of(name)
                print(f"  {Colors.GOLD}Parent of {name}:{Colors.END} {result}")
            
            elif action == "children":
                name = " ".join(parts[1:])
                result = tree.children_of(name)
                if result:
                    print(f"  {Colors.GOLD}Children of {name}:{Colors.END} {', '.join(result)}")
                else:
                    print(f"  {Colors.GOLD}Children of {name}:{Colors.END} None")
            
            elif action == "ancestors":
                name = " ".join(parts[1:])
                result = tree.ancestors_of(name)
                if result:
                    print(f"  {Colors.GOLD}Ancestors of {name}:{Colors.END} {' → '.join(result)}")
                else:
                    print(f"  {Colors.GOLD}Ancestors of {name}:{Colors.END} None (This is the founder)")
            
            elif action == "descendants":
                name = " ".join(parts[1:])
                result = tree.descendants_of(name)
                if result:
                    print(f"  {Colors.GOLD}Descendants of {name}:{Colors.END} {', '.join(result)}")
                else:
                    print(f"  {Colors.GOLD}Descendants of {name}:{Colors.END} None")
            
            elif action == "path":
                name = " ".join(parts[1:])
                result = tree.path_to_root(name)
                if result:
                    print(f"  {Colors.GOLD}Path:{Colors.END} {' → '.join(result)}")
                else:
                    print(f"  {Colors.RED}Member not found{Colors.END}")
            
            elif action == "check":
                if len(parts) < 3:
                    print(f"  {Colors.RED}Usage: check <child> <ancestor>{Colors.END}")
                else:
                    child = parts[1]
                    ancestor = " ".join(parts[2:])
                    result = tree.is_descendant(child, ancestor)
                    if result:
                        print(f"  {Colors.GREEN}✓ {child} is a descendant of {ancestor}{Colors.END}")
                    else:
                        print(f"  {Colors.RED}✗ {child} is NOT a descendant of {ancestor}{Colors.END}")
            
            else:
                print(f"  {Colors.RED}Unknown command. Type 'help' for available commands.{Colors.END}")
        
        except Exception as e:
            print(f"  {Colors.RED}Error: {e}{Colors.END}")


if __name__ == "__main__":
    main()
