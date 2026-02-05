class HashMap:
    def __init__(self, size=16):
        self.size = size
        self.b = [[] for _ in range(size)]

    def _h(self, k):
        return hash(k) % self.size

    def put(self, k, v):
        i = self._h(k)
        for item in self.b[i]:
            if item[0] == k:
                item[1] = v
                return
        self.b[i].append([k, v])

    def get(self, k):
        for ek, ev in self.b[self._h(k)]:
            if ek == k: return ev
        return None

    def remove(self, k):
        i = self._h(k)
        for j, (ek, ev) in enumerate(self.b[i]):
            if ek == k:
                self.b[i].pop(j)
                return True
        return False

if __name__ == "__main__":
    h = HashMap()
    
    h.put("userid_123", "Alice")
    print(f"Full Bucket Structure: {h.b}")    
    h.put("userid_456", "Bob")
    print(f"Full Bucket Structure: {h.b}")
    h.put("userid_123", "Alice Smith")
    print(f"Full Bucket Structure: {h.b}")    
    print(f"User 123: {h.get('userid_123')}")
    print(f"User 456: {h.get('userid_456')}")
    
    h.remove("userid_456")
    print(f"User 456 after removal: {h.get('userid_456')}")
    
    print(f"Full Bucket Structure: {h.b}")