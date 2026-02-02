class StudentManager:
    def __init__(self):
        self.students = []  # List to store student names

    def add_student(self, name):
        if name not in self.students:
            self.students.append(name)
            print(f"Added student: {name}")
        else:
            print(f"Student {name} already exists.")

    def remove_student(self, name):
        if name in self.students:
            self.students.remove(name)
            print(f"Removed student: {name}")
        else:
            print(f"Student {name} not found.")

    def list_students(self):
        if self.students:
            print("Current students:")
            for student in self.students:
                print(f"- {student}")
        else:
            print("No students in the list.")

    def search_student(self, name):
        if name in self.students:
            print(f"Student {name} found.")
        else:
            print(f"Student {name} not found.")

# Interactive loop
if __name__ == "__main__":
    manager = StudentManager()
    while True:
        print("\nOptions: add <name>, remove <name>, list, search <name>, exit")
        command = input("Enter command: ").strip().split()
        if not command:
            continue
        action = command[0].lower()
        if action == "add" and len(command) > 1:
            manager.add_student(command[1])
        elif action == "remove" and len(command) > 1:
            manager.remove_student(command[1])
        elif action == "list":
            manager.list_students()
        elif action == "search" and len(command) > 1:
            manager.search_student(command[1])
        elif action == "exit":
            break
        else:
            print("Invalid command.")