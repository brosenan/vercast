import random
import graphs

friend_avg = 10
num_actors = 1000

def choose_friends(num):
    friends = []
    for i in range(num_actors):
        if i == num:
            continue
        if random.randint(0, num_actors-1) < friend_avg:
            friends.append(i)
    return friends

class Actor:
    def __init__(self, num, G):
        self.num = num
        self.friends = choose_friends(num)
        self.state = (self.num, 0)
        self.index = 1
        G.add_edge('root', self.state, 1)
    def run_turn(self, G, actors):
        if self.should_do_merge():
            friend = actors[self.get_friend()]
            if self.should_pull():
                return self.do_pull(G, friend)
            else:
                return friend.do_pull(G, self)
        else:
            newState = (self.num, self.index)
            G.add_edge(self.state, newState, 1)
            self.index += 1
            self.state = newState
            return None
    def should_do_merge(self):
        return len(self.friends) > 0 and random.randint(0, 1) == 0
    def should_pull(self):
        return random.randint(0, 1) == 0
    def do_pull(self, G, other):
        G.reset()
        #print G.G.V, self.state, other.state
        (lca, p1, p2) = graphs.LCA(G, self.state, other.state)
        if lca == None:
            return None
        newState = (self.num, self.index)
        G.add_edge(self.state, newState, sum(p2))
        G.add_edge(other.state, newState, sum(p1))
        self.index += 1
        return (sum(p1), sum(p2), G.reads)
    def get_friend(self):
        #return self.friends[random.randint(0, len(self.friends)-1)]
        return self.num / 2 if self.num > 0 else 1
def choose_actor(actors):
    index = random.randint(0, len(actors)-1)
    return actors[index]


def run_simulation():
    G = graphs.CountGraph(graphs.Graph())
    actors = []
    for i in range(num_actors):
        actors.append(Actor(i, G))
    while True:
        actor = choose_actor(actors)
        res = actor.run_turn(G, actors)
        if res:
            yield res

def stats():
    for (m1, m2, k) in run_simulation():
        yield float(k)/min((m1,m2))

def first_k(seq, k):
    for i in seq:
        if k == 0:
            raise StopIteration()
        yield i
        k -= 1
        

if __name__ == '__main__':
    pop = list(first_k(stats(), 100000))
    print max(pop), min(pop), sum(pop)/len(pop)

