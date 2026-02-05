import sys

class ticketms:
    def __init__(self, capacity=100):
        self.data = [None] * capacity
        self.front = -1
        self.rear = -1
        self.size = 0
        self.capacity = capacity
    
    def is_emptyqueue(self):
        return self.size == 0
    
    def is_fullqueue(self):
        return self.size == self.capacity
    
    def addticket(self, value):
        if self.is_fullqueue():
            print("Error: Queue is full")
            return
        
        if self.is_emptyqueue():
            self.front = 0
            self.rear = 0
        else:
            self.rear += 1
        
        self.data[self.rear] = value
        self.size += 1
        print(f"Ticket '{value}' added successfully.")
    
    def deleteticket(self):
        if self.is_emptyqueue():
            print("Error: Queue is empty")
            return None
        
        value = self.data[self.front]
        
        if self.front == self.rear:
            self.front = -1
            self.rear = -1
        else:
            self.front += 1
        
        self.size -= 1
        return value
    
    def peekfomqueue(self):
        if self.is_emptyqueue():
            print("Error: Queue is empty")
            return None
        return self.data[self.front]
    
    def traversetickets(self):
        if self.is_emptyqueue():
            print("Queue is empty")
            return
        
        for i in range(self.front, self.rear + 1):
            print(f"Index {i}: {self.data[i]}")
    
    def get_numofticks(self):
        return self.size

def run_cli():
    system = ticketms(10)
    
    commands = {
        "add": "Add a ticket (e.g., add 101)",
        "delete": "Remove the front ticket",
        "peek": "View the front ticket",
        "list": "Show all tickets",
        "size": "Show number of tickets",
        "exit": "Close the program"
    }

    print("--- Ticket Management System ---")
    for cmd, desc in commands.items():
        print(f"{cmd}: {desc}")

    while True:
        user_input = input("\n> ").strip().split()
        if not user_input:
            continue
            
        cmd = user_input[0].lower()
        args = user_input[1:]

        if cmd == "add":
            if args:
                system.addticket(args[0])
            else:
                print("Error: Please provide a ticket value.")
        elif cmd == "delete":
            val = system.deleteticket()
            if val is not None:
                print(f"Deleted ticket: {val}")
        elif cmd == "peek":
            val = system.peekfomqueue()
            if val is not None:
                print(f"Front ticket: {val}")
        elif cmd == "list":
            system.traversetickets()
        elif cmd == "size":
            print(f"Total tickets: {system.get_numofticks()}")
        elif cmd == "exit":
            print("Goodbye!")
            break
        else:
            print("Unknown command. Type 'add', 'delete', 'peek', 'list', 'size', or 'exit'.")

if __name__ == "__main__":
    run_cli()