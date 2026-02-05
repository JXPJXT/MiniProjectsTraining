"""
Avengers Combat Compatibility Graph Visualization
A weighted graph showing combat team compatibility between Avengers.
Uses NetworkX for graph structure and Matplotlib for visualization.
"""

import networkx as nx
import matplotlib.pyplot as plt
from matplotlib.widgets import Button
from matplotlib.patches import FancyBboxPatch
import matplotlib.colors as mcolors
import numpy as np


def get_edge_color(weight):
    """Return a color based on the edge weight (1-10 scale)."""
    color_map = {
        1: "#FF1744",   # Red - Very Poor
        2: "#FF5722",   # Deep Orange - Poor  
        3: "#FF9800",   # Orange - Below Average
        4: "#FFC107",   # Amber - Average
        5: "#FFEB3B",   # Yellow - Moderate
        6: "#CDDC39",   # Lime - Good
        7: "#8BC34A",   # Light Green - Very Good
        8: "#4CAF50",   # Green - Great
        9: "#00BCD4",   # Cyan - Excellent
        10: "#2196F3",  # Blue - Perfect
    }
    return color_map.get(weight, "#9E9E9E")


def create_avengers_graph():
    """Create an undirected graph with Avengers and their combat compatibility weights."""
    
    # Initialize undirected graph
    G = nx.Graph()
    
    # Define the 6 Avengers
    avengers = ["Iron Man", "Captain America", "Black Widow", "Hulk", "Thor", "Hawkeye"]
    
    # Add nodes
    G.add_nodes_from(avengers)
    
    # Define edge weights (combat compatibility scores)
    # Only one edge between each pair of nodes
    edges_with_weights = [
        # Iron Man connections (plus self-loop handled separately)
        ("Iron Man", "Captain America", 7),
        ("Iron Man", "Hawkeye", 2),
        
        # Captain America connections
        ("Captain America", "Black Widow", 5),
        ("Captain America", "Hulk", 6),
        ("Captain America", "Thor", 7),
        ("Captain America", "Hawkeye", 8),
        
        # Black Widow connections
        ("Black Widow", "Hulk", 4),
        ("Black Widow", "Thor", 5),
        ("Black Widow", "Hawkeye", 9),
        
        # Hulk connections
        ("Hulk", "Thor", 8),
        ("Hulk", "Hawkeye", 3),
        
        # Thor connections
        ("Thor", "Hawkeye", 4),
    ]
    
    # Add edges with weights
    for u, v, w in edges_with_weights:
        G.add_edge(u, v, weight=w)
    
    # Iron Man self-loop weight (stored separately since networkx Graph doesn't support self-loops well)
    iron_man_self_weight = 10
    
    return G, avengers, iron_man_self_weight


def get_circular_positions(avengers):
    """Generate circular positions for the nodes."""
    pos = {}
    n = len(avengers)
    for i, avenger in enumerate(avengers):
        angle = 2 * np.pi * i / n - np.pi / 2  # Start from top
        pos[avenger] = (np.cos(angle) * 1.2, np.sin(angle) * 1.2)
    return pos


def visualize_graph(G, avengers, iron_man_self_weight, selected_pair=None, ax=None):
    """
    Visualize the Avengers graph with optional highlighting of selected pair.
    """
    if ax is None:
        ax = plt.gca()
    
    ax.clear()
    ax.set_facecolor('#0d1117')
    
    # Create circular layout
    pos = get_circular_positions(avengers)
    
    # Define colors for each Avenger
    avenger_colors = {
        "Iron Man": "#E63946",       # Vibrant Red
        "Captain America": "#457B9D", # Steel Blue
        "Black Widow": "#1D3557",     # Dark Navy
        "Hulk": "#2D6A4F",            # Forest Green
        "Thor": "#E9C46A",            # Golden
        "Hawkeye": "#9B5DE5"          # Purple
    }
    
    # Draw edges with weight-based colors
    for u, v, data in G.edges(data=True):
        weight = data['weight']
        edge_color = get_edge_color(weight)
        
        is_highlighted = selected_pair and (u in selected_pair and v in selected_pair)
        
        # Calculate edge properties
        alpha = 1.0 if is_highlighted else 0.7
        linewidth = 6 if is_highlighted else 3
        
        # Draw edge
        x_coords = [pos[u][0], pos[v][0]]
        y_coords = [pos[u][1], pos[v][1]]
        
        # Glow effect for highlighted edges
        if is_highlighted:
            ax.plot(x_coords, y_coords, color=edge_color, linewidth=linewidth + 4, 
                   alpha=0.3, solid_capstyle='round', zorder=1)
        
        ax.plot(x_coords, y_coords, color=edge_color, linewidth=linewidth, 
               alpha=alpha, solid_capstyle='round', zorder=2)
        
        # Draw weight label on edge
        mid_x = (pos[u][0] + pos[v][0]) / 2
        mid_y = (pos[u][1] + pos[v][1]) / 2
        
        # Offset perpendicular to edge
        dx = pos[v][0] - pos[u][0]
        dy = pos[v][1] - pos[u][1]
        length = np.sqrt(dx**2 + dy**2)
        if length > 0:
            offset = 0.12
            perp_x = -dy / length * offset
            perp_y = dx / length * offset
        else:
            perp_x, perp_y = 0, 0
        
        label_size = 14 if is_highlighted else 10
        label_weight = 'bold'
        
        # Weight label with background
        bbox_props = dict(
            boxstyle='circle,pad=0.3',
            facecolor=edge_color,
            edgecolor='white',
            linewidth=2 if is_highlighted else 1,
            alpha=0.95
        )
        
        ax.text(mid_x + perp_x, mid_y + perp_y, str(weight),
               fontsize=label_size, fontweight=label_weight,
               ha='center', va='center', color='white',
               bbox=bbox_props, zorder=5)
    
    # Draw Iron Man self-loop
    iron_man_pos = pos["Iron Man"]
    loop_color = get_edge_color(iron_man_self_weight)
    is_iron_highlighted = selected_pair and "Iron Man" in selected_pair and len(set(selected_pair)) == 1
    
    loop_alpha = 1.0 if is_iron_highlighted else 0.8
    loop_lw = 4 if is_iron_highlighted else 2.5
    
    # Draw self-loop as a circle above Iron Man
    theta = np.linspace(0, 2 * np.pi, 100)
    loop_radius = 0.2
    loop_center_y = iron_man_pos[1] + 0.35
    loop_x = iron_man_pos[0] + loop_radius * np.cos(theta)
    loop_y = loop_center_y + loop_radius * np.sin(theta) * 0.6
    
    if is_iron_highlighted:
        ax.plot(loop_x, loop_y, color=loop_color, linewidth=loop_lw + 3, alpha=0.3, zorder=1)
    ax.plot(loop_x, loop_y, color=loop_color, linewidth=loop_lw, alpha=loop_alpha, zorder=2)
    
    # Self-loop weight label
    ax.text(iron_man_pos[0], loop_center_y + 0.15, str(iron_man_self_weight),
           fontsize=11, fontweight='bold', ha='center', va='center', color='white',
           bbox=dict(boxstyle='circle,pad=0.3', facecolor=loop_color, edgecolor='white', linewidth=1.5),
           zorder=5)
    
    # Draw nodes
    for avenger in avengers:
        x, y = pos[avenger]
        is_selected = selected_pair and avenger in selected_pair
        
        node_color = avenger_colors.get(avenger, "#1E90FF")
        node_size = 0.28 if is_selected else 0.22
        edge_width = 4 if is_selected else 2
        
        # Glow effect for selected nodes
        if is_selected:
            glow = plt.Circle((x, y), node_size + 0.08, color='#FF6B6B', alpha=0.4, zorder=3)
            ax.add_patch(glow)
        
        # Node circle
        circle = plt.Circle((x, y), node_size, color=node_color, ec='white', 
                           linewidth=edge_width, zorder=4)
        ax.add_patch(circle)
        
        # Node label
        label_parts = avenger.split()
        if len(label_parts) > 1:
            label_text = '\n'.join(label_parts)
        else:
            label_text = avenger
            
        ax.text(x, y, label_text, fontsize=9, fontweight='bold',
               ha='center', va='center', color='white', zorder=6)
    
    # Title
    if selected_pair and len(set(selected_pair)) == 2:
        a1, a2 = selected_pair
        if G.has_edge(a1, a2):
            score = G[a1][a2]['weight']
            compatibility_text = f"Compatibility Score: {score}/10"
            color_indicator = get_edge_color(score)
        else:
            compatibility_text = "No direct connection!"
            color_indicator = "#FF1744"
        
        title = f"⚡ {a1}  &  {a2} ⚡"
        ax.set_title(title, fontsize=18, fontweight='bold', color='white', pad=15)
        
        # Compatibility subtitle
        ax.text(0, 1.85, compatibility_text, fontsize=14, fontweight='bold',
               ha='center', va='center', color=color_indicator,
               transform=ax.transData)
    elif selected_pair and "Iron Man" in selected_pair:
        ax.set_title("⚡ Iron Man - Self-Centered Hero ⚡", 
                    fontsize=18, fontweight='bold', color='white', pad=15)
        ax.text(0, 1.85, f"Self Compatibility: {iron_man_self_weight}/10 (Perfect with himself!)",
               fontsize=14, fontweight='bold', ha='center', va='center', 
               color=get_edge_color(iron_man_self_weight), transform=ax.transData)
    else:
        ax.set_title("🦸 Avengers Combat Compatibility 🦸", 
                    fontsize=20, fontweight='bold', color='white', pad=15)
        ax.text(0, 1.85, "Select two Avengers to see their team compatibility",
               fontsize=12, ha='center', va='center', color='#888888', 
               style='italic', transform=ax.transData)
    
    # Set axis properties
    ax.set_xlim(-2, 2)
    ax.set_ylim(-2, 2.2)
    ax.set_aspect('equal')
    ax.axis('off')


def draw_color_legend(ax):
    """Draw the weight-to-color legend."""
    ax.set_facecolor('#0d1117')
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    # Legend title
    ax.text(0.5, 0.95, "COMPATIBILITY SCALE", fontsize=11, fontweight='bold',
           ha='center', va='top', color='white')
    
    # Draw color boxes
    weights = list(range(1, 11))
    box_height = 0.065
    start_y = 0.82
    
    for i, weight in enumerate(weights):
        y = start_y - i * (box_height + 0.015)
        color = get_edge_color(weight)
        
        # Color box
        rect = plt.Rectangle((0.1, y), 0.25, box_height, 
                             facecolor=color, edgecolor='white', linewidth=1)
        ax.add_patch(rect)
        
        # Weight number
        ax.text(0.225, y + box_height/2, str(weight), fontsize=10, fontweight='bold',
               ha='center', va='center', color='white')
        
        # Label
        labels = {
            1: "Very Poor", 2: "Poor", 3: "Below Avg",
            4: "Average", 5: "Moderate", 6: "Good",
            7: "Very Good", 8: "Great", 9: "Excellent", 10: "Perfect"
        }
        ax.text(0.42, y + box_height/2, labels[weight], fontsize=9,
               ha='left', va='center', color='#CCCCCC')


def interactive_selection():
    """Create an interactive visualization with button selection."""
    
    # Create graph
    G, avengers, iron_man_self_weight = create_avengers_graph()
    
    # Create figure with dark theme
    fig = plt.figure(figsize=(16, 10), facecolor='#0d1117')
    
    # Main graph axes
    ax_graph = plt.axes([0.02, 0.12, 0.72, 0.82])
    
    # Legend axes
    ax_legend = plt.axes([0.76, 0.12, 0.22, 0.82])
    draw_color_legend(ax_legend)
    
    # Store selected avengers
    selected = {'avengers': [], 'buttons': {}}
    
    def update_display():
        """Update the graph display based on selection."""
        if len(selected['avengers']) == 2:
            visualize_graph(G, avengers, iron_man_self_weight, 
                          tuple(selected['avengers']), ax_graph)
        elif len(selected['avengers']) == 1 and selected['avengers'][0] == "Iron Man":
            visualize_graph(G, avengers, iron_man_self_weight, 
                          ("Iron Man", "Iron Man"), ax_graph)
        else:
            visualize_graph(G, avengers, iron_man_self_weight, None, ax_graph)
        fig.canvas.draw_idle()
    
    def create_button_callback(avenger):
        """Create a callback function for each avenger button."""
        def callback(event):
            btn = selected['buttons'][avenger]
            
            if avenger in selected['avengers']:
                selected['avengers'].remove(avenger)
                btn.color = '#1f2937'
                btn.hovercolor = '#374151'
            else:
                if len(selected['avengers']) >= 2:
                    old_avenger = selected['avengers'].pop(0)
                    old_btn = selected['buttons'][old_avenger]
                    old_btn.color = '#1f2937'
                    old_btn.hovercolor = '#374151'
                selected['avengers'].append(avenger)
                btn.color = '#dc2626'
                btn.hovercolor = '#ef4444'
            update_display()
        return callback
    
    # Avenger button colors (matching node colors)
    button_colors = {
        "Iron Man": "#991b1b",
        "Captain America": "#1e3a5f", 
        "Black Widow": "#1e293b",
        "Hulk": "#14532d",
        "Thor": "#854d0e",
        "Hawkeye": "#581c87"
    }
    
    # Create avenger selection buttons
    button_width = 0.14
    button_height = 0.055
    button_spacing = 0.012
    start_x = 0.06
    
    for i, avenger in enumerate(avengers):
        ax_btn = plt.axes([start_x + i * (button_width + button_spacing), 0.025, 
                          button_width, button_height])
        btn = Button(ax_btn, avenger, color='#1f2937', hovercolor='#374151')
        btn.label.set_color('white')
        btn.label.set_fontsize(9)
        btn.label.set_fontweight('bold')
        
        # Style button border
        for spine in ax_btn.spines.values():
            spine.set_edgecolor(button_colors.get(avenger, '#4b5563'))
            spine.set_linewidth(2)
        
        callback = create_button_callback(avenger)
        btn.on_clicked(callback)
        selected['buttons'][avenger] = btn
    
    # Initial visualization
    visualize_graph(G, avengers, iron_man_self_weight, None, ax_graph)
    
    plt.show()


def main():
    """Main entry point."""
    print("=" * 60)
    print("🦸 AVENGERS COMBAT COMPATIBILITY GRAPH 🦸")
    print("=" * 60)
    print("\nVisualization showing Avengers combat team compatibility.")
    print("Edge colors indicate compatibility strength (Red=Poor → Blue=Perfect)")
    print("\n• Iron Man is self-centered - only connected to himself!")
    print("• Click two Avengers to see their compatibility score")
    print("=" * 60)
    
    interactive_selection()


if __name__ == "__main__":
    main()
