#!/usr/bin/python

class Graph:
    def __init__(self):
        self.V = {}

    def add_edge(self, v1, v2, l):
        if not v1 in self.V:
            self.V[v1] = {'inbound': [], 'outbound': []}
        if not v2 in self.V:
            self.V[v2] = {'inbound': [], 'outbound': []}
        self.V[v1]['outbound'].append((v2, l))
        self.V[v2]['inbound'].append((v1, l))
    def outbound(self, v):
        return self.V[v]['outbound']
    def inbound(self, v):
        return self.V[v]['inbound']

class CountGraph:
    def __init__(self, G):
        self.G = G
        self.reset()
    
    def reset(self):
        self.reads = 0
        self.writes = 0

    def add_edge(self, v1, v2, l):
        self.G.add_edge(v1, v2, l)
        self.writes += 1
    def outbound(self, v):
        self.reads += 1
        return self.G.outbound(v)
    def inbound(self, v):
        self.reads += 1
        return self.G.inbound(v)

class InvGraph:
    def __init__(self, G):
        self.G = G
    def outbound(self, v):
        return self.G.inbound(v)
    def inbound(self, v):
        return self.G.outbound(v)

def BFS(G, v):
    q = [(v, [])]
    covered = {}
    while q:
        (v1, path) = q.pop()
        if v1 in covered:
            continue
        covered[v1] = 1
        for (v2, l) in G.outbound(v1):
            q.insert(0, (v2, path + [l]))
        yield (v1, path)

def LCA(G, v1, v2):
    G = InvGraph(G)
    s1 = {}
    s2 = {}
    g1 = BFS(G, v1)
    g2 = BFS(G, v2)
    while g1 or g2:
        if g1:
            try:
                (v_1, p1) = g1.next()
                if v_1 in s2:
                    return (v_1, p1, s2[v_1])
                s1[v_1] = p1
            except StopIteration:
                g1 = None
        if g2:
            try:
                (v_2, p2) = g2.next()
                if v_2 in s1:
                    return (v_2, s1[v_2], p2)
                s2[v_2] = p2
            except StopIteration:
                g2 = None
    return (None, None, None)

if __name__ == '__main__':
    G = CountGraph(Graph())
    G.add_edge('a', 'b', 1)
    G.add_edge('a', 'c', 2)
    G.add_edge('b', 'd', 3)
    G.add_edge('b', 'e', 4)
    G.add_edge('c', 'e', 5)
    G.add_edge('c', 'f', 6)
    print LCA(G, 'f', 'd')
    print G.reads, G.writes

