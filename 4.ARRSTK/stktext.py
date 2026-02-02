class SimpleTextEditor:
    def __init__(self):
        self.text_words = []
        self.redo_words = []

    def add(self, text):
        words = text.split()
        if not words:
            return
        self.text_words.extend(words)
        self.redo_words.clear()
        self.show()

    def undo(self):
        if self.text_words:
            word = self.text_words.pop()
            self.redo_words.append(word)
            self.show()
        else:
            print("nothing to undo")

    def redo(self):
        if self.redo_words:
            word = self.redo_words.pop()
            self.text_words.append(word)
            self.show()
        else:
            print("nothing to redo")

    def remove(self):
        if self.text_words:
            word = self.text_words.pop()
            self.redo_words.clear()  
            print(f"removed: {word}")
            self.show()
        else:
            print("nothing to remove")

    def show(self):
        text = ' '.join(self.text_words)
        print("text:", text if text else "(empty)")

   


if __name__ == "__main__":
    editor = SimpleTextEditor()
    print("commands: add <text> | undo | redo | remove | show | exit")

    while True:
        line = input("> ").strip()
        if not line:
            continue

        parts = line.split(maxsplit=1)
        cmd = parts[0].lower()

        if cmd == "add" and len(parts) > 1:
            editor.add(parts[1])

        elif cmd in ("undo"):
            editor.undo()

        elif cmd in ("redo"):
            editor.redo()

        elif cmd == "remove":
            editor.remove()

        elif cmd in ("show"):
            editor.show()

        elif cmd in ("exit"):
            print("bye")
            break

        else:
            print("unknown command")