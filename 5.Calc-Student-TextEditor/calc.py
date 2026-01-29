class RightToLeftCalc:
    def __init__(self):
        self.stack = []
        self.history = []

    def push(self, value):
        self.stack.append(value)
        print(f"pushed: {value}")
        print(f"stack now: {self.stack}")
        print("---")

    def calculate(self):
        # Build current expression string before evaluation
        current_expr = " ".join(map(str, self.stack))
        self.history.append(f"expression: {current_expr}")

        while len(self.stack) >= 3:
            right = self.stack.pop()
            op = self.stack.pop()
            left = self.stack.pop()

            if not (isinstance(left, (int, float)) and 
                    isinstance(right, (int, float)) and 
                    op in '+-*/'):
                self.stack.append(left)
                self.stack.append(op)
                self.stack.append(right)
                break

            if op == '+':
                res = left + right
            elif op == '-':
                res = left - right
            elif op == '*':
                res = left * right
            elif op == '/':
                if right == 0:
                    print("division by zero - stopping")
                    self.stack.append(left)
                    self.stack.append(op)
                    break
                res = left / right

            self.stack.append(res)
            self.history.append(f"{left} {op} {right} = {res}")

        self.print_result()

    def print_result(self):
        print("\nfinal stack:", self.stack)
        if len(self.stack) == 1 and isinstance(self.stack[0], (int, float)):
            print("final result:", self.stack[0])
        print("\nhistory:")
        for step in self.history:
            print(step)
        print("===")

    def show_current(self):
        print("\ncurrent stack:", self.stack)
        print("===")


if __name__ == "__main__":
    calc = RightToLeftCalc()
    print("enter numbers and operators one by one")
    print("commands: calc | show | exit\n")

    while True:
        inp = input("> ").strip()

        if inp.lower() in ("exit"):
            calc.print_result()
            print("bye")
            break

        if inp.lower() in ("calc"):
            calc.calculate()
            continue

        if inp.lower() == "show":
            calc.show_current()
            continue

        if not inp:
            continue

        try:
            value = float(inp)
            calc.push(value)
        except ValueError:
            if inp in '+-*/':
                calc.push(inp)
            else:
                print("invalid - number or + - * / only")