import networkx as nx
import matplotlib.pyplot as plt

def draw_tree():
    G = nx.Graph()
    edges = [(5, 2), (5, 8), (2, 1), (2, 3), (8, 7), (8, 9)]
    G.add_edges_from(edges)
    
    pos = {5: (0, 0), 2: (-1, -1), 8: (1, -1), 1: (-1.5, -2), 3: (-0.5, -2), 7: (0.5, -2), 9: (1.5, -2)}
    
    nx.draw(G, pos, with_labels=True, node_size=2000, node_color="skyblue")
    plt.show()
draw_tree()